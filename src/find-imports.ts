import {
  BaseNode,
  CallExpression,
  Expression,
  Statement,
} from '@typescript-eslint/types/dist/ast-spec';
import { parse } from '@typescript-eslint/typescript-estree';
import glob from 'fast-glob';
import fs from 'fs';
import path from 'path';

interface Options {
  packageImports: boolean;
  absoluteImports: boolean;
  relativeImports: boolean;
  ignore: string[];
  root: string;
}

const defaultOptions: Options = {
  packageImports: true,
  absoluteImports: false,
  relativeImports: false,
  ignore: [],
  root: '~',
};

export async function findImports(
  patterns: string | string[] = [],
  options: Partial<Options> = defaultOptions,
) {
  const _options = { ...defaultOptions, ...options };

  const filePaths = await glob(patterns, {
    cwd: path.resolve(_options.root),
    ignore: _options.ignore,
    absolute: false,
    onlyFiles: true,
  });

  const importedModules = filePaths.reduce(
    (modules, modulePath) => ({
      ...modules,
      [modulePath]: getImportedModulesFromModule(
        modulePath,
        _options.root,
      ).filter((mod) => shouldImportBeCounted(mod, _options)),
    }),
    {} as Record<string, string[]>,
  );

  return importedModules;
}

function getImportedModulesFromModule(modulePath: string, root: string) {
  try {
    const tree = parse(
      fs.readFileSync(path.resolve(root, modulePath), { encoding: 'utf-8' }),
    );

    return tree.body.map((node) => getImportedModulesInStatement(node)).flat();
  } catch (e) {
    console.error('Error in `' + modulePath + '`: ' + e);
    return [];
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

function shouldImportBeCounted(value: string, options: Options) {
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
