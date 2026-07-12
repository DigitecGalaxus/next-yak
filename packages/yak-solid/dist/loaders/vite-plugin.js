import { viteYak } from "next-yak/vite";

//#region loaders/vite-plugin.ts
function viteYakSolid(options = {}) {
	return viteYak({
		...options,
		library: {
			name: "@yak/solid",
			reactRefreshReg: false,
			excludePattern: /packages\/yak-solid/
		}
	});
}

//#endregion
export { viteYakSolid };
//# sourceMappingURL=vite-plugin.js.map