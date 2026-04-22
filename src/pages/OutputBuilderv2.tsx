import { Fragment, useMemo, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import planMarkdown from "../../output_builder_implementation_plan.md?raw";
import arrowSvg from "../assets/arrow.svg?raw";
import "./OutputBuilderv2.css";

type InlineToken =
  | { type: "text"; content: string }
  | { type: "strong"; content: string }
  | { type: "code"; content: string };

type ContentNode =
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "heading"; text: string };

type MarkdownSection = {
  title: string;
  nodes: ContentNode[];
};

type ParsedDocument = {
  title: string;
  sections: MarkdownSection[];
};

type OutputBuilderv2Props = {
  onBack: () => void;
};

type SectionGroup = {
  title: string;
  nodes: ContentNode[];
};

function InlineArrow() {
  return (
    <span
      className="ob2-back__icon"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: arrowSvg }}
    />
  );
}

function flushListNode(
  nodes: ContentNode[],
  currentList: { ordered: boolean; items: string[] } | null,
) {
  if (!currentList || currentList.items.length === 0) {
    return null;
  }

  nodes.push({
    type: "list",
    ordered: currentList.ordered,
    items: [...currentList.items],
  });

  return null;
}

function parseMarkdown(source: string): ParsedDocument {
  const document: ParsedDocument = {
    title: "",
    sections: [],
  };

  let currentSection: MarkdownSection | null = null;
  let currentList: { ordered: boolean; items: string[] } | null = null;

  for (const line of source.split("\n")) {
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      if (currentSection) {
        currentList = flushListNode(currentSection.nodes, currentList);
      }
      continue;
    }

    if (trimmed.startsWith("# ")) {
      document.title = trimmed.slice(2);
      continue;
    }

    if (trimmed.startsWith("## ")) {
      if (currentSection) {
        currentList = flushListNode(currentSection.nodes, currentList);
      }

      currentSection = {
        title: trimmed.slice(3),
        nodes: [],
      };
      document.sections.push(currentSection);
      continue;
    }

    if (!currentSection) {
      continue;
    }

    if (trimmed.startsWith("### ")) {
      currentList = flushListNode(currentSection.nodes, currentList);
      currentSection.nodes.push({
        type: "heading",
        text: trimmed.slice(4),
      });
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const item = trimmed.slice(2);
      if (!currentList || currentList.ordered) {
        currentList = flushListNode(currentSection.nodes, currentList) ?? {
          ordered: false,
          items: [],
        };
      }
      currentList.items.push(item);
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      if (!currentList || !currentList.ordered) {
        currentList = flushListNode(currentSection.nodes, currentList) ?? {
          ordered: true,
          items: [],
        };
      }
      currentList.items.push(orderedMatch[1]);
      continue;
    }

    currentList = flushListNode(currentSection.nodes, currentList);
    currentSection.nodes.push({
      type: "paragraph",
      text: trimmed,
    });
  }

  if (currentSection) {
    flushListNode(currentSection.nodes, currentList);
  }

  return document;
}

function parseInline(text: string) {
  const tokens: InlineToken[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const fullMatch = match[0];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      tokens.push({
        type: "text",
        content: text.slice(lastIndex, start),
      });
    }

    if (fullMatch.startsWith("**")) {
      tokens.push({
        type: "strong",
        content: fullMatch.slice(2, -2),
      });
    } else {
      tokens.push({
        type: "code",
        content: fullMatch.slice(1, -1),
      });
    }

    lastIndex = start + fullMatch.length;
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return tokens;
}

function renderInline(text: string, keyPrefix: string) {
  return parseInline(text).map((token, index) => {
    const key = `${keyPrefix}-${index}`;

    if (token.type === "strong") {
      return (
        <strong key={key} className="ob2-inline-strong">
          {token.content}
        </strong>
      );
    }

    if (token.type === "code") {
      return (
        <code key={key} className="ob2-inline-code">
          {token.content}
        </code>
      );
    }

    return <Fragment key={key}>{token.content}</Fragment>;
  });
}

