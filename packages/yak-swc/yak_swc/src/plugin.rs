use crate::yak_file_visitor::YakFileVisitor;
use crate::{Config, TransformVisitor};
use swc_core::common::plugin::metadata::TransformPluginMetadataContextKind;
use swc_core::ecma::ast::Program;
use swc_core::ecma::visit::visit_mut_pass;
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};

#[plugin_transform]
pub fn process_transform(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
  let config: Config = serde_json::from_str(
    &metadata
      .get_transform_plugin_config()
      .expect("failed to get plugin config for swc-yak"),
  )
  .expect("failed to parse plugin swc-yak config");

  let filename = metadata
    .get_context(&TransformPluginMetadataContextKind::Filename)
    .expect("failed to get filename");

  // *.yak.ts and *.yak.tsx files follow different rules
  // see yak_file_visitor.rs
  if is_yak_file(&filename) {
    return program.apply(visit_mut_pass(&mut YakFileVisitor::new()));
  }

  // Get a relative posix path to generate always the same hash
  // on different machines or operating systems
  let deterministic_path = relative_posix_path::relative_posix_path(&config.base_path, &filename);
  program.apply(visit_mut_pass(&mut TransformVisitor::new(
    metadata.comments,
    deterministic_path,
    config.minify,
    config.prefix,
    config.display_names,
    config.transpilation_mode,
  )))
}

fn is_yak_file(filename: &str) -> bool {
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
