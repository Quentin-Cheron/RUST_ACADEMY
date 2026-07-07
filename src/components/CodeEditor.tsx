"use client";

import Editor from "react-simple-code-editor";
import hljs from "highlight.js/lib/core";
import rust from "highlight.js/lib/languages/rust";
import bash from "highlight.js/lib/languages/bash";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import yaml from "highlight.js/lib/languages/yaml";
import type { CodeLanguage } from "@/content/types";

hljs.registerLanguage("rust", rust);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("dockerfile", dockerfile);
hljs.registerLanguage("yaml", yaml);

const SUPPORTED = new Set(["rust", "bash", "dockerfile", "yaml"]);

function makeHighlight(language: CodeLanguage) {
  const lang = SUPPORTED.has(language) ? language : "rust";
  return (code: string): string => {
    try {
      return hljs.highlight(code, { language: lang }).value;
    } catch {
      return code;
    }
  };
}

export default function CodeEditor({
  value,
  onValueChange,
  readOnly = false,
  language = "rust",
}: {
  value: string;
  onValueChange: (v: string) => void;
  readOnly?: boolean;
  language?: CodeLanguage;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-code-bg">
      <Editor
        value={value}
        onValueChange={onValueChange}
        highlight={makeHighlight(language)}
        readOnly={readOnly}
        padding={16}
        tabSize={language === "yaml" ? 2 : 4}
        insertSpaces
        textareaClassName="focus:outline-none"
        className="hljs min-h-[180px] font-mono text-sm leading-relaxed"
        style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          color: "#d7dae0",
        }}
      />
    </div>
  );
}
