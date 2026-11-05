import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  text: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split by LaTeX math patterns: \(...\), \[...\], \frac{...}{...}, \sqrt{...}, ^\circ, or $...$
  const containsLatex = /\\frac|\\sqrt|\^\\circ|\\\(|\\\[|\$/.test(text);

  if (!containsLatex) {
    return <span className={className}>{text}</span>;
  }

  // Parse inline formulas
  const parts: (string | { math: string; display?: boolean })[] = [];

  // Replace \frac{a}{b}, \sqrt{x}, x^\circ patterns
  const mathRegex = /(\\frac\{[^}]+\}\{[^}]+\}|\\sqrt\{[^}]+\}|\d+\^\\circ|\$[^$]+\$)/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = mathRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const formula = match[0].replace(/^\$/, '').replace(/\$$/, '');
    parts.push({ math: formula, display: false });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return (
    <span className={className}>
      {parts.map((p, idx) => {
        if (typeof p === 'string') {
          return <span key={idx}>{p}</span>;
        }
        try {
          const html = katex.renderToString(p.math, {
            throwOnError: false,
            displayMode: p.display || false,
          });
          return (
            <span
              key={idx}
              className="inline-block px-1 align-baseline"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={idx}>{p.math}</span>;
        }
      })}
    </span>
  );
};
