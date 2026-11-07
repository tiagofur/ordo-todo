import { REGENERATE_COMMAND } from './paths.ts';

/**
 * Converts the "Native" namespace of the shared next-intl catalogs into Android
 * string resources. Only the ICU subset Android can represent is accepted:
 * plain text, `{arg}`, `{arg, number}` and one top-level `{n, plural, …}` with
 * `#`. Anything else (select, exact `=N` matches, nested plurals, rich-text
 * tags) fails loudly instead of shipping a string that renders wrong.
 *
 * Quoted literals follow formatjs: a `'` before `{`, `}`, `<`, `>` (and `#`
 * inside plurals) opens a literal, `''` is an apostrophe, a lone `'` closes it.
 *
 * Numeric arguments render as `%N$d`: pass Kotlin `Int` (a Float/Double throws
 * at format time) and expect no ICU locale grouping for thousands.
 */

export type IcuNode =
  | { kind: 'text'; value: string }
  | { kind: 'arg'; name: string; numeric: boolean }
  | { kind: 'pound' }
  | { kind: 'plural'; name: string; branches: Map<PluralCategory, IcuNode[]> };

export const PLURAL_CATEGORIES = ['zero', 'one', 'two', 'few', 'many', 'other'] as const;
export type PluralCategory = (typeof PLURAL_CATEGORIES)[number];

export class IcuSubsetError extends Error {
  constructor(key: string, message: string) {
    super(`[${key}] ${message}`);
    this.name = 'IcuSubsetError';
  }
}

const ARG_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
const RICH_TAG = /^<\/?[A-Za-z][\w-]*\s*\/?>/;

/** C0 controls (except tab and newline) and DEL: invalid XML 1.0 characters. */
function isControlChar(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return (code < 0x20 && ch !== '\t' && ch !== '\n') || code === 0x7f;
}

class IcuParser {
  private pos = 0;
  private readonly src: string;
  private readonly key: string;

  constructor(src: string, key: string) {
    this.src = src;
    this.key = key;
  }

  parse(): IcuNode[] {
    const nodes = this.parseNodes(false);
    if (this.pos < this.src.length) this.fail(`unexpected "${this.src[this.pos]}" at ${this.pos}`);
    return nodes;
  }

  private fail(message: string): never {
    throw new IcuSubsetError(this.key, message);
  }

  private parseNodes(inPlural: boolean): IcuNode[] {
    const nodes: IcuNode[] = [];
    let text = '';
    const flush = () => {
      if (text) nodes.push({ kind: 'text', value: text });
      text = '';
    };

    while (this.pos < this.src.length) {
      const ch = this.src[this.pos]!;
      const next = this.src[this.pos + 1];

      if (ch === "'") {
        if (next === "'") {
          text += "'";
          this.pos += 2;
        } else if (
          next === '{' ||
          next === '}' ||
          next === '<' ||
          next === '>' ||
          (inPlural && next === '#')
        ) {
          // ICU quoted literal (formatjs opens quotes before < and > too).
          // Inside it, '' is an apostrophe; the literal ends at a single '.
          this.pos += 1;
          for (;;) {
            const quoted = this.src[this.pos];
            if (quoted === undefined) this.fail('unterminated quoted literal');
            if (quoted === "'") {
              if (this.src[this.pos + 1] === "'") {
                text += "'";
                this.pos += 2;
              } else {
                this.pos += 1;
                break;
              }
            } else {
              text += quoted;
              this.pos += 1;
            }
          }
        } else {
          text += "'";
          this.pos += 1;
        }
      } else if (ch === '{') {
        flush();
        nodes.push(this.parsePlaceholder(inPlural));
      } else if (ch === '}') {
        if (!inPlural) this.fail(`unbalanced "}" at ${this.pos}`);
        break;
      } else if (ch === '#' && inPlural) {
        flush();
        nodes.push({ kind: 'pound' });
        this.pos += 1;
      } else if (ch === '<' && RICH_TAG.test(this.src.slice(this.pos))) {
        this.fail('rich-text tags are not supported in native strings');
      } else if (isControlChar(ch)) {
        this.fail(
          `control character U+${ch.charCodeAt(0).toString(16).padStart(4, '0')} is not supported; use \\n for line breaks`,
        );
      } else {
        text += ch;
        this.pos += 1;
      }
    }
    flush();
    return nodes;
  }

