// sum.ts
function sum(a: number, b: number): number {
    return a + b;
  }
  
  
  test('sum function should add two numbers correctly', () => {
    const result = sum(2, 3);
    expect(result).toBe(5);
  });