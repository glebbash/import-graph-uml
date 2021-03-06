import { resolve } from 'path';
import yargs from 'yargs';

const argsParser = yargs([])
  .options({
    src: { type: 'string', demandOption: true },
    out: { type: 'string', default: 'out.puml' },
    plantUmlJar: {
      type: 'string',
      default: resolve(__dirname, '../assets/plantuml-1.2021.16.jar'),
    },
    include: { type: 'string', default: 'src/**/*.ts' },
    builder: { type: 'string', default: resolve(__dirname, './build-module-graph') },
  })
  .help();

export function parseArgs(args: string[]) {
  return argsParser.parse(args);
}
