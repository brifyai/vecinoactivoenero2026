// Servicio centralizado para manejar localStorage
// Proporciona persistencia de datos en el navegador

const STORAGE_KEYS = {
  POSTS: 'friendbook_posts',
  USERS: 'friendbook_users',
  FRIENDS: 'friendbook_friends',
  FRIEND_REQUESTS: 'friendbook_friend_requests',
  COMMENTS: 'friendbook_comments',
  REACTIONS: 'friendbook_reactions',
  NOTIFICATIONS: 'friendbook_notifications',
  MESSAGES: 'friendbook_messages',
  CURRENT_USER: 'friendbook_current_user',
  PAGES: 'friendbook_pages',
  LIKED_PAGES: 'friendbook_liked_pages',
  EVENTS: 'friendbook_events',
  GROUPS: 'friendbook_groups',
  FAVORITES: 'friendbook_favorites',
  SEARCH_HISTORY: 'friendbook_search_history',
  // Neighborhood connection keys
  NEIGHBORHOODS: 'vecino_neighborhoods',
  CONNECTIONS: 'vecino_connections',
  LOCAL_NEEDS: 'vecino_local_needs',
  COMMUNITY_ACTIONS: 'vecino_community_actions',
  // Messaging and moderation keys
  DIRECT_MESSAGES: 'vecino_direct_messages',
  REPORTS: 'vecino_reports',
  MODERATORS: 'vecino_moderators',
};

