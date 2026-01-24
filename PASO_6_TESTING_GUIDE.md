# Paso 6.3: Testing y Validación

## Objetivo

Implementar tests completos para servicios, slices y componentes integrados con Supabase.

---

## 🧪 Estructura de Testing

```
src/
├── services/
│   ├── __tests__/
│   │   ├── supabaseAuthService.test.js
│   │   ├── supabasePostsService.test.js
│   │   └── ...
├── store/
│   └── slices/
│       ├── __tests__/
│       │   ├── authSlice.test.js
│       │   ├── postsSlice.test.js
│       │   └── ...
└── components/
    └── __tests__/
        ├── Post.test.js
        └── ...
```

---

## 📦 Configuración de Testing

### 1. Instalar Dependencias

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

### 2. Configurar Jest

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js'
  ]
};
```

### 3. Setup Tests

```javascript
// src/setupTests.js
import '@testing-library/jest-dom';

// Mock Supabase
jest.mock('./config/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis()
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
        remove: jest.fn()
      }))
    },
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn()
    }))
  }
}));
```

---

## 🔐 Tests de Autenticación

```javascript
// src/services/__tests__/supabaseAuthService.test.js
import supabaseAuthService from '../supabaseAuthService';
import { supabase } from '../../config/supabase';

describe('SupabaseAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' }
      };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await supabaseAuthService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { name: 'Test User' }
        }
      });

      expect(result.user).toEqual(mockUser);
    });

    it('should throw error on registration failure', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Email already exists' }
      });

      await expect(
        supabaseAuthService.register({
          email: 'test@example.com',
          password: 'password123'
        })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockSession = {
        user: { id: '123', email: 'test@example.com' },
        access_token: 'token123'
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const result = await supabaseAuthService.login(
        'test@example.com',
        'password123'
      );

      expect(result.user).toEqual(mockSession.user);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null });

      await supabaseAuthService.logout();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});
```

---

## 📝 Tests de Posts Service

```javascript
// src/services/__tests__/supabasePostsService.test.js
import supabasePostsService from '../supabasePostsService';
import { supabase } from '../../config/supabase';

describe('SupabasePostsService', () => {
  describe('getPosts', () => {
    it('should fetch posts for a neighborhood', async () => {
      const mockPosts = [
        { id: 1, content: 'Test post 1' },
        { id: 2, content: 'Test post 2' }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: mockPosts, error: null })
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await supabasePostsService.getPosts(1, 10, 0);

      expect(result).toEqual(mockPosts);
      expect(mockQuery.eq).toHaveBeenCalledWith('neighborhood_id', 1);
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const mockPost = {
        id: 1,
        content: 'New post',
        author_id: '123'
      };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPost, error: null })
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await supabasePostsService.createPost({
        content: 'New post',
        authorId: '123',
        neighborhoodId: 1
      });

      expect(result).toEqual(mockPost);
    });
  });

  describe('likePost', () => {
    it('should toggle like on post', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null })
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await supabasePostsService.likePost(1, '123');

      expect(result.added).toBe(true);
    });
  });
});
```

---

## 🔄 Tests de Redux Slices

```javascript
// src/store/slices/__tests__/postsSlice.test.js
import postsReducer, {
  loadPosts,
  createPost,
  deletePost
} from '../postsSlice';
import { configureStore } from '@reduxjs/toolkit';
import supabasePostsService from '../../../services/supabasePostsService';

jest.mock('../../../services/supabasePostsService');

describe('postsSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        posts: postsReducer,
        auth: (state = { user: { id: '123' } }) => state
      }
    });
  });

  describe('loadPosts', () => {
    it('should load posts successfully', async () => {
      const mockPosts = [
        { id: 1, content: 'Post 1' },
        { id: 2, content: 'Post 2' }
      ];

      supabasePostsService.getPosts.mockResolvedValue(mockPosts);

      await store.dispatch(loadPosts({ neighborhoodId: 1 }));

      const state = store.getState().posts;
      expect(state.items).toEqual(mockPosts);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle load posts error', async () => {
      supabasePostsService.getPosts.mockRejectedValue(
        new Error('Network error')
      );

      await store.dispatch(loadPosts({ neighborhoodId: 1 }));

      const state = store.getState().posts;
      expect(state.error).toBe('Network error');
      expect(state.loading).toBe(false);
    });
  });

  describe('createPost', () => {
    it('should create post successfully', async () => {
      const mockPost = { id: 3, content: 'New post' };

      supabasePostsService.createPost.mockResolvedValue(mockPost);

      await store.dispatch(createPost({
        content: 'New post',
        images: []
      }));

      const state = store.getState().posts;
      expect(state.items[0]).toEqual(mockPost);
    });
  });

  describe('deletePost', () => {
    it('should delete post successfully', async () => {
      // Setup initial state with a post
      store = configureStore({
        reducer: {
          posts: postsReducer,
          auth: (state = { user: { id: '123' } }) => state
        },
        preloadedState: {
          posts: {
            items: [{ id: 1, content: 'Post to delete' }],
            loading: false,
            error: null
          }
        }
      });

      supabasePostsService.deletePost.mockResolvedValue();

      await store.dispatch(deletePost(1));

      const state = store.getState().posts;
      expect(state.items).toHaveLength(0);
    });
  });
});
```

---

## 🎨 Tests de Componentes

```javascript
// src/components/__tests__/Post.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Post from '../Post/Post';
import postsReducer from '../../store/slices/postsSlice';

const mockPost = {
  id: 1,
  content: 'Test post content',
  author: { name: 'Test User', avatar: 'avatar.jpg' },
  likes: 5,
  comments: 2,
  created_at: new Date().toISOString()
};

