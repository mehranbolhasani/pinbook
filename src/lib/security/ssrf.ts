/**
 * SSRF protection utility.
 * Validates that a URL is safe to fetch server-side by ensuring it uses
 * an allowed scheme and does not resolve to a private/reserved IP address.
 */

const ALLOWED_SCHEMES = ['http:', 'https:'];

// Private/reserved IP prefixes (IPv4)
const PRIVATE_IPV4_PREFIXES = [
  '0.',        // Current network
  '10.',       // Private
  '127.',      // Loopback
  '169.254.',  // Link-local
  '172.16.', '172.17.', '172.18.', '172.19.',
  '172.20.', '172.21.', '172.22.', '172.23.',
  '172.24.', '172.25.', '172.26.', '172.27.',
  '172.28.', '172.29.', '172.30.', '172.31.', // Private
  '192.0.2.',  // TEST-NET-1
  '192.88.99.', // 6to4 relay anycast
  '192.168.',  // Private
  '198.18.', '198.19.', // Benchmark testing
  '198.51.100.', // TEST-NET-2
  '203.0.113.', // TEST-NET-3
  '224.', '225.', '226.', '227.', '228.', '229.',
  '230.', '231.', '232.', '233.', '234.', '235.',
  '236.', '237.', '238.', '239.', '240.', '241.',
  '242.', '243.', '244.', '245.', '246.', '247.',
  '248.', '249.', '250.', '251.', '252.', '253.',
  '254.', '255.', // Multicast + reserved
];

const PRIVATE_IPV4_RANGES: [string, string][] = [
  ['100.64.0.0', '100.127.255.255'], // CGNAT
];

function isPrivateIPv4(ip: string): boolean {
  // Check exact prefix matches first
  for (const prefix of PRIVATE_IPV4_PREFIXES) {
    if (ip.startsWith(prefix)) return true;
  }

  // Check range matches
  for (const [start, end] of PRIVATE_IPV4_RANGES) {
    if (ipInRange(ip, start, end)) return true;
  }

  return false;
}

function ipToLong(ip: string): number {
  const parts = ip.split('.').map(Number);
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function ipInRange(ip: string, start: string, end: string): boolean {
  const ipNum = ipToLong(ip);
  const startNum = ipToLong(start);
  const endNum = ipToLong(end);
  return ipNum >= startNum && ipNum <= endNum;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  // Loopback
  if (lower === '::1' || lower === '0:0:0:0:0:0:0:1') return true;
  // Link-local
  if (lower.startsWith('fe80:')) return true;
  // Unique local addresses
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
  // Loopback compressed forms
  if (lower === '::1') return true;
  // IPv4-mapped loopback
  if (lower.startsWith('::ffff:127.')) return true;
  if (lower.startsWith('::ffff:0:127.')) return true;
  // IPv4-mapped private
  if (lower.startsWith('::ffff:10.')) return true;
  if (lower.startsWith('::ffff:192.168.')) return true;
  if (lower.startsWith('::ffff:172.')) {
    const mapped = lower.slice(7); // after ::ffff:
    for (let i = 16; i <= 31; i++) {
      if (mapped.startsWith(`172.${i}.`)) return true;
    }
  }
  return false;
}

function isPrivateIP(ip: string): boolean {
  if (ip.includes(':')) {
    return isPrivateIPv6(ip);
  }
  return isPrivateIPv4(ip);
}

export function isValidPublicUrl(urlString: string): { valid: true } | { valid: false; reason: string } {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }

  // Scheme check
  if (!ALLOWED_SCHEMES.includes(parsed.protocol)) {
    return { valid: false, reason: 'Only HTTP and HTTPS URLs are allowed' };
  }

  // Host must exist
  if (!parsed.hostname) {
    return { valid: false, reason: 'URL must have a hostname' };
  }

  // Block localhost variants
  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '0.0.0.0') {
    return { valid: false, reason: 'Localhost URLs are not allowed' };
  }

  // Block IPv4 literals
  const ipv4Match = hostname.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (ipv4Match) {
    const ip = ipv4Match[1];
    if (isPrivateIPv4(ip)) {
      return { valid: false, reason: 'Private IP addresses are not allowed' };
    }
  }

  // Block IPv6 literals (with or without brackets)
  const ipv6Host = hostname.replace(/^\[|\]$/g, '');
  if (ipv6Host.includes(':')) {
    if (isPrivateIPv6(ipv6Host)) {
      return { valid: false, reason: 'Private IPv6 addresses are not allowed' };
    }
  }

  return { valid: true };
}
