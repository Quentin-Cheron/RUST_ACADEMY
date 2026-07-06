"use client";

import Editor from "react-simple-code-editor";
import hljs from "highlight.js/lib/core";
import rust from "highlight.js/lib/languages/rust";

hljs.registerLanguage("rust", rust);

function highlight(code: string): string {
  try {
    return hljs.highlight(code, { language: "rust" }).value;
  } catch {
    return code;
  }
}

export default function CodeEditor({
  value,
  onValueChange,
  readOnly = false,
}: {
  value: string;
  onValueChange: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-code-bg">
      <Editor
        value={value}
        onValueChange={onValueChange}
        highlight={highlight}
        readOnly={readOnly}
        padding={16}
        tabSize={4}
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
