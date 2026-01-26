export function useUserProfilePosts(profileUser, visiblePosts) {
  const allPosts = [
    {
      id: 1,
      author: {
        id: profileUser?.id || 1,
        name: profileUser?.name || 'Usuario',
        avatar: profileUser?.avatar || 'https://i.pravatar.cc/50?img=1',
        verified: profileUser?.verified || false
      },
      authorId: profileUser?.id || 1,
      time: 'hace 30 min',
      avatar: profileUser?.avatar || 'https://i.pravatar.cc/50?img=1',
      content: '¡Hoy es el cumpleaños de nuestros tres lindos cachorros!',
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=500&fit=crop',
      hashtags: ['#cachorros', '#cumpleaños', '#perros'],
      likes: 175,
      comments: 4368,
      shares: 936,
      reactions: ['🤝', '❤️', '👏', '💡']
    },
    {
      id: 2,
      author: {
        id: profileUser?.id || 1,
        name: profileUser?.name || 'Usuario',
        avatar: profileUser?.avatar || 'https://i.pravatar.cc/50?img=16',
        verified: profileUser?.verified || false
      },
      authorId: profileUser?.id || 1,
      time: 'hace 1 hora',
      avatar: profileUser?.avatar || 'https://i.pravatar.cc/50?img=16',
      content: 'Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto.',
      image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800&h=500&fit=crop',
      hashtags: ['#estilodeVida', '#inspiración'],
      likes: 234,
      comments: 89,
      shares: 45,
      reactions: ['🤝', '❤️', '🙌']
    }
  ];

  const posts = allPosts.slice(0, visiblePosts);

  return {
    posts,
    allPosts,
    hasMorePosts: visiblePosts < allPosts.length
  };
}