#!/usr/bin/env node

import yargs from 'yargs';

import { generateImportGraph } from './import-graph-uml';

export const argsParser = yargs([])
  .options({
    src: { type: 'string', demandOption: true },
    out: { type: 'string', default: 'out.puml' },
    plantUmlJar: { type: 'string', default: 'plantuml-1.2021.16.jar' },
    include: { type: 'string', default: 'src/**/*.ts' },
    builder: { type: 'string', default: './build-diagram' },
  })
  .help();

const args = argsParser.parse(process.argv.slice(2));

generateImportGraph(args).catch(console.error);
