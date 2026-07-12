import { createMemo } from "solid-js";
import { Dynamic, createComponent } from "@solidjs/web";
import { YakThemeProvider, useTheme, useTheme as useTheme$1 } from "@yak/solid/context";

//#region runtime/cssLiteral.ts
const yakComponentSymbol = Symbol("yak");
var ClassNames = class {
	value;
	constructor(initial) {
		this.value = initial || "";
	}
	add(className) {
		if (!this.value) this.value = className;
		else if (!this.has(className)) this.value += " " + className;
	}
	has(className) {
		return (" " + this.value + " ").includes(" " + className + " ");
	}
	delete(className) {
		if (this.has(className)) this.value = this.value.split(" ").filter((existing) => existing !== className).join(" ");
	}
};
function css(...args) {
	let className;
	const dynamicCssFunctions = [];
	for (const arg of args) if (typeof arg === "string") className = arg;
	else if (typeof arg === "function") dynamicCssFunctions.push(arg);
	else if (typeof arg === "object" && "style" in arg) dynamicCssFunctions.push((props, _, style) => {
		for (const key in arg.style) {
			const value = arg.style[key];
			if (typeof value === "function") style[key] = String(recursivePropExecution(props, value));
			else style[key] = String(value);
		}
	});
	if (dynamicCssFunctions.length === 0) return Object.assign((_, classNames) => {
		if (className) classNames.add(className);
	}, { $dynamic: false });
	return Object.assign((props, classNames, allStyles) => {
		if (className) classNames.add(className);
		for (let i = 0; i < dynamicCssFunctions.length; i++) unwrapProps(props, dynamicCssFunctions[i], classNames, allStyles);
	}, { $dynamic: true });
}
const unwrapProps = (props, fn, classNames, style) => {
	let result = fn(props, classNames, style);
	while (result) {
		if (typeof result === "function") {
			result = result(props, classNames, style);
			continue;
		} else if (typeof result === "object") {
			const resultClassName = "class" in result && result.class || result.className;
			if (resultClassName) classNames.add(resultClassName);
			if ("style" in result && result.style) for (const key in result.style) style[key] = result.style[key];
		}
		break;
	}
};
const recursivePropExecution = (props, fn) => {
	const result = fn(props);
	if (typeof result === "function") return recursivePropExecution(props, result);
	if (typeof result !== "string" && typeof result !== "number" && !(result instanceof String)) {
		if (process.env.NODE_ENV === "development") throw new Error(`Dynamic CSS functions must return a string or number but returned ${JSON.stringify(result)}\n\nDynamic CSS function: ${fn.toString()}\n`);
	}
	return result;
};

//#endregion
//#region runtime/solid-compat.ts
const renderDynamic = (props) => createComponent(Dynamic, props);
const mergeSolidProps = (...sources) => {
	const resolve = (source) => (typeof source === "function" ? source() : source) ?? {};
	const lookup = (key) => {
		for (let i = sources.length - 1; i >= 0; i--) {
			const resolved = resolve(sources[i]);
			if (key in resolved) return resolved;
		}
	};
	return new Proxy(Object.create(null), {
		get(_, key) {
			return lookup(key)?.[key];
		},
		has(_, key) {
			return lookup(key) !== void 0;
		},
		ownKeys() {
			const keys = /* @__PURE__ */ new Set();
			for (const source of sources) for (const key of Reflect.ownKeys(resolve(source))) keys.add(key);
			return Array.from(keys);
		},
		getOwnPropertyDescriptor(_, key) {
			if (!lookup(key)) return;
			return {
				enumerable: true,
				configurable: true,
				get: () => lookup(key)?.[key]
			};
		}
	});
};

