import { existsSync } from 'fs';
import { readFile, unlink } from 'fs/promises';
import { m } from 'multiline-str';
import { resolve } from 'path';

import { generateImportGraph } from './import-graph-uml';
import { parseArgs } from './parse-args';

describe('generateImportGraph', () => {
  it('generates import graph', async () => {
    const args = parseArgs([
      '--src',
      resolve(__dirname, '../test/fixtures'),
      '--include',
      '**/*.ts',
      '--builder',
      resolve(__dirname, '../test/build-graph.js'),
    ]);

    await generateImportGraph(args);

    const content = await readFile('out.puml', { encoding: 'utf-8' });
    expect(content).toBe(m`
      @startuml
      class "~/a" as c0
      class "~/b" as c1
      class "~/d" as c2
      class "/something-from-root" as c3
      class "~/folder/c" as c4
      class "express" as c5
      c0 --> c1
      c0 --> c4
      c1 --> c4
      c2 --> c3
      c2 --> c1
      c2 --> c4
      c4 --> c5
      @enduml

      `);

    expect(existsSync('out.png')).toBe(true);
  });

  afterEach(async () => {
    try {
      await unlink('out.puml');
    } catch (_ignored) {}

    try {
      await unlink('out.png');
    } catch (_ignored) {}
  });
});
