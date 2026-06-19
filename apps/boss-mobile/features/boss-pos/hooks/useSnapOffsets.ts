import { useCallback, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { theme } from '@/lib/theme';

// Variable-width horizontal lists (chips) can't use snapToInterval; measure each
// item's x and expose snapToOffsets so scrolling always rests with an item flush
// to the leading padding (no half-cut items, consistent left gap).
export function useSnapOffsets(count: number, leadingPad: number = theme.space.lg)
{
  const xs = useRef<number[]>([]);
  const [offsets, setOffsets] = useState<number[]>([]);
  const onItemLayout = useCallback((index: number) => (e: LayoutChangeEvent) =>
  {
    xs.current[index] = e.nativeEvent.layout.x;
    let filled = 0;
    for(let i = 0; i < count; i++)
    {
      if(typeof xs.current[i] === 'number')
      {
        filled++;
      }
    }
    if(filled === count)
    {
      setOffsets(xs.current.slice(0, count).map((x) => Math.max(0, x - leadingPad)));
    }
  }, [count, leadingPad]);
  return { offsets, onItemLayout };
}
