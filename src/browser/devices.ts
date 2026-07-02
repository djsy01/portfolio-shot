import { devices as playwrightDevices } from 'playwright';
import { InvalidConfigError } from '../errors.js';
import type { DeviceConfig, DeviceInput, Viewport } from '../types.js';

interface PlaywrightDeviceDescriptor {
  viewport: Viewport;
  userAgent: string;
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
}

/** Friendly aliases for common Playwright device descriptors. */
const DEVICE_ALIASES: Record<string, string> = {
  mobile: 'iPhone 13',
  tablet: 'iPad (gen 7)',
};

const knownDevices = playwrightDevices as unknown as Record<string, PlaywrightDeviceDescriptor>;

/**
 * Resolves a device input (a preset name or a fully custom object) into a concrete
 * `DeviceConfig`. `"desktop"` uses the configured (or default) desktop viewport;
 * `"mobile"` / `"tablet"` and any exact Playwright device name (e.g. `"iPhone 15 Pro"`)
 * are resolved from Playwright's built-in device catalog.
 */
export function resolveDevice(input: DeviceInput, desktopViewport: Viewport): DeviceConfig {
  if (typeof input !== 'string') {
    return input;
  }

  if (input === 'desktop') {
    return { name: 'desktop', viewport: desktopViewport };
  }

  const playwrightName = DEVICE_ALIASES[input] ?? input;
  const descriptor = knownDevices[playwrightName];

  if (!descriptor) {
    throw new InvalidConfigError(
      `Unknown device "${input}". Use "desktop", "mobile", "tablet", an exact Playwright device name ` +
        '(e.g. "iPhone 15 Pro", "iPad Pro 11"), or a custom { name, viewport } object.',
    );
  }

  return {
    name: input,
    viewport: descriptor.viewport,
    userAgent: descriptor.userAgent,
    deviceScaleFactor: descriptor.deviceScaleFactor,
    isMobile: descriptor.isMobile,
    hasTouch: descriptor.hasTouch,
  };
}