const renderWithRedux = (component, initialState = {}) => {
  const store = configureStore({
    reducer: {
      posts: postsReducer,
      auth: (state = { user: { id: '123' } }) => state
    },
    preloadedState: initialState
  });

  return render(<Provider store={store}>{component}</Provider>);
};

describe('Post Component', () => {
  it('should render post content', () => {
    renderWithRedux(<Post post={mockPost} />);
    
    expect(screen.getByText('Test post content')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should display like count', () => {
    renderWithRedux(<Post post={mockPost} />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should handle like button click', () => {
    renderWithRedux(<Post post={mockPost} />);
    
    const likeButton = screen.getByRole('button', { name: /like/i });
    fireEvent.click(likeButton);
    
    // Verificar que se llamó la acción
  });

  it('should show comments when clicked', () => {
    renderWithRedux(<Post post={mockPost} />);
    
    const commentsButton = screen.getByRole('button', { name: /comment/i });
    fireEvent.click(commentsButton);
    
    // Verificar que se muestra la sección de comentarios
  });
});
```

---

## 🔌 Tests de Integration

```javascript
// src/__tests__/integration/postFlow.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import App from '../../App';
import rootReducer from '../../store';

describe('Post Creation Flow', () => {
  it('should create and display a new post', async () => {
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: '123', name: 'Test User' }
        }
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );

    // Click en crear post
    const createButton = screen.getByRole('button', { name: /crear publicación/i });
    fireEvent.click(createButton);

    // Escribir contenido
    const textarea = screen.getByPlaceholderText(/qué estás pensando/i);
    fireEvent.change(textarea, { target: { value: 'Mi nuevo post' } });

    // Publicar
    const publishButton = screen.getByRole('button', { name: /publicar/i });
    fireEvent.click(publishButton);

    // Verificar que aparece el post
    await waitFor(() => {
      expect(screen.getByText('Mi nuevo post')).toBeInTheDocument();
    });
  });
});
```

---

## 🎯 Tests E2E con Cypress

### Instalación

```bash
npm install --save-dev cypress
```

### Configuración

```javascript
// cypress.config.js
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
};
```

### Test de Login

```javascript
// cypress/e2e/auth.cy.js
describe('Authentication', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/home');
    cy.contains('Bienvenido').should('be.visible');
  });

  it('should show error on invalid credentials', () => {
    cy.visit('/login');
    
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    cy.contains('Credenciales inválidas').should('be.visible');
  });
});
```

### Test de Posts

```javascript
// cypress/e2e/posts.cy.js
describe('Posts', () => {
  beforeEach(() => {
    // Login antes de cada test
    cy.login('test@example.com', 'password123');
  });

  it('should create a new post', () => {
    cy.visit('/home');
    
    cy.get('[data-testid="create-post-button"]').click();
    cy.get('textarea[name="content"]').type('Mi nuevo post de prueba');
    cy.get('button[type="submit"]').click();
    
    cy.contains('Mi nuevo post de prueba').should('be.visible');
  });

  it('should like a post', () => {
    cy.visit('/home');
    
    cy.get('[data-testid="post"]').first().within(() => {
      cy.get('[data-testid="like-button"]').click();
      cy.get('[data-testid="like-count"]').should('contain', '1');
    });
  });

  it('should add a comment', () => {
    cy.visit('/home');
    
    cy.get('[data-testid="post"]').first().within(() => {
      cy.get('[data-testid="comment-button"]').click();
    });
    
    cy.get('textarea[name="comment"]').type('Gran post!');
    cy.get('button[type="submit"]').click();
    
    cy.contains('Gran post!').should('be.visible');
  });
});
```

---

## 📊 Coverage Reports

### Configurar Coverage

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{js,jsx}",
      "!src/index.js",
      "!src/reportWebVitals.js"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}
```

### Ejecutar Tests

```bash
# Tests unitarios
npm test

# Tests con coverage
npm run test:coverage

# Tests E2E
npx cypress open
```

---

## ✅ Checklist de Testing

### Servicios
- [ ] supabaseAuthService tests
- [ ] supabasePostsService tests
- [ ] supabaseMessagesService tests
- [ ] supabaseEventsService tests
- [ ] supabaseGroupsService tests
- [ ] supabaseFriendsService tests
- [ ] supabaseNotificationsService tests
- [ ] supabaseStorageService tests

### Redux Slices
- [ ] authSlice tests
- [ ] postsSlice tests
- [ ] messagesSlice tests
- [ ] eventsSlice tests
- [ ] groupsSlice tests
- [ ] friendsSlice tests
- [ ] notificationsSlice tests

### Componentes
- [ ] Post component tests
- [ ] CreatePost component tests
- [ ] Header component tests
- [ ] Sidebar component tests
- [ ] RealtimeManager tests

### Integration
- [ ] Login flow test
- [ ] Post creation flow test
- [ ] Messaging flow test
- [ ] Event RSVP flow test

### E2E
- [ ] Authentication E2E
- [ ] Posts E2E
- [ ] Messages E2E
- [ ] Events E2E

### Coverage
- [ ] Alcanzar 70%+ coverage
- [ ] Generar reporte de coverage
- [ ] Revisar áreas sin cobertura

---

## 🚨 Troubleshooting

### Tests fallan con "Cannot find module"
**Solución:** Verificar configuración de moduleNameMapper en jest.config.js

### Timeout en tests async
**Solución:** Aumentar timeout: `jest.setTimeout(10000)`

### Mock de Supabase no funciona
**Solución:** Verificar que el mock esté en setupTests.js

### Tests E2E fallan
**Solución:** Verificar que la app esté corriendo en localhost:3000

---

**Siguiente:** Paso 6.4 - Despliegue a Producción
