import glob from 'fast-glob';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

export type SourceFile = { path: string; read: () => Promise<string> };

export type GetSourceFilesOptions = {
  root: string;
  patterns: string | string[];
  ignore: string[];
};

export async function getSourceFiles(options: GetSourceFilesOptions): Promise<SourceFile[]> {
  const filePaths = await glob(options.patterns, {
    cwd: resolve(options.root),
    ignore: options.ignore,
    absolute: false,
    onlyFiles: true,
  });

  return filePaths.map((path) => ({
    path,
    read: () => readFile(resolve(options.root, path), { encoding: 'utf-8' }),
  }));
}
