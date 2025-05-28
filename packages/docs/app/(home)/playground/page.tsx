import DynamicEditor from "@/components/editor";
import "./playground.css";
import { decompressWithDictionary } from "@/components/compress";
import { examples } from "./examples";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Home(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  let initialState: Record<string, string> = examples.base.files;
  if (
    searchParams["q"] &&
    typeof searchParams["q"] === "string" &&
    searchParams["q"].length > 0
  ) {
    initialState = decompressWithDictionary(searchParams["q"]);
  }
  return <DynamicEditor initialState={initialState} />;
}