//#endregion
//#region runtime/styled.ts
const styledFactory = (Component) => Object.assign(yakStyled(Component), { attrs: (attrs) => yakStyled(Component, attrs) });
const styled = styledFactory;
const yakStyled = (Component, attrs) => {
	const isYakComponent = typeof Component === "function" && yakComponentSymbol in Component;
	const [, parentAttrsFn, parentRuntimeStylesFn, parentTarget] = isYakComponent ? Component[yakComponentSymbol] : [];
	const targetComponent = isYakComponent ? parentTarget : Component;
	const mergedAttrsFn = buildRuntimeAttrsProcessor(attrs, parentAttrsFn);
	return (styles, ...values) => {
		const runtimeStyleProcessor = buildRuntimeStylesProcessor(css(styles, ...values), parentRuntimeStylesFn);
		const Yak = !mergedAttrsFn && !runtimeStyleProcessor.$dynamic ? (props) => {
			if ("$__runtimeStylesProcessed" in props) return renderDynamic(mergeSolidProps(filterDomProps(props), { component: targetComponent }));
			return renderDynamic(mergeSolidProps(filterDomProps(props), {
				component: targetComponent,
				get class() {
					const classNames = new ClassNames(normalizeClass(props.class));
					runtimeStyleProcessor(props, classNames, void 0);
					return classNames.value || void 0;
				}
			}));
		} : (props) => {
			const theme = useTheme$1();
			const propsWithTheme = mergeSolidProps({ theme }, props);
			const attrsProps = mergedAttrsFn && !("$__attrs" in props) ? createMemo(() => mergedAttrsFn(propsWithTheme)) : void 0;
			const styleInput = attrsProps ? mergeSolidProps(propsWithTheme, attrsProps) : propsWithTheme;
			const computed = "$__runtimeStylesProcessed" in props ? void 0 : createMemo(() => {
				const attrsResult = attrsProps?.();
				const classNames = new ClassNames(normalizeClass(props.class));
				const attrsClass = normalizeClass(attrsResult?.class);
				if (attrsClass) classNames.add(attrsClass);
				const style = runtimeStyleProcessor.$dynamic || attrsResult?.style ? {
					...unwrapStyle(props.style),
					...unwrapStyle(attrsResult?.style)
				} : unwrapStyle(props.style);
				runtimeStyleProcessor(styleInput, classNames, style);
				return {
					class: classNames.value || void 0,
					style: style && Object.keys(style).length > 0 ? style : void 0
				};
			});
			const merged = mergeSolidProps(props, attrsProps ?? {}, computed ? {
				get class() {
					return computed().class;
				},
				get style() {
					return computed().style;
				}
			} : {});
			const allowTheme = () => {
				const attrsResult = attrsProps?.();
				return !!attrsResult && "theme" in attrsResult && attrsResult.theme !== theme;
			};
			return renderDynamic(mergeSolidProps(filterDomProps(merged, allowTheme), { component: targetComponent }));
		};
		return Object.assign(Yak, { [yakComponentSymbol]: [
			Yak,
			mergedAttrsFn,
			runtimeStyleProcessor,
			targetComponent
		] });
	};
};
const normalizeClass = (value) => {
	if (!value) return "";
	if (typeof value === "string") return value;
	if (Array.isArray(value)) return value.map(normalizeClass).filter(Boolean).join(" ");
	if (typeof value === "object") return Object.keys(value).filter((key) => value[key]).join(" ");
	return String(value);
};
const unwrapStyle = (style) => {
	if (typeof style !== "string") return style;
	const result = {};
	for (const declaration of style.split(";")) {
		const colonIndex = declaration.indexOf(":");
		if (colonIndex === -1) continue;
		const property = declaration.slice(0, colonIndex).trim();
		const value = declaration.slice(colonIndex + 1).trim();
		if (property && value) result[property] = value;
	}
	return result;
};
const isBlockedProp = (key, allowTheme) => typeof key === "string" && (key.startsWith("$") || key === "theme" && !(allowTheme && allowTheme()));
const filterDomProps = (props, allowTheme) => new Proxy(props, {
	get: (target, key) => isBlockedProp(key, allowTheme) ? void 0 : Reflect.get(target, key),
	has: (target, key) => !isBlockedProp(key, allowTheme) && Reflect.has(target, key),
	ownKeys: (target) => Reflect.ownKeys(target).filter((key) => !isBlockedProp(key, allowTheme)),
	getOwnPropertyDescriptor: (target, key) => isBlockedProp(key, allowTheme) ? void 0 : Reflect.getOwnPropertyDescriptor(target, key)
});
const mergeClassNames = (a, b) => {
	if (!a && !b) return void 0;
	if (!a) return b;
	if (!b) return a;
	return a + " " + b;
};
const combineProps = (props, newProps) => newProps ? (props.class === newProps.class || !newProps.class) && (props.style === newProps.style || !newProps.style) ? {
	...props,
	...newProps
} : {
	...props,
	...newProps,
	class: mergeClassNames(props.class, newProps.class),
	style: {
		...unwrapStyle(props.style),
		...unwrapStyle(newProps.style)
	}
} : props;
const buildRuntimeAttrsProcessor = (attrs, parentAttrsFn) => {
	const ownAttrsFn = attrs && (typeof attrs === "function" ? attrs : () => attrs);
	if (ownAttrsFn && parentAttrsFn) return (props) => {
		const parentProps = parentAttrsFn(props);
		return combineProps(parentProps, ownAttrsFn(combineProps(props, parentProps)));
	};
	return ownAttrsFn || parentAttrsFn;
};
const buildRuntimeStylesProcessor = (runtimeStylesFn, parentRuntimeStylesFn) => {
	if (runtimeStylesFn && parentRuntimeStylesFn) return Object.assign((props, classNames, style) => {
		parentRuntimeStylesFn(props, classNames, style);
		runtimeStylesFn(props, classNames, style);
	}, { $dynamic: runtimeStylesFn.$dynamic || parentRuntimeStylesFn.$dynamic });
	return runtimeStylesFn || parentRuntimeStylesFn;
};

