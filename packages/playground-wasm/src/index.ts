import init, {Options, start, transform} from "../wasm/index";

document.getElementsByTagName("button")[0].onclick = () => {
  const input = (document.getElementById("input") as HTMLTextAreaElement).value;

  console.log(`start transformation ${input}`);

  let opts : Options = {
    filename: "theFile.tsx",
    "jsc": {
      "target": "es2020",
      "loose": false,
      "externalHelpers": false,
      "keepClassNames": true,
      "parser": {
        "syntax": "typescript",
        "tsx": true,
        "decorators": true,
      },
      transform: {
        react: {
          "runtime": "automatic",
          // wtf is this?
          "importSource": "@emotion/react"
        }
      },
      "preserveAllComments": true,
    },
      // source is a module
      isModule: true,
      // code gen target should be a module
      module: {
        type: "es6",
      }
    };
  showTransformOutput(transform(input, opts, undefined) as { code: string});
};

init().then(() => {
  start();
  console.log("started");
});

const showTransformOutput = (result: { code: string }) => {
  console.log("result", result);
  document.getElementById("content").innerHTML = result.code;
};
