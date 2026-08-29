import React, { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { SchemaNav, type SchemaNavHeading } from "./SchemaNav";
import "./Editor.css";

export interface TextEditorDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** HTML content string (output of TextEditor) */
  content: string;
  
  /** Enable KaTeX LaTeX rendering @default true */
  enableLatex?: boolean;
  
  /** Show document outline sidebar @default false */
  showOutline?: boolean;
  
  /** Published timestamp (optional) */
  publishedAt?: string | Date | number;
  
  /** Author display name (optional) */
  author?: string;
  
  className?: string;
  classNames?: TextEditorDisplayClassNames;
}

export interface TextEditorDisplayClassNames {
  root?: string;
  main?: string;
  stage?: string;
  content?: string;
  sidebar?: string;
  meta?: string;
}

function processEditorLatex(input: string): string {
  if (!input) return "";

  const pattern = /(?:\$\$\s*([\s\S]+?)\s*\$\$|\\\[\s*([\s\S]+?)\s*\\\])|(?:\$(?!\$)\s*([^\$\n]+?)\s*\$|\\\(\s*([\s\S]+?)\s*\\\))/g;

  return input.replace(pattern, (match, block1, block2, inline1, inline2) => {
    const blockMath = block1 ?? block2;
    const inlineMath = inline1 ?? inline2;
    const isBlock = blockMath !== undefined;
    const mathContent = blockMath ?? inlineMath;

    try {
      const renderedHtml = katex.renderToString(mathContent, {
        displayMode: isBlock,
        throwOnError: true,
        output: "htmlAndMathml",
      });

      if (isBlock) {
        return `<div class="bs-latex-block">${renderedHtml}</div>`;
      }
      return `<span class="bs-latex-inline">${renderedHtml}</span>`;
    } catch (err) {
      return `<code class="bs-latex-error" title="LaTeX Syntax Error: ${(err as Error)?.message}">${mathContent}</code>`;
    }
  });
}

// Generate simple mock headings from H1, H2, H3 elements for the outline
function generateOutline(html: string): SchemaNavHeading[] {
  if (typeof document === "undefined") return []; // SSR safety
  
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  
  const headers = tempDiv.querySelectorAll("h1, h2, h3");
  const headings: SchemaNavHeading[] = [];
  
  headers.forEach((h, i) => {
    const level = parseInt(h.tagName.substring(1)) as 1 | 2 | 3;
    headings.push({
      id: `h${level}-${i}`,
      text: h.textContent || "",
      level,
    });
  });
  
  return headings;
}

export function TextEditorDisplay({
  content,
  enableLatex = true,
  showOutline = false,
  publishedAt,
  author,
  className = "",
  classNames,
  style,
  ...props
}: TextEditorDisplayProps) {
  const renderedContent = useMemo(() => {
    return enableLatex ? processEditorLatex(content) : content;
  }, [content, enableLatex]);

  const outline = useMemo(() => {
    return showOutline ? generateOutline(content) : [];
  }, [content, showOutline]);

  const formattedDate = useMemo(() => {
    if (!publishedAt) return null;
    return new Date(publishedAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [publishedAt]);

  return (
    <div
      className={["bs-text-editor-display", className, classNames?.root].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      <div className={["bs-text-editor-main", classNames?.main].filter(Boolean).join(" ")}>
        <div className={["bs-text-editor-stage", classNames?.stage].filter(Boolean).join(" ")}>
          
          {/* Metadata Header */}
          {(author || formattedDate) && (
            <div className={["bs-text-editor-display-meta", classNames?.meta].filter(Boolean).join(" ")}>
              {author && <span className="bs-meta-author">By {author}</span>}
              {author && formattedDate && <span className="bs-meta-dot">·</span>}
              {formattedDate && <span className="bs-meta-date">Published {formattedDate}</span>}
            </div>
          )}

          {/* Rendered HTML Document */}
          <div
            className={["bs-text-editor-content", "bs-text-editor-content--display", classNames?.content].filter(Boolean).join(" ")}
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        </div>

        {showOutline && outline.length > 0 && (
          <div className={["bs-text-editor-sidebar", classNames?.sidebar].filter(Boolean).join(" ")}>
            <SchemaNav headings={outline} />
          </div>
        )}
      </div>
    </div>
  );
}