class StorageService {
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
      return false;
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  }

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  // Posts
  getPosts() {
    return this.get(STORAGE_KEYS.POSTS) || [];
  }

  savePosts(posts) {
    return this.set(STORAGE_KEYS.POSTS, posts);
  }

  addPost(post) {
    const posts = this.getPosts();
    posts.unshift(post);
    return this.savePosts(posts);
  }

  updatePost(postId, updates) {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...updates };
      return this.savePosts(posts);
    }
    return false;
  }

  deletePost(postId) {
    const posts = this.getPosts();
    const filtered = posts.filter(p => p.id !== postId);
    return this.savePosts(filtered);
  }

  // Users
  getUsers() {
    return this.get(STORAGE_KEYS.USERS) || [];
  }

  saveUsers(users) {
    return this.set(STORAGE_KEYS.USERS, users);
  }

  addUser(user) {
    const users = this.getUsers();
    users.push(user);
    return this.saveUsers(users);
  }

  getUserByEmail(email) {
    const users = this.getUsers();
    return users.find(u => u.email === email);
  }

  updateUser(userId, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.saveUsers(users);
      
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        this.setCurrentUser({ ...currentUser, ...updates });
      }
      return true;
    }
    return false;
  }

  // Current User
  getCurrentUser() {
    return this.get(STORAGE_KEYS.CURRENT_USER);
  }

  setCurrentUser(user) {
    return this.set(STORAGE_KEYS.CURRENT_USER, user);
  }

  clearCurrentUser() {
    return this.remove(STORAGE_KEYS.CURRENT_USER);
  }

  // Friends
  getFriends(userId) {
    const allFriends = this.get(STORAGE_KEYS.FRIENDS) || {};
    return allFriends[userId] || [];
  }

  addFriend(userId, friendId) {
    const allFriends = this.get(STORAGE_KEYS.FRIENDS) || {};
    if (!allFriends[userId]) allFriends[userId] = [];
    if (!allFriends[userId].includes(friendId)) {
      allFriends[userId].push(friendId);
    }
    if (!allFriends[friendId]) allFriends[friendId] = [];
    if (!allFriends[friendId].includes(userId)) {
      allFriends[friendId].push(userId);
    }
    return this.set(STORAGE_KEYS.FRIENDS, allFriends);
  }

  removeFriend(userId, friendId) {
    const allFriends = this.get(STORAGE_KEYS.FRIENDS) || {};
    if (allFriends[userId]) {
      allFriends[userId] = allFriends[userId].filter(id => id !== friendId);
    }
    if (allFriends[friendId]) {
      allFriends[friendId] = allFriends[friendId].filter(id => id !== userId);
    }
    return this.set(STORAGE_KEYS.FRIENDS, allFriends);
  }

  isFriend(userId, friendId) {
    const friends = this.getFriends(userId);
    return friends.includes(friendId);
  }

  // Friend Requests
  getFriendRequests(userId) {
    const allRequests = this.get(STORAGE_KEYS.FRIEND_REQUESTS) || {};
    return allRequests[userId] || [];
  }

  sendFriendRequest(fromUserId, toUserId) {
    const allRequests = this.get(STORAGE_KEYS.FRIEND_REQUESTS) || {};
    if (!allRequests[toUserId]) allRequests[toUserId] = [];
    
    const request = {
      id: Date.now(),
      from: fromUserId,
      to: toUserId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    allRequests[toUserId].push(request);
    return this.set(STORAGE_KEYS.FRIEND_REQUESTS, allRequests);
  }

  acceptFriendRequest(userId, requestId) {
    const allRequests = this.get(STORAGE_KEYS.FRIEND_REQUESTS) || {};
    const userRequests = allRequests[userId] || [];
    const request = userRequests.find(r => r.id === requestId);
    
    if (request) {
      this.addFriend(userId, request.from);
      allRequests[userId] = userRequests.filter(r => r.id !== requestId);
      this.set(STORAGE_KEYS.FRIEND_REQUESTS, allRequests);
      return true;
    }
    return false;
  }

  rejectFriendRequest(userId, requestId) {
    const allRequests = this.get(STORAGE_KEYS.FRIEND_REQUESTS) || {};
    const userRequests = allRequests[userId] || [];
    allRequests[userId] = userRequests.filter(r => r.id !== requestId);
    return this.set(STORAGE_KEYS.FRIEND_REQUESTS, allRequests);
  }

  // Comments
  getComments(postId) {
    const allComments = this.get(STORAGE_KEYS.COMMENTS) || {};
    return allComments[postId] || [];
  }

  addComment(postId, comment) {
    const allComments = this.get(STORAGE_KEYS.COMMENTS) || {};
    if (!allComments[postId]) allComments[postId] = [];
    allComments[postId].push(comment);
    return this.set(STORAGE_KEYS.COMMENTS, allComments);
  }

  deleteComment(postId, commentId) {
    const allComments = this.get(STORAGE_KEYS.COMMENTS) || {};
    if (allComments[postId]) {
      allComments[postId] = allComments[postId].filter(c => c.id !== commentId);
      return this.set(STORAGE_KEYS.COMMENTS, allComments);
    }
    return false;
  }

  // Reactions
  getReactions(postId) {
    const allReactions = this.get(STORAGE_KEYS.REACTIONS) || {};
    return allReactions[postId] || [];
  }

  addReaction(postId, reaction) {
    const allReactions = this.get(STORAGE_KEYS.REACTIONS) || {};
    if (!allReactions[postId]) allReactions[postId] = [];
    
    allReactions[postId] = allReactions[postId].filter(r => r.userId !== reaction.userId);
    allReactions[postId].push(reaction);
    
    return this.set(STORAGE_KEYS.REACTIONS, allReactions);
  }

  removeReaction(postId, userId) {
    const allReactions = this.get(STORAGE_KEYS.REACTIONS) || {};
    if (allReactions[postId]) {
      allReactions[postId] = allReactions[postId].filter(r => r.userId !== userId);
      return this.set(STORAGE_KEYS.REACTIONS, allReactions);
    }
    return false;
  }

  // Notifications
  getNotifications(userId) {
    const allNotifications = this.get(STORAGE_KEYS.NOTIFICATIONS) || {};
    return allNotifications[userId] || [];
  }

  addNotification(userId, notification) {
    const allNotifications = this.get(STORAGE_KEYS.NOTIFICATIONS) || {};
    if (!allNotifications[userId]) allNotifications[userId] = [];
    allNotifications[userId].unshift(notification);
    return this.set(STORAGE_KEYS.NOTIFICATIONS, allNotifications);
  }

  markNotificationAsRead(userId, notificationId) {
    const allNotifications = this.get(STORAGE_KEYS.NOTIFICATIONS) || {};
    if (allNotifications[userId]) {
      const notification = allNotifications[userId].find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        return this.set(STORAGE_KEYS.NOTIFICATIONS, allNotifications);
      }
    }
    return false;
  }

  markAllNotificationsAsRead(userId) {
    const allNotifications = this.get(STORAGE_KEYS.NOTIFICATIONS) || {};
    if (allNotifications[userId]) {
      allNotifications[userId].forEach(n => n.read = true);
      return this.set(STORAGE_KEYS.NOTIFICATIONS, allNotifications);
    }
    return false;
  }

  // Favorites
  getFavorites(userId) {
    const allFavorites = this.get(STORAGE_KEYS.FAVORITES) || {};
    return allFavorites[userId] || [];
  }

  addFavorite(userId, item) {
    const allFavorites = this.get(STORAGE_KEYS.FAVORITES) || {};
    if (!allFavorites[userId]) allFavorites[userId] = [];
    allFavorites[userId].unshift(item);
    return this.set(STORAGE_KEYS.FAVORITES, allFavorites);
  }

  removeFavorite(userId, itemId) {
    const allFavorites = this.get(STORAGE_KEYS.FAVORITES) || {};
    if (allFavorites[userId]) {
      allFavorites[userId] = allFavorites[userId].filter(f => f.id !== itemId);
      return this.set(STORAGE_KEYS.FAVORITES, allFavorites);
    }
    return false;
  }

  isFavorite(userId, itemId) {
    const favorites = this.getFavorites(userId);
    return favorites.some(f => f.id === itemId);
  }

  // Search History
  getSearchHistory(userId) {
    const allHistory = this.get(STORAGE_KEYS.SEARCH_HISTORY) || {};
    return allHistory[userId] || [];
  }

  addSearchHistory(userId, searchTerm) {
    const allHistory = this.get(STORAGE_KEYS.SEARCH_HISTORY) || {};
    if (!allHistory[userId]) allHistory[userId] = [];
    
    allHistory[userId] = allHistory[userId].filter(s => s !== searchTerm);
    allHistory[userId].unshift(searchTerm);
    
    if (allHistory[userId].length > 10) {
      allHistory[userId] = allHistory[userId].slice(0, 10);
    }
    
    return this.set(STORAGE_KEYS.SEARCH_HISTORY, allHistory);
  }

  clearSearchHistory(userId) {
    const allHistory = this.get(STORAGE_KEYS.SEARCH_HISTORY) || {};
    allHistory[userId] = [];
    return this.set(STORAGE_KEYS.SEARCH_HISTORY, allHistory);
  }

  // Pages
  getPages() {
    return this.get(STORAGE_KEYS.PAGES) || [];
  }

  savePages(pages) {
    return this.set(STORAGE_KEYS.PAGES, pages);
  }

  // Liked Pages
  getLikedPages(userId) {
    const allLikedPages = this.get(STORAGE_KEYS.LIKED_PAGES) || {};
    return allLikedPages[userId] || [];
  }

  likePage(userId, pageId) {
    const allLikedPages = this.get(STORAGE_KEYS.LIKED_PAGES) || {};
    if (!allLikedPages[userId]) allLikedPages[userId] = [];
    if (!allLikedPages[userId].includes(pageId)) {
      allLikedPages[userId].push(pageId);
      return this.set(STORAGE_KEYS.LIKED_PAGES, allLikedPages);
    }
    return false;
  }

  unlikePage(userId, pageId) {
    const allLikedPages = this.get(STORAGE_KEYS.LIKED_PAGES) || {};
    if (allLikedPages[userId]) {
      allLikedPages[userId] = allLikedPages[userId].filter(id => id !== pageId);
      return this.set(STORAGE_KEYS.LIKED_PAGES, allLikedPages);
    }
    return false;
  }

  // Groups
  getGroups() {
    return this.get(STORAGE_KEYS.GROUPS) || [];
  }

  saveGroups(groups) {
    return this.set(STORAGE_KEYS.GROUPS, groups);
  }

  // Neighborhoods
  getNeighborhoods() {
    return this.get(STORAGE_KEYS.NEIGHBORHOODS) || [];
  }

  saveNeighborhoods(neighborhoods) {
    return this.set(STORAGE_KEYS.NEIGHBORHOODS, neighborhoods);
  }

  // Connections
  getConnections() {
    return this.get(STORAGE_KEYS.CONNECTIONS) || [];
  }

  saveConnections(connections) {
    return this.set(STORAGE_KEYS.CONNECTIONS, connections);
  }

  // Local Needs
  getLocalNeeds() {
    return this.get(STORAGE_KEYS.LOCAL_NEEDS) || [];
  }

  saveLocalNeeds(needs) {
    return this.set(STORAGE_KEYS.LOCAL_NEEDS, needs);
  }

  // Community Actions
  getCommunityActions() {
    return this.get(STORAGE_KEYS.COMMUNITY_ACTIONS) || [];
  }

  saveCommunityActions(actions) {
    return this.set(STORAGE_KEYS.COMMUNITY_ACTIONS, actions);
  }

  // Direct Messages
  getMessages() {
    return this.get(STORAGE_KEYS.DIRECT_MESSAGES) || [];
  }

  saveMessages(messages) {
    return this.set(STORAGE_KEYS.DIRECT_MESSAGES, messages);
  }

  // Reports
  getReports() {
    return this.get(STORAGE_KEYS.REPORTS) || [];
  }

  saveReports(reports) {
    return this.set(STORAGE_KEYS.REPORTS, reports);
  }

  // Moderators
  getModerators() {
    return this.get(STORAGE_KEYS.MODERATORS) || [];
  }

  saveModerators(moderators) {
    return this.set(STORAGE_KEYS.MODERATORS, moderators);
  }

  // Get user by ID
  getUser(userId) {
    const users = this.getUsers();
    return users.find(u => u.id === userId);
  }

  // Inicializar datos de ejemplo
  initializeMockData() {
    // Migrar páginas existentes para agregar slugs
    const existingPages = this.getPages();
    if (existingPages.length > 0 && !existingPages[0].slug) {
      const updatedPages = existingPages.map(page => ({
        ...page,
        slug: page.slug || page.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        image: page.image || page.avatar
      }));
      this.savePages(updatedPages);
    }

    // Migrar grupos existentes para agregar slugs
    const existingGroups = this.getGroups();
    if (existingGroups.length > 0 && !existingGroups[0].slug) {
      const updatedGroups = existingGroups.map(group => ({
        ...group,
        slug: group.slug || group.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        image: group.image || group.avatar
      }));
      this.saveGroups(updatedGroups);
    }

    // Solo inicializar grupos y páginas si no existen
    if (this.getPages().length === 0) {
      const mockPages = [
        { id: 1, name: 'Diseño Gráfico', slug: 'diseno-grafico', category: 'Arte y Diseño', likes: 23, avatar: 'https://i.pravatar.cc/150?img=30', image: 'https://i.pravatar.cc/150?img=30', cover: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=400&fit=crop', description: 'Comunidad de diseñadores gráficos', location: 'Santiago, Chile', website: 'disenografico.cl', verified: false },
        { id: 2, name: 'Diseñador Web', slug: 'disenador-web', category: 'Tecnología', likes: 18, avatar: 'https://i.pravatar.cc/150?img=31', image: 'https://i.pravatar.cc/150?img=31', cover: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=1200&h=400&fit=crop', description: 'Diseño y desarrollo web profesional', location: 'Santiago, Chile', website: 'disenadorweb.cl', verified: false },
        { id: 3, name: 'Desarrollador Web', slug: 'desarrollador-web', category: 'Tecnología', likes: 31, avatar: 'https://i.pravatar.cc/150?img=32', image: 'https://i.pravatar.cc/150?img=32', cover: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=400&fit=crop', description: 'Comunidad de desarrolladores web', location: 'Santiago, Chile', website: 'desarrolladorweb.cl', verified: true },
        { id: 4, name: 'Experto SEO', slug: 'experto-seo', category: 'Marketing Digital', likes: 15, avatar: 'https://i.pravatar.cc/150?img=33', image: 'https://i.pravatar.cc/150?img=33', cover: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=1200&h=400&fit=crop', description: 'Optimización para motores de búsqueda', location: 'Santiago, Chile', website: 'expertoseo.cl', verified: false },
        { id: 5, name: 'Diseñador UI/UX', slug: 'disenador-ui-ux', category: 'Diseño', likes: 27, avatar: 'https://i.pravatar.cc/150?img=34', image: 'https://i.pravatar.cc/150?img=34', cover: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200&h=400&fit=crop', description: 'Diseño de interfaces y experiencia de usuario', location: 'Santiago, Chile', website: 'uiuxdesign.cl', verified: false },
        { id: 6, name: 'Fotografía Profesional', slug: 'fotografia-profesional', category: 'Arte', likes: 42, avatar: 'https://i.pravatar.cc/150?img=35', image: 'https://i.pravatar.cc/150?img=35', cover: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=400&fit=crop', description: 'Compartiendo momentos únicos', location: 'Santiago, Chile', website: 'fotoprof.cl', verified: true },
        { id: 7, name: 'Marketing Digital', slug: 'marketing-digital', category: 'Marketing', likes: 36, avatar: 'https://i.pravatar.cc/150?img=36', image: 'https://i.pravatar.cc/150?img=36', cover: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop', description: 'Estrategias de marketing online', location: 'Santiago, Chile', website: 'marketingdigital.cl', verified: false },
        { id: 8, name: 'Desarrollo Móvil', slug: 'desarrollo-movil', category: 'Tecnología', likes: 19, avatar: 'https://i.pravatar.cc/150?img=37', image: 'https://i.pravatar.cc/150?img=37', cover: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=400&fit=crop', description: 'Apps para iOS y Android', location: 'Santiago, Chile', website: 'desarrollomovil.cl', verified: false },
      ];
      this.savePages(mockPages);
    }

    if (this.getGroups().length === 0) {
      const mockGroups = [
        { id: 1, name: 'Grupo de Diseño', slug: 'grupo-de-diseno', category: 'Arte y Diseño', memberCount: 12, members: [101, 102, 103, 104, 105], avatar: 'https://i.pravatar.cc/150?img=40', image: 'https://i.pravatar.cc/150?img=40', cover: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&h=400&fit=crop', description: 'Comunidad para diseñadores gráficos, UI/UX y más', location: 'Santiago, Chile', isPrivate: false, createdAt: '2024-01-15' },
        { id: 2, name: 'Fotografía', slug: 'fotografia', category: 'Arte', memberCount: 8, members: [101, 103, 106, 107], avatar: 'https://i.pravatar.cc/150?img=41', image: 'https://i.pravatar.cc/150?img=41', cover: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&h=400&fit=crop', description: 'Comparte tus fotos y aprende de otros fotógrafos', location: 'Santiago, Chile', isPrivate: false, createdAt: '2024-02-20' },
        { id: 3, name: 'Desarrolladores Chile', slug: 'desarrolladores-chile', category: 'Tecnología', memberCount: 15, members: [101, 102, 104, 108], avatar: 'https://i.pravatar.cc/150?img=42', image: 'https://i.pravatar.cc/150?img=42', cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=400&fit=crop', description: 'Grupo de desarrolladores de software en Chile', location: 'Santiago, Chile', isPrivate: false, createdAt: '2024-03-10' },
        { id: 4, name: 'Marketing Digital', slug: 'marketing-digital-grupo', category: 'Negocios', memberCount: 6, members: [101, 105], avatar: 'https://i.pravatar.cc/150?img=43', image: 'https://i.pravatar.cc/150?img=43', cover: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=1200&h=400&fit=crop', description: 'Aprende y comparte sobre marketing digital', location: 'Santiago, Chile', isPrivate: false, createdAt: '2024-01-25' },
        { id: 5, name: 'Vecinos de Chamisero', slug: 'vecinos-de-chamisero', category: 'Comunidad', memberCount: 9, members: [101], avatar: 'https://i.pravatar.cc/150?img=44', image: 'https://i.pravatar.cc/150?img=44', cover: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=400&fit=crop', description: 'Comunidad del barrio de Chamisero', location: 'Chamisero, Colina', isPrivate: false, createdAt: '2024-02-01' },
      ];
      this.saveGroups(mockGroups);
    }

    const allLikedPages = this.get(STORAGE_KEYS.LIKED_PAGES) || {};
    if (!allLikedPages[101]) {
      allLikedPages[101] = [1, 3, 6];
      this.set(STORAGE_KEYS.LIKED_PAGES, allLikedPages);
    }
    
    // Migrar reacciones antiguas a reacciones vecinales
    this.migrateReactionsToVecinal();
  }
  
  // Migrar reacciones antiguas a reacciones vecinales
  migrateReactionsToVecinal() {
    const posts = this.getPosts();
    const oldReactions = ['😊', '😍', '😮', '👍', '👎', '😢', '😡'];
    const newReactions = ['🤝', '❤️', '👏', '💡', '🙌'];
    
    let updated = false;
    const updatedPosts = posts.map(post => {
      if (post.reactions && post.reactions.some(r => oldReactions.includes(r))) {
        // Reemplazar reacciones antiguas con nuevas reacciones vecinales
        const migratedReactions = post.reactions.map(reaction => {
          if (oldReactions.includes(reaction)) {
            // Mapear aleatoriamente a una reacción vecinal
            return newReactions[Math.floor(Math.random() * newReactions.length)];
          }
          return reaction;
        });
        updated = true;
        return { ...post, reactions: migratedReactions };
      }
      return post;
    });
    
    if (updated) {
      this.savePosts(updatedPosts);
      console.log('✅ Reacciones migradas a formato vecinal');
    }
  }
}

const storageService = new StorageService();
export default storageService;