//#endregion
//#region runtime/atoms.ts
const atoms = (...atoms) => {
	const staticClasses = [];
	const dynamicFunctions = [];
	for (const atom of atoms) if (typeof atom === "string") staticClasses.push(...atom.split(" "));
	else if (typeof atom === "function") dynamicFunctions.push(atom);
	return css(...staticClasses.length > 0 ? [(_, classNames) => {
		staticClasses.forEach((cls) => classNames.add(cls));
	}, ...dynamicFunctions] : dynamicFunctions);
};

//#endregion
//#region runtime/keyframes.ts
const keyframes = (styles, ..._dynamic) => {
	return styles;
};

//#endregion
//#region runtime/globalStyle.ts
const globalStyle = (_styles, ..._values) => {};

//#endregion
//#region runtime/internals/unitPostFix.ts
const unitPostFix = (arg, unit) => {
	switch (typeof arg) {
		case "function": return (props) => unitPostFix(arg(props), unit);
		case "number":
		case "string": return `${arg}${unit}`;
		default: return;
	}
};

//#endregion
//#region runtime/internals/mergeCssProp.ts
const mergeCssProp = (relevantProps, cssProp) => {
	const classNames = new ClassNames(relevantProps.class);
	const existingStyle = relevantProps.style;
	const style = existingStyle ? { ...existingStyle } : {};
	cssProp({}, classNames, style);
	const result = {};
	if (Object.keys(style).length > 0) result.style = style;
	if (classNames.value) result.class = classNames.value;
	return result;
};

