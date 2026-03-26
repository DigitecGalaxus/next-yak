/**
 * Pages Router entry — re-exports both default component AND a non-component
 * function. This makes the page module NOT a refresh boundary (mixed exports).
 *
 * Without this, the default pages/index.tsx only exports a component,
 * making it a boundary that catches the HMR update.
 */
export { default, getPageConfig } from "../App.tsx";
