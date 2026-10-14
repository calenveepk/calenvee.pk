import { Product } from '../types/index';
import { PRODUCTS } from '../data/products';

// Canonical concept synonym dictionary for Pakistani e-commerce
const CONCEPT_SYNONYMS: Record<string, string[]> = {
  watch: [
    'watch', 'watches', 'timepiece', 'timepieces', 'chronograph', 'dial',
    'smartwatch', 'wrist', 'analog', 'quartz', 'strap', 'ghadi', 'ghari', 'clock'
  ],
  men: [
    'men', 'man', 'mens', 'male', 'gents', 'gentleman', 'boy', 'boys', 'mard'
  ],
  women: [
    'women', 'woman', 'womens', 'female', 'ladies', 'lady', 'girl', 'girls', 'aurat'
  ],
  sunglasses: [
    'sunglasses', 'sunglass', 'glasses', 'glass', 'shades', 'frames',
    'aviator', 'eyewear', 'cyber', 'screen', 'spectacles', 'chashma',
    'uv400', 'polarized', 'sun glasses', 'shaker'
  ],
  perfume: [
    'perfume', 'perfumes', 'fragrance', 'fragrances', 'scent', 'scents',
    'cologne', 'parfum', 'extrait', 'oud', 'attar', 'itr', 'khushbu',
    'body spray', 'eau de parfum'
  ],
  jewelry: [
    'jewelry', 'jewellery', 'chain', 'chains', 'necklace', 'necklaces',
    'pendant', 'pendants', 'bracelet', 'bracelets', 'ring', 'rings',
    'cuban', 'gold', 'silver', 'stainless steel', 'anti-tarnish',
    'waterproof', 'angothi', 'challa', 'kangan', 'locket'
  ],
  bag: [
    'bag', 'bags', 'handbag', 'handbags', 'tote', 'totes', 'crossbody',
    'backpack', 'messenger', 'purse', 'wallet', 'clutch', 'side bag',
    'shoulder bag', 'chest bag'
  ],
  tech: [
    'tech', 'technology', 'gadget', 'gadgets', 'smartwatch', 'magsafe',
    'cardholder', 'key organizer', 'strap', 'apple watch', 'loop',
    'electronics', 'edc'
  ],
  shoes: [
    'shoe', 'shoes', 'sneaker', 'sneakers', 'footwear', 'kicks', 'trainers'
  ]
};

// Common stopwords to ignore during multi-word search
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'in', 'of', 'with', 'to', 'at',
  'by', 'from', 'on', 'buy', 'online', 'pakistan', 'best', 'cheap', 'top',
  'new', 'calenvee', 'calenvee.pk', 'shop', 'store'
]);

/**
 * Basic Porter-style English stemmer for e-commerce terms
 * Handles plurals, singulars, and regular/irregular variations
 */
export function stemWord(rawWord: string): string {
  const w = rawWord.toLowerCase().trim();
  if (w.length <= 2) return w;

  // Irregular forms
  if (w === 'men' || w === 'mens') return 'man';
  if (w === 'women' || w === 'womens') return 'woman';
  if (w === 'glasses' || w === 'sunglasses') return 'sunglass';
  if (w === 'watches') return 'watch';
  if (w === 'feet') return 'foot';

  // Common suffix reductions
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('sses')) return w.slice(0, -2);
  if (w.endsWith('ches') || w.endsWith('shes') || w.endsWith('xes')) return w.slice(0, -2);
  if (w.endsWith('es') && w.length > 3) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 2) return w.slice(0, -1);
  if (w.endsWith('ing') && w.length > 4) return w.slice(0, -3);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);

  return w;
}

/**
 * Tokenize a search query into meaningful cleaned terms
 */
export function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 0 && !STOPWORDS.has(t));
}

/**
 * Find all matching concept keys for a given token
 */
function getMatchingConcepts(token: string): string[] {
  const stemmed = stemWord(token);
  const matchedConcepts: string[] = [];

  for (const [conceptKey, synonyms] of Object.entries(CONCEPT_SYNONYMS)) {
    if (
      conceptKey === token ||
      conceptKey === stemmed ||
      synonyms.some(s => s === token || s === stemmed || stemWord(s) === stemmed)
    ) {
      matchedConcepts.push(conceptKey);
    }
  }

  return matchedConcepts;
}

/**
 * Comprehensive Product Search Engine
 * Features:
 * - Stemming & pluralization (e.g., "watches" -> "watch")
 * - Concept & synonym expansion (e.g., "shades" -> sunglasses, "timepiece" -> watch)
 * - Multi-token combo matching (e.g., "man watches" boosts men's watches to the top)
 * - Rich keyword matching against title, category, tags, description, and seoKeywords
 * - Weighted relevance scoring
 */