  private readUntil(stops: string): string {
    const start = this.pos;
    while (this.pos < this.src.length && !stops.includes(this.src[this.pos]!)) this.pos += 1;
    if (this.pos >= this.src.length) this.fail('unterminated placeholder');
    return this.src.slice(start, this.pos).trim();
  }

  private skipSpaces(): void {
    while (/\s/.test(this.src[this.pos] ?? '')) this.pos += 1;
  }

  private parsePlaceholder(inPlural: boolean): IcuNode {
    this.pos += 1; // "{"
    const name = this.readUntil(',}');
    if (!ARG_NAME.test(name)) this.fail(`invalid argument name "${name}"`);

    if (this.src[this.pos] === '}') {
      this.pos += 1;
      return { kind: 'arg', name, numeric: false };
    }

    this.pos += 1; // ","
    const type = this.readUntil(',}');
    if (type === 'number') {
      if (this.src[this.pos] !== '}') this.fail(`number styles are not supported ("${name}")`);
      this.pos += 1;
      return { kind: 'arg', name, numeric: true };
    }
    if (type !== 'plural') this.fail(`"${type}" arguments are not supported ("${name}")`);
    if (inPlural) this.fail('nested plurals are not supported');
    if (this.src[this.pos] !== ',') this.fail(`plural "${name}" has no branches`);
    this.pos += 1;

    const branches = new Map<PluralCategory, IcuNode[]>();
    for (;;) {
      this.skipSpaces();
      if (this.src[this.pos] === '}') {
        this.pos += 1;
        break;
      }
      const selector = this.readUntil('{ \t\n');
      if (selector.startsWith('=')) {
        this.fail(`exact plural matches ("${selector}") have no Android equivalent`);
      }
      if (!(PLURAL_CATEGORIES as readonly string[]).includes(selector)) {
        this.fail(`unknown plural category "${selector}"`);
      }
      this.skipSpaces();
      if (this.src[this.pos] !== '{') this.fail(`plural branch "${selector}" has no body`);
      this.pos += 1;
      const body = this.parseNodes(true);
      if (this.src[this.pos] !== '}') this.fail(`unterminated plural branch "${selector}"`);
      this.pos += 1;
      branches.set(selector as PluralCategory, body);
    }
    if (!branches.has('other')) this.fail(`plural "${name}" needs an "other" branch`);
    return { kind: 'plural', name, branches };
  }
}

export function parseIcu(message: string, key: string): IcuNode[] {
  return new IcuParser(message, key).parse();
}

export interface ArgInfo {
  position: number;
  numeric: boolean;
}

/** Arguments in order of first appearance; the plural argument is always numeric. */
export function collectArgs(nodes: IcuNode[]): Map<string, ArgInfo> {
  const args = new Map<string, ArgInfo>();
  const visit = (list: IcuNode[]) => {
    for (const node of list) {
      if (node.kind === 'arg' || node.kind === 'plural') {
        const numeric = node.kind === 'plural' || node.numeric;
        const known = args.get(node.name);
        if (known) known.numeric ||= numeric;
        else args.set(node.name, { position: args.size + 1, numeric });
      }
      if (node.kind === 'plural') for (const branch of node.branches.values()) visit(branch);
    }
  };
  visit(nodes);
  return args;
}

function escapeText(raw: string, formatted: boolean): string {
  let out = raw
    .replace(/\\/g, '\\\\')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
  if (formatted) out = out.replace(/%/g, '%%');
  return out;
}

