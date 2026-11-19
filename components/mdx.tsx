import clsx from 'clsx';
import Link from 'fumadocs-core/link';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { CodeBlock, type CodeBlockProps, Pre } from 'fumadocs-ui/components/codeblock';
import { Step as BaseStep, Steps } from 'fumadocs-ui/components/steps';
import { CircleCheck, CircleX, icons, Info, Lightbulb, TriangleAlert } from 'lucide-react';
import type { MDXComponents } from 'mdx/types';
import type { ReactNode } from 'react';
import { LaravelIcon, LivewireIcon } from '@/components/ui/brand-icons';
import { Lined, type linings } from '@/components/ui/lined';

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

const callouts = {
  note: { Icon: Info, tone: 'zinc', box: 'border-zinc-200 dark:border-white/10', icon: 'text-zinc-500 dark:text-zinc-400' },
  info: { Icon: Info, tone: 'brand', box: 'border-brand-200 dark:border-brand-400/30', icon: 'text-brand-600 dark:text-brand-400' },
  tip: { Icon: Lightbulb, tone: 'emerald', box: 'border-emerald-200 dark:border-emerald-400/30', icon: 'text-emerald-600 dark:text-emerald-400' },
  success: { Icon: CircleCheck, tone: 'emerald', box: 'border-emerald-200 dark:border-emerald-400/30', icon: 'text-emerald-600 dark:text-emerald-400' },
  warning: { Icon: TriangleAlert, tone: 'amber', box: 'border-amber-200 dark:border-amber-400/30', icon: 'text-amber-600 dark:text-amber-400' },
  error: { Icon: CircleX, tone: 'red', box: 'border-red-200 dark:border-red-400/30', icon: 'text-red-600 dark:text-red-400' },
} satisfies Record<string, { Icon: typeof Info; tone: keyof typeof linings; box: string; icon: string }>;

// Fumadocs' type names, so 3.x pages can write `<Callout type="warn">` as its docs show.
const calloutAliases: Record<string, keyof typeof callouts> = { warn: 'warning', idea: 'tip', danger: 'error', check: 'success' };

function Callout({ type = 'info', title, children }: { type?: string; title?: ReactNode; children?: ReactNode }) {
  const { Icon, tone, box, icon } = callouts[calloutAliases[type] ?? (type as keyof typeof callouts)] ?? callouts.info;

  return (
    <Lined tone={tone} className="my-6">
      <div role="note" className={clsx('flex gap-3 border p-4 text-sm', box)}>
        <Icon aria-hidden className={clsx('mt-0.5 size-4 shrink-0', icon)} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {title ? <p className="my-0! font-medium text-foreground">{title}</p> : null}
          <div className="prose-no-margin text-fd-muted-foreground empty:hidden">{children}</div>
        </div>
      </div>
    </Lined>
  );
}

function Card({
  icon,
  title,
  description,
  href,
  children,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  href?: string;
  children?: ReactNode;
}) {
  const Root = href ? Link : 'div';
  const glyph = typeof icon === 'string' ? iconFor(icon) : icon;

  return (
    <Lined className="@max-lg:col-span-full">
      <Root
        href={href}
        data-card
        className={clsx(
          'block h-full border bg-fd-card p-4 text-fd-card-foreground transition-colors',
          href && 'hover:bg-zinc-50 dark:hover:bg-white/3',
        )}
      >
        <div className="not-prose flex items-center gap-2">
          {glyph ? <span className="shrink-0 text-fd-muted-foreground [&_svg]:size-4">{glyph}</span> : null}
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <div className="prose-no-margin mt-1 text-sm text-fd-muted-foreground empty:hidden">
          {description}
          {children}
        </div>
      </Root>
    </Lined>
  );
}

