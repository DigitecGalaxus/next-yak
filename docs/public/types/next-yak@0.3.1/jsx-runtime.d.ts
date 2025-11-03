import { CSSProperties } from 'react';

type StaticCSSProp = {
    className: string;
    style?: CSSProperties;
};

declare const Fragment: any;
declare const jsx: any;
declare const jsxs: any;
declare namespace YakJSX {
    type Element = React.JSX.Element;
    type ElementType = React.JSX.ElementType;
    type ElementClass = React.JSX.ElementClass;
    type ElementAttributesProperty = React.JSX.ElementAttributesProperty;
    type ElementChildrenAttribute = React.JSX.ElementChildrenAttribute;
    type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<C, P>;
    type IntrinsicAttributes = React.JSX.IntrinsicAttributes;
    type IntrinsicClassAttributes<T> = React.JSX.IntrinsicClassAttributes<T>;
    type IntrinsicElements = {
        [K in keyof JSX.IntrinsicElements]: React.JSX.IntrinsicElements[K] & {
            css?: StaticCSSProp;
        };
    };
}

export { Fragment, YakJSX as JSX, YakJSX, jsx, jsxs };
