@workspace In all TypeScript files inside the `types/` directory:

Refactor every exported empty interface that extends a supertype into an exported type alias.

Requirements:

1. Identify patterns like:
   `export interface Foo extends Bar {}`
   and transform them into:
   `export type Foo = Bar;`
2. If an interface extends multiple types (e.g. `extends A, B {}`), convert it into an intersection:
   `export type Foo = A & B;`
3. If an interface contains body properties (e.g., `export interface Foo extends Bar { id: string }`), convert it to:
   `export type Foo = Bar & { id: string };`
4. Preserve all JSDoc comments, generic type parameters, and exports.
5. Do not modify files outside the `types/` folder.