/** Android trims and collapses whitespace and treats a leading @ or ? as a reference. */
function protectEdges(value: string): string {
  let out = value
    .replace(/^ +| +$/g, (m) => '\\u0020'.repeat(m.length))
    .replace(/ {2,}/g, (m) => ' ' + '\\u0020'.repeat(m.length - 1));
  if (out.startsWith('@') || out.startsWith('?')) out = `\\${out}`;
  return out;
}

function renderNodes(
  nodes: IcuNode[],
  args: Map<string, ArgInfo>,
  formatted: boolean,
  pluralArg: string | null,
): string {
  return nodes
    .map((node) => {
      switch (node.kind) {
        case 'text':
          return escapeText(node.value, formatted);
        case 'arg': {
          const info = args.get(node.name)!;
          return `%${info.position}$${info.numeric ? 'd' : 's'}`;
        }
        case 'pound':
          return `%${args.get(pluralArg!)!.position}$d`;
        case 'plural':
          throw new Error('plural must be expanded before rendering');
      }
    })
    .join('');
}

export type AndroidResource =
  | { kind: 'string'; name: string; value: string; formatted: boolean; args: Map<string, ArgInfo> }
  | {
      kind: 'plurals';
      name: string;
      items: Map<PluralCategory, string>;
      formatted: boolean;
      args: Map<string, ArgInfo>;
    };

/**
 * Renders one message. `args` must come from the default locale so every
 * translation uses the same positional slots (`%1$s` is the same value everywhere).
 */
export function toAndroidResource(
  name: string,
  key: string,
  nodes: IcuNode[],
  args: Map<string, ArgInfo>,
): AndroidResource {
  const formatted = args.size > 0;
  const plurals = nodes.filter((n) => n.kind === 'plural');
  if (plurals.length > 1) throw new IcuSubsetError(key, 'only one plural per message is supported');

  const plural = plurals[0];
  if (!plural) {
    const value = protectEdges(renderNodes(nodes, args, formatted, null));
    return { kind: 'string', name, value, formatted: formatted || !value.includes('%'), args };
  }

  const index = nodes.indexOf(plural);
  const prefix = nodes.slice(0, index);
  const suffix = nodes.slice(index + 1);
  const items = new Map<PluralCategory, string>();
  for (const category of PLURAL_CATEGORIES) {
    const branch = plural.branches.get(category);
    if (!branch) continue;
    const value = renderNodes([...prefix, ...branch, ...suffix], args, formatted, plural.name);
    items.set(category, protectEdges(value));
  }
  const hasPercent = [...items.values()].some((value) => value.includes('%'));
  return { kind: 'plurals', name, items, formatted: formatted || !hasPercent, args };
}

/** `today.sections.done` → `today_sections_done`; camelCase segments become snake_case. */
export function resourceName(path: readonly string[]): string {
  const name = path
    .map((segment) => segment.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase())
    .join('_');
  if (!/^[a-z][a-z0-9_]*$/.test(name)) {
    throw new Error(
      `"${path.join('.')}" does not map to a valid Android resource name ("${name}")`,
    );
  }
  return name;
}

export type MessageTree = { [key: string]: string | MessageTree };

/** Flattens a nested catalog into [path, message] pairs, preserving source order. */
export function flattenMessages(
  tree: MessageTree,
  prefix: string[] = [],
): Array<[string[], string]> {
  const out: Array<[string[], string]> = [];
  for (const [key, value] of Object.entries(tree)) {
    const path = [...prefix, key];
    if (typeof value === 'string') out.push([path, value]);
    else out.push(...flattenMessages(value, path));
  }
  return out;
}

function sameArgs(a: Map<string, ArgInfo>, b: Map<string, ArgInfo>): boolean {
  if (a.size !== b.size) return false;
  for (const [name, info] of a) {
    const other = b.get(name);
    if (!other || other.numeric !== info.numeric) return false;
  }
  return true;
}

export interface LocaleCatalog {
  /** next-intl locale file id, e.g. "es". */
  locale: string;
  messages: MessageTree;
}

/**
 * Builds the resources for every locale. The first catalog is the default
 * locale: its key order is the output order and its argument order fixes the
 * positional slots. Key sets, argument sets and resource kinds must match.
 */
