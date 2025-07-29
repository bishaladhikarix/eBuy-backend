import { fuzzyBrandSearch, calculateBrandSimilarity, getBrandSuggestions } from '../utils/fuzzySearch.js';

console.log('=== Testing Custom Fuzzy Brand Search ===\n');

// Test data mimicking your product structure
const testProducts = [
  { id: 1, brand: 'Samsung', title: 'Galaxy S23', price: 50000 },
  { id: 2, brand: 'Apple', title: 'iPhone 15', price: 80000 },
  { id: 3, brand: 'Nike', title: 'Air Max 270', price: 12000 },
  { id: 4, brand: 'Adidas', title: 'Ultraboost 22', price: 15000 },
  { id: 5, brand: 'Sony', title: 'PlayStation 5', price: 60000 },
  { id: 6, brand: 'Microsoft', title: 'Xbox Series X', price: 55000 },
  { id: 7, brand: 'OnePlus', title: 'OnePlus 11', price: 45000 },
  { id: 8, brand: 'Xiaomi', title: 'Mi 13 Pro', price: 35000 },
  { id: 9, brand: 'Asus', title: 'ROG Strix', price: 70000 },
  { id: 10, brand: 'Dell', title: 'XPS 13', price: 75000 }
];

// Test 1: Exact match
console.log('1. Exact match - "Samsung":');
const exactResults = fuzzyBrandSearch(testProducts, 'Samsung');
console.log(exactResults.map(p => `${p.brand} (${p.searchScore}%)`));
console.log();

// Test 2: Typo correction
console.log('2. Typo correction - "Samung":');
const typoResults = fuzzyBrandSearch(testProducts, 'Samung');
console.log(typoResults.map(p => `${p.brand} (${p.searchScore}%)`));
console.log();

// Test 3: Partial match
console.log('3. Partial match - "Sam":');
const partialResults = fuzzyBrandSearch(testProducts, 'Sam');
console.log(partialResults.map(p => `${p.brand} (${p.searchScore}%)`));
console.log();

// Test 4: Case insensitive
console.log('4. Case insensitive - "apple":');
const caseResults = fuzzyBrandSearch(testProducts, 'apple');
console.log(caseResults.map(p => `${p.brand} (${p.searchScore}%)`));
console.log();

// Test 5: Similar brand
console.log('5. Similar brand - "Adidaz":');
const similarResults = fuzzyBrandSearch(testProducts, 'Adidaz');
console.log(similarResults.map(p => `${p.brand} (${p.searchScore}%)`));
console.log();

// Test 6: Brand suggestions
console.log('6. Brand suggestions for "Mi":');
const suggestions = getBrandSuggestions(testProducts, 'Mi');
console.log(suggestions);
console.log();

// Test 7: Individual similarity scores
console.log('7. Individual similarity calculations:');
console.log(`"Samsung" vs "Samsung": ${Math.round(calculateBrandSimilarity('Samsung', 'Samsung') * 100)}%`);
console.log(`"Samsung" vs "Samung": ${Math.round(calculateBrandSimilarity('Samsung', 'Samung') * 100)}%`);
console.log(`"Sam" vs "Samsung": ${Math.round(calculateBrandSimilarity('Sam', 'Samsung') * 100)}%`);
console.log(`"Apple" vs "apple": ${Math.round(calculateBrandSimilarity('Apple', 'apple') * 100)}%`);
console.log(`"Nike" vs "Mike": ${Math.round(calculateBrandSimilarity('Nike', 'Mike') * 100)}%`);

console.log('\n=== Test Complete ===');
