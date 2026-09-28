import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MediaService } from '../media';
import { CreateUploadUrlDto, UploadUrlResponseDto, MediaResponseDto } from '../dtos';
import { CurrentUser } from '@/common';

@ApiTags('media')
@ApiBearerAuth('access-token')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-url')
  @ApiOperation({ summary: 'Get a presigned POST policy for direct upload to storage' })
  @ApiOkResponse({ type: UploadUrlResponseDto })
  createUploadUrl(@CurrentUser('id') userId: string, @Body() data: CreateUploadUrlDto) {
    return this.mediaService.createUploadUrl(userId, data);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm that the file was uploaded' })
  @ApiOkResponse({ type: MediaResponseDto })
  confirm(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.mediaService.confirm(userId, id);
  }
}
