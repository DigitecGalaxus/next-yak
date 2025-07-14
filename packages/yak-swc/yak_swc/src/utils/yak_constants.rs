/// Prefix for exported styled components
/// Format: "YAK EXPORTED STYLED:{export_name}:{class_name}"
pub const YAK_EXPORTED_STYLED_PREFIX: &str = "YAK EXPORTED STYLED:";

/// Prefix for exported CSS mixins  
/// Format: "YAK EXPORTED MIXIN:{export_name}"
pub const YAK_EXPORTED_MIXIN_PREFIX: &str = "YAK EXPORTED MIXIN:";

/// Prefix for extracted CSS without export metadata
/// Used for non-exported components and as fallback
pub const YAK_EXTRACTED_CSS_PREFIX: &str = "YAK Extracted CSS:";