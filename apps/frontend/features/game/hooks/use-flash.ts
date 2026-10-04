'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

//Короткое всплывающее сообщение; новый вызов корректно перезапускает таймер
export function useFlash() {
  const [flash, setFlash] = useState('');
  const timerRef = useRef<number | undefined>(undefined);

  const show = useCallback((message: string, ms = 1400) => {
    window.clearTimeout(timerRef.current);
    setFlash(message);
    timerRef.current = window.setTimeout(() => setFlash(''), ms);
  }, []);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return { flash, show };
}
