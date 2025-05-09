mod types;

use swc_core::binding_macros::wasm;
use swc_core::binding_macros::wasm::{SingleThreadedComments, compiler};
use swc_core::ecma::visit::VisitMutWith;
use swc_core::ecma::visit::swc_ecma_ast::*;
use wasm_bindgen::prelude::*;

// Copied from build_transform_sync so that we can pass the same comments structure to
// the yak pass.
#[wasm_bindgen(js_name = "transform")]
pub fn transform_sync(s: JsValue, opts: JsValue) -> Result<JsValue, JsValue> {
    use serde::Serialize;

    let c = compiler();

    let opts: wasm::Options = if opts.is_null() || opts.is_undefined() {
        Default::default()
    } else {
        wasm::serde_wasm_bindgen::from_value(opts)?
    };

    let error_format = opts.experimental.error_format.unwrap_or_default();
    wasm::try_with_handler_globals(c.cm.clone(), Default::default(), |handler| {
        c.run(|| {
            let s = JsCast::dyn_into::<js_sys::JsString>(s);
            let out = match s {
                Ok(s) => {
                    let fm = c.cm.new_source_file(
                        if opts.filename.is_empty() {
                            wasm::FileName::Anon.into()
                        } else {
                            wasm::FileName::Real(opts.filename.clone().into()).into()
                        },
                        s.into(),
                    );

                    // Note: SingleThreadedComments uses Rc internally.
                    // Clones will contribute to the same comment map.
                    let comments = SingleThreadedComments::default();
                    wasm::anyhow::Context::context(
                        c.process_js_with_custom_pass(
                            fm,
                            None,
                            handler,
                            &opts,
                            comments.clone(),
                            |_| yak_pass(comments.clone()),
                            |_| noop_pass(),
                        ),
                        "failed to process js file",
                    )?
                }
                Err(v) => c.process_js(
                    handler,
                    wasm::serde_wasm_bindgen::from_value(v).expect(""),
                    &opts,
                )?,
            };

            out.serialize(wasm::compat_serializer().as_ref())
                .map_err(|e| anyhow::anyhow!("failed to serialize transform result: {}", e))
        })
    })
    .map_err(|e| wasm::convert_err(e, Some(error_format)))
}

fn yak_pass(comments: SingleThreadedComments) -> impl Pass + use<> {
    fn_pass(move |program: &mut Program| {
        let mut transformer = yak_swc::TransformVisitor::new(
            Some(comments.clone()),
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
