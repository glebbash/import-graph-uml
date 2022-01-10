import { BuildConfig } from './import-graph-uml';

export const buildGraph: BuildConfig['buildGraph'] = async (builder) => {
  builder.unlink((node) => !node.name.includes('.module'));

  for (const node of builder.getNodes()) {
    if (node.name.split('/').length > 3) {
      node.name = node.name.split('/').slice(2, -1).join('/');
    } else {
      node.name = node.name.slice('~/src/'.length, -'.module'.length);
    }
  }

  builder.append('@startuml');

  for (const node of builder.getNodes()) {
    builder.appendNode(node);
  }

  for (const link of builder.getLinks()) {
    builder.appendLink(link);
  }

  builder.append('@enduml');

  return builder.build();
};
