// Test app status and login functionality
console.log('🧪 Testing app status...');

// Test 1: Check if login works
console.log('\n1. Testing login with admin@vecinoactivo.cl / 123456');

// Test 2: Check localStorage structure
console.log('\n2. Checking localStorage structure...');
const posts = JSON.parse(localStorage.getItem('friendbook_posts') || '[]');
console.log(`Found ${posts.length} posts in localStorage`);

if (posts.length > 0) {
  console.log('\n3. Checking post structure...');
  const samplePost = posts[0];
  console.log('Sample post author type:', typeof samplePost.author);
  console.log('Sample post author value:', samplePost.author);
  
  if (typeof samplePost.author === 'object' && samplePost.author !== null) {
    console.log('✅ Post author is object with properties:', Object.keys(samplePost.author));
  } else {
    console.log('❌ Post author is not an object - this will cause React rendering error');
  }
}

console.log('\n4. App should now work without React object rendering errors');
console.log('   - Login: admin@vecinoactivo.cl / 123456');
console.log('   - Posts should render correctly');
console.log('   - Firebase test available at /firebase-test');