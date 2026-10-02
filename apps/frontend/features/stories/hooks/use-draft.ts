import { useCallback, useEffect, useRef, useState } from 'react';
import { DRAFT_DELAY_MS } from '@/features/stories/lib/editor/constants';

export function useDraft(external: string, push: (value: string) => void, delay = DRAFT_DELAY_MS) {
  const [draft, setDraft] = useState(external);
  const draftRef = useRef(external);
  const dirtyRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const pushRef = useRef(push);
  pushRef.current = push;

  // внешнее значение (undo, ответ сервера) подтягиваем, только если пользователь не печатает
  useEffect(() => {
    if (!dirtyRef.current) {
      draftRef.current = external;
      setDraft(external);
    }
  }, [external]);

  const flush = useCallback(() => {
    window.clearTimeout(timerRef.current);
    timerRef.current = undefined;
    if (!dirtyRef.current) return;
    dirtyRef.current = false;
    pushRef.current(draftRef.current);
  }, []);

  const onChange = useCallback(
    (value: string) => {
      draftRef.current = value;
      dirtyRef.current = true;
      setDraft(value);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(flush, delay);
    },
    [delay, flush],
  );

  useEffect(() => flush, [flush]); // не теряем ввод при размонтировании

  return { value: draft, onChange, flush };
}
