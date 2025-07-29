/**
 * Custom Fuzzy Search Algorithm for Brand Names
 * Implements multiple string similarity algorithms for better brand matching
 */

/**
 * Calculate Levenshtein distance between two strings
 * This measures the minimum number of edits needed to transform one string into another
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,         // deletion
        matrix[i][j - 1] + 1,         // insertion
        matrix[i - 1][j - 1] + cost   // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate Jaro similarity
 * Good for detecting character transpositions
 */
function jaroSimilarity(str1, str2) {
  if (str1 === str2) return 1.0;
  
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0 || len2 === 0) return 0.0;
  
  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
  const str1Matches = new Array(len1).fill(false);
  const str2Matches = new Array(len2).fill(false);
  
  let matches = 0;
  
  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);
    
    for (let j = start; j < end; j++) {
      if (str2Matches[j] || str1[i] !== str2[j]) continue;
      str1Matches[i] = true;
      str2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0.0;
  
  // Find transpositions
  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!str1Matches[i]) continue;
    while (!str2Matches[k]) k++;
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }
  
  return (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3.0;
}

/**
 * Calculate Jaro-Winkler similarity with prefix bonus
 */
function jaroWinklerSimilarity(str1, str2) {
  const jaroSim = jaroSimilarity(str1, str2);
  
  if (jaroSim < 0.7) return jaroSim;
  
  // Common prefix length (up to 4 characters)
  let prefixLength = 0;
  const maxPrefix = Math.min(4, Math.min(str1.length, str2.length));
  
  for (let i = 0; i < maxPrefix; i++) {
    if (str1[i] === str2[i]) {
      prefixLength++;
    } else {
      break;
    }
  }
  
  return jaroSim + (prefixLength * 0.1 * (1 - jaroSim));
}

/**
 * Calculate substring match score
 * Gives bonus for partial matches and considers position
 */
function substringScore(searchTerm, target) {
  const searchLower = searchTerm.toLowerCase();
  const targetLower = target.toLowerCase();
  
  if (targetLower.includes(searchLower)) {
    // Position bonus (earlier matches score higher)
    const position = targetLower.indexOf(searchLower);
    const positionScore = 1 - (position / targetLower.length);
    
    // Length ratio bonus
    const lengthRatio = searchLower.length / targetLower.length;
    
    return (positionScore * 0.6 + lengthRatio * 0.4) * 0.9;
  }
  
  return 0;
}

/**
 * Main fuzzy matching function
 * Combines multiple algorithms for robust brand matching
 */
export function calculateBrandSimilarity(searchTerm, brandName, options = {}) {
  const {
    caseSensitive = false,
    minLength = 2,
    jaroWeight = 0.4,
    levenshteinWeight = 0.3,
    substringWeight = 0.3
  } = options;
  
  // Normalize strings
  const search = caseSensitive ? searchTerm.trim() : searchTerm.toLowerCase().trim();
  const brand = caseSensitive ? brandName.trim() : brandName.toLowerCase().trim();
  
  // Basic validations
  if (search.length < minLength || !brand || brand.length === 0) {
    return 0;
  }
  
  // Exact match
  if (search === brand) return 1.0;
  
  let totalScore = 0;
  let weightSum = 0;
  
  // Jaro-Winkler similarity (handles typos and transpositions well)
  const jaroScore = jaroWinklerSimilarity(search, brand);
  totalScore += jaroScore * jaroWeight;
  weightSum += jaroWeight;
  
  // Levenshtein-based similarity (handles character substitutions)
  const maxLen = Math.max(search.length, brand.length);
  const levDistance = levenshteinDistance(search, brand);
  const levScore = Math.max(0, 1 - (levDistance / maxLen));
  totalScore += levScore * levenshteinWeight;
  weightSum += levenshteinWeight;
  
  // Substring matching (handles partial brand names)
  const subScore = substringScore(search, brand);
  totalScore += subScore * substringWeight;
  weightSum += substringWeight;
  
  return weightSum > 0 ? totalScore / weightSum : 0;
}

/**
 * Search brands with fuzzy matching
 * Returns ranked results based on similarity scores
 */
export function fuzzyBrandSearch(products, searchTerm, options = {}) {
  const {
    threshold = 0.3,
    limit = null,
    includeScore = true
  } = options;
  
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }
  
  const results = [];
  
  for (const product of products) {
    // Skip products without brands
    if (!product.brand || product.brand.trim().length === 0) {
      continue;
    }
    
    const score = calculateBrandSimilarity(searchTerm, product.brand);
    
    if (score >= threshold) {
      const result = {
        ...product,
        searchScore: Math.round(score * 100), // Convert to percentage
        fuzzyMatch: true
      };
      
      if (!includeScore) {
        delete result.searchScore;
        delete result.fuzzyMatch;
      }
      
      results.push(result);
    }
  }
  
  // Sort by score (highest first)
  results.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));
  
  // Apply limit if specified
  if (limit && limit > 0) {
    return results.slice(0, limit);
  }
  
  return results;
}

/**
 * Get unique brand suggestions based on fuzzy matching
 * Useful for autocomplete functionality
 */
export function getBrandSuggestions(products, searchTerm, options = {}) {
  const { threshold = 0.3, limit = 10 } = options;
  
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }
  
  const brandScores = new Map();
  
  for (const product of products) {
    if (!product.brand || product.brand.trim().length === 0) {
      continue;
    }
    
    const brand = product.brand;
    const score = calculateBrandSimilarity(searchTerm, brand);
    
    if (score >= threshold) {
      // Keep only the highest score for each brand
      if (!brandScores.has(brand) || brandScores.get(brand) < score) {
        brandScores.set(brand, score);
      }
    }
  }
  
  // Convert to array and sort
  const suggestions = Array.from(brandScores.entries())
    .map(([brand, score]) => ({ brand, score: Math.round(score * 100) }))
    .sort((a, b) => b.score - a.score);
  
  return limit ? suggestions.slice(0, limit) : suggestions;
}

// Export default object for easier importing
export default {
  calculateBrandSimilarity,
  fuzzyBrandSearch,
  getBrandSuggestions
};
