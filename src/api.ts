export type { DiagramBuilder, Link, Node } from './diagram-builder';
export type GraphOptions = ReturnType<typeof import('./cli').argsParser['parse']>;

import type { DiagramBuilder } from './diagram-builder';
export type BuildConfig = {
  buildDiagram: (builder: DiagramBuilder) => Promise<string>;
};
