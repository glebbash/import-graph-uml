import { findImports } from './find-imports';
import { SourceFile } from './get-source-files';

describe('findImports', () => {
  it('finds imports', async () => {
    const files: SourceFile[] = [
      { path: 'a.ts', read: async () => `import "./b"` },
      { path: 'b.ts', read: async () => '' },
    ];

    const imports = await findImports(files);

    expect(imports).toStrictEqual({
      'a.ts': ['./b'],
      'b.ts': [],
    });
  });

  it('errors if files are invalid', async () => {
    const files: SourceFile[] = [{ path: 'a.ts', read: async () => `import 1` }];

    await expect(findImports(files)).rejects.toThrow(
      new Error("Error loading 'a.ts': TSError: Declaration or statement expected."),
    );
  });
});
