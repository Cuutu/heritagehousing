"use client";

import ReactMarkdown from "react-markdown";

type PostContentProps = {
  markdown: string;
  className?: string;
};

export function PostContent({ markdown, className }: PostContentProps) {
  return (
    <div
      className={`blog-md text-[15px] leading-relaxed text-[var(--paragraph)] ${className ?? ""}`}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="font-display mt-10 text-3xl font-semibold tracking-tight text-[var(--headline)] first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-display mt-8 text-2xl font-semibold text-[var(--headline)]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 text-lg font-semibold text-[var(--headline)]">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mt-4 first:mt-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mt-4 list-disc space-y-2 pl-6">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-4 list-decimal space-y-2 pl-6">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-[var(--brand-accent)] underline-offset-4 hover:underline"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mt-4 border-l-4 border-[var(--brand-accent)]/40 pl-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code
                  className={`mt-4 block overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm ${className ?? ""}`}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="my-4">{children}</pre>,
          hr: () => <hr className="my-10 border-[var(--brand-border)]" />,
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--headline)]">
              {children}
            </strong>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
