import { closeSync, existsSync, globSync, openSync, readFileSync, readSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? '.';
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// What MDX renders: fenced blocks and inline code show markup as text, so an `<img` there is an example.
function prose(text) {
  let fenced = false;
  return text.split('\n').map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      return '';
    }
    return fenced ? '' : line.replace(/``.*?``|`[^`]*`/g, '');
  });
}

// `<Screenshot>` renders at half the PNG's size, for 2x screens, so an odd side gives a fractional size.
function screenshotProblem(src) {
  if (!src.endsWith('.png')) return 'is not a .png';
  const path = join(root, 'public', src);
  if (!existsSync(path)) return 'is missing';
  const header = Buffer.alloc(24);
  const file = openSync(path, 'r');
  try {
    readSync(file, header, 0, 24, 0);
  } finally {
    closeSync(file);
  }
  if (!header.subarray(0, 8).equals(pngSignature)) return 'has no PNG signature';
  const width = header.readUInt32BE(16);
  const height = header.readUInt32BE(20);
  if (width % 2 || height % 2) return `has an odd size, ${width}x${height}`;
  return undefined;
}

const problems = [];
let screenshots = 0;
for (const file of globSync('content/**/*.mdx', { cwd: root })) {
  const lines = prose(readFileSync(join(root, file), 'utf8'));
  lines.forEach((line, at) => {
    if (/<img\b/i.test(line)) problems.push(`${file}:${at + 1}: raw <img>, use a markdown image or <Screenshot>`);
  });
  for (const [, src] of lines.join('\n').matchAll(/<Screenshot\b[^>]*?\bsrc=["']([^"']+)["']/g)) {
    screenshots++;
    const sources = src.endsWith('.png') ? [src, src.replace(/\.png$/, '-dark.png')] : [src];
    for (const each of sources) {
      const problem = screenshotProblem(each);
      if (problem) problems.push(`${file}: <Screenshot> ${each} ${problem}`);
    }
  }
}

if (problems.length) {
  console.error(`${problems.length} image problems:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`ok: no raw <img> in content, ${screenshots} screenshots with a valid light and dark PNG`);
