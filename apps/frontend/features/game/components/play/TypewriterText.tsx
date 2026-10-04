'use client';

import { useEffect, useRef, useState } from 'react';

const TYPE_SPEED = 22;

export function TypewriterText({
  text,
  skipToken,
  onDone,
}: {
  text: string;
  skipToken: number;
  onDone: () => void;
}) {
  const [count, setCount] = useState(0);
  const timerRef = useRef<number | null>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const textRef = useRef(text);
  textRef.current = text;

  const stop = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    stop();
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || text.length === 0) {
      setCount(text.length);
      onDoneRef.current();
      return;
    }
    setCount(0);
    let index = 0;
    timerRef.current = window.setInterval(() => {
      index += 1;
      setCount(index);
      if (index >= text.length) {
        stop();
        onDoneRef.current();
      }
    }, TYPE_SPEED);
    return stop;
  }, [text]);

  useEffect(() => {
    if (skipToken === 0 || timerRef.current === null) return; // уже допечатано
    stop();
    setCount(textRef.current.length);
    onDoneRef.current();
  }, [skipToken]);

  const finished = count >= text.length;
  return (
    <>
      {text.slice(0, count)}
      <span className={finished ? 'opacity-0' : 'typewriter-caret'}>▋</span>
    </>
  );
}
