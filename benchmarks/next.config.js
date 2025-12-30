const { withYak } = require("next-yak/withYak");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    // totally optional -  minify css class names:
    // https://stackoverflow.com/questions/66744765/how-to-hash-css-class-names-in-nextjs
    // vercel is open to add this as a feature, so we should prepare a PR for this
    // that way we can drop this hack
    const rules = config.module.rules
      .find((rule) => typeof rule.oneOf === "object")
      .oneOf.filter((rule) => Array.isArray(rule.use));
    if (!dev)
      rules.forEach((rule) => {
        rule.use.forEach((moduleLoader) => {
          if (
            moduleLoader.loader?.includes("css-loader") &&
            !moduleLoader.loader?.includes("postcss-loader") &&
            moduleLoader.options !== undefined &&
            moduleLoader.options.modules !== undefined &&
            moduleLoader.options.modules.getLocalIdent
          ) {
            const orig = moduleLoader.options.modules.getLocalIdent;
            moduleLoader.options.modules.getLocalIdent = (...args) =>
              "yak" + orig(...args).substr(-5);
          }
        });
      });
    return config;
  },
};

module.exports = withYak(nextConfig);
