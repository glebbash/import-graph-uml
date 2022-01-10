import {
  BaseNode,
  CallExpression,
  Expression,
  Statement,
} from '@typescript-eslint/types/dist/ast-spec';
import { parse } from '@typescript-eslint/typescript-estree';

import { SourceFile } from './get-source-files';

type FileContent = { path: string; content: string };

export type FindImportsOptions = {
  packageImports?: false;
  absoluteImports?: true;
  relativeImports?: true;
};

type FindImportsOptionsFull = {
  packageImports: boolean;
  absoluteImports: boolean;
  relativeImports: boolean;
};

const findImportsOptionsDefaults: FindImportsOptionsFull = {
  packageImports: true,
  absoluteImports: false,
  relativeImports: false,
};

export async function findImports(
  files: SourceFile[],
  options: FindImportsOptions = {},
) {
  const optionsFull = {
    ...findImportsOptionsDefaults,
    ...options,
  };

  const fileContents = await Promise.all(
    files.map(async (file) => ({
      path: file.path,
      content: await file.read(),
    })),
  );

  const importedModules = fileContents.reduce(
    (modules, file) => ({
      ...modules,
      [file.path]: getImportedModulesFromModule(file).filter((mod) =>
        shouldImportBeCounted(mod, optionsFull),
      ),
    }),
    {} as Record<string, string[]>,
  );

  return importedModules;
}

function getImportedModulesFromModule(file: FileContent) {
  try {
    const tree = parse(file.content);

    return tree.body.map((node) => getImportedModulesInStatement(node)).flat();
  } catch (e) {
    throw new Error(`Error loading '${file.path}': ${e}`);
  }
}

function getImportedModulesInStatement(node: Statement): string[] {
  if (node.type === 'ImportDeclaration') {
    return [node.source.value];
  }

  if (node.type === 'ExportAllDeclaration' && node.source) {
    return [node.source.value];
  }

  if (node.type === 'ExpressionStatement') {
    return getImportedModulesInExpr(node.expression);
  }

  if (node.type === 'VariableDeclaration') {
    return node.declarations
      .map((decl) => decl.init)
      .filter((init): init is Expression => Boolean(init))
      .map(getImportedModulesInExpr)
      .flat();
  }

  return [];
}

function getImportedModulesInExpr(expr: BaseNode): string[] {
  if (!isCallExpression(expr)) {
    return [];
  }

  if (isRequireExpression(expr)) {
    return [expr.arguments[0].value];
  }

  if (expr.callee.type === 'MemberExpression') {
    return getImportedModulesInExpr(expr.callee.object);
  }

  return expr.arguments.map(getImportedModulesInExpr).flat();
}

function shouldImportBeCounted(value: string, options: FindImportsOptionsFull) {
  return (
    (value[0] === '/' && options.absoluteImports) ||
    (value[0] === '.' && options.relativeImports) ||
    options.packageImports
  );
}

function isRequireExpression(
  node: CallExpression,
): node is CallExpression & { arguments: [{ value: string }] } {
  return (
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments[0]?.type === 'Literal' &&
    typeof node.arguments[0].value === 'string'
  );
}

function isCallExpression(node: BaseNode): node is CallExpression {
  return node?.type === 'CallExpression';
}
