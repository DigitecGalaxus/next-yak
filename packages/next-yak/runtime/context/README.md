# Yak Theme Context

The yak theme context allows users to configure the theme of their yak application.

It works for react-server components and for normal react components.

## Usage

The context will be available in every `styled` and `css` literal:

```tsx
const Headline = styled.h1`
    color: ${props => props.theme.colors.primary};
`;
```


## React Server Components

To use the yak theme context in a react server component, you need to place a `yak.context.tsx` in
the same directory as your Next.js config.

```tsx
// yak.context.tsx
export async function getYakThemeContext() {
    return {
        colors: {
            primary: "red",
            secondary: "blue",
        },
    }
}

declare module "next-yak/context" {
    export interface YakTheme extends Awaited<ReturnType<typeof getYakThemeContext>> { }
}
```

> **Note:** The `getYakThemeContext` function can be async, which is useful when you need to access
> server-side APIs like `cookies()` or `headers()` from Next.js 15+. Next-yak automatically handles
> the promise resolution using React's `use()` hook internally.

In your root layout component you have to forward the entire response of `getYakThemeContext`
context to the client:

```tsx
// layout.tsx
import { YakThemeProvider } from "next-yak";

export function Layout({ children }) {
    return (
        <YakThemeProvider>
            {children}
        </YakThemeProvider>
    );
}
```

Internally this works because of an alias set by `withYak` inside the NextJs config.

## React Components

If you are using server components you can **skip this section**.  

To use the yak theme context in a normal react component, you can just use the `YakThemeProvider`:

```tsx
// _app.tsx
import { YakThemeProvider } from "next-yak/context";

const theme = {
    colors: {
        primary: "red",
        secondary: "blue",
    },
};

declare module "next-yak/context" {
    export interface YakTheme extends typeof theme { }
}

export function App({ children }) {
    return (
        <YakThemeProvider value={theme}>
            {children}
        </YakThemeProvider>
    );
}
```