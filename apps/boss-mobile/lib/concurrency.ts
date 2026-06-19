/** Paralel istekleri sinirla — gensrv pool uzerinde ayni anda cok sorgu disconnect riskini azaltir. */
export async function mapPool<T>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<void>
): Promise<void>
{
  if(items.length === 0)
  {
    return;
  }
  let nextIndex = 0;
  const workerCount = Math.min(Math.max(1, concurrency), items.length);
  const workers = Array.from({ length: workerCount }, async () =>
  {
    while(nextIndex < items.length)
    {
      const index = nextIndex;
      nextIndex += 1;
      await fn(items[index], index);
    }
  });
  await Promise.all(workers);
}
