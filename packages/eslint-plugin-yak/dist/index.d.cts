import * as _typescript_eslint_utils_ts_eslint from '@typescript-eslint/utils/ts-eslint';

interface EsLintPluginYakRuleDocs {
    description: string;
    recommended?: boolean;
    requiresTypeChecking?: boolean;
}

declare const plugin: {
    meta: {
        name: string;
        version: string;
    };
    configs: {};
    rules: {
        "css-nesting-operator": _typescript_eslint_utils_ts_eslint.RuleModule<"missingNestingOperator", [], EsLintPluginYakRuleDocs, _typescript_eslint_utils_ts_eslint.RuleListener>;
        "enforce-semicolon": _typescript_eslint_utils_ts_eslint.RuleModule<"lonelyExpression", [], EsLintPluginYakRuleDocs, _typescript_eslint_utils_ts_eslint.RuleListener>;
        "style-conditions": _typescript_eslint_utils_ts_eslint.RuleModule<"invalidRuntimeReturnValue" | "invalidCssReturnValue", [], EsLintPluginYakRuleDocs, _typescript_eslint_utils_ts_eslint.RuleListener>;
    };
    processors: {};
};
declare const rules: {
    "css-nesting-operator": _typescript_eslint_utils_ts_eslint.RuleModule<"missingNestingOperator", [], EsLintPluginYakRuleDocs, _typescript_eslint_utils_ts_eslint.RuleListener>;
    "enforce-semicolon": _typescript_eslint_utils_ts_eslint.RuleModule<"lonelyExpression", [], EsLintPluginYakRuleDocs, _typescript_eslint_utils_ts_eslint.RuleListener>;
    "style-conditions": _typescript_eslint_utils_ts_eslint.RuleModule<"invalidRuntimeReturnValue" | "invalidCssReturnValue", [], EsLintPluginYakRuleDocs, _typescript_eslint_utils_ts_eslint.RuleListener>;
};
declare const configs: {};
declare const processors: {};
declare const meta: {
    name: string;
    version: string;
};
declare const name: string;
declare const version: string;

export { configs, plugin as default, meta, name, processors, rules, version };
