import { memo, useEffect, useRef, useState } from 'react';
import { Text, type TextStyle } from 'react-native';
import { textSharp } from '@/lib/typography';

type Props = {
  value: number;
  format: (n: number) => string;
  duration?: number;
  style?: TextStyle | TextStyle[];
};

const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

/** Hedef sayiya yumusak sayim (count-up). Yalniz bu kucuk metin yeniden render olur. */
export const CountUpText = memo(function CountUpText({ value, format, duration = 700, style }: Props)
{
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() =>
  {
    const from = fromRef.current;
    const to = value;
    if(from === to)
    {
      setDisplay(to);
      return;
    }
    const start = Date.now();
    const tick = () =>
    {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / duration);
      const current = from + (to - from) * easeOut(p);
      setDisplay(current);
      if(p < 1)
      {
        rafRef.current = requestAnimationFrame(tick);
      }
      else
      {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () =>
    {
      if(rafRef.current !== null)
      {
        cancelAnimationFrame(rafRef.current);
      }
      fromRef.current = to;
    };
  }, [value, duration]);
  return <Text style={[textSharp, style]} numberOfLines={1}>{format(display)}</Text>;
});
