import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';

// Require CommonJS modules
const cmsStorage = require('../scripts/cms-storage.cjs');

describe('CMS Storage & Safety Engine', () => {
  const testFile = path.resolve(__dirname, '../src/data/__test_atomic.json');

  afterEach(() => {
    if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
    if (fs.existsSync(testFile + '.bak')) fs.unlinkSync(testFile + '.bak');
  });

  it('rejects path traversal attacks outside src/data and public', () => {
    expect(() => {
      cmsStorage.writeJsonFileAtomic(path.resolve(__dirname, '../../unauthorized.json'), { hacked: true });
    }).toThrow(/Security Exception/);
  });

  it('atomically writes JSON files and creates automatic .bak backup', () => {
    const payload1 = { version: 1, name: 'Calenvee Test' };
    cmsStorage.writeJsonFileAtomic(testFile, payload1);

    expect(fs.existsSync(testFile)).toBe(true);
    const read1 = cmsStorage.readJsonFile(testFile);
    expect(read1.version).toBe(1);

    // Second write should create .bak backup of the first
    const payload2 = { version: 2, name: 'Calenvee Updated' };
    cmsStorage.writeJsonFileAtomic(testFile, payload2);

    expect(fs.existsSync(testFile + '.bak')).toBe(true);
    const readBak = cmsStorage.readJsonFile(testFile + '.bak');
    expect(readBak.version).toBe(1);

    const read2 = cmsStorage.readJsonFile(testFile);
    expect(read2.version).toBe(2);
  });

  it('validates site configuration schema properly', () => {
    const invalidConfig = { version: 'not-a-number' };
    const res = cmsStorage.validateSiteConfig(invalidConfig);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);

    const validMockConfig = {
      version: 1,
      global: {
        shipping: { standardShippingFee: 250, freeShippingThreshold: 3500 },
        contact: { storeName: 'Calenvee.pk' }
      },
      pages: {
        home: {
          id: 'home',
          name: 'Home',
          sections: [
            { id: 'hero-1', type: 'hero', visible: true, settings: {} }
          ]
        }
      }
    };
    const validRes = cmsStorage.validateSiteConfig(validMockConfig);
    expect(validRes.valid).toBe(true);
  });

  it('creates snapshots in .history and lists them', () => {
    const sampleConfig = {
      version: 1,
      global: { shipping: { standardShippingFee: 250 }, contact: { storeName: 'Calenvee.pk' } },
      pages: { home: { id: 'home', sections: [{ id: 's1', type: 'hero', visible: true }] } }
    };

    const snapshot = cmsStorage.createSnapshot(sampleConfig, 'Test snapshot creation');
    expect(snapshot.snapshotId).toContain('snapshot-');

    const list = cmsStorage.listSnapshots();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].id).toContain('snapshot-');
  });

  it('computes human-readable diffs between configurations', () => {
    const oldConfig = {
      global: { announcementBar: { enabled: true } },
      pages: {
        home: {
          sections: [
            { id: 'sec-1', type: 'hero', visible: true, settings: { title: 'Old' } }
          ]
        }
      }
    };

    const newConfig = {
      global: { announcementBar: { enabled: false } },
      pages: {
        home: {
          sections: [
            { id: 'sec-1', type: 'hero', visible: false, settings: { title: 'New' } },
            { id: 'sec-2', type: 'product-grid', visible: true, settings: {} }
          ]
        }
      }
    };

    const diff = cmsStorage.computeDiff(oldConfig, newConfig);
    expect(diff.hasChanges).toBe(true);
    expect(diff.changes.some(c => c.includes('Announcement bar'))).toBe(true);
    expect(diff.changes.some(c => c.includes('sec-2'))).toBe(true);
  });
});

