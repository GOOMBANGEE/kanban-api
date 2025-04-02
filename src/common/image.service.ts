import { v1 as uuidV1 } from 'uuid';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { envKey } from './const/env.const';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageService {
  private readonly imagePath: string;

  constructor(private readonly configService: ConfigService) {
    this.imagePath = path.join(this.configService.get(envKey.imagePath));

    // 이미지 저장 디렉토리 없으면 생성
    if (!fs.existsSync(path.join(__dirname, '../..', this.imagePath))) {
      fs.mkdirSync(path.join(__dirname, '../..', this.imagePath), {
        recursive: true,
      });
    }
  }

  // base64 가져와서 image 저장
  async saveIcon(icon: string): Promise<{ imageUrl: string }> {
    const imgRegex = /^data:image\/([a-zA-Z]+);base64,(.+)$/;
    const base64 = RegExp(imgRegex).exec(icon);

    const filename = await this.saveImage(base64);
    const imageUrl = `${this.imagePath}/${filename}`;

    return { imageUrl };
  }

  async saveContentImage(
    base64: RegExpMatchArray,
  ): Promise<{ filename: string; base64Data: string }> {
    const base64Data = base64[2];

    const filename = await this.saveImage(base64);

    return { filename, base64Data };
  }

  async saveImage(base64: RegExpMatchArray) {
    const extension = base64[1];
    const base64Data = base64[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // 파일명 생성 및 저장
    const filename = `${uuidV1()}-${Date.now()}.${extension}`;
    const filePath = path.join(__dirname, '../..', this.imagePath, filename);
    await fs.promises.writeFile(filePath, buffer);

    return filename;
  }
}
