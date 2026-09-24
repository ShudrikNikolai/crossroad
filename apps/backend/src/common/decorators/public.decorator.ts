import { SetMetadata } from '@nestjs/common';
export const PUBLIC_KEY = 'isPublic' as const;
export const Public = () => SetMetadata(PUBLIC_KEY, true);
