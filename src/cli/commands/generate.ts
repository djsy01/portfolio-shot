import { generate } from '../../index.js';
import { loadConfig } from '../../config/loadConfig.js';
import { PortfolioShotError } from '../../errors.js';
import { logger } from '../../utils/logger.js';

export interface GenerateOptions {
  config?: string;
}

export async function runGenerate(options: GenerateOptions): Promise<void> {
  try {
    const config = await loadConfig(options.config);
    await generate(config);
  } catch (error) {
    if (error instanceof PortfolioShotError) {
      logger.error(error.message);
    } else {
      logger.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    }
    process.exitCode = 1;
  }
}
