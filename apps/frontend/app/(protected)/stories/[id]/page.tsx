'use client';

import { useParams } from 'next/navigation';
import { StoryDetailsScreen } from '@/features/stories/components/details/StoryDetailsScreen';

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  return <StoryDetailsScreen storyId={id} />;
}
