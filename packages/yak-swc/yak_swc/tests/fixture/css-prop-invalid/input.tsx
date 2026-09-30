import { css } from "@yak/react";

const styles = css`color:red;`;
const Elem = () => <div css="invalid" />;
const Elem2 = (props: any) => <div css={props} />;
