import path from 'node:path';
import fs from 'fs-extra';
import sharp from 'sharp';
import { OutputDirectoryError } from '../errors.js';
import type { ImageFormat, ResizeOptions } from '../types.js';

export interface OptimizeOptions {
  outputDir: string;
  fileName: string;
  format: ImageFormat;
  quality: number;
  resize?: ResizeOptions;
}

export async function saveOptimizedImage(buffer: Buffer, options: OptimizeOptions): Promise<string> {
  try {
    await fs.ensureDir(options.outputDir);
  } catch (error) {
    throw new OutputDirectoryError(`Could not create output directory "${options.outputDir}".`, error);
  }

  const filePath = path.join(options.outputDir, `${options.fileName}.${options.format}`);

  let pipeline = sharp(buffer);

  if (options.resize && (options.resize.width || options.resize.height)) {
    pipeline = pipeline.resize(options.resize.width, options.resize.height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  pipeline = options.format === 'webp' ? pipeline.webp({ quality: options.quality }) : pipeline.png({ compressionLevel: 9 });

  await pipeline.toFile(filePath);

  return filePath;
}
