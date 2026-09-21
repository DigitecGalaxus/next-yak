import { hydrate } from "@solidjs/web";
import App from "../cases/[case-name]/index.tsx";

hydrate(() => <App />, document.getElementById("root")!);
