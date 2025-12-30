import React, { ReactNode, CSSProperties, FunctionComponent } from 'react';

interface YakTheme {
}
/**
 * Returns the current yak theme context
 *
 * @see https://github.com/DigitecGalaxus/next-yak/blob/main/packages/next-yak/runtime/context/README.md
 */
declare const useTheme: () => YakTheme;
/**
 * Yak theme context provider
 *
 * @see https://github.com/DigitecGalaxus/next-yak/blob/main/packages/next-yak/runtime/context/README.md
 */
declare const YakThemeProvider: ({ children, theme, }: {
    children: ReactNode;
    theme?: YakTheme;
}) => React.JSX.Element;

type ComponentStyles$1<TProps> = (props: TProps) => {
    className: string;
    style?: {
        [key: string]: string;
    };
};
type StaticCSSProp$1 = {
    className: string;
    style?: CSSProperties;
};
type CSSInterpolation$1<TProps> = string | number | undefined | null | false | ComponentStyles$1<TProps> | StaticCSSProp$1 | {
    __yak: true;
} | ((props: TProps) => CSSInterpolation$1<TProps>);
/**
 * Allows to use CSS styles in a styled or css block
 *
 * e.g.
 *
 * ```tsx
 * const Component = styled.div`
 *  color: black;
 *  ${({$active}) => $active && css`color: red;`}
 * `;
 * ```
 */
declare function css(styles: TemplateStringsArray, ...values: []): StaticCSSProp$1;
declare function css<TProps = {}>(styles: TemplateStringsArray, ...values: CSSInterpolation$1<TProps & {
    theme: YakTheme;
}>[]): ComponentStyles$1<TProps>;

type ComponentStyles<TProps> = (props: TProps) => {
    className: string;
    style?: {
        [key: string]: string;
    };
};
type StaticCSSProp = {
    className: string;
    style?: CSSProperties;
};
type CSSInterpolation<TProps> = string | number | undefined | null | false | ComponentStyles<TProps> | StaticCSSProp | {
    __yak: true;
} | ((props: TProps) => CSSInterpolation<TProps>);

/**
 * All valid html tags
 */
type HtmlTags = keyof JSX.IntrinsicElements;
/**
 * Return type of the provided props merged with the initial props
 * where the specified props are optional
 */
type AttrsMerged<TBaseProps, TIn extends object = {}> = Substitute<TBaseProps & {
    theme: YakTheme;
}, TIn>;
/**
 * The attrs function allows to add additional props to a styled component.
 * The props can be specified as an object or as a function that receives the
 * current props as argument.
 */
type Attrs<TBaseProps, TIn extends object = {}, TOut extends AttrsMerged<TBaseProps, TIn> = AttrsMerged<TBaseProps, TIn>> = Partial<TOut> | ((p: Substitute<TBaseProps & {
    theme: YakTheme;
}, TIn>) => Partial<TOut>);
/**
 * Type for the proxy object returned by `styled` that allows to
 * access all html tags as properties.
 */
type StyledLiteral<T> = <TCSSProps>(styles: TemplateStringsArray, ...values: Array<CSSInterpolation<T & NoInfer<TCSSProps> & {
    theme: YakTheme;
}>>) => FunctionComponent<TCSSProps & T> & {
    __yak: true;
};
/**
 * The `styled` method works perfectly on all of your own or any third-party component,
 * as long as they attach the passed className prop to a DOM element.
 *
 * @usage
 *
 * ```tsx
 * const StyledLink = styled(Link)`
 *  color: #BF4F74;
 *  font-weight: bold;
 * `;
 * ```
 */
