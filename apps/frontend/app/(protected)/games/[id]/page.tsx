'use client';

import { useParams } from 'next/navigation';
import { GameScreen } from '@/features/game/components/play/GameScreen';

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  return <GameScreen playthroughId={id} />;
}
