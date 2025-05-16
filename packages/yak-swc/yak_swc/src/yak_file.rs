//! Handles "yak files". These are special files that are evaluated at build time.
//! Their transformation is entirely different from the transformation of ordinary files.

use swc_core::atoms::atom;
use swc_core::common::errors::HANDLER;
use swc_core::common::Spanned;
use swc_core::ecma::ast::*;
use swc_core::ecma::visit::{Fold, VisitMut, VisitMutWith};

use crate::yak_imports::{visit_module_imports, YakImports};

pub struct YakFileVisitor {
  yak_imports: Option<YakImports>,
  is_inside_css_tpl: bool,
}

/// A vistor which transform the AST of a .yak.tsx .yak.ts or .yak.js file
/// by removing the next-yak imports and converting tagged template literals
/// so that it can evaluated as a pure nodejs module
impl YakFileVisitor {
  pub fn new() -> Self {
    Self {
      yak_imports: None,
      is_inside_css_tpl: false,
    }
  }

  fn is_invalid_expr(&self, expr: &Expr) -> bool {
    matches!(expr, Expr::Fn(_) | Expr::Arrow(_))
  }

  fn remove_next_yak_imports(&self, module: &mut Module) {
    module.body.retain(|item| {
      if let ModuleItem::ModuleDecl(ModuleDecl::Import(import_decl)) = item {
        return &import_decl.src.value != "next-yak/internal";
      }
      true
    });
  }

  fn yak_imports(&self) -> &YakImports {
    self
      .yak_imports
      .as_ref()
      .expect("Internal error: yak_library_imports is None - this should be impossible as imports are parsed in the initial program visit before any other processing")
  }
}

impl VisitMut for YakFileVisitor {
  fn visit_mut_module(&mut self, module: &mut Module) {
    self.yak_imports = Some(visit_module_imports(module));
    if self.yak_imports().is_using_next_yak() {
      self.remove_next_yak_imports(module);
      module.visit_mut_children_with(self);
    }
  }

  fn visit_mut_expr(&mut self, expr: &mut Expr) {
    expr.visit_mut_children_with(self);
    // Convert tagged template literals to an object with plain template literals
    // e.g. css`font-size: ${20}px;` => { __yak: `font-size: ${20}px;` }
    // This is necessary as the mixin is also imported at runtime and a string would be
    // interpreted as a class name
    if let Expr::TaggedTpl(n) = expr {
      if let Some("css") = self
        .yak_imports
        .as_ref()
        .unwrap()
        .get_yak_library_function_name(n)
        .as_deref()
      {
        *expr = ObjectLit {
          span: n.span,
          props: vec![PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
            key: PropName::Ident(IdentName::new("__yak".into(), n.span)),
            value: Box::new(Expr::Tpl(Tpl {
              span: n.span,
              exprs: n.tpl.exprs.clone(),
              quasis: n.tpl.quasis.clone(),
            })),
          })))]
          .into_iter()
          .collect(),
        }
        .into();
      }
    }
  }

  fn visit_mut_tagged_tpl(&mut self, n: &mut TaggedTpl) {
    let Some(name) = self
      .yak_imports
      .as_ref()
      .unwrap()
      .get_yak_library_function_name(n)
    else {
      // Ignore unknown template literals
      return;
    };

    // Right now only css template literals are allowed
    if name != atom!("css") {
      HANDLER.with(|handler| {
        handler
          .struct_span_err(
            n.span,
            "Only css template literals are allowed inside .yak files",
          )
          .emit();
      });
      return;
    }

    if self.is_inside_css_tpl {
      HANDLER.with(|handler| {
        handler
          .struct_span_err(
            n.span,
            "Nested css template literals are not allowed inside .yak files",
          )
          .emit();
      });
      return;
    }

    let before_is_inside_css_tpl = self.is_inside_css_tpl;
    self.is_inside_css_tpl = true;

    for expr in &n.tpl.exprs {
      if self.is_invalid_expr(expr) {
        HANDLER.with(|handler| {
          handler
            .struct_span_err(
              expr.span(),
              "Function expressions are not allowed in css template literals inside .yak files",
            )
            .emit();
        });
      }
    }

    n.tpl.exprs.visit_mut_with(self);
    self.is_inside_css_tpl = before_is_inside_css_tpl;
  }
}

impl Fold for YakFileVisitor {}

pub fn is_yak_file(filename: &str) -> bool {
  // Ignore the valid case of a file with only 7 characters
  // as it would have only an extension and no filename
  if filename.len() < 8 {
    return false;
  }
  matches!(
    &filename[filename.len() - 8..],
    ".yak.tsx" | ".yak.jsx" | ".yak.mjs"
  ) || matches!(&filename[filename.len() - 7..], ".yak.ts" | ".yak.js")
}

#[cfg(test)]
mod tests {
  use super::*;
  use std::path::PathBuf;
  use swc_core::ecma::{transforms::testing::test_transform, visit::visit_mut_pass};
  use swc_ecma_parser::{Syntax, TsSyntax};
  use swc_ecma_transforms_testing::{test_fixture, FixtureTestConfig};

  #[test]
  fn test_yak_file_visitor() {
    let mut visitor = YakFileVisitor::new();
    test_transform(
      Default::default(),
      Some(true),
      |_| visit_mut_pass(&mut visitor),
      r#"
                import { css } from "next-yak";
                export const heading = css`
                  font-size: ${20}px;
                `;
            "#,
      r#"
                export const heading = {
                  __yak: `
                  font-size: ${20}px;
                `};
            "#,
    );
  }

  #[testing::fixture("tests/fixture/**/input.yak.tsx")]
  fn fixture_yak(input: PathBuf) {
    test_fixture(
      Syntax::Typescript(TsSyntax {
        tsx: true,
        ..Default::default()
      }),
      &|_| visit_mut_pass(YakFileVisitor::new()),
      &input,
      &input.with_file_name("output.yak.tsx"),
      FixtureTestConfig {
        module: None,
        sourcemap: false,
        allow_error: true,
      },
    )
  }
}
