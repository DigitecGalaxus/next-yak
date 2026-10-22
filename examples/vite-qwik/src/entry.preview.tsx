// the production server behind `vite preview`: the built client assets and
// the router's node middleware around the server render
import { createQwikRouter } from "@qwik.dev/router/middleware/node";
import render from "./entry.ssr";

export default createQwikRouter({ render });
