import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import { buildOutputs, findStaleOutputs, staleMessage } from './outputs.ts';
import { REPO_ROOT } from './paths.ts';

const [command] = process.argv.slice(2);

if (command === 'generate') {
  const files = buildOutputs();
  for (const file of files) {
    mkdirSync(dirname(file.path), { recursive: true });
    writeFileSync(file.path, file.content);
    console.log(`wrote ${relative(REPO_ROOT, file.path)}`);
  }
} else if (command === 'check') {
  const stale = findStaleOutputs();
  if (stale.length) {
    console.error(staleMessage(stale));
    process.exit(1);
  }
  console.log('Native generated files are up to date.');
} else {
  console.error('Usage: node src/cli.ts <generate|check>');
  process.exit(2);
}
