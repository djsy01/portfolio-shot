const supportsColor = Boolean(process.stdout.isTTY);

const ansi = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
};

function paint(code: string, text: string): string {
  return supportsColor ? `${code}${text}${ansi.reset}` : text;
}

export const logger = {
  success(message: string): void {
    console.log(`${paint(ansi.green, '✔')} ${message}`);
  },
  info(message: string): void {
    console.log(`${paint(ansi.cyan, 'ℹ')} ${message}`);
  },
  warn(message: string): void {
    console.warn(`${paint(ansi.yellow, '⚠')} ${message}`);
  },
  error(message: string): void {
    console.error(`${paint(ansi.red, '✖')} ${message}`);
  },
  step(message: string): void {
    console.log(`${paint(ansi.dim, '…')} ${message}`);
  },
  done(message: string): void {
    console.log(`\n${paint(ansi.green, message)}`);
  },
};