//#endregion
//#region runtime/styledDom.ts
const __yak_a = /*#__PURE__*/ styled("a");
const __yak_abbr = /*#__PURE__*/ styled("abbr");
const __yak_address = /*#__PURE__*/ styled("address");
const __yak_area = /*#__PURE__*/ styled("area");
const __yak_article = /*#__PURE__*/ styled("article");
const __yak_aside = /*#__PURE__*/ styled("aside");
const __yak_audio = /*#__PURE__*/ styled("audio");
const __yak_b = /*#__PURE__*/ styled("b");
const __yak_base = /*#__PURE__*/ styled("base");
const __yak_bdi = /*#__PURE__*/ styled("bdi");
const __yak_bdo = /*#__PURE__*/ styled("bdo");
const __yak_big = /*#__PURE__*/ styled("big");
const __yak_blockquote = /*#__PURE__*/ styled("blockquote");
const __yak_body = /*#__PURE__*/ styled("body");
const __yak_br = /*#__PURE__*/ styled("br");
const __yak_button = /*#__PURE__*/ styled("button");
const __yak_canvas = /*#__PURE__*/ styled("canvas");
const __yak_caption = /*#__PURE__*/ styled("caption");
const __yak_cite = /*#__PURE__*/ styled("cite");
const __yak_code = /*#__PURE__*/ styled("code");
const __yak_col = /*#__PURE__*/ styled("col");
const __yak_colgroup = /*#__PURE__*/ styled("colgroup");
const __yak_data = /*#__PURE__*/ styled("data");
const __yak_datalist = /*#__PURE__*/ styled("datalist");
const __yak_dd = /*#__PURE__*/ styled("dd");
const __yak_del = /*#__PURE__*/ styled("del");
const __yak_details = /*#__PURE__*/ styled("details");
const __yak_dfn = /*#__PURE__*/ styled("dfn");
const __yak_dialog = /*#__PURE__*/ styled("dialog");
const __yak_div = /*#__PURE__*/ styled("div");
const __yak_dl = /*#__PURE__*/ styled("dl");
const __yak_dt = /*#__PURE__*/ styled("dt");
const __yak_em = /*#__PURE__*/ styled("em");
const __yak_embed = /*#__PURE__*/ styled("embed");
const __yak_fieldset = /*#__PURE__*/ styled("fieldset");
const __yak_figcaption = /*#__PURE__*/ styled("figcaption");
const __yak_figure = /*#__PURE__*/ styled("figure");
const __yak_footer = /*#__PURE__*/ styled("footer");
const __yak_form = /*#__PURE__*/ styled("form");
const __yak_h1 = /*#__PURE__*/ styled("h1");
const __yak_h2 = /*#__PURE__*/ styled("h2");
const __yak_h3 = /*#__PURE__*/ styled("h3");
const __yak_h4 = /*#__PURE__*/ styled("h4");
const __yak_h5 = /*#__PURE__*/ styled("h5");
const __yak_h6 = /*#__PURE__*/ styled("h6");
const __yak_header = /*#__PURE__*/ styled("header");
const __yak_hgroup = /*#__PURE__*/ styled("hgroup");
const __yak_hr = /*#__PURE__*/ styled("hr");
const __yak_html = /*#__PURE__*/ styled("html");
const __yak_i = /*#__PURE__*/ styled("i");
const __yak_iframe = /*#__PURE__*/ styled("iframe");
const __yak_img = /*#__PURE__*/ styled("img");
const __yak_input = /*#__PURE__*/ styled("input");
const __yak_ins = /*#__PURE__*/ styled("ins");
const __yak_kbd = /*#__PURE__*/ styled("kbd");
const __yak_keygen = /*#__PURE__*/ styled("keygen");
const __yak_label = /*#__PURE__*/ styled("label");
const __yak_legend = /*#__PURE__*/ styled("legend");
const __yak_li = /*#__PURE__*/ styled("li");
const __yak_link = /*#__PURE__*/ styled("link");
const __yak_main = /*#__PURE__*/ styled("main");
const __yak_map = /*#__PURE__*/ styled("map");
const __yak_mark = /*#__PURE__*/ styled("mark");
const __yak_menu = /*#__PURE__*/ styled("menu");
const __yak_menuitem = /*#__PURE__*/ styled("menuitem");
const __yak_meta = /*#__PURE__*/ styled("meta");
const __yak_meter = /*#__PURE__*/ styled("meter");
const __yak_nav = /*#__PURE__*/ styled("nav");
const __yak_noscript = /*#__PURE__*/ styled("noscript");
const __yak_object = /*#__PURE__*/ styled("object");
const __yak_ol = /*#__PURE__*/ styled("ol");
const __yak_optgroup = /*#__PURE__*/ styled("optgroup");
const __yak_option = /*#__PURE__*/ styled("option");
const __yak_output = /*#__PURE__*/ styled("output");
const __yak_p = /*#__PURE__*/ styled("p");
const __yak_param = /*#__PURE__*/ styled("param");
const __yak_picture = /*#__PURE__*/ styled("picture");
const __yak_pre = /*#__PURE__*/ styled("pre");
const __yak_progress = /*#__PURE__*/ styled("progress");
const __yak_q = /*#__PURE__*/ styled("q");
const __yak_rp = /*#__PURE__*/ styled("rp");
const __yak_rt = /*#__PURE__*/ styled("rt");
const __yak_ruby = /*#__PURE__*/ styled("ruby");
const __yak_s = /*#__PURE__*/ styled("s");
const __yak_samp = /*#__PURE__*/ styled("samp");
const __yak_script = /*#__PURE__*/ styled("script");
const __yak_section = /*#__PURE__*/ styled("section");
const __yak_select = /*#__PURE__*/ styled("select");
const __yak_small = /*#__PURE__*/ styled("small");
const __yak_source = /*#__PURE__*/ styled("source");
const __yak_span = /*#__PURE__*/ styled("span");
const __yak_strong = /*#__PURE__*/ styled("strong");
const __yak_style = /*#__PURE__*/ styled("style");
const __yak_sub = /*#__PURE__*/ styled("sub");
const __yak_summary = /*#__PURE__*/ styled("summary");
const __yak_sup = /*#__PURE__*/ styled("sup");
const __yak_table = /*#__PURE__*/ styled("table");
const __yak_tbody = /*#__PURE__*/ styled("tbody");
const __yak_td = /*#__PURE__*/ styled("td");
const __yak_textarea = /*#__PURE__*/ styled("textarea");
const __yak_tfoot = /*#__PURE__*/ styled("tfoot");
const __yak_th = /*#__PURE__*/ styled("th");
const __yak_thead = /*#__PURE__*/ styled("thead");
const __yak_time = /*#__PURE__*/ styled("time");
const __yak_tr = /*#__PURE__*/ styled("tr");
const __yak_track = /*#__PURE__*/ styled("track");
const __yak_u = /*#__PURE__*/ styled("u");
const __yak_ul = /*#__PURE__*/ styled("ul");
const __yak_use = /*#__PURE__*/ styled("use");
const __yak_var = /*#__PURE__*/ styled("var");
const __yak_video = /*#__PURE__*/ styled("video");
const __yak_wbr = /*#__PURE__*/ styled("wbr");
const __yak_circle = /*#__PURE__*/ styled("circle");
const __yak_clipPath = /*#__PURE__*/ styled("clipPath");
const __yak_defs = /*#__PURE__*/ styled("defs");
const __yak_ellipse = /*#__PURE__*/ styled("ellipse");
const __yak_foreignObject = /*#__PURE__*/ styled("foreignObject");
const __yak_g = /*#__PURE__*/ styled("g");
const __yak_image = /*#__PURE__*/ styled("image");
const __yak_line = /*#__PURE__*/ styled("line");
const __yak_linearGradient = /*#__PURE__*/ styled("linearGradient");
const __yak_marker = /*#__PURE__*/ styled("marker");
const __yak_mask = /*#__PURE__*/ styled("mask");
const __yak_path = /*#__PURE__*/ styled("path");
const __yak_pattern = /*#__PURE__*/ styled("pattern");
const __yak_polygon = /*#__PURE__*/ styled("polygon");
const __yak_polyline = /*#__PURE__*/ styled("polyline");
const __yak_radialGradient = /*#__PURE__*/ styled("radialGradient");
const __yak_rect = /*#__PURE__*/ styled("rect");
const __yak_stop = /*#__PURE__*/ styled("stop");
const __yak_svg = /*#__PURE__*/ styled("svg");
const __yak_text = /*#__PURE__*/ styled("text");
const __yak_tspan = /*#__PURE__*/ styled("tspan");