declare const styled: (<T>(Component: HtmlTags | FunctionComponent<T>) => (<TCSSProps extends object = {}>(styles: TemplateStringsArray, ...values: CSSInterpolation<T & TCSSProps & {
    theme: YakTheme;
}>[]) => FunctionComponent<FastOmit<TCSSProps & T, never>> & {
    __yak: true;
}) & {
    attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<T, TAttrsIn> = AttrsMerged<T, TAttrsIn>>(attrs: Attrs<T, TAttrsIn, TAttrsOut>) => <TCSSProps extends object = {}>(styles: TemplateStringsArray, ...values: CSSInterpolation<T & TCSSProps & {
        theme: YakTheme;
    }>[]) => FunctionComponent<Substitute<TCSSProps & T, TAttrsIn>> & {
        __yak: true;
    };
}) & {
    symbol: StyledLiteral<React.SVGProps<SVGSymbolElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGSymbolElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGSymbolElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGSymbolElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["symbol"], TAttrsIn>>;
    };
    object: StyledLiteral<React.DetailedHTMLProps<React.ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["object"], TAttrsIn>>;
    };
    search: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["search"], TAttrsIn>>;
    };
    big: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["big"], TAttrsIn>>;
    };
    link: StyledLiteral<React.DetailedHTMLProps<React.LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["link"], TAttrsIn>>;
    };
    small: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["small"], TAttrsIn>>;
    };
    sub: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["sub"], TAttrsIn>>;
    };
    sup: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["sup"], TAttrsIn>>;
    };
    a: StyledLiteral<React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["a"], TAttrsIn>>;
    };
    abbr: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["abbr"], TAttrsIn>>;
    };
    address: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["address"], TAttrsIn>>;
    };
    area: StyledLiteral<React.DetailedHTMLProps<React.AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["area"], TAttrsIn>>;
    };
    article: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["article"], TAttrsIn>>;
    };
    aside: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["aside"], TAttrsIn>>;
    };
    audio: StyledLiteral<React.DetailedHTMLProps<React.AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["audio"], TAttrsIn>>;
    };
    b: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["b"], TAttrsIn>>;
    };
    base: StyledLiteral<React.DetailedHTMLProps<React.BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["base"], TAttrsIn>>;
    };
    bdi: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["bdi"], TAttrsIn>>;
    };
    bdo: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["bdo"], TAttrsIn>>;
    };
    blockquote: StyledLiteral<React.DetailedHTMLProps<React.BlockquoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.BlockquoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.BlockquoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.BlockquoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["blockquote"], TAttrsIn>>;
    };
    body: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["body"], TAttrsIn>>;
    };
    br: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLBRElement>, HTMLBRElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLBRElement>, HTMLBRElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLBRElement>, HTMLBRElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLBRElement>, HTMLBRElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["br"], TAttrsIn>>;
    };
    button: StyledLiteral<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["button"], TAttrsIn>>;
    };
    canvas: StyledLiteral<React.DetailedHTMLProps<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["canvas"], TAttrsIn>>;
    };
    caption: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["caption"], TAttrsIn>>;
    };
    center: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["center"], TAttrsIn>>;
    };
    cite: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["cite"], TAttrsIn>>;
    };
    code: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["code"], TAttrsIn>>;
    };
    col: StyledLiteral<React.DetailedHTMLProps<React.ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["col"], TAttrsIn>>;
    };
    colgroup: StyledLiteral<React.DetailedHTMLProps<React.ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["colgroup"], TAttrsIn>>;
    };
    data: StyledLiteral<React.DetailedHTMLProps<React.DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["data"], TAttrsIn>>;
    };
    datalist: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["datalist"], TAttrsIn>>;
    };
    dd: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["dd"], TAttrsIn>>;
    };
    del: StyledLiteral<React.DetailedHTMLProps<React.DelHTMLAttributes<HTMLModElement>, HTMLModElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.DelHTMLAttributes<HTMLModElement>, HTMLModElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.DelHTMLAttributes<HTMLModElement>, HTMLModElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.DelHTMLAttributes<HTMLModElement>, HTMLModElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["del"], TAttrsIn>>;
    };
    details: StyledLiteral<React.DetailedHTMLProps<React.DetailsHTMLAttributes<HTMLDetailsElement>, HTMLDetailsElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.DetailsHTMLAttributes<HTMLDetailsElement>, HTMLDetailsElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.DetailsHTMLAttributes<HTMLDetailsElement>, HTMLDetailsElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.DetailsHTMLAttributes<HTMLDetailsElement>, HTMLDetailsElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["details"], TAttrsIn>>;
    };
    dfn: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["dfn"], TAttrsIn>>;
    };
    dialog: StyledLiteral<React.DetailedHTMLProps<React.DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["dialog"], TAttrsIn>>;
    };
    div: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["div"], TAttrsIn>>;
    };
    dl: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDListElement>, HTMLDListElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDListElement>, HTMLDListElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDListElement>, HTMLDListElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDListElement>, HTMLDListElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["dl"], TAttrsIn>>;
    };
    dt: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["dt"], TAttrsIn>>;
    };
    em: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["em"], TAttrsIn>>;
    };
    embed: StyledLiteral<React.DetailedHTMLProps<React.EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["embed"], TAttrsIn>>;
    };
    fieldset: StyledLiteral<React.DetailedHTMLProps<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["fieldset"], TAttrsIn>>;
    };
    figcaption: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["figcaption"], TAttrsIn>>;
    };
    figure: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["figure"], TAttrsIn>>;
    };
    footer: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["footer"], TAttrsIn>>;
    };
    form: StyledLiteral<React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["form"], TAttrsIn>>;
    };
    h1: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["h1"], TAttrsIn>>;
    };
    h2: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["h2"], TAttrsIn>>;
    };
    h3: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["h3"], TAttrsIn>>;
    };
    h4: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["h4"], TAttrsIn>>;
    };
    h5: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["h5"], TAttrsIn>>;
    };
    h6: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["h6"], TAttrsIn>>;
    };
    head: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["head"], TAttrsIn>>;
    };
    header: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["header"], TAttrsIn>>;
    };
    hgroup: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["hgroup"], TAttrsIn>>;
    };
    hr: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHRElement>, HTMLHRElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHRElement>, HTMLHRElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHRElement>, HTMLHRElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHRElement>, HTMLHRElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["hr"], TAttrsIn>>;
    };
    html: StyledLiteral<React.DetailedHTMLProps<React.HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["html"], TAttrsIn>>;
    };
    i: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["i"], TAttrsIn>>;
    };
    iframe: StyledLiteral<React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["iframe"], TAttrsIn>>;
    };
    img: StyledLiteral<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["img"], TAttrsIn>>;
    };
    input: StyledLiteral<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["input"], TAttrsIn>>;
    };
    ins: StyledLiteral<React.DetailedHTMLProps<React.InsHTMLAttributes<HTMLModElement>, HTMLModElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.InsHTMLAttributes<HTMLModElement>, HTMLModElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.InsHTMLAttributes<HTMLModElement>, HTMLModElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.InsHTMLAttributes<HTMLModElement>, HTMLModElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["ins"], TAttrsIn>>;
    };
    kbd: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["kbd"], TAttrsIn>>;
    };
    keygen: StyledLiteral<React.DetailedHTMLProps<React.KeygenHTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.KeygenHTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.KeygenHTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.KeygenHTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["keygen"], TAttrsIn>>;
    };
    label: StyledLiteral<React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["label"], TAttrsIn>>;
    };
    legend: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["legend"], TAttrsIn>>;
    };
    li: StyledLiteral<React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["li"], TAttrsIn>>;
    };
    main: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["main"], TAttrsIn>>;
    };
    map: StyledLiteral<React.DetailedHTMLProps<React.MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["map"], TAttrsIn>>;
    };
    mark: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["mark"], TAttrsIn>>;
    };
    menu: StyledLiteral<React.DetailedHTMLProps<React.MenuHTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.MenuHTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.MenuHTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.MenuHTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["menu"], TAttrsIn>>;
    };
    menuitem: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["menuitem"], TAttrsIn>>;
    };
    meta: StyledLiteral<React.DetailedHTMLProps<React.MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["meta"], TAttrsIn>>;
    };
    meter: StyledLiteral<React.DetailedHTMLProps<React.MeterHTMLAttributes<HTMLMeterElement>, HTMLMeterElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.MeterHTMLAttributes<HTMLMeterElement>, HTMLMeterElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.MeterHTMLAttributes<HTMLMeterElement>, HTMLMeterElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.MeterHTMLAttributes<HTMLMeterElement>, HTMLMeterElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["meter"], TAttrsIn>>;
    };
    nav: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["nav"], TAttrsIn>>;
    };
    noindex: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["noindex"], TAttrsIn>>;
    };
    noscript: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["noscript"], TAttrsIn>>;
    };
    ol: StyledLiteral<React.DetailedHTMLProps<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["ol"], TAttrsIn>>;
    };
    optgroup: StyledLiteral<React.DetailedHTMLProps<React.OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["optgroup"], TAttrsIn>>;
    };
    option: StyledLiteral<React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["option"], TAttrsIn>>;
    };
    output: StyledLiteral<React.DetailedHTMLProps<React.OutputHTMLAttributes<HTMLOutputElement>, HTMLOutputElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.OutputHTMLAttributes<HTMLOutputElement>, HTMLOutputElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.OutputHTMLAttributes<HTMLOutputElement>, HTMLOutputElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.OutputHTMLAttributes<HTMLOutputElement>, HTMLOutputElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["output"], TAttrsIn>>;
    };
    p: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["p"], TAttrsIn>>;
    };
    param: StyledLiteral<React.DetailedHTMLProps<React.ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["param"], TAttrsIn>>;
    };
    picture: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["picture"], TAttrsIn>>;
    };
    pre: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLPreElement>, HTMLPreElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLPreElement>, HTMLPreElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLPreElement>, HTMLPreElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLPreElement>, HTMLPreElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["pre"], TAttrsIn>>;
    };
    progress: StyledLiteral<React.DetailedHTMLProps<React.ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["progress"], TAttrsIn>>;
    };
    q: StyledLiteral<React.DetailedHTMLProps<React.QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["q"], TAttrsIn>>;
    };
    rp: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["rp"], TAttrsIn>>;
    };
    rt: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["rt"], TAttrsIn>>;
    };
    ruby: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["ruby"], TAttrsIn>>;
    };
    s: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["s"], TAttrsIn>>;
    };
    samp: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["samp"], TAttrsIn>>;
    };
    slot: StyledLiteral<React.DetailedHTMLProps<React.SlotHTMLAttributes<HTMLSlotElement>, HTMLSlotElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.SlotHTMLAttributes<HTMLSlotElement>, HTMLSlotElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.SlotHTMLAttributes<HTMLSlotElement>, HTMLSlotElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.SlotHTMLAttributes<HTMLSlotElement>, HTMLSlotElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["slot"], TAttrsIn>>;
    };
    script: StyledLiteral<React.DetailedHTMLProps<React.ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["script"], TAttrsIn>>;
    };
    section: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["section"], TAttrsIn>>;
    };
    select: StyledLiteral<React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["select"], TAttrsIn>>;
    };
    source: StyledLiteral<React.DetailedHTMLProps<React.SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["source"], TAttrsIn>>;
    };
    span: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["span"], TAttrsIn>>;
    };
    strong: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["strong"], TAttrsIn>>;
    };
    style: StyledLiteral<React.DetailedHTMLProps<React.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["style"], TAttrsIn>>;
    };
    summary: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["summary"], TAttrsIn>>;
    };
    table: StyledLiteral<React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["table"], TAttrsIn>>;
    };
    template: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["template"], TAttrsIn>>;
    };
    tbody: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["tbody"], TAttrsIn>>;
    };
    td: StyledLiteral<React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["td"], TAttrsIn>>;
    };
    textarea: StyledLiteral<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["textarea"], TAttrsIn>>;
    };
    tfoot: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["tfoot"], TAttrsIn>>;
    };
    th: StyledLiteral<React.DetailedHTMLProps<React.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["th"], TAttrsIn>>;
    };
    thead: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["thead"], TAttrsIn>>;
    };
    time: StyledLiteral<React.DetailedHTMLProps<React.TimeHTMLAttributes<HTMLTimeElement>, HTMLTimeElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.TimeHTMLAttributes<HTMLTimeElement>, HTMLTimeElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.TimeHTMLAttributes<HTMLTimeElement>, HTMLTimeElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.TimeHTMLAttributes<HTMLTimeElement>, HTMLTimeElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["time"], TAttrsIn>>;
    };
    title: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["title"], TAttrsIn>>;
    };
    tr: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["tr"], TAttrsIn>>;
    };
    track: StyledLiteral<React.DetailedHTMLProps<React.TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["track"], TAttrsIn>>;
    };
    u: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["u"], TAttrsIn>>;
    };
    ul: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["ul"], TAttrsIn>>;
    };
    var: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["var"], TAttrsIn>>;
    };
    video: StyledLiteral<React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["video"], TAttrsIn>>;
    };
    wbr: StyledLiteral<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["wbr"], TAttrsIn>>;
    };
    webview: StyledLiteral<React.DetailedHTMLProps<React.WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.DetailedHTMLProps<React.WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>, TAttrsIn> = AttrsMerged<React.DetailedHTMLProps<React.WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>, TAttrsIn>>(attrs: Attrs<React.DetailedHTMLProps<React.WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["webview"], TAttrsIn>>;
    };
    svg: StyledLiteral<React.SVGProps<SVGSVGElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGSVGElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGSVGElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGSVGElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["svg"], TAttrsIn>>;
    };
    animate: StyledLiteral<React.SVGProps<SVGElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["animate"], TAttrsIn>>;
    };
    animateMotion: StyledLiteral<React.SVGProps<SVGElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["animateMotion"], TAttrsIn>>;
    };
    animateTransform: StyledLiteral<React.SVGProps<SVGElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["animateTransform"], TAttrsIn>>;
    };
    circle: StyledLiteral<React.SVGProps<SVGCircleElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGCircleElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGCircleElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGCircleElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["circle"], TAttrsIn>>;
    };
    clipPath: StyledLiteral<React.SVGProps<SVGClipPathElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGClipPathElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGClipPathElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGClipPathElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["clipPath"], TAttrsIn>>;
    };
    defs: StyledLiteral<React.SVGProps<SVGDefsElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGDefsElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGDefsElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGDefsElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["defs"], TAttrsIn>>;
    };
    desc: StyledLiteral<React.SVGProps<SVGDescElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGDescElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGDescElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGDescElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["desc"], TAttrsIn>>;
    };
    ellipse: StyledLiteral<React.SVGProps<SVGEllipseElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGEllipseElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGEllipseElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGEllipseElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["ellipse"], TAttrsIn>>;
    };
    feBlend: StyledLiteral<React.SVGProps<SVGFEBlendElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEBlendElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEBlendElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEBlendElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feBlend"], TAttrsIn>>;
    };
    feColorMatrix: StyledLiteral<React.SVGProps<SVGFEColorMatrixElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEColorMatrixElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEColorMatrixElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEColorMatrixElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feColorMatrix"], TAttrsIn>>;
    };
    feComponentTransfer: StyledLiteral<React.SVGProps<SVGFEComponentTransferElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEComponentTransferElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEComponentTransferElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEComponentTransferElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feComponentTransfer"], TAttrsIn>>;
    };
    feComposite: StyledLiteral<React.SVGProps<SVGFECompositeElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFECompositeElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFECompositeElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFECompositeElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feComposite"], TAttrsIn>>;
    };
    feConvolveMatrix: StyledLiteral<React.SVGProps<SVGFEConvolveMatrixElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEConvolveMatrixElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEConvolveMatrixElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEConvolveMatrixElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feConvolveMatrix"], TAttrsIn>>;
    };
    feDiffuseLighting: StyledLiteral<React.SVGProps<SVGFEDiffuseLightingElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEDiffuseLightingElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEDiffuseLightingElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEDiffuseLightingElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feDiffuseLighting"], TAttrsIn>>;
    };
    feDisplacementMap: StyledLiteral<React.SVGProps<SVGFEDisplacementMapElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEDisplacementMapElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEDisplacementMapElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEDisplacementMapElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feDisplacementMap"], TAttrsIn>>;
    };
    feDistantLight: StyledLiteral<React.SVGProps<SVGFEDistantLightElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEDistantLightElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEDistantLightElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEDistantLightElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feDistantLight"], TAttrsIn>>;
    };
    feDropShadow: StyledLiteral<React.SVGProps<SVGFEDropShadowElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEDropShadowElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEDropShadowElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEDropShadowElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feDropShadow"], TAttrsIn>>;
    };
    feFlood: StyledLiteral<React.SVGProps<SVGFEFloodElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEFloodElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEFloodElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEFloodElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feFlood"], TAttrsIn>>;
    };
    feFuncA: StyledLiteral<React.SVGProps<SVGFEFuncAElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEFuncAElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEFuncAElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEFuncAElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feFuncA"], TAttrsIn>>;
    };
    feFuncB: StyledLiteral<React.SVGProps<SVGFEFuncBElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEFuncBElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEFuncBElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEFuncBElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feFuncB"], TAttrsIn>>;
    };
    feFuncG: StyledLiteral<React.SVGProps<SVGFEFuncGElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEFuncGElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEFuncGElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEFuncGElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feFuncG"], TAttrsIn>>;
    };
    feFuncR: StyledLiteral<React.SVGProps<SVGFEFuncRElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEFuncRElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEFuncRElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEFuncRElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feFuncR"], TAttrsIn>>;
    };
    feGaussianBlur: StyledLiteral<React.SVGProps<SVGFEGaussianBlurElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEGaussianBlurElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEGaussianBlurElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEGaussianBlurElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feGaussianBlur"], TAttrsIn>>;
    };
    feImage: StyledLiteral<React.SVGProps<SVGFEImageElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEImageElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEImageElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEImageElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feImage"], TAttrsIn>>;
    };
    feMerge: StyledLiteral<React.SVGProps<SVGFEMergeElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEMergeElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEMergeElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEMergeElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feMerge"], TAttrsIn>>;
    };
    feMergeNode: StyledLiteral<React.SVGProps<SVGFEMergeNodeElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEMergeNodeElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEMergeNodeElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEMergeNodeElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feMergeNode"], TAttrsIn>>;
    };
    feMorphology: StyledLiteral<React.SVGProps<SVGFEMorphologyElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEMorphologyElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEMorphologyElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEMorphologyElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feMorphology"], TAttrsIn>>;
    };
    feOffset: StyledLiteral<React.SVGProps<SVGFEOffsetElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEOffsetElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEOffsetElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEOffsetElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feOffset"], TAttrsIn>>;
    };
    fePointLight: StyledLiteral<React.SVGProps<SVGFEPointLightElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFEPointLightElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFEPointLightElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFEPointLightElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["fePointLight"], TAttrsIn>>;
    };
    feSpecularLighting: StyledLiteral<React.SVGProps<SVGFESpecularLightingElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFESpecularLightingElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFESpecularLightingElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFESpecularLightingElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feSpecularLighting"], TAttrsIn>>;
    };
    feSpotLight: StyledLiteral<React.SVGProps<SVGFESpotLightElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFESpotLightElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFESpotLightElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFESpotLightElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feSpotLight"], TAttrsIn>>;
    };
    feTile: StyledLiteral<React.SVGProps<SVGFETileElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFETileElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFETileElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFETileElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feTile"], TAttrsIn>>;
    };
    feTurbulence: StyledLiteral<React.SVGProps<SVGFETurbulenceElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFETurbulenceElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFETurbulenceElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFETurbulenceElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["feTurbulence"], TAttrsIn>>;
    };
    filter: StyledLiteral<React.SVGProps<SVGFilterElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGFilterElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGFilterElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGFilterElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["filter"], TAttrsIn>>;
    };
    foreignObject: StyledLiteral<React.SVGProps<SVGForeignObjectElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGForeignObjectElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGForeignObjectElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGForeignObjectElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["foreignObject"], TAttrsIn>>;
    };
    g: StyledLiteral<React.SVGProps<SVGGElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGGElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGGElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGGElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["g"], TAttrsIn>>;
    };
    image: StyledLiteral<React.SVGProps<SVGImageElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGImageElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGImageElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGImageElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["image"], TAttrsIn>>;
    };
    line: StyledLiteral<React.SVGLineElementAttributes<SVGLineElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGLineElementAttributes<SVGLineElement>, TAttrsIn> = AttrsMerged<React.SVGLineElementAttributes<SVGLineElement>, TAttrsIn>>(attrs: Attrs<React.SVGLineElementAttributes<SVGLineElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["line"], TAttrsIn>>;
    };
    linearGradient: StyledLiteral<React.SVGProps<SVGLinearGradientElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGLinearGradientElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGLinearGradientElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGLinearGradientElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["linearGradient"], TAttrsIn>>;
    };
    marker: StyledLiteral<React.SVGProps<SVGMarkerElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGMarkerElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGMarkerElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGMarkerElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["marker"], TAttrsIn>>;
    };
    mask: StyledLiteral<React.SVGProps<SVGMaskElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGMaskElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGMaskElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGMaskElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["mask"], TAttrsIn>>;
    };
    metadata: StyledLiteral<React.SVGProps<SVGMetadataElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGMetadataElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGMetadataElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGMetadataElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["metadata"], TAttrsIn>>;
    };
    mpath: StyledLiteral<React.SVGProps<SVGElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["mpath"], TAttrsIn>>;
    };
    path: StyledLiteral<React.SVGProps<SVGPathElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGPathElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGPathElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGPathElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["path"], TAttrsIn>>;
    };
    pattern: StyledLiteral<React.SVGProps<SVGPatternElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGPatternElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGPatternElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGPatternElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["pattern"], TAttrsIn>>;
    };
    polygon: StyledLiteral<React.SVGProps<SVGPolygonElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGPolygonElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGPolygonElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGPolygonElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["polygon"], TAttrsIn>>;
    };
    polyline: StyledLiteral<React.SVGProps<SVGPolylineElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGPolylineElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGPolylineElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGPolylineElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["polyline"], TAttrsIn>>;
    };
    radialGradient: StyledLiteral<React.SVGProps<SVGRadialGradientElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGRadialGradientElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGRadialGradientElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGRadialGradientElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["radialGradient"], TAttrsIn>>;
    };
    rect: StyledLiteral<React.SVGProps<SVGRectElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGRectElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGRectElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGRectElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["rect"], TAttrsIn>>;
    };
    stop: StyledLiteral<React.SVGProps<SVGStopElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGStopElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGStopElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGStopElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["stop"], TAttrsIn>>;
    };
    switch: StyledLiteral<React.SVGProps<SVGSwitchElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGSwitchElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGSwitchElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGSwitchElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["switch"], TAttrsIn>>;
    };
    text: StyledLiteral<React.SVGTextElementAttributes<SVGTextElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGTextElementAttributes<SVGTextElement>, TAttrsIn> = AttrsMerged<React.SVGTextElementAttributes<SVGTextElement>, TAttrsIn>>(attrs: Attrs<React.SVGTextElementAttributes<SVGTextElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["text"], TAttrsIn>>;
    };
    textPath: StyledLiteral<React.SVGProps<SVGTextPathElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGTextPathElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGTextPathElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGTextPathElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["textPath"], TAttrsIn>>;
    };
    tspan: StyledLiteral<React.SVGProps<SVGTSpanElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGTSpanElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGTSpanElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGTSpanElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["tspan"], TAttrsIn>>;
    };
    use: StyledLiteral<React.SVGProps<SVGUseElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGUseElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGUseElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGUseElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["use"], TAttrsIn>>;
    };
    view: StyledLiteral<React.SVGProps<SVGViewElement>> & {
        attrs: <TAttrsIn extends object = {}, TAttrsOut extends AttrsMerged<React.SVGProps<SVGViewElement>, TAttrsIn> = AttrsMerged<React.SVGProps<SVGViewElement>, TAttrsIn>>(attrs: Attrs<React.SVGProps<SVGViewElement>, TAttrsIn, TAttrsOut>) => StyledLiteral<Substitute<JSX.IntrinsicElements["view"], TAttrsIn>>;
    };
};
type FastOmit<T extends object, U extends string | number | symbol> = {
    [K in keyof T as K extends U ? never : K]: T[K];
};
type Substitute<A extends object, B extends object> = FastOmit<A, keyof B> & B;

/**
 * Allows to use CSS keyframe animations in a styled or css block
 *
 * @usage
 *
 * ```tsx
 * import { styled, keyframes } from "next-yak";
 *
 * const rotate = keyframes`
 *  from {
 *   transform: rotate(0deg);
 *  }
 *  to {
 *   transform: rotate(360deg);
 *  }
 * `;
 *
 * const Spinner = styled.div`
 *   animation: ${rotate} 1s linear infinite;
 * `;
 * ```
 */
declare const keyframes: (styles: TemplateStringsArray, ...dynamic: never[]) => string;

/**
 * Allows to use atomic CSS classes in a styled or css block
 *
 * @usage
 *
 * ```tsx
 * import { styled, atoms } from "next-yak";
 *
 * const Button = styled.button<{ $primary?: boolean }>`
 *  ${atoms("text-teal-600", "text-base", "rounded-md")}
 *  ${props => props.$primary && atoms("shadow-md")}
 * `;
 * ```
 */
declare const atoms: (...atoms: string[]) => () => {
    className: string;
};

export { YakTheme, YakThemeProvider, atoms, css, keyframes, styled, useTheme };
