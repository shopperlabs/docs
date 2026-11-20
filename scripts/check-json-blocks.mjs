import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? '.';
const problems = [];
let blocks = 0;
let bodies = 0;

const lineOf = (text, index) => text.slice(0, index).split('\n').length;
const parses = (json) => {
  try {
    JSON.parse(json);
    return undefined;
  } catch (error) {
    return error.message;
  }
};

for (const file of globSync('content/**/*.mdx', { cwd: root })) {
  const text = readFileSync(join(root, file), 'utf8');
  for (const block of text.matchAll(/^([ \t]*)```json\b[^\n]*\n([\s\S]*?)^\1```/gm)) {
    blocks++;
    // A block that opens on a key is an excerpt of composer.json: parse it as the object it sits in.
    const sample = block[2].replace(/\s*\/\/ \[!code [^\]]*\]/g, '');
    const error = parses(/^\s*"/.test(sample) ? `{${sample.replace(/,\s*$/, '')}}` : sample);
    if (error) problems.push(`${file}:${lineOf(text, block.index)}: json block, ${error}`);
  }
  for (const body of text.matchAll(/(?:-d|--data(?:-raw)?) '([^']*)'/g)) {
    bodies++;
    const error = parses(body[1]);
    if (error) problems.push(`${file}:${lineOf(text, body.index)}: curl body, ${error}`);
  }
}

if (problems.length) {
  console.error(`${problems.length} invalid JSON samples:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`ok: ${blocks} json blocks and ${bodies} curl bodies parse`);
