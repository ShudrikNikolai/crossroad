'use client';

import { useEffect, useState } from 'react';

/** CSS-класс входной анимации на ~0.5с при смене узла. */
export function useNodeTransition(nodeId: string | undefined) {
  const [className, setClassName] = useState('');

  useEffect(() => {
    if (!nodeId) return;
    setClassName('game-node-enter');
    const timer = window.setTimeout(() => setClassName(''), 520);
    return () => window.clearTimeout(timer);
  }, [nodeId]);

  return className;
}