export function buildAndroidResources(
  catalogs: readonly LocaleCatalog[],
): Map<string, AndroidResource[]> {
  const [base, ...rest] = catalogs;
  if (!base) throw new Error('at least one locale catalog is required');

  const baseEntries = flattenMessages(base.messages);
  const baseKeys = new Set(baseEntries.map(([path]) => path.join('.')));
  const result = new Map<string, AndroidResource[]>();
  const slots = new Map<string, Map<string, ArgInfo>>();
  const kinds = new Map<string, AndroidResource['kind']>();
  const names = new Map<string, string>();

  for (const [path, message] of baseEntries) {
    const key = path.join('.');
    const name = resourceName(path);
    const clash = names.get(name);
    if (clash) throw new Error(`"${clash}" and "${key}" both map to the resource "${name}"`);
    names.set(name, key);
    slots.set(key, collectArgs(parseIcu(message, `${base.locale}:${key}`)));
  }

  for (const catalog of [base, ...rest]) {
    const entries = flattenMessages(catalog.messages);
    const keys = new Set(entries.map(([path]) => path.join('.')));
    const missing = [...baseKeys].filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !baseKeys.has(k));
    if (missing.length || extra.length) {
      throw new Error(
        `Native catalog "${catalog.locale}" is out of parity with "${base.locale}"` +
          (missing.length ? `; missing: ${missing.join(', ')}` : '') +
          (extra.length ? `; extra: ${extra.join(', ')}` : ''),
      );
    }

    const byKey = new Map(entries.map(([path, message]) => [path.join('.'), message]));
    const resources: AndroidResource[] = [];
    for (const [path] of baseEntries) {
      const key = path.join('.');
      const label = `${catalog.locale}:${key}`;
      const nodes = parseIcu(byKey.get(key)!, label);
      const args = slots.get(key)!;
      if (!sameArgs(args, collectArgs(nodes))) {
        throw new IcuSubsetError(label, `arguments differ from "${base.locale}"`);
      }
      const resource = toAndroidResource(resourceName(path), label, nodes, args);
      const kind = kinds.get(key);
      if (kind && kind !== resource.kind) {
        throw new IcuSubsetError(label, `is a ${resource.kind} but "${base.locale}" is a ${kind}`);
      }
      kinds.set(key, resource.kind);
      resources.push(resource);
    }
    result.set(catalog.locale, resources);
  }
  return result;
}

function argsComment(args: Map<string, ArgInfo>): string {
  const list = [...args.entries()]
    .map(([name, info]) =>
      info.numeric ? `%${info.position}$d = ${name} (Int)` : `%${info.position}$s = ${name}`,
    )
    .join(', ');
  return `    <!-- args: ${list} -->\n`;
}

/** Serializes one locale's resources. Pass `toolsLocale` only for the default `values/` file. */
export function renderStringsXml(
  resources: readonly AndroidResource[],
  sourceFile: string,
  toolsLocale?: string,
): string {
  const body = resources
    .map((res) => {
      const comment = res.args.size ? argsComment(res.args) : '';
      const formattedAttr = res.formatted ? '' : ' formatted="false"';
      if (res.kind === 'string') {
        return `${comment}    <string name="${res.name}"${formattedAttr}>${res.value}</string>`;
      }
      const items = [...res.items.entries()]
        .map(([quantity, value]) => `        <item quantity="${quantity}">${value}</item>`)
        .join('\n');
      return `${comment}    <plurals name="${res.name}"${formattedAttr}>\n${items}\n    </plurals>`;
    })
    .join('\n');
  const root = toolsLocale
    ? `<resources xmlns:tools="http://schemas.android.com/tools" tools:locale="${toolsLocale}">`
    : '<resources>';
  return `<?xml version="1.0" encoding="utf-8"?>
<!-- GENERATED FILE — DO NOT EDIT. Source: ${sourceFile} (namespace "Native"). Regenerate with: ${REGENERATE_COMMAND} -->
${root}
${body}
</resources>
`;
}
