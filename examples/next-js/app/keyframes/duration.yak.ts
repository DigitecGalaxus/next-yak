const fib = (n: number): number => {
  if (n <= 1) {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
};

export const verySlow = fib(20) + "ms";
