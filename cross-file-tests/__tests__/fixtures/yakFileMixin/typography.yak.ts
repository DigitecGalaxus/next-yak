import { css } from "next-yak";

const elements = [
    "h1",
    "h2",
    "h3"
]

export const typography = Object.fromEntries(elements.map((element, i) => {
    return [element, css`
        font-family: "Roboto", sans-serif;
        font-size: ${16 - i * 2}px;
        font-weight: 400;
        line-height: 1.5;
        letter-spacing: 0.00938em;
    `]
}));