import { Target } from "lucide-react";
import type { ContentBlock } from "@/content/types";
import { renderInline } from "@/lib/inline";
import CodeBlock from "./CodeBlock";
import Callout from "./Callout";

export default function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return block.level === 2 ? (
              <h3 key={i} className="mt-8 mb-3 text-xl font-bold text-foreground">
                {block.text}
              </h3>
            ) : (
              <h4 key={i} className="mt-6 mb-2 text-lg font-semibold text-foreground">
                {block.text}
              </h4>
            );

          case "paragraph":
            return (
              <p key={i} className="my-4 leading-7 text-foreground/90">
                {renderInline(block.text)}
              </p>
            );

          case "code":
            return (
              <CodeBlock
                key={i}
                code={block.code}
                language={block.language}
                filename={block.filename}
                caption={block.caption}
              />
            );

          case "callout":
            return <Callout key={i} variant={block.variant} title={block.title} text={block.text} />;

          case "list":
            return block.ordered ? (
              <ol key={i} className="my-4 list-decimal space-y-1.5 pl-6 leading-7 text-foreground/90">
                {block.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="my-4 list-disc space-y-1.5 pl-6 leading-7 text-foreground/90">
                {block.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ul>
            );

          case "usecase":
            return (
              <div
                key={i}
                className="my-5 rounded-xl border border-primary/30 bg-primary/[0.06] p-4"
              >
                <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-primary">
                  <Target className="size-4" />
                  <span>Dans quel cas c&apos;est utile &mdash; {block.title}</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">{renderInline(block.text)}</p>
              </div>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
