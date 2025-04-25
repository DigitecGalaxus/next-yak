import init, { start, transform } from "../wasm/index";

document.getElementsByTagName("button")[0].onclick = () => {
  const input = (document.getElementById("input") as HTMLTextAreaElement).value;

  console.log(`start transformation ${input}`);

  showTransformOutput(transform(input));
};

init().then(() => {
  start();
  console.log("started");
});

const showTransformOutput = (result: string) => {
  document.getElementById("content").innerHTML = result;
};
