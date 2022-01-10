import { exec as execWithCallback } from 'child_process';
import { writeFile } from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

import type { BuildConfig, GraphOptions } from './api';
import { DiagramBuilder } from './diagram-builder';
import { findImports } from './find-imports';

export * from './api';


const exec = promisify(execWithCallback);

export async function generateImportGraph(args: GraphOptions) {
  const imports = await findImports(args.include, { root: args.src });
  const fixedImports = fixImports(imports, args.src);

  const diagram = await buildDiagram(
    new DiagramBuilder(fixedImports),
    args.builder,
  );

  await writeFile(args.out, diagram);

  const { stdout, stderr } = await exec(
    `java -jar ${args.plantUmlJar} ${args.out}`,
  );
  process.stdout.write(stdout);
  process.stderr.write(stderr);

  console.log(`Diagram generated at ${args.out.slice(0, -'.puml'.length)}.png`);
}

async function buildDiagram(
  builder: DiagramBuilder,
  buildConfigPath: string,
): Promise<string> {
  const buildConfig: BuildConfig = await import(buildConfigPath);
  return buildConfig.buildDiagram(builder);
}

function fixImports(imports: Record<string, string[]>, root: string) {
  return Object.fromEntries(
    Object.entries(imports).map(([mod, is]) => [
      '~/' + formatModuleName(mod.slice(0, -'.ts'.length), root),
      [
        ...new Set(
          is.map((importUrl) =>
            formatModuleName(getRelativePathToRoot(importUrl, mod, root), root),
          ),
        ),
      ],
    ]),
  );
}

function formatModuleName(name: string, root: string) {
  if (name[0] !== '.') {
    return name;
  }

  return `~/${path.resolve(root, name).slice(root.length + 1)}`;
}

function getRelativePathToRoot(
  importUrl: string,
  module: string,
  root: string,
) {
  if (importUrl[0] !== '.') {
    return importUrl;
  }

  const folderPath = path.resolve(root, path.dirname(module));
  return './' + path.relative(root, path.resolve(folderPath, importUrl));
}
