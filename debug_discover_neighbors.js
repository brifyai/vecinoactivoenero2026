// Debug script for DiscoverNeighbors page
console.log('🔍 Debugging DiscoverNeighbors page...');

// Check if user is logged in
const authState = JSON.parse(localStorage.getItem('persist:root') || '{}');
console.log('🔐 Auth state from localStorage:', authState);

// Check users in storage
const users = JSON.parse(localStorage.getItem('friendbook_users') || '[]');
console.log('👥 Users in storage:', users.length);
users.forEach((user, index) => {
  console.log(`${index + 1}. ${user.name} (@${user.username}) - Neighborhood: ${user.neighborhoodName || 'N/A'}`);
});

// Check current session
const session = JSON.parse(localStorage.getItem('vecino-activo-auth') || 'null');
console.log('🎫 Current session:', session);

if (session && session.user) {
  console.log('👤 Current user details:');
  console.log('  - Name:', session.user.name);
  console.log('  - Username:', session.user.username);
  console.log('  - Neighborhood ID:', session.user.neighborhoodId);
  console.log('  - Neighborhood Name:', session.user.neighborhoodName);
  console.log('  - Neighborhood Code:', session.user.neighborhoodCode);
} else {
  console.log('❌ No active session found');
}

console.log('\n💡 Try navigating to http://localhost:3004/app/descubrir-vecinos now');
console.log('   Check the browser console for component logs starting with 🔍');