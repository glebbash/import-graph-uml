/** @type {import("../src/import-graph-uml").BuildConfig['buildGraph']} */
module.exports.buildGraph = async (builder) => {
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
