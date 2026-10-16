import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import { isSectionActive } from '../src/utils/configLoader';

const cmsStorage = require('../scripts/cms-storage.cjs');

describe('Milestone 5: Section Types & CMS API Round-Trip Verification', () => {
  let originalConfig: any;

  beforeEach(() => {
    originalConfig = cmsStorage.readJsonFile(cmsStorage.SITE_CONFIG_FILE);
  });

  afterEach(() => {
    // Restore original published config after each test
    if (originalConfig) {
      cmsStorage.writeJsonFileAtomic(cmsStorage.SITE_CONFIG_FILE, originalConfig);
    }
    if (fs.existsSync(cmsStorage.DRAFT_CONFIG_FILE)) {
      try { fs.unlinkSync(cmsStorage.DRAFT_CONFIG_FILE); } catch (_) {}
    }
  });

  it('round-trips Hero Banner Section: draft, publish, verify settings', () => {
    const draft = JSON.parse(JSON.stringify(originalConfig));
    const heroSec = draft.pages.home.sections.find((s: any) => s.type === 'hero');
    expect(heroSec).toBeDefined();

    heroSec.settings.autoIntervalSeconds = 8;
    heroSec.settings.slides[0].kicker = 'TEST VERIFIED KICKER';
    heroSec.settings.slides[0].headlinePrefix = 'Precision Engineered,';

    // 1. Save draft
    cmsStorage.writeJsonFileAtomic(cmsStorage.DRAFT_CONFIG_FILE, draft);
    const savedDraft = cmsStorage.readJsonFile(cmsStorage.DRAFT_CONFIG_FILE);
    expect(savedDraft.pages.home.sections[0].settings.autoIntervalSeconds).toBe(8);
    expect(savedDraft.pages.home.sections[0].settings.slides[0].kicker).toBe('TEST VERIFIED KICKER');

    // 2. Publish draft
    const snapshot = cmsStorage.createSnapshot(savedDraft, 'Hero roundtrip test');
    cmsStorage.writeJsonFileAtomic(cmsStorage.SITE_CONFIG_FILE, savedDraft);

    // 3. Verify storefront published state
    const published = cmsStorage.readJsonFile(cmsStorage.SITE_CONFIG_FILE);
    const publishedHero = published.pages.home.sections.find((s: any) => s.type === 'hero');
    expect(publishedHero.settings.autoIntervalSeconds).toBe(8);
    expect(publishedHero.settings.slides[0].kicker).toBe('TEST VERIFIED KICKER');
  });

  it('round-trips Product Grid Section: rule change and columns', () => {
    const draft = JSON.parse(JSON.stringify(originalConfig));
    const prodSec = draft.pages.home.sections.find((s: any) => s.type === 'product-grid');
    expect(prodSec).toBeDefined();

    prodSec.settings.rule = 'new-drops';
    prodSec.settings.limit = 6;
    prodSec.settings.columnsDesktop = 3;

    cmsStorage.writeJsonFileAtomic(cmsStorage.SITE_CONFIG_FILE, draft);
    const published = cmsStorage.readJsonFile(cmsStorage.SITE_CONFIG_FILE);
    const updated = published.pages.home.sections.find((s: any) => s.id === prodSec.id);
    expect(updated.settings.rule).toBe('new-drops');
    expect(updated.settings.limit).toBe(6);
    expect(updated.settings.columnsDesktop).toBe(3);
  });

  it('round-trips Category Grid Section: title and limit update', () => {
    const draft = JSON.parse(JSON.stringify(originalConfig));
    const catSec = draft.pages.home.sections.find((s: any) => s.type === 'category-grid');
    expect(catSec).toBeDefined();

    catSec.settings.title = 'EXPLORE CURATED DEPARTMENTS';
    catSec.settings.limit = 4;

    cmsStorage.writeJsonFileAtomic(cmsStorage.SITE_CONFIG_FILE, draft);
    const published = cmsStorage.readJsonFile(cmsStorage.SITE_CONFIG_FILE);
    const updated = published.pages.home.sections.find((s: any) => s.id === catSec.id);
    expect(updated.settings.title).toBe('EXPLORE CURATED DEPARTMENTS');
    expect(updated.settings.limit).toBe(4);
  });

  it('round-trips Deal of the Day Section: deal selection and auto-hide', () => {
    const draft = JSON.parse(JSON.stringify(originalConfig));
    const dealSec = draft.pages.home.sections.find((s: any) => s.type === 'deal-of-the-day');
    expect(dealSec).toBeDefined();

    dealSec.settings.dealId = 'deal-obsidian-chrono';
    dealSec.settings.autoHideWhenExpired = true;

    cmsStorage.writeJsonFileAtomic(cmsStorage.SITE_CONFIG_FILE, draft);
    const published = cmsStorage.readJsonFile(cmsStorage.SITE_CONFIG_FILE);
    const updated = published.pages.home.sections.find((s: any) => s.id === dealSec.id);
    expect(updated.settings.autoHideWhenExpired).toBe(true);
  });

  it('round-trips Promotional Banner Section: layout and content', () => {
    const draft = JSON.parse(JSON.stringify(originalConfig));
    const bannerSec = draft.pages.home.sections.find((s: any) => s.type === 'promo-banner');
    expect(bannerSec).toBeDefined();

    bannerSec.settings.layout = 'split-2';
    bannerSec.settings.banners[0].title = 'Seasonal Flash Drop';

    cmsStorage.writeJsonFileAtomic(cmsStorage.SITE_CONFIG_FILE, draft);
    const published = cmsStorage.readJsonFile(cmsStorage.SITE_CONFIG_FILE);
    const updated = published.pages.home.sections.find((s: any) => s.id === bannerSec.id);
    expect(updated.settings.layout).toBe('split-2');
    expect(updated.settings.banners[0].title).toBe('Seasonal Flash Drop');
  });

  it('round-trips Trust Badges Section: badges array modification', () => {
    const draft = JSON.parse(JSON.stringify(originalConfig));
    const trustSec = draft.pages.home.sections.find((s: any) => s.type === 'trust-badges');
    expect(trustSec).toBeDefined();

    trustSec.settings.title = 'HONEST SERVICE PROMISE';
    trustSec.settings.badges.push({
      id: 'b-new',
      title: 'Direct Video Inspection',
      subtitle: 'Real videos on WhatsApp upon request',
      icon: 'Video'
    });

    cmsStorage.writeJsonFileAtomic(cmsStorage.SITE_CONFIG_FILE, draft);
    const published = cmsStorage.readJsonFile(cmsStorage.SITE_CONFIG_FILE);
    const updated = published.pages.home.sections.find((s: any) => s.id === trustSec.id);
    expect(updated.settings.title).toBe('HONEST SERVICE PROMISE');
    expect(updated.settings.badges.some((b: any) => b.id === 'b-new')).toBe(true);
  });

  it('round-trips Customer Testimonials Section: layout and count', () => {
    const draft = JSON.parse(JSON.stringify(originalConfig));
    const testSec = draft.pages.home.sections.find((s: any) => s.type === 'testimonials');
    expect(testSec).toBeDefined();

    testSec.settings.layout = 'grid';
    testSec.settings.limit = 6;

    cmsStorage.writeJsonFileAtomic(cmsStorage.SITE_CONFIG_FILE, draft);
    const published = cmsStorage.readJsonFile(cmsStorage.SITE_CONFIG_FILE);
    const updated = published.pages.home.sections.find((s: any) => s.id === testSec.id);
    expect(updated.settings.layout).toBe('grid');
    expect(updated.settings.limit).toBe(6);
  });

  it('enforces "hidden means gone": section with visible=false is inactive', () => {
    const activeSection = { id: 's1', type: 'hero', visible: true };
    expect(isSectionActive(activeSection)).toBe(true);

    const hiddenSection = { id: 's2', type: 'hero', visible: false };
    expect(isSectionActive(hiddenSection)).toBe(false);

    // Schedule test (future showFrom)
    const futureSection = {
      id: 's3',
      type: 'hero',
      visible: true,
      showFrom: '2099-01-01T00:00:00+05:00'
    };
    expect(isSectionActive(futureSection)).toBe(false);

    // Schedule test (past showUntil)
    const expiredSection = {
      id: 's4',
      type: 'hero',
      visible: true,
      showUntil: '2020-01-01T00:00:00+05:00'
    };
    expect(isSectionActive(expiredSection)).toBe(false);
  });

  it('rejects invalid schema payloads with descriptive validation errors', () => {
    const invalidPayloads = [
      null,
      { version: 'wrong' },
      { version: 1, global: null },
      { version: 1, global: { shipping: { standardShippingFee: 'not-number' } } },
      { version: 1, global: { shipping: { standardShippingFee: 250 }, contact: { storeName: 'Calenvee' } }, pages: { home: { sections: [{ noId: true }] } } }
    ];

    for (const invalid of invalidPayloads) {
      const res = cmsStorage.validateSiteConfig(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors.length).toBeGreaterThan(0);
    }
  });

  it('creates snapshots and supports one-click rollback', () => {
    const baseline = JSON.parse(JSON.stringify(originalConfig));
    const snapshot = cmsStorage.createSnapshot(baseline, 'Baseline snapshot');
    expect(snapshot.snapshotId).toBeDefined();

    // Now alter published config
    const mutated = JSON.parse(JSON.stringify(baseline));
    mutated.global.contact.storeName = 'MUTATED STORE NAME';
    cmsStorage.writeJsonFileAtomic(cmsStorage.SITE_CONFIG_FILE, mutated);

    const currentMutated = cmsStorage.readJsonFile(cmsStorage.SITE_CONFIG_FILE);
    expect(currentMutated.global.contact.storeName).toBe('MUTATED STORE NAME');

    // Rollback to snapshot
    const rollbackResult = cmsStorage.rollbackSnapshot(snapshot.snapshotId);
    expect(rollbackResult.success).toBe(true);

    const restored = cmsStorage.readJsonFile(cmsStorage.SITE_CONFIG_FILE);
    expect(restored.global.contact.storeName).toBe(baseline.global.contact.storeName);
  });
});

