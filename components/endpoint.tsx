import clsx from 'clsx';
import Link from 'fumadocs-core/link';
import { ChevronRight } from 'lucide-react';
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { CopyButton } from '@/components/ui/copy-button';

const methods = {
  GET: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20',
  POST: 'bg-brand-50 text-brand-700 ring-brand-600/20 dark:bg-brand-400/10 dark:text-brand-400 dark:ring-brand-400/25',
  PATCH: 'bg-amber-50 text-amber-800 ring-amber-600/25 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/20',
  DELETE: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20',
};

const badge = 'inline-flex py-0.5 font-mono text-[0.6875rem]/4 font-semibold tracking-wide ring-1 ring-inset';

export const errorStatus = clsx(badge, 'px-1.5', methods.DELETE);

const access = {
  public: 'None',
  optional: 'Customer bearer token, optional',
  owner: 'The ID, and the customer token when a customer owns it',
  customer: 'Customer bearer token',
  signed: 'Signed URL',
  webhook: 'Provider signature, checked by the driver',
};

const line = 'border-zinc-200 dark:border-white/10';
const disclosure =
  'flex cursor-pointer list-none items-center gap-1.5 text-fd-muted-foreground transition-colors duration-200 hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-hidden focus-visible:ring-inset dark:focus-visible:ring-brand-400 [&::-webkit-details-marker]:hidden';
const chevron = 'size-3.5 shrink-0 transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none';

export function Method({ children }: { children: keyof typeof methods }) {
  return (
    <span className={clsx(badge, 'w-14 shrink-0 justify-center', methods[children])}>{children}</span>
  );
}

// Every store route counts against `shopper-api` too; the webhook group has its own limiter only.
function limitersOf(limit?: 'auth' | 'checkout' | 'webhook') {
  if (limit === 'webhook') return ['shopper-api-webhook'];
  return limit ? ['shopper-api', `shopper-api-${limit}`] : ['shopper-api'];
}

export function Endpoint({
  id,
  method,
  path,
  auth,
  limit,
  children,
}: {
  id: string;
  method: keyof typeof methods;
  path: string;
  auth: keyof typeof access;
  limit?: 'auth' | 'checkout' | 'webhook';
  children: ReactNode;
}) {
  return (
    <div id={id} className="my-10">
      <div className={clsx('not-prose border bg-fd-card', line)}>
        <div className="flex items-center gap-3 py-1.5 pr-1.5 pl-2">
          <Method>{method}</Method>
          <code className="min-w-0 flex-1 font-mono text-sm break-all text-fd-foreground">{path}</code>
          <CopyButton text={path} label={`Copy ${path}`} />
        </div>
        <dl className={clsx('flex flex-wrap gap-x-6 gap-y-1 border-t px-3 py-2 text-xs/5', line)}>
          <div className="flex gap-1.5">
            <dt className="text-fd-muted-foreground">Auth</dt>
            <dd className="text-fd-foreground">{access[auth]}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-fd-muted-foreground">Rate limit</dt>
            <dd className="flex gap-1.5">
              {limitersOf(limit).map((name) => (
                <Link
                  key={name}
                  href="/3.x/store-api#rate-limits"
                  className="font-mono text-fd-foreground underline decoration-zinc-300 underline-offset-2 hover:decoration-current focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-hidden dark:decoration-white/25 dark:focus-visible:ring-brand-400"
                >
                  {name}
                </Link>
              ))}
            </dd>
          </div>
        </dl>
      </div>
      <div className="prose-no-margin mt-6">{children}</div>
    </div>
  );
}

type FieldProps = {
  name: string;
  type?: string;
  required?: boolean;
  default?: string;
  kind?: 'param' | 'attribute';
  children?: ReactNode;
};

const isField = (node: ReactNode): node is ReactElement<FieldProps> => isValidElement(node) && node.type === Field;

function requiredFirst(fields: ReactElement<FieldProps>[]) {
  return [...fields.filter((field) => field.props.required), ...fields.filter((field) => !field.props.required)];
}

