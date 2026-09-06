import { SetMetadata } from '@nestjs/common';
import { AUTH } from '../consts';

export const Public = () => SetMetadata(AUTH.IS_PUBLIC_KEY, true);
