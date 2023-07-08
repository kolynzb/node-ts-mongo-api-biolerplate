// sum.ts
const sum = (a: number, b: number): number  => a + b;

test('sum function should add two numbers correctly', () => {
  const result = sum(2, 3);
  expect(result).toBe(5);
});
