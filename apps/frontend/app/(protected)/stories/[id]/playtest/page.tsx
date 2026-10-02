'use client';

import { useParams } from 'next/navigation';
import { PlaytestScreen } from '@/features/stories/components/playtest/PlaytestScreen';

export default function PlaytestPage() {
  const { id } = useParams<{ id: string }>();
  return <PlaytestScreen storyId={id} />;
}
