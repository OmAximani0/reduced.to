import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ShortenerDTO } from './dto/shortener.dto';
import { ShortenerService } from './shortener.service';

@Controller({
  path: 'shortener',
  version: '1',
})
export class ShortenerController {
  constructor(private readonly shortenerService: ShortenerService) {}

  @Get(':shortUrl')
  findOne(@Param('shortUrl') shortUrl: string) {
    return this.shortenerService.getOriginalUrl(shortUrl);
  }

  @Post()
  async shortener(@Body() body: ShortenerDTO) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(body.originalUrl);

      // Checks if the URL is already reduced.
      if (this.shortenerService.isUrlAlreadyShortend(body.originalUrl)) {
        throw new Error('The URL is already shortened...');
      }
    } catch (err: any) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        error: err.message || 'URL is invalid',
      });
    }

    let shortUrl: string;

    do {
      shortUrl = this.shortenerService.generateShortUrl();
    } while (!(await this.shortenerService.isShortUrlAvailable(shortUrl)));

    await this.shortenerService.addUrl(parsedUrl.href, shortUrl);
    return { newUrl: shortUrl };
  }
}
