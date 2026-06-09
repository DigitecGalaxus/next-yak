import { importHeader, libs, styledIdentFor, writeBenchmarkSource } from "../_shared.ts";

// 1000 components with $primary / $size / $variant / $disabled props, each
// driving a different CSS property via inline ternaries inside the template
// literal. Yak compiles these to CSS variables; styled-components hashes
// the resulting prop tuple to a class. Pair with IdiomaticDynamicProps for
// the class-toggle counterpart.
const componentCount = 1000;

for (const lib of libs) {
  const styled = styledIdentFor(lib);

  const fileContent = `
"use client";
import React, { type FunctionComponent } from 'react';
${importHeader(lib)}

interface DynamicProps {
  $primary?: boolean;
  $size?: 'small' | 'medium' | 'large';
  $variant?: 'solid' | 'outline' | 'ghost';
  $disabled?: boolean;
}

${Array.from({ length: componentCount }, (_, index) => {
  const baseColor = `#${(index + 1).toString(16).padStart(6, "0")}`;
  return `const DynamicComponent${index + 1} = ${styled}.div<DynamicProps>\`
  color: \${props => props.$primary ? '${baseColor}' : '#666'};
  background-color: \${props => {
    if (props.$disabled) return '#f5f5f5';
    if (props.$variant === 'solid') return '${baseColor}22';
    if (props.$variant === 'outline') return 'transparent';
    return '${baseColor}11';
  }};
  border: 2px solid \${props => {
    if (props.$disabled) return '#ddd';
    if (props.$variant === 'outline') return '${baseColor}';
    return 'transparent';
  }};
  padding: \${props => {
    switch (props.$size) {
      case 'small': return '4px 8px';
      case 'large': return '12px 24px';
      default: return '8px 16px';
    }
  }};
  font-size: \${props => {
    switch (props.$size) {
      case 'small': return '12px';
      case 'large': return '18px';
      default: return '14px';
    }
  }};
  border-radius: 6px;
  margin: 2px;
  display: inline-block;
  cursor: \${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: \${props => props.$disabled ? 0.5 : 1};
  transition: all 0.2s ease;

  &:hover {
    transform: \${props => props.$disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: \${props => props.$disabled ? 'none' : \`0 2px 4px ${baseColor}44\`};
  }

  &:active {
    transform: \${props => props.$disabled ? 'none' : 'translateY(0)'};
  }
\`;`;
}).join("\n\n")}

export const DynamicPropsComponents${
    lib === "next-yak" ? "Yak" : "Styled"
  }: FunctionComponent = () => {
  const [state, setState] = React.useState(0);

  return (
    <div>
      <button onClick={() => setState(s => s + 1)}>
        Toggle State ({state})
      </button>
      ${Array.from({ length: componentCount }, (_, index) => {
        const variants = ["solid", "outline", "ghost"];
        const sizes = ["small", "medium", "large"];
        const variant = variants[index % variants.length];
        const size = sizes[index % sizes.length];
        const isPrimary = index % 2 === 0;
        const isDisabled = index % 10 === 0;

        return `<DynamicComponent${index + 1}
        $primary={${isPrimary}}
        $size="${size}"
        $variant="${variant}"
        $disabled={${isDisabled}}
      >
        Dynamic {${index + 1}} {state % 2 === 0 ? 'A' : 'B'}
      </DynamicComponent${index + 1}>`;
      }).join("\n      ")}
    </div>
  );
};
`;

  writeBenchmarkSource("DynamicPropsComponents", lib, fileContent);
}

// Vanilla lane: the optimal version of yak's own mechanism — literal class
// name plus a plain object literal of CSS variables computed with the same
// ternary logic, zero library runtime. Same var count as the compiled yak
// output so the comparison isolates runtime overhead, not mechanism.
const vanillaSource = `
"use client";
import React, { type FunctionComponent } from 'react';

interface DynamicProps {
  $primary?: boolean;
  $size?: 'small' | 'medium' | 'large';
  $variant?: 'solid' | 'outline' | 'ghost';
  $disabled?: boolean;
  children?: React.ReactNode;
}

${Array.from({ length: componentCount }, (_, index) => {
  const baseColor = `#${(index + 1).toString(16).padStart(6, "0")}`;
  return `const DynamicComponent${index + 1}: FunctionComponent<DynamicProps> = ({ $primary, $size, $variant, $disabled, children }) => (
  <div
    className="dyn_${index + 1}"
    style={{
      '--c': $primary ? '${baseColor}' : '#666',
      '--bg': $disabled ? '#f5f5f5' : $variant === 'solid' ? '${baseColor}22' : $variant === 'outline' ? 'transparent' : '${baseColor}11',
      '--bc': $disabled ? '#ddd' : $variant === 'outline' ? '${baseColor}' : 'transparent',
      '--p': $size === 'small' ? '4px 8px' : $size === 'large' ? '12px 24px' : '8px 16px',
      '--fs': $size === 'small' ? '12px' : $size === 'large' ? '18px' : '14px',
      '--cur': $disabled ? 'not-allowed' : 'pointer',
      '--op': $disabled ? 0.5 : 1,
      '--htf': $disabled ? 'none' : 'translateY(-1px)',
      '--hbs': $disabled ? 'none' : '0 2px 4px ${baseColor}44',
      '--atf': $disabled ? 'none' : 'translateY(0)',
    } as React.CSSProperties}
  >
    {children}
  </div>
);`;
}).join("\n\n")}

export const DynamicPropsComponentsVanilla: FunctionComponent = () => {
  const [state, setState] = React.useState(0);

  return (
    <div>
      <button onClick={() => setState(s => s + 1)}>
        Toggle State ({state})
      </button>
      ${Array.from({ length: componentCount }, (_, index) => {
        const variants = ["solid", "outline", "ghost"];
        const sizes = ["small", "medium", "large"];
        const variant = variants[index % variants.length];
        const size = sizes[index % sizes.length];
        const isPrimary = index % 2 === 0;
        const isDisabled = index % 10 === 0;

        return `<DynamicComponent${index + 1}
        $primary={${isPrimary}}
        $size="${size}"
        $variant="${variant}"
        $disabled={${isDisabled}}
      >
        Dynamic {${index + 1}} {state % 2 === 0 ? 'A' : 'B'}
      </DynamicComponent${index + 1}>`;
      }).join("\n      ")}
    </div>
  );
};
`;

writeBenchmarkSource("DynamicPropsComponents", "vanilla", vanillaSource);
