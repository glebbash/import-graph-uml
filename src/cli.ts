#!/usr/bin/env node

/* istanbul ignore file */

import { generateImportGraph } from './import-graph-uml';
import { parseArgs } from './parse-args';

(async () => {
  try {
    const args = parseArgs(process.argv.slice(2));
    await generateImportGraph(args);

    console.log(`Graph generated at ${args.out.slice(0, -'.puml'.length)}.png`);
  } catch (e) {
    console.error(e);
  }
})();