function splitSectionNodes(nodes: ContentNode[]) {
  const intro: ContentNode[] = [];
  const groups: SectionGroup[] = [];
  let currentGroup: SectionGroup | null = null;

  for (const node of nodes) {
    if (node.type === "heading") {
      currentGroup = {
        title: node.text,
        nodes: [],
      };
      groups.push(currentGroup);
      continue;
    }

    if (currentGroup) {
      currentGroup.nodes.push(node);
      continue;
    }

    intro.push(node);
  }

  return { intro, groups };
}

function DocumentNode({ node, nodeKey }: { node: ContentNode; nodeKey: string }) {
  if (node.type === "paragraph") {
    return <p className="ob2-paragraph">{renderInline(node.text, nodeKey)}</p>;
  }

  if (node.type === "list") {
    const ListTag = node.ordered ? "ol" : "ul";

    return (
      <ListTag className={node.ordered ? "ob2-list ob2-list--ordered" : "ob2-list ob2-list--unordered"}>
        {node.items.map((item, index) => (
          <li key={`${nodeKey}-item-${index}`} className="ob2-list__item">
            <span className="ob2-list__text">{renderInline(item, `${nodeKey}-inline-${index}`)}</span>
          </li>
        ))}
      </ListTag>
    );
  }

  return null;
}

function SectionBand({ section, index }: { section: MarkdownSection; index: number }) {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-96px 0px",
  });
  const shouldReduceMotion = useReducedMotion();
  const { intro, groups } = splitSectionNodes(section.nodes);

  return (
    <motion.section
      ref={ref}
      className="ob2-section"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
      animate={
        shouldReduceMotion
          ? undefined
          : isInView
            ? {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.64,
                  ease: [0.22, 1, 0.36, 1],
                },
              }
            : undefined
      }
    >
      <div className="ob2-section__header">
        <h2 className="ob2-section__title">{section.title}</h2>
        <div className={`ob2-section__chip ob2-section__chip--${index % 3}`} aria-hidden="true" />
      </div>

      {intro.length > 0 && (
        <div className="ob2-section__intro">
          {intro.map((node, nodeIndex) => (
            <DocumentNode key={`${section.title}-intro-${nodeIndex}`} node={node} nodeKey={`${section.title}-intro-${nodeIndex}`} />
          ))}
        </div>
      )}

      {groups.length > 0 && (
        <div className="ob2-grid">
          {groups.map((group, groupIndex) => (
            <motion.article
              key={`${section.title}-${group.title}`}
              className={`ob2-card ${groupIndex % 3 === 0 ? "ob2-card--wide" : ""}`}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: -8,
                    }
              }
              transition={{
                duration: 0.24,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="ob2-card__glow" aria-hidden="true" />
              <h3 className="ob2-card__title">{group.title}</h3>
              <div className="ob2-card__body">
                {group.nodes.map((node, nodeIndex) => (
                  <DocumentNode
                    key={`${group.title}-${nodeIndex}`}
                    node={node}
                    nodeKey={`${group.title}-${nodeIndex}`}
                  />
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {groups.length === 0 && intro.length === 0 && (
        <div className="ob2-empty" aria-hidden="true" />
      )}
    </motion.section>
  );
}

export function OutputBuilderv2({ onBack }: OutputBuilderv2Props) {
  const document = useMemo(() => parseMarkdown(planMarkdown), []);

  return (
    <div className="ob2-page">
      <div className="ob2-page__grain" aria-hidden="true" />

      <button className="ob2-back" type="button" onClick={onBack} aria-label="Back to canvas">
        <InlineArrow />
      </button>

      <main className="ob2-shell">
        <section className="ob2-hero">
          <div className="ob2-hero__content">
            <h1 className="ob2-hero__title">{document.title}</h1>
          </div>

          <div className="ob2-hero__art" aria-hidden="true">
            <div className="ob2-hero__panel ob2-hero__panel--primary">
              <span />
              <span />
              <span />
            </div>
            <div className="ob2-hero__panel ob2-hero__panel--secondary">
              <span />
              <span />
            </div>
            <div className="ob2-hero__panel ob2-hero__panel--tertiary" />
          </div>
        </section>

        <div className="ob2-sections">
          {document.sections.map((section, index) => (
            <SectionBand key={section.title} section={section} index={index} />
          ))}
        </div>
      </main>
    </div>
  );
}
