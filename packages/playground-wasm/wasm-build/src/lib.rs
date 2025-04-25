use swc_core::common::input::StringInput;
use swc_core::common::sync::*;
use swc_core::common::*;
use swc_core::ecma::visit::swc_ecma_ast::*;
use swc_core::ecma::visit::*;
use swc_ecma_codegen::{Config, Emitter, text_writer::JsWriter};
use swc_ecma_lexer::{Lexer, Syntax};
use swc_ecma_parser::Parser;
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

#[wasm_bindgen(js_name = "transform")]
pub fn transform(source_code: String) -> String {
    let cm: Lrc<SourceMap> = Default::default();

    let fm = cm.new_source_file(
        FileName::Custom("example.js".into()).into(),
        source_code.into(),
    );

    let lexer = Lexer::new(
        Syntax::Es(Default::default()),
        Default::default(),
        StringInput::from(&*fm),
        None,
    );

    let mut parser = Parser::new_from(lexer);
    let result = parser.parse_module();

    match result {
        Ok(mut module) => {
            println!("Successfully parsed the module!");
            let mut transformer = ConsoleLogToErrorTransformer;
            module.visit_mut_with(&mut transformer);

            // Generate code from the transformed AST
            let mut buf = vec![];
            let writer = JsWriter::new(cm.clone(), "\n", &mut buf, None);
            let mut emitter = Emitter {
                cfg: Config::default(),
                cm: cm.clone(),
                comments: None,
                wr: writer,
            };

            match emitter.emit_module(&module) {
                Ok(_) => {
                    // Convert the buffer back to a string
                    match String::from_utf8(buf) {
                        Ok(js) => js,
                        Err(e) => format!("Error converting generated code to string: {:?}", e),
                    }
                }
                Err(e) => format!("Error emitting code: {:?}", e),
            }
        }
        Err(err) => {
            // Handle parsing errors
            println!("Error parsing the module: {:?}", err);
            format!("Error parsing the module: {:?}", err)
        }
    }
}

// Initialize function for the wasm module
#[wasm_bindgen(start)]
pub fn start() {
    // #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}
