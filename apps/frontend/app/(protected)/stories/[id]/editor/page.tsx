'use client';

import { useParams } from 'next/navigation';
import { ReactFlowProvider } from '@xyflow/react';
import { StoryEditor } from '@/features/stories/components/editor/StoryEditor';

export default function StoryEditorPage() {
  const params = useParams<{ id: string }>();
  return (
    <ReactFlowProvider>
      <StoryEditor storyId={params.id} />
    </ReactFlowProvider>
  );
}
