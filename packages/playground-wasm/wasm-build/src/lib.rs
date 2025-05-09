mod typs;

use swc_core::binding_macros::build_transform_sync;
use swc_core::binding_macros::wasm::SingleThreadedComments;
use swc_core::ecma::visit::swc_ecma_ast::*;
use swc_core::ecma::visit::{VisitMut, VisitMutWith};
use wasm_bindgen::prelude::*;

// Transformer that converts console.log to console.error
struct ConsoleLogToErrorTransformer;

impl VisitMut for ConsoleLogToErrorTransformer {
    // Visit every call expression in the AST
    fn visit_mut_call_expr(&mut self, call: &mut CallExpr) {
        // First, visit any nested expressions
        call.visit_mut_children_with(self);

        // Check if this is a console.log call
        if let Callee::Expr(expr) = &mut call.callee {
            if let Expr::Member(member_expr) = &mut **expr {
                // Check if it's accessing a property on 'console' object
                if let Expr::Ident(ident) = &*member_expr.obj {
                    if ident.sym.to_string() == "console" {
                        // Check if the property is 'log'
                        if let MemberProp::Ident(prop_ident) = &mut member_expr.prop {
                            if prop_ident.sym.to_string() == "log" {
                                // Replace 'log' with 'error'
                                prop_ident.sym = "error".into();
                            }
                        }
                    }
                }
            }
        }
    }
}

build_transform_sync!(
    #[wasm_bindgen(js_name = "transform")],
    |_| (log_to_error_pass(), yak_pass()),
    |_| noop_pass(),
    Default::default());

fn log_to_error_pass() -> impl Pass {
    fn_pass(|program: &mut Program| {
        let mut transformer = ConsoleLogToErrorTransformer;
        program.visit_mut_with(&mut transformer);
    })
}

fn yak_pass() -> impl Pass {
    fn_pass(|program: &mut Program| {
        let mut transformer = yak_swc::TransformVisitor::new(
            Some(SingleThreadedComments::default()),
            "theFile.tsx",
            false,
            None,
            true,
        );
        program.visit_mut_with(&mut transformer);
    })
}

#[wasm_bindgen(typescript_custom_section)]
const INTERFACE_DEFINITIONS: &'static str = r#"

export function transform(
    code: string | Program,
    options?: Options,
    experimental_plugin_bytes_resolver?: any
): Output;
"#;

// Initialize function for the wasm module
#[wasm_bindgen(start)]
pub fn start() {
    // #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}
