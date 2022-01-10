import '/something-from-root';
export * from './b';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const x = require('./folder/c');
class C {}
console.log(C);
x(2, x(2, 2));
