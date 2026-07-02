export class PortfolioShotError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'PortfolioShotError';
  }
}

export class InvalidConfigError extends PortfolioShotError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidConfigError';
  }
}

export class BrowserLaunchError extends PortfolioShotError {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'BrowserLaunchError';
  }
}

export class PageCaptureError extends PortfolioShotError {
  readonly pageName: string;

  constructor(message: string, pageName: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'PageCaptureError';
    this.pageName = pageName;
  }
}

export class OutputDirectoryError extends PortfolioShotError {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'OutputDirectoryError';
  }
}

export class AuthError extends PortfolioShotError {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'AuthError';
  }
}
