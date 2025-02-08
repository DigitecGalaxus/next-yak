import * as _typescript_eslint_utils_ts_eslint from '@typescript-eslint/utils/ts-eslint';

interface EsLintPluginYakRuleDocs {
    description: string;
    recommended?: boolean;
    requiresTypeChecking?: boolean;
}

declare const plugin: {
    meta: {
        name: any;
        version: any;
    };
    configs: {};
    rules: {
        "css-nesting-operator": _typescript_eslint_utils_ts_eslint.RuleModule<"missingNestingOperator", [], EsLintPluginYakRuleDocs, _typescript_eslint_utils_ts_eslint.RuleListener>;
        "enforce-semicolon": _typescript_eslint_utils_ts_eslint.RuleModule<"lonelyExpression", [], EsLintPluginYakRuleDocs, _typescript_eslint_utils_ts_eslint.RuleListener>;
        "style-conditions": _typescript_eslint_utils_ts_eslint.RuleModule<"invalidRuntimeReturnValue" | "invalidCssReturnValue", [], EsLintPluginYakRuleDocs, _typescript_eslint_utils_ts_eslint.RuleListener>;
    };
    processors: {};
};

export { plugin as default };
