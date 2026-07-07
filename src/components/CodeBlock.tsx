"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import hljs from "highlight.js/lib/core";
import rust from "highlight.js/lib/languages/rust";
import bash from "highlight.js/lib/languages/bash";
import ini from "highlight.js/lib/languages/ini"; // pour TOML
import dockerfile from "highlight.js/lib/languages/dockerfile";
import yaml from "highlight.js/lib/languages/yaml";
import go from "highlight.js/lib/languages/go";
import type { CodeLanguage } from "@/content/types";
import { Button } from "@/components/ui/button";

hljs.registerLanguage("rust", rust);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("toml", ini);
hljs.registerLanguage("dockerfile", dockerfile);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("go", go);

interface Props {
  code: string;
  language?: CodeLanguage;
  filename?: string;
  caption?: string;
}

const langLabel: Record<CodeLanguage, string> = {
  rust: "Rust",
  bash: "Terminal",
  toml: "Cargo.toml",
  text: "Texte",
  dockerfile: "Dockerfile",
  yaml: "YAML",
  go: "Go",
};

export default function CodeBlock({
  code,
  language = "rust",
  filename,
  caption,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ref.current && language !== "text") {
      ref.current.removeAttribute("data-highlighted");
      hljs.highlightElement(ref.current);
    }
  }, [code, language]);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <figure className="group my-5 overflow-hidden rounded-xl border border-border bg-code-bg shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 bg-code-header px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          <span className="ml-2 font-mono text-xs text-zinc-400">
            {filename ?? langLabel[language]}
          </span>
        </div>
        <Button
          onClick={copy}
          variant="ghost"
          size="sm"
          className="text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="text-emerald-400" /> : <Copy />}
          {copied ? "Copie" : "Copier"}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code ref={ref} className={`language-${language} font-mono`}>
          {code}
        </code>
      </pre>
      {caption && (
        <figcaption className="border-t border-white/10 px-4 py-2 text-xs text-zinc-400 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
