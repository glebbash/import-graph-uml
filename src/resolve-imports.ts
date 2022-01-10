import path from 'path';

export function resolveImports(
  imports: Record<string, string[]>,
  root: string,
): Record<string, string[]> {
  const resolvedRoot = path.resolve(root);

  return Object.fromEntries(
    Object.entries(imports).map(([mod, is]) => [
      '~/' + formatModuleName(mod.slice(0, -'.ts'.length), resolvedRoot),
      [
        ...new Set(
          is.map((importUrl) =>
            formatModuleName(getRelativePathToRoot(importUrl, mod, resolvedRoot), resolvedRoot),
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

function getRelativePathToRoot(importUrl: string, module: string, root: string) {
  if (importUrl[0] !== '.') {
    return importUrl;
  }

  const folderPath = path.resolve(root, path.dirname(module));
  return './' + path.relative(root, path.resolve(folderPath, importUrl));
}
