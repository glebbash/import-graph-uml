export type Node = { id: string; name: string };
export type Link = [Node, Node];

export class DiagramBuilder {
  private str = '';
  private nodes = this.buildAllNodes();
  private links = this.buildAllLinks();

  // eslint-disable-next-line no-useless-constructor
  constructor(private imports: Record<string, string[]>) {}

  appendNode(node: Node) {
    this.append(`class "${node.name}" as ${node.id}`);
  }

  appendLink(node1: Node, node2: Node) {
    this.append(`${node1.id} --> ${node2.id}`);
  }

  unlink(predicate: (node: Node) => boolean) {
    const shouldKeep = (node: Node) => !predicate(node);

    this.nodes = this.nodes.filter(shouldKeep);
    this.links = this.links.filter(([a, b]) => shouldKeep(a) && shouldKeep(b));
  }

  findNodeByName(name: string): Node | undefined {
    return this.nodes.find((node) => node.name === name);
  }

  append(text: string) {
    this.str += text + '\n';
  }

  build(): string {
    return this.str;
  }

  getNodes(): readonly Node[] {
    return this.nodes;
  }

  getLinks(): readonly Link[] {
    return this.links;
  }

  getImports(): Readonly<Record<string, string[]>> {
    return this.imports;
  }

  private buildAllNodes(): Node[] {
    const allNames = Object.entries(this.imports)
      .map(([k, vs]) => [k, ...vs])
      .flat();
    const uniqueNames = [...new Set(allNames)];

    return uniqueNames.map((name, id) => ({ id: `c${id}`, name }));
  }

  private buildAllLinks() {
    const links: Link[] = [];
    for (const [k, vs] of Object.entries(this.imports)) {
      for (const v of vs) {
        const node1 = this.findNodeByName(k);
        const node2 = this.findNodeByName(v);

        if (!node1 || !node2) {
          continue;
        }

        links.push([node1, node2]);
      }
    }

    return links;
  }
}
