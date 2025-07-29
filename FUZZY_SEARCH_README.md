# Fuzzy Brand Search Implementation

This document explains the custom fuzzy search algorithm implemented for brand matching in the eBuy backend.

## Overview

The fuzzy search algorithm allows users to find products even when they make typos, use partial brand names, or similar-sounding brand names. It combines multiple string similarity algorithms for robust brand matching.

## Files Added/Modified

### New Files:
- `utils/fuzzySearch.js` - Custom fuzzy search algorithm implementation
- `test/fuzzySearchTest.js` - Unit tests for the fuzzy search algorithm
- `test/apiTest.js` - API integration tests

### Modified Files:
- `controllers/productController.js` - Added support for `brand_search` and `fuzzy` parameters
- `db/query/Productquery.js` - Integrated fuzzy search logic into product queries

## API Usage

### Frontend Parameters

Your frontend can now send these parameters to `/api/products`:

```javascript
// Enable fuzzy brand search
const queryParams = new URLSearchParams();
queryParams.append('brand_search', 'Samsung'); // Brand to search for
queryParams.append('fuzzy', 'true');          // Enable fuzzy matching
queryParams.append('limit', '20');            // Results limit

const response = await fetch(`/api/products?${queryParams.toString()}`);
```

### Response Format

The API returns products with additional fuzzy search metadata:

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "title": "Galaxy S23",
        "brand": "Samsung",
        "price": 50000,
        "searchScore": 100,
        "fuzzyMatch": true,
        // ... other product fields
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "hasMore": false
    }
  }
}
```

## Algorithm Details

### String Similarity Algorithms Used

1. **Levenshtein Distance**: Measures character edits needed (insertions, deletions, substitutions)
2. **Jaro-Winkler Similarity**: Good for detecting transpositions and gives bonus for common prefixes
3. **Substring Matching**: Handles partial brand names and gives position-based scoring

### Scoring System

- **Score Range**: 0-100% (where 100% is exact match)
- **Default Threshold**: 25% (adjustable)
- **Exact matches**: Always score 100%
- **Case insensitive**: "apple" matches "Apple"
- **Typo tolerance**: "Samung" matches "Samsung" with ~64% score
- **Partial matches**: "Sam" matches "Samsung" with ~68% score

### Configuration Options

```javascript
const options = {
  threshold: 0.25,        // Minimum score to include (0-1)
  limit: null,            // Maximum results (null = no limit)
  includeScore: true,     // Include search score in results
  caseSensitive: false,   // Case sensitivity
  minLength: 2            // Minimum search term length
};
```

## Testing

### Run Unit Tests
```bash
npm run test:fuzzy
# or
node test/fuzzySearchTest.js
```

### Run API Tests
```bash
# Start the server first
npm start

# In another terminal
node test/apiTest.js
```

## Examples

### Exact Match
```
Search: "Samsung" → Samsung (100%)
```

### Typo Correction
```
Search: "Samung" → Samsung (64%), Asus (36%), Sony (34%)
```

### Partial Match
```
Search: "Sam" → Samsung (68%), Xiaomi (37%)
```

### Case Insensitive
```
Search: "apple" → Apple (100%)
```

### Similar Sounding
```
Search: "Adidaz" → Adidas (62%)
```

## Performance Considerations

- **Database Query**: First queries with regular filters (category, price, etc.)
- **Memory Processing**: Applies fuzzy matching to filtered results in memory
- **Pagination**: Applied after fuzzy scoring for accurate results
- **Scalability**: Suitable for moderate product catalogs (tested with 1000+ products)

## Future Enhancements

1. **Caching**: Add Redis caching for popular brand searches
2. **Indexing**: Implement n-gram indexing for faster fuzzy matching
3. **Machine Learning**: Use ML models for brand name normalization
4. **Analytics**: Track search patterns and improve algorithm
5. **Autocomplete**: Implement brand suggestion API endpoint

## Troubleshooting

### No Results Returned
- Check if `fuzzy=true` parameter is sent correctly
- Verify search term is at least 2 characters
- Lower the threshold in `fuzzyBrandSearch` options

### Poor Match Quality
- Adjust algorithm weights in `calculateBrandSimilarity`
- Tune the threshold value (default: 0.25)
- Check if products have proper brand names in database

### Performance Issues
- Reduce the number of products queried before fuzzy matching
- Implement pagination at database level for large datasets
- Consider caching frequently searched terms

## Debug Mode

Enable detailed logging by checking the console output when making requests:

```
🔍 Fuzzy brand search requested for: "Samsung"
📦 Found 150 total products to search through
✨ Fuzzy search found 5 matching products
🏆 Top matches: ['Samsung (100%)', 'Asus (40%)', 'Sony (34%)']
📄 Paginated to 5 products (offset: 0, limit: 20)
```
