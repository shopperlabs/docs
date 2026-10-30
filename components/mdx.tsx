import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Callout } from 'fumadocs-ui/components/callout';
import { Card as BaseCard, Cards } from 'fumadocs-ui/components/card';
import { Step as BaseStep, Steps } from 'fumadocs-ui/components/steps';
import { icons } from 'lucide-react';
import type { MDXComponents } from 'mdx/types';
import type { ReactNode } from 'react';

// Pages were written for Mintlify with Font Awesome names; these have no Lucide icon of the same name.
const fontAwesomeToLucide: Record<string, keyof typeof icons> = {
  'align-left': 'TextAlignStart',
  'boxes-stacked': 'Boxes',
  'cart-shopping': 'ShoppingCart',
  clone: 'Copy',
  comments: 'MessagesSquare',
  'file-lines': 'FileText',
  fire: 'Flame',
  font: 'Type',
  gear: 'Settings',
  github: 'FolderGit2',
  'hand-wave': 'Hand',
  'hands-helping': 'HandHelping',
  hashtag: 'Hash',
  heading: 'Heading1',
  'layer-group': 'Layers',
  'link-simple': 'Link',
  'magnifying-glass': 'Search',
  mobile: 'Smartphone',
  'money-bill': 'Banknote',
  'monitor-waveform': 'Activity',
  'note-sticky': 'StickyNote',
  'pen-nib': 'PenTool',
  'pen-to-square': 'SquarePen',
  rotate: 'RotateCw',
  'ruler-combined': 'Ruler',
  'scale-balanced': 'Scale',
  shop: 'Store',
  sitemap: 'Network',
  swatches: 'Palette',
  'triangle-exclamation': 'TriangleAlert',
  'user-tie': 'UserCog',
  vial: 'TestTube',
};

function iconFor(name?: string) {
  if (!name) return undefined;

  const pascalName = name.replace(/(^|-)([a-z0-9])/g, (_, __, letter: string) => letter.toUpperCase());
  const Icon = icons[fontAwesomeToLucide[name] ?? (pascalName as keyof typeof icons)];

  return Icon ? <Icon /> : undefined;
}

function Card({ icon, title, href, children }: { icon?: string; title: string; href?: string; children?: ReactNode }) {
  return (
    <BaseCard icon={iconFor(icon)} title={title} href={href}>
      {children}
    </BaseCard>
  );
}

function CardGroup({ cols = 2, children }: { cols?: number; children: ReactNode }) {
  return <Cards className={cols === 3 ? '@lg:grid-cols-3' : undefined}>{children}</Cards>;
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <BaseStep>
      <h3>{title}</h3>
      {children}
    </BaseStep>
  );
}

function Frame({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <figure className="my-6">
      <div className="overflow-hidden rounded-xl border bg-fd-card p-1 [&_img]:m-0 [&_img]:rounded-lg">{children}</div>
      {caption && <figcaption className="mt-2 text-center text-sm text-fd-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

function ParamField({
  path,
  type,
  default: defaultValue,
  required,
  children,
}: {
  path: string;
  type?: string;
  default?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="my-6 border-b pb-4 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-2 text-sm">
        <code>{path}</code>
        {type && <span className="font-mono text-fd-muted-foreground">{type}</span>}
        {defaultValue !== undefined && <span className="font-mono text-fd-muted-foreground">default: {defaultValue}</span>}
        {required && <span className="font-medium text-fd-error">required</span>}
      </div>
      <div className="prose-no-margin mt-2 text-sm">{children}</div>
    </div>
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Note: (props: { children: ReactNode }) => <Callout type="info" {...props} />,
    Info: (props: { children: ReactNode }) => <Callout type="info" {...props} />,
    Tip: (props: { children: ReactNode }) => <Callout type="idea" {...props} />,
    Warning: (props: { children: ReactNode }) => <Callout type="warning" {...props} />,
    Card,
    CardGroup,
    Steps,
    Step,
    Frame,
    ParamField,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