// The gap leaves room for each card's lining, which juts 0.5rem left and down.
function Cards({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx('@container my-6 grid grid-cols-2 gap-5', className)}>{children}</div>;
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

// Captures are taken at a device scale of 2, so the 2x descriptor shows them at their size on screen.
function Screenshot({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const dark = src.replace(/\.png$/, '-dark.png');

  return (
    <Frame caption={caption}>
      <img src={src} srcSet={`${src} 2x`} alt={alt} loading="lazy" className="mx-auto! block dark:hidden" />
      <img src={dark} srcSet={`${dark} 2x`} alt={alt} loading="lazy" className="mx-auto! hidden dark:block" />
    </Frame>
  );
}

// Fumadocs picks the title icon from the language alone, so a Blade view or a Livewire class gets a generic one.
// The div matches the wrapper Fumadocs puts around its own icons, which global.css styles as part of the title tab.
function frameworkIcon(title: CodeBlockProps['title']) {
  if (typeof title !== 'string') return undefined;
  if (/(^|\/)livewire\//i.test(title))
    return (
      <div>
        <LivewireIcon className="size-3.5" />
      </div>
    );
  if (title.endsWith('.php'))
    return (
      <div>
        <LaravelIcon className="size-3.5" />
      </div>
    );
}

function CodeBlockPre({ title, icon, children, ...props }: CodeBlockProps) {
  return (
    <CodeBlock title={title} icon={frameworkIcon(title) ?? icon} {...props}>
      <Pre>{children}</Pre>
    </CodeBlock>
  );
}

const bareCode = 'border-0 bg-transparent p-0 font-mono text-[0.8125rem] font-semibold text-fd-foreground';
const cell = 'border-0 py-1.5 pl-0 align-baseline';

// The typography plugin gives every prose table a bordered card; utilities outrank its layer, so these classes undo it.
function ApiTable({
  name,
  element,
  builtOn,
  label = 'Prop',
  children,
}: {
  name: string;
  element?: string;
  builtOn?: string;
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className="my-6 overflow-x-auto" tabIndex={0}>
      <table className="my-0 border-collapse rounded-none border-0 bg-transparent">
        <colgroup>
          <col className="w-1/4" />
          <col className="w-1/4" />
          <col className="w-1/2" />
        </colgroup>
        <thead className="border-b border-fd-border">
          <tr>
            {[label, 'Default', 'Description'].map((heading) => (
              <th key={heading} className="border-0 bg-transparent pt-0 pr-4 pb-4 pl-0 text-sm font-semibold last:pr-0">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:nth-child(2)>td]:pt-3">
          <tr>
            <td colSpan={3} className="border-y border-fd-border bg-fd-secondary p-2 text-fd-muted-foreground">
              <code className={bareCode}>{name}</code>
              {element && (
                <span className="ml-1 italic">
                  renders a <code className={bareCode}>{`<${element}>`}</code> element
                </span>
              )}
              {builtOn && (
                <span className="ml-1 italic">
                  built on the <code className={bareCode}>{`<${builtOn}>`}</code> component
                </span>
              )}
            </td>
          </tr>
          {children}
        </tbody>
      </table>
    </div>
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
    <tr>
      <td className={clsx(cell, 'pr-4')}>
        <code className={bareCode}>{path}</code>
        {type && <div className="mt-0.5 font-mono text-xs text-fd-muted-foreground">{type}</div>}
      </td>
      <td className={clsx(cell, 'pr-4')}>
        {defaultValue !== undefined ? <code className={bareCode}>{defaultValue}</code> : required ? 'required' : '-'}
      </td>
      <td className={clsx(cell, 'prose-no-margin pr-0')}>{children}</td>
    </tr>
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    pre: CodeBlockPre,
    Callout,
    Note: (props: { children: ReactNode }) => <Callout type="note" {...props} />,
    Info: (props: { children: ReactNode }) => <Callout type="info" {...props} />,
    Tip: (props: { children: ReactNode }) => <Callout type="tip" {...props} />,
    Warning: (props: { children: ReactNode }) => <Callout type="warning" {...props} />,
    Card,
    Cards,
    CardGroup,
    Steps,
    Step,
    Frame,
    Screenshot,
    ApiTable,
    ParamField,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
