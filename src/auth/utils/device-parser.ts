// ============================================================================
// ModularAuth-Kit — Device Parser
// Parses User-Agent strings into structured device information.
// Uses ua-parser-js for cross-browser/device detection.
// ============================================================================

import { UAParser } from 'ua-parser-js';

import type { DeviceInfo } from '../auth.types.js';

/**
 * Parse a User-Agent string into structured device information.
 * Handles missing or empty user-agent gracefully with safe defaults.
 *
 * @param userAgent - The raw User-Agent header string
 * @returns Parsed device info: { browser, os, type }
 */
export function parseDevice(userAgent: string): DeviceInfo {
  if (!userAgent) {
    return { browser: 'Unknown', os: 'Unknown', type: 'desktop' };
  }

  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  // Infer device type: mobile, tablet, or desktop (default)
  let type: DeviceInfo['type'] = 'desktop';
  if (device.type === 'mobile') {
    type = 'mobile';
  } else if (device.type === 'tablet') {
    type = 'tablet';
  }

  return {
    browser: browser.name ? `${browser.name} ${browser.version ?? ''}`.trim() : 'Unknown',
    os: os.name ? `${os.name} ${os.version ?? ''}`.trim() : 'Unknown',
    type,
  };
}
