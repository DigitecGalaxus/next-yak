import { styled } from "next-yak/internal";
import * as __yak from "next-yak/internal";
import "data:text/css;base64,LnltN3VCQnUgewogIGRpc3BsYXk6IGdyaWQ7CiAgZ3JpZC10ZW1wbGF0ZS1hcmVhczogImhlYWRlciBoZWFkZXIgaGVhZGVyIgoibmF2IGNvbnRlbnQgc2lkZWJhciIKImZvb3RlciBmb290ZXIgZm9vdGVyIjsKICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDIwMHB4IDFmciAyMDBweDsKICBncmlkLXRlbXBsYXRlLXJvd3M6IGF1dG8gMWZyIGF1dG87CiAgbWluLWhlaWdodDogMTAwdmg7CiAgZ2FwOiAyMHB4OwogIHBhZGRpbmc6IDIwcHg7CiAgYmFja2dyb3VuZC1jb2xvcjogI2YwZjBmMDsKICBAbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHsKICAgIGdyaWQtdGVtcGxhdGUtYXJlYXM6ICJoZWFkZXIiCiJuYXYiCiJjb250ZW50Igoic2lkZWJhciIKImZvb3RlciI7CiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmcjsKICB9CiAgLmhlYWRlciB7CiAgICBncmlkLWFyZWE6IGhlYWRlcjsKICAgIGJhY2tncm91bmQtY29sb3I6ICMwMDdiZmY7CiAgICBjb2xvcjogd2hpdGU7CiAgICBwYWRkaW5nOiAyMHB4OwogICAgYm9yZGVyLXJhZGl1czogOHB4OwogIH0KICAubmF2IHsKICAgIGdyaWQtYXJlYTogbmF2OwogICAgYmFja2dyb3VuZC1jb2xvcjogIzI4YTc0NTsKICAgIGNvbG9yOiB3aGl0ZTsKICAgIHBhZGRpbmc6IDIwcHg7CiAgICBib3JkZXItcmFkaXVzOiA4cHg7CiAgfQogIC5jb250ZW50IHsKICAgIGdyaWQtYXJlYTogY29udGVudDsKICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlOwogICAgcGFkZGluZzogMjBweDsKICAgIGJvcmRlci1yYWRpdXM6IDhweDsKICAgIGJveC1zaGFkb3c6IDAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMSk7CiAgfQogIC5zaWRlYmFyIHsKICAgIGdyaWQtYXJlYTogc2lkZWJhcjsKICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmMxMDc7CiAgICBwYWRkaW5nOiAyMHB4OwogICAgYm9yZGVyLXJhZGl1czogOHB4OwogIH0KICAuZm9vdGVyIHsKICAgIGdyaWQtYXJlYTogZm9vdGVyOwogICAgYmFja2dyb3VuZC1jb2xvcjogIzZjNzU3ZDsKICAgIGNvbG9yOiB3aGl0ZTsKICAgIHBhZGRpbmc6IDIwcHg7CiAgICBib3JkZXItcmFkaXVzOiA4cHg7CiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7CiAgfQp9";
export const GridLayout = /*YAK EXPORTED STYLED:GridLayout:ym7uBBu*//*YAK Extracted CSS:
.ym7uBBu {
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
*/ /*#__PURE__*/ __yak.__yak_div("ym7uBBu");
