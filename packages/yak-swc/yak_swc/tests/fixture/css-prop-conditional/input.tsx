import { css } from "next-yak";

const Elem = () => {
  const show = Math.random() > 0.5;
  return (
    <div
      css={css`
        ${() =>
          show &&
          css`
            color: red;
          `}
      `}
    />
  );
};

const Elem2 = () => {
  const show = Math.random() > 0.5;
  return (
    <div
      css={css`
        ${() =>
          show &&
          css`
            color: red;
          `}
      `}
      className="test-class"
    />
  );
};

const Elem3 = () => {
  const show = Math.random() > 0.5;
  return (
    <div
      style={{ padding: "5px" }}
      css={css`
        ${() =>
          show &&
          css`
            padding: 10px;
          `}
      `}
    />
  );
};

const Elem4 = (props: any) => {
  const show = Math.random() > 0.5;
  return (
    <div
      css={css`
        ${() =>
          show &&
          css`
            color: green;
          `}
      `}
      {...props}
    />
  );
};

const Elem5 = (props: any) => {
  return (
    <div
      css={css`
        ${() =>
          props.show &&
          css`
            color: purple;
          `}
      `}
      {...props.a}
      {...props.b}
    />
  );
};

const Elem6 = (props: any) => {
  return (
    <div
      css={css`
        ${() =>
          props.show &&
          css`
            font-size: 16px;
          `}
      `}
      className="main"
      style={{ fontWeight: "bold" }}
    />
  );
};

const Elem7 = (props: any) => {
  return (
    <div
      css={css`
        ${() => props.show && css``}
      `}
      className="empty-css"
    />
  );
};

const Elem8 = () => {
  const show = Math.random() > 0.5;
  return (
    <div
      css={css`
        color: ${() => show && "red"};
      `}
    />
  );
};

const Elem9 = () => {
  const show = Math.random() > 0.5;
  return (
    <div
      css={css`
        color: ${() => show && "red"};
      `}
      className="test-class"
    />
  );
};

const Elem10 = () => {
  const show = Math.random() > 0.5;
  return (
    <div
      style={{ padding: "5px" }}
      css={css`
        padding: ${() => show && "10px"};
      `}
    />
  );
};

const Elem11 = (props: any) => {
  const show = Math.random() > 0.5;
  return (
    <div
      css={css`
        color: ${() => show && "green"};
      `}
      {...props}
    />
  );
};

const Elem12 = (props: any) => {
  return (
    <div
      css={css`
        color: ${() => props.show && "purple"};
      `}
      {...props.a}
      {...props.b}
    />
  );
};

const Elem13 = (props: any) => {
  return (
    <div
      css={css`
        font-size: ${() => props.show && "16px"};
      `}
      className="main"
      style={{ fontWeight: "bold" }}
    />
  );
};

const Elem14 = (props: any) => {
  return (
    <div
      css={css`
        display: ${() => props.show && "block"};
      `}
      className="empty-css"
    />
  );
};

const Elem15 = (props: any) => {
  return (
    <div
      css={css`
        ${() =>
          props.a &&
          css`
            ${() =>
              props.b &&
              css`
                color: ${() => props.c && "orange"};
              `}
          `}
      `}
    />
  );
};