export function searchProducts(
  rawQuery: string,
  productList: Product[] = PRODUCTS
): Product[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return productList;

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) {
    // If the query was purely a stopword or short symbol, fallback to substring match
    return productList.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.categoryLabel && p.categoryLabel.toLowerCase().includes(query))
    );
  }

  // Precompute tokens, stems, and concepts
  const stemmedTokens = tokens.map(stemWord);
  const tokenConcepts = tokens.map(getMatchingConcepts);

  const scoredProducts: { product: Product; score: number; tokensMatchedCount: number }[] = [];

  for (const product of productList) {
    let score = 0;
    let tokensMatchedCount = 0;

    const pName = product.name.toLowerCase();
    const pCat = product.category.toLowerCase();
    const pCatLabel = (product.categoryLabel || '').toLowerCase();
    const pSubcat = (product.subcategory || '').toLowerCase();
    const pTags = (product.tags || []).map(t => t.toLowerCase());
    const pKeywords = (product.seoKeywords || []).map(k => k.toLowerCase());
    const pGender = (product.gender || '').toLowerCase();
    const pShortDesc = (product.shortDescription || '').toLowerCase();
    const pDesc = (product.description || '').toLowerCase();

    // 1. Exact phrase match across full name
    if (pName.includes(query)) {
      score += 150;
    }

    // 2. Exact match in SEO keywords list
    if (pKeywords.includes(query)) {
      score += 100;
    }

    // 3. Category / Subcategory direct matches
    if (pCat === query || pCatLabel === query) {
      score += 80;
    }
    if (pSubcat === query) {
      score += 60;
    }

    // 4. Token-by-token evaluation
    tokens.forEach((token, index) => {
      const stemmed = stemmedTokens[index];
      const concepts = tokenConcepts[index];
      let tokenMatched = false;

      // Direct name match
      if (pName.includes(token) || pName.includes(stemmed)) {
        score += 50;
        tokenMatched = true;
      }

      // SEO keywords match
      if (pKeywords.some(k => k.includes(token) || k.includes(stemmed))) {
        score += 45;
        tokenMatched = true;
      }

      // Category / Subcategory match
      if (
        pCat.includes(token) || pCat.includes(stemmed) ||
        pCatLabel.includes(token) || pCatLabel.includes(stemmed) ||
        pSubcat.includes(token) || pSubcat.includes(stemmed)
      ) {
        score += 40;
        tokenMatched = true;
      }

      // Gender match (e.g. user typed "man" / "men" and product is gender: "men")
      if (
        (concepts.includes('men') && pGender === 'men') ||
        (concepts.includes('women') && pGender === 'women')
      ) {
        score += 50;
        tokenMatched = true;
      }

      // Concept / Synonym match
      for (const concept of concepts) {
        if (
          pCat === concept ||
          pCatLabel.toLowerCase().includes(concept) ||
          pSubcat.toLowerCase().includes(concept) ||
          pKeywords.some(k => k.includes(concept)) ||
          pTags.some(t => t.includes(concept)) ||
          pName.includes(concept)
        ) {
          score += 40;
          tokenMatched = true;
          break;
        }
      }

      // Tags match
      if (pTags.some(t => t.includes(token) || t.includes(stemmed))) {
        score += 25;
        tokenMatched = true;
      }

      // Description match
      if (pShortDesc.includes(token) || pDesc.includes(token) || pDesc.includes(stemmed)) {
        score += 15;
        tokenMatched = true;
      }

      if (tokenMatched) {
        tokensMatchedCount++;
      }
    });

    // 5. Multi-token synergy bonus:
    // If user searched for multiple words (e.g. "man watches" = 2 tokens),
    // and this product matched ALL of them, give a massive ranking bonus!
    if (tokens.length > 1 && tokensMatchedCount === tokens.length) {
      score += 120;
    } else if (tokens.length > 1 && tokensMatchedCount > 0) {
      // Partial match on multi-token query
      score += tokensMatchedCount * 20;
    }

    if (score > 0) {
      scoredProducts.push({ product, score, tokensMatchedCount });
    }
  }

  // Multi-token refinement: If user entered multiple words (e.g. "man watches"),
  // and there are products that match ALL concepts/tokens, strictly prioritize full matches!
  if (tokens.length > 1) {
    const fullMatches = scoredProducts.filter(sp => sp.tokensMatchedCount >= tokens.length);
    if (fullMatches.length > 0) {
      return fullMatches.sort((a, b) => b.score - a.score).map(sp => sp.product);
    }
  }

  // Sort descending by relevance score
  scoredProducts.sort((a, b) => b.score - a.score);

  return scoredProducts.map(sp => sp.product);
}

/**
 * Live search suggestions helper (for Navbar dropdown)
 */
export function getLiveSuggestions(query: string, limit: number = 5): Product[] {
  if (!query || query.trim().length === 0) return [];
  return searchProducts(query).slice(0, limit);
}
