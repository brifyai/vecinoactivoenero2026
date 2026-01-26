// Clear existing demo data to force re-initialization with correct structure
console.log('🧹 Clearing existing demo data...');

// Clear all localStorage keys related to the app
const keysToRemove = [
  'friendbook_posts',
  'friendbook_users',
  'friendbook_friends',
  'friendbook_session',
  'vecino-activo-auth'
];

keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Removed: ${key}`);
  }
});

console.log('🔄 Demo data cleared. Refresh the page to reinitialize with correct structure.');