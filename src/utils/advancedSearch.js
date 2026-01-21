// Sistema de búsqueda avanzada con filtros y ranking

class AdvancedSearch {
  // Búsqueda de usuarios con ranking
  searchUsers(query, users, options = {}) {
    if (!query || !users) return [];

    const {
      includeEmail = true,
      includeBio = true,
      includeLocation = true,
      minScore = 0.3
    } = options;

    const results = users.map(user => {
      let score = 0;
      const lowerQuery = query.toLowerCase();

      // Búsqueda en nombre (peso mayor)
      if (user.name && user.name.toLowerCase().includes(lowerQuery)) {
        score += 1.0;
        if (user.name.toLowerCase().startsWith(lowerQuery)) {
          score += 0.5; // Bonus por coincidencia al inicio
        }
      }

      // Búsqueda en email
      if (includeEmail && user.email && user.email.toLowerCase().includes(lowerQuery)) {
        score += 0.7;
      }

      // Búsqueda en biografía
      if (includeBio && user.bio && user.bio.toLowerCase().includes(lowerQuery)) {
        score += 0.5;
      }

      // Búsqueda en ubicación
      if (includeLocation && user.location && user.location.toLowerCase().includes(lowerQuery)) {
        score += 0.6;
      }

      return { user, score };
    })
    .filter(result => result.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .map(result => result.user);

    return results;
  }

  // Búsqueda de posts con filtros
  searchPosts(query, posts, filters = {}) {
    if (!posts) return [];

    let results = [...posts];

    // Filtro por texto
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(post => {
        const contentMatch = post.content && post.content.toLowerCase().includes(lowerQuery);
        const authorMatch = post.author && post.author.toLowerCase().includes(lowerQuery);
        const hashtagMatch = post.hashtags && post.hashtags.some(tag => 
          tag.toLowerCase().includes(lowerQuery)
        );
        return contentMatch || authorMatch || hashtagMatch;
      });
    }

    // Filtro por fecha
    if (filters.dateFrom || filters.dateTo) {
      results = results.filter(post => {
        const postDate = new Date(post.timestamp || Date.now());
        if (filters.dateFrom && postDate < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && postDate > new Date(filters.dateTo)) return false;
        return true;
      });
    }

    // Filtro por autor
    if (filters.author) {
      results = results.filter(post => 
        post.author && post.author.toLowerCase().includes(filters.author.toLowerCase())
      );
    }

    // Filtro por tiene imagen
    if (filters.hasImage !== undefined) {
      results = results.filter(post => 
        filters.hasImage ? post.image : !post.image
      );
    }

    // Filtro por hashtags
    if (filters.hashtags && filters.hashtags.length > 0) {
      results = results.filter(post => 
        post.hashtags && filters.hashtags.some(tag => 
          post.hashtags.includes(tag)
        )
      );
    }

    // Ordenamiento
    if (filters.sortBy) {
      results = this.sortPosts(results, filters.sortBy, filters.sortOrder);
    }

    return results;
  }

  // Ordenar posts
  sortPosts(posts, sortBy, order = 'desc') {
    const sorted = [...posts].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = (b.timestamp || 0) - (a.timestamp || 0);
          break;
        case 'likes':
          comparison = (b.likes || 0) - (a.likes || 0);
          break;
        case 'comments':
          comparison = (b.comments || 0) - (a.comments || 0);
          break;
        case 'shares':
          comparison = (b.shares || 0) - (a.shares || 0);
          break;
        case 'relevance':
          comparison = this.calculateRelevance(b) - this.calculateRelevance(a);
          break;
        default:
          comparison = 0;
      }

      return order === 'asc' ? -comparison : comparison;
    });

    return sorted;
  }

  // Calcular relevancia de un post
  calculateRelevance(post) {
    const likes = post.likes || 0;
    const comments = post.comments || 0;
    const shares = post.shares || 0;
    const age = Date.now() - (post.timestamp || Date.now());
    const ageInHours = age / (1000 * 60 * 60);

    // Fórmula de relevancia (similar a Reddit/HackerNews)
    const score = (likes + comments * 2 + shares * 3) / Math.pow(ageInHours + 2, 1.5);
    return score;
  }

  // Búsqueda de eventos
  searchEvents(query, events, filters = {}) {
    if (!events) return [];

    let results = [...events];

    // Filtro por texto
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(event => {
        const titleMatch = event.title && event.title.toLowerCase().includes(lowerQuery);
        const descMatch = event.description && event.description.toLowerCase().includes(lowerQuery);
        const locationMatch = event.location && event.location.toLowerCase().includes(lowerQuery);
        return titleMatch || descMatch || locationMatch;
      });
    }

    // Filtro por fecha
    if (filters.upcoming) {
      const now = new Date();
      results = results.filter(event => new Date(event.date) >= now);
    }

    // Filtro por categoría
    if (filters.category) {
      results = results.filter(event => event.category === filters.category);
    }

    return results;
  }

  // Búsqueda de grupos
  searchGroups(query, groups, filters = {}) {
    if (!groups) return [];

    let results = [...groups];

    // Filtro por texto
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(group => {
        const nameMatch = group.name && group.name.toLowerCase().includes(lowerQuery);
        const descMatch = group.description && group.description.toLowerCase().includes(lowerQuery);
        return nameMatch || descMatch;
      });
    }

    // Filtro por privacidad
    if (filters.privacy) {
      results = results.filter(group => group.privacy === filters.privacy);
    }

    // Filtro por miembro
    if (filters.isMember !== undefined) {
      results = results.filter(group => 
        filters.isMember ? group.isMember : !group.isMember
      );
    }

    return results;
  }

  // Sugerencias de búsqueda (autocompletado)
  getSuggestions(query, data, type = 'users') {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    const suggestions = [];

    switch (type) {
      case 'users':
        data.forEach(user => {
          if (user.name && user.name.toLowerCase().includes(lowerQuery)) {
            suggestions.push({
              type: 'user',
              text: user.name,
              subtitle: user.email,
              data: user
            });
          }
        });
        break;

      case 'hashtags':
        const hashtags = new Set();
        data.forEach(post => {
          if (post.hashtags) {
            post.hashtags.forEach(tag => {
              if (tag.toLowerCase().includes(lowerQuery)) {
                hashtags.add(tag);
              }
            });
          }
        });
        hashtags.forEach(tag => {
          suggestions.push({
            type: 'hashtag',
            text: tag,
            subtitle: 'Hashtag'
          });
        });
        break;

      case 'all':
        // Combinar todos los tipos
        suggestions.push(...this.getSuggestions(query, data.users, 'users'));
        suggestions.push(...this.getSuggestions(query, data.posts, 'hashtags'));
        break;
    }

    return suggestions.slice(0, 10); // Limitar a 10 sugerencias
  }

  // Búsqueda fuzzy (tolerante a errores de tipeo)
  fuzzySearch(query, items, key) {
    if (!query || !items) return [];

    const lowerQuery = query.toLowerCase();
    
    return items.filter(item => {
      const value = key ? item[key] : item;
      if (!value) return false;

      const lowerValue = value.toLowerCase();
      
      // Coincidencia exacta
      if (lowerValue.includes(lowerQuery)) return true;

      // Coincidencia fuzzy (permite 1-2 caracteres de diferencia)
      return this.levenshteinDistance(lowerQuery, lowerValue) <= 2;
    });
  }

  // Calcular distancia de Levenshtein (similitud entre strings)
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}

const advancedSearch = new AdvancedSearch();
export default advancedSearch;