//#endregion
export { YakThemeProvider, __yak_a, __yak_abbr, __yak_address, __yak_area, __yak_article, __yak_aside, __yak_audio, __yak_b, __yak_base, __yak_bdi, __yak_bdo, __yak_big, __yak_blockquote, __yak_body, __yak_br, __yak_button, __yak_canvas, __yak_caption, __yak_circle, __yak_cite, __yak_clipPath, __yak_code, __yak_col, __yak_colgroup, __yak_data, __yak_datalist, __yak_dd, __yak_defs, __yak_del, __yak_details, __yak_dfn, __yak_dialog, __yak_div, __yak_dl, __yak_dt, __yak_ellipse, __yak_em, __yak_embed, __yak_fieldset, __yak_figcaption, __yak_figure, __yak_footer, __yak_foreignObject, __yak_form, __yak_g, __yak_h1, __yak_h2, __yak_h3, __yak_h4, __yak_h5, __yak_h6, __yak_header, __yak_hgroup, __yak_hr, __yak_html, __yak_i, __yak_iframe, __yak_image, __yak_img, __yak_input, __yak_ins, __yak_kbd, __yak_keygen, __yak_label, __yak_legend, __yak_li, __yak_line, __yak_linearGradient, __yak_link, __yak_main, __yak_map, __yak_mark, __yak_marker, __yak_mask, __yak_menu, __yak_menuitem, mergeCssProp as __yak_mergeCssProp, __yak_meta, __yak_meter, __yak_nav, __yak_noscript, __yak_object, __yak_ol, __yak_optgroup, __yak_option, __yak_output, __yak_p, __yak_param, __yak_path, __yak_pattern, __yak_picture, __yak_polygon, __yak_polyline, __yak_pre, __yak_progress, __yak_q, __yak_radialGradient, __yak_rect, __yak_rp, __yak_rt, __yak_ruby, __yak_s, __yak_samp, __yak_script, __yak_section, __yak_select, __yak_small, __yak_source, __yak_span, __yak_stop, __yak_strong, __yak_style, __yak_sub, __yak_summary, __yak_sup, __yak_svg, __yak_table, __yak_tbody, __yak_td, __yak_text, __yak_textarea, __yak_tfoot, __yak_th, __yak_thead, __yak_time, __yak_tr, __yak_track, __yak_tspan, __yak_u, __yak_ul, unitPostFix as __yak_unitPostFix, __yak_use, __yak_var, __yak_video, __yak_wbr, atoms, css, globalStyle, keyframes, styled, useTheme };
//# sourceMappingURL=internal.js.map