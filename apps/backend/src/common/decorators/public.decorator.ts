import { PUBLIC_KEY } from '../utils';
import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata(PUBLIC_KEY, true);
