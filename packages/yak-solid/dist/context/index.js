import { createContext, useContext } from "solid-js";
import { createComponent } from "@solidjs/web";

//#region runtime/solid-compat.ts
const renderContextProvider = (context, value, children) => {
	return createComponent(typeof context === "function" ? context : context.Provider, {
		value,
		get children() {
			return children();
		}
	});
};

//#endregion
//#region runtime/context/index.ts
const YakContext = createContext({});
const useTheme = () => useContext(YakContext);
const YakThemeProvider = (props) => {
	return renderContextProvider(YakContext, new Proxy({}, {
		get: (_, key) => props.theme?.[key],
		has: (_, key) => props.theme ? key in props.theme : false,
		ownKeys: () => props.theme ? Reflect.ownKeys(props.theme) : [],
		getOwnPropertyDescriptor: (_, key) => props.theme && key in props.theme ? {
			enumerable: true,
			configurable: true,
			value: props.theme[key]
		} : void 0
	}), () => props.children);
};

//#endregion
export { YakThemeProvider, useTheme };
//# sourceMappingURL=index.js.map