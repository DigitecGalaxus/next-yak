import { styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LmlucHV0X0dyaWRMYXlvdXRfbTd1QkJ1IHsKICBkaXNwbGF5OiBncmlkOwogIGdyaWQtdGVtcGxhdGUtYXJlYXM6ICJoZWFkZXIgaGVhZGVyIGhlYWRlciIKIm5hdiBjb250ZW50IHNpZGViYXIiCiJmb290ZXIgZm9vdGVyIGZvb3RlciI7CiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAyMDBweCAxZnIgMjAwcHg7CiAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiBhdXRvIDFmciBhdXRvOwogIG1pbi1oZWlnaHQ6IDEwMHZoOwogIGdhcDogMjBweDsKICBwYWRkaW5nOiAyMHB4OwogIGJhY2tncm91bmQtY29sb3I6ICNmMGYwZjA7CiAgQG1lZGlhIChtYXgtd2lkdGg6IDc2OHB4KSB7CiAgICBncmlkLXRlbXBsYXRlLWFyZWFzOiAiaGVhZGVyIgoibmF2IgoiY29udGVudCIKInNpZGViYXIiCiJmb290ZXIiOwogICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnI7CiAgfQogIC5oZWFkZXIgewogICAgZ3JpZC1hcmVhOiBoZWFkZXI7CiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA3YmZmOwogICAgY29sb3I6IHdoaXRlOwogICAgcGFkZGluZzogMjBweDsKICAgIGJvcmRlci1yYWRpdXM6IDhweDsKICB9CiAgLm5hdiB7CiAgICBncmlkLWFyZWE6IG5hdjsKICAgIGJhY2tncm91bmQtY29sb3I6ICMyOGE3NDU7CiAgICBjb2xvcjogd2hpdGU7CiAgICBwYWRkaW5nOiAyMHB4OwogICAgYm9yZGVyLXJhZGl1czogOHB4OwogIH0KICAuY29udGVudCB7CiAgICBncmlkLWFyZWE6IGNvbnRlbnQ7CiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTsKICAgIHBhZGRpbmc6IDIwcHg7CiAgICBib3JkZXItcmFkaXVzOiA4cHg7CiAgICBib3gtc2hhZG93OiAwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjEpOwogIH0KICAuc2lkZWJhciB7CiAgICBncmlkLWFyZWE6IHNpZGViYXI7CiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZjMTA3OwogICAgcGFkZGluZzogMjBweDsKICAgIGJvcmRlci1yYWRpdXM6IDhweDsKICB9CiAgLmZvb3RlciB7CiAgICBncmlkLWFyZWE6IGZvb3RlcjsKICAgIGJhY2tncm91bmQtY29sb3I6ICM2Yzc1N2Q7CiAgICBjb2xvcjogd2hpdGU7CiAgICBwYWRkaW5nOiAyMHB4OwogICAgYm9yZGVyLXJhZGl1czogOHB4OwogICAgdGV4dC1hbGlnbjogY2VudGVyOwogIH0KfQ==";
export const GridLayout = /*YAK EXPORTED STYLED:GridLayout:input_GridLayout_m7uBBu*//*YAK Extracted CSS:
.input_GridLayout_m7uBBu {
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
