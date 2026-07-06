import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const SRC_DIR = dirname(fileURLToPath(import.meta.url));

// APIs that would send data off the machine. The whole pitch is that none of
// these appear in shipped source — this test is the executable proof.
const NETWORK_APIS = [/\bfetch\s*\(/, /XMLHttpRequest/, /\bWebSocket\b/, /sendBeacon/, /EventSource/];

function collectSourceFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectSourceFiles(full));
    } else if (entry.endsWith('.js') && !entry.endsWith('.test.js')) {
      files.push(full);
    }
  }
  return files;
}

describe('no-network guarantee', () => {
  const files = collectSourceFiles(SRC_DIR);

  it('scans the whole src tree', () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it('contains no outbound-network API calls in shipped source', () => {
    const offenders = [];
    for (const file of files) {
      const code = readFileSync(file, 'utf8');
      for (const pattern of NETWORK_APIS) {
        if (pattern.test(code)) offenders.push(`${file} matched ${pattern}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
