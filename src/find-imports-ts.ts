import { createProgram } from '@typescript-eslint/typescript-estree';
import path from 'path';

type Import = { text: string };

export function findImports(cwd = process.cwd()) {
  return createProgram('tsconfig.json')
    .getSourceFiles()
    .filter(({ fileName }) => !fileName.includes('node_modules'))
    .reduce((modules, file) => {
      console.log((file as any).imports);
      return {
        ...modules,
        [path.relative(cwd, file.fileName)]: (file as any).imports.map(
          (i: Import) => i.text,
        ),
      };
    }, {} as Record<string, string[]>);
}
