import { v1 as uuidV1 } from 'uuid';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { envKey } from './const/env.const';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageService {
  private readonly baseUrl: string;
  private readonly imagePath: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get(envKey.baseUrl);
    this.imagePath = path.join(this.configService.get(envKey.imagePath));
  }

  // base64 가져와서 image 저장
  async saveIcon(icon: string): Promise<{ imageUrl: string }> {
    const imgRegex = /^data:image\/([a-zA-Z]+);base64,(.+)$/;
    const base64 = RegExp(imgRegex).exec(icon);

    const extension = base64[1];
    const base64Data = base64[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // 파일명 생성 및 저장
    const filename = `${uuidV1()}-${Date.now()}.${extension}`;
    const filePath = path.join(__dirname, this.imagePath, filename);
    await fs.promises.writeFile(filePath, buffer);

    const imageUrl = `${this.baseUrl}/${this.imagePath}/${filename}`;
    return { imageUrl };
  }
}
