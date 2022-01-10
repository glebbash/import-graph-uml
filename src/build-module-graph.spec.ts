import { m } from 'multiline-str';

import { buildGraph as buildModuleGraph } from './build-module-graph';
import { GraphBuilder } from './import-graph-uml';

describe('build-module-graph', () => {
  it('builds graph of modules only', async () => {
    const imports = {
      '~/src/a.module': ['~/src/b/b.module', '~/src/c.module'],
      '~/src/b/b.module': ['~/src/c.module'],
      '~/src/c.module': ['~/src/helper'],
      '~/src/helper': ['~/src/not-found.module'],
    };

    const builder = new GraphBuilder(imports);

    const res = await buildModuleGraph(builder);

    expect(builder.getImports()).toBe(imports);
    expect(res).toBe(m`
      @startuml
      class "a" as c0
      class "b" as c1
      class "c" as c2
      c0 --> c1
      c0 --> c2
      c1 --> c2
      @enduml

      `);
  });
});
