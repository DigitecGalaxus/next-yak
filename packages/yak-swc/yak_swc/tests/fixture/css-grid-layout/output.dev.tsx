import { styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "./input.yak.module.css!=!./input?./input.yak.module.css";
export const GridLayout = /*YAK EXPORTED STYLED:GridLayout:input_GridLayout_m7uBBu*//*YAK Extracted CSS:
:global(.input_GridLayout_m7uBBu) {
  display: grid;
  grid-template-areas: "header header header"
"nav content sidebar"
"footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 20px;
  padding: 20px;
  background-color: #f0f0f0;
  @media (max-width: 768px) {
    grid-template-areas: "header"
"nav"
"content"
"sidebar"
"footer";
    grid-template-columns: 1fr;
  }
  .header {
    grid-area: header;
    background-color: #007bff;
    color: white;
    padding: 20px;
    border-radius: 8px;
  }
  .nav {
    grid-area: nav;
    background-color: #28a745;
    color: white;
    padding: 20px;
    border-radius: 8px;
  }
  .content {
    grid-area: content;
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .sidebar {
    grid-area: sidebar;
    background-color: #ffc107;
    padding: 20px;
    border-radius: 8px;
  }
  .footer {
    grid-area: footer;
    background-color: #6c757d;
    color: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
  }
}
*/ /*#__PURE__*/ Object.assign(/*#__PURE__*/ __yak.__yak_div("input_GridLayout_m7uBBu"), {
    "displayName": "GridLayout"
});
