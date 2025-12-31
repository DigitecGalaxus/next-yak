/**
 * Preview annotations for storybook-addon-yak
 *
 * This file is intentionally minimal. Users should handle theming
 * themselves in their own preview.tsx file using YakThemeProvider.
 *
 * @example
 * ```tsx
 * // .storybook/preview.tsx
 * import { YakThemeProvider } from 'next-yak';
 * import { getYakThemeContext } from 'next-yak/context/baseContext';
 *
 * const preview: Preview = {
 *   decorators: [
 *     (Story) => (
 *       <YakThemeProvider theme={getYakThemeContext()}>
 *         <Story />
 *       </YakThemeProvider>
 *     ),
 *   ],
 * };
 *
 * export default preview;
 * ```
 */

// No built-in decorators - users add YakThemeProvider themselves
export {};