// Request parameters list the required ones first; response attributes keep the order the API returns them in.
// The list sits in prose, whose ul and li margins and the square bullets of global.css win over plain utilities.
function FieldList({
  fields,
  kind,
  className,
}: {
  fields: ReactElement<FieldProps>[];
  kind: 'param' | 'attribute';
  className?: string;
}) {
  const ordered = kind === 'param' ? requiredFirst(fields) : fields;

  return (
    <ul className={clsx('my-0! list-none! divide-y', line, className)}>
      {ordered.map((field) => cloneElement(field, { kind }))}
    </ul>
  );
}

export function Field({ name, type, required, default: fallback, kind = 'param', children }: FieldProps) {
  const parts = Children.toArray(children);
  const nested = parts.filter(isField);
  const description = parts.filter((part) => !isField(part));

  return (
    <li className="my-0! py-3 ps-0">
      <div className="not-prose flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <code className="font-mono text-[0.8125rem] font-semibold text-fd-foreground">{name}</code>
        {type ? <span className="font-mono text-xs text-fd-muted-foreground">{type}</span> : null}
        {required || kind === 'attribute' ? null : (
          <span className={clsx('border px-1.5 text-[0.6875rem]/4 text-fd-muted-foreground', line)}>optional</span>
        )}
        {fallback !== undefined ? (
          <span className="text-xs text-fd-muted-foreground">
            Default: <code className="font-mono text-fd-foreground">{fallback}</code>
          </span>
        ) : null}
      </div>
      {description.length > 0 ? <div className="prose-no-margin mt-1 text-sm">{description}</div> : null}
      {nested.length > 0 ? (
        <details className={clsx('group mt-3 border bg-fd-card', line)}>
          <summary className={clsx(disclosure, 'px-3 py-1.5 text-xs font-medium')}>
            <ChevronRight className={chevron} aria-hidden />
            Child fields ({nested.length})
          </summary>
          <FieldList fields={nested} kind={kind} className={clsx('border-t px-3', line)} />
        </details>
      ) : null}
    </li>
  );
}

// MDX puts a newline string between block elements.
function fieldsOf(component: string, title: string, children: ReactNode) {
  const parts = Children.toArray(children).filter((part) => !(typeof part === 'string' && part.trim() === ''));
  if (!parts.every(isField)) throw new Error(`<${component} title="${title}"> takes <Field> children only`);

  return parts;
}

function FieldGroup({ title, fields, kind }: { title: string; fields: ReactElement<FieldProps>[]; kind: 'param' | 'attribute' }) {
  return (
    <div className="my-6">
      <p className="mt-0 mb-1 text-sm font-medium text-fd-foreground">{title}</p>
      <FieldList fields={fields} kind={kind} className="border-y ps-0" />
    </div>
  );
}

export function Params({ title, children }: { title: string; children: ReactNode }) {
  return <FieldGroup title={title} fields={fieldsOf('Params', title, children)} kind="param" />;
}

export function Attributes({ title, children }: { title: string; children: ReactNode }) {
  return <FieldGroup title={title} fields={fieldsOf('Attributes', title, children)} kind="attribute" />;
}

export function Errors({ children }: { children: ReactNode }) {
  return (
    <details className={clsx('group my-6 border bg-fd-card', line)}>
      <summary className={clsx(disclosure, 'px-3 py-2 text-sm font-medium')}>
        <ChevronRight className={chevron} aria-hidden />
        Errors
      </summary>
      <div className={clsx('prose-no-margin border-t px-3 py-3 text-sm', line)}>
        {children}
        <p>
          The meaning of every code is in <Link href="/3.x/store-api/errors#error-codes">Error Codes</Link>.
        </p>
      </div>
    </details>
  );
}

export function Routes({ children }: { children: ReactNode }) {
  return <ul className={clsx('not-prose my-6 divide-y border bg-fd-card', line)}>{children}</ul>;
}

export function Route({
  method,
  path,
  href,
  children,
}: {
  method: keyof typeof methods;
  path: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-baseline gap-3 px-3 py-2 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-hidden focus-visible:ring-inset dark:focus-visible:ring-brand-400"
      >
        <Method>{method}</Method>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[0.8125rem] break-all text-fd-foreground transition-colors duration-200 group-hover:text-brand-700 dark:group-hover:text-brand-400">
            {path}
          </span>
          <span className="block text-sm text-fd-muted-foreground">{children}</span>
        </span>
      </Link>
    </li>
  );
}
