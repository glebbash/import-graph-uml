import { exec as execWithCallback } from 'child_process';
import { writeFile } from 'fs/promises';
import { promisify } from 'util';

import { findImports } from './find-imports';
import { getSourceFiles } from './get-source-files';

export { type Link, type Node, GraphBuilder } from './graph-builder';
export type GraphOptions = ReturnType<typeof import('./parse-args').parseArgs>;

import { GraphBuilder } from './graph-builder';
import { resolveImports } from './resolve-imports';
export type BuildConfig = {
  buildGraph: (builder: GraphBuilder) => Promise<string>;
};

const exec = promisify(execWithCallback);

export async function generateImportGraph(args: GraphOptions) {
  const sourceFiles = await getSourceFiles({
    root: args.src,
    patterns: args.include,
    ignore: [],
  });
  const imports = await findImports(sourceFiles);
  const resolvedImports = resolveImports(imports, args.src);

  const builder = new GraphBuilder(resolvedImports);
  const buildConfig: BuildConfig = await import(args.builder);
  const graph = await buildConfig.buildGraph(builder);

  await writeFile(args.out, graph);

  const { stdout, stderr } = await exec(`java -jar ${args.plantUmlJar} ${args.out}`);
  process.stdout.write(stdout);
  process.stderr.write(stderr);
}
