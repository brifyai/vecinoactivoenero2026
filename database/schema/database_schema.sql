-- ============================================
-- ESQUEMA DE BASE DE DATOS VECINO ACTIVO
-- Supabase PostgreSQL Schema
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- TABLA: users (Usuarios)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE,
  avatar TEXT,
  phone VARCHAR(50),
  bio TEXT,
  
  -- Información de vecindario
  neighborhood_id VARCHAR(100),
  neighborhood_name VARCHAR(255),
  neighborhood_code VARCHAR(50),
  
  -- Verificación
  verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- TABLA: friendships (Amistades)
-- ============================================
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, friend_id)
);

-- ============================================
-- TABLA: posts (Publicaciones)
-- ============================================
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image TEXT,
  
  -- Metadata
  feeling VARCHAR(50),
  location VARCHAR(255),
  privacy VARCHAR(20) DEFAULT 'public', -- public, friends, private
  category VARCHAR(50) DEFAULT 'general',
  hashtags TEXT[],
  
  -- Contadores
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: post_reactions (Reacciones a posts)
-- ============================================
CREATE TABLE post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id, emoji)
);

-- ============================================
-- TABLA: comments (Comentarios)
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: messages (Mensajes directos)
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: notifications (Notificaciones)
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- friend_request, new_message, post_like, etc.
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  
  -- Referencias opcionales
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  event_id UUID,
  project_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: events (Eventos)
-- ============================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  location VARCHAR(255),
  image TEXT,
  
  -- Organizador
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Metadata
  category VARCHAR(50),
  privacy VARCHAR(20) DEFAULT 'public',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: event_attendees (Asistentes a eventos)
-- ============================================
CREATE TABLE event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'going', -- going, interested, not-going
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- ============================================
-- TABLA: groups (Grupos)
-- ============================================
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  
  -- Creador
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Metadata
  privacy VARCHAR(20) DEFAULT 'public',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: group_members (Miembros de grupos)
-- ============================================
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- admin, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ============================================
-- TABLA: group_posts (Publicaciones en grupos)
-- ============================================
CREATE TABLE group_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: projects (Proyectos comunitarios)
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'propuesta', -- propuesta, en_progreso, completado
  
  -- Creador
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Vecindario
  neighborhood_id VARCHAR(100),
  neighborhood_name VARCHAR(255),
  neighborhood_code VARCHAR(50),
  
  -- Financiamiento
  budget DECIMAL(10,2) DEFAULT 0,
  funding_goal DECIMAL(10,2) DEFAULT 0,
  current_funding DECIMAL(10,2) DEFAULT 0,
  
  -- Votos
  votes INTEGER DEFAULT 0,
  
  -- Fechas
  start_date DATE,
  end_date DATE,
  completion_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  priority VARCHAR(20) DEFAULT 'media',
  tags TEXT[],
  images TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: project_volunteers (Voluntarios de proyectos)
-- ============================================
CREATE TABLE project_volunteers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- ============================================
-- TABLA: project_voters (Votantes de proyectos)
-- ============================================
CREATE TABLE project_voters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- ============================================
-- TABLA: project_updates (Actualizaciones de proyectos)
-- ============================================
CREATE TABLE project_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: polls (Encuestas/Votaciones)
-- ============================================
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active', -- active, closed
  
  -- Creador
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Vecindario
  neighborhood_id VARCHAR(100),
  
  -- Metadata
  total_votes INTEGER DEFAULT 0,
  ends_at DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: poll_options (Opciones de encuestas)
-- ============================================
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  text VARCHAR(255) NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: poll_votes (Votos en encuestas)
-- ============================================
CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- ============================================
-- TABLA: local_businesses (Negocios locales)
-- ============================================
CREATE TABLE local_businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  subcategory VARCHAR(50),
  
  -- Dueño
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Vecindario
  neighborhood_id VARCHAR(100),
  neighborhood_name VARCHAR(255),
  neighborhood_code VARCHAR(50),
  
  -- Contacto
  address VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  whatsapp VARCHAR(50),
  instagram VARCHAR(100),
  facebook VARCHAR(100),
  
  -- Horarios (JSON)
  hours JSONB,
  
  -- Media
  images TEXT[],
  logo TEXT,
  
  -- Servicios y tags
  tags TEXT[],
  services TEXT[],
  
  -- Precios y opciones
  price_range VARCHAR(20) DEFAULT 'medio',
  accepts_cards BOOLEAN DEFAULT FALSE,
  has_delivery BOOLEAN DEFAULT FALSE,
  
  -- Calificación
  rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  
  -- Estado
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: business_reviews (Reseñas de negocios)
-- ============================================
CREATE TABLE business_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES local_businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- ============================================
-- TABLA: business_offers (Ofertas de negocios)
-- ============================================
CREATE TABLE business_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES local_businesses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount VARCHAR(50),
  code VARCHAR(50),
  terms TEXT,
  valid_until DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: shared_resources (Recursos compartidos)
-- ============================================
CREATE TABLE shared_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  subcategory VARCHAR(50),
  
  -- Dueño
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Vecindario
  neighborhood_id VARCHAR(100),
  neighborhood_name VARCHAR(255),
  neighborhood_code VARCHAR(50),
  
  -- Condición
  condition VARCHAR(20) DEFAULT 'bueno',
  images TEXT[],
  
  -- Depósito
  requires_deposit BOOLEAN DEFAULT FALSE,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Préstamo
  max_loan_days INTEGER DEFAULT 7,
  rules TEXT,
  
  -- Estado
  is_available BOOLEAN DEFAULT TRUE,
  total_loans INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: resource_reservations (Reservas de recursos)
-- ============================================
CREATE TABLE resource_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID REFERENCES shared_resources(id) ON DELETE CASCADE,
  
  -- Dueño y prestamista
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  borrower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Fechas
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Propósito
  purpose TEXT,
  
  -- Estado
  status VARCHAR(20) DEFAULT 'pendiente', -- pendiente, activa, completada, cancelada
  deposit_paid BOOLEAN DEFAULT FALSE,
  returned_in_good_condition BOOLEAN,
  borrower_rating INTEGER CHECK (borrower_rating >= 1 AND borrower_rating <= 5),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: help_requests (Solicitudes de ayuda)
-- ============================================
CREATE TABLE help_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  urgency VARCHAR(20) DEFAULT 'normal', -- baja, normal, alta, urgente
  status VARCHAR(20) DEFAULT 'abierta', -- abierta, en_proceso, resuelta, cancelada
  
  -- Solicitante
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Vecindario
  neighborhood_id VARCHAR(100),
  neighborhood_name VARCHAR(255),
  neighborhood_code VARCHAR(50),
  
  -- Ubicación
  location VARCHAR(255),
  images TEXT[],
  
  -- Oferta aceptada
  accepted_offer_id UUID,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- TABLA: help_offers (Ofertas de ayuda)
-- ============================================
CREATE TABLE help_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES help_requests(id) ON DELETE CASCADE,
  helper_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  availability VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: community_calendar (Calendario comunitario)
-- ============================================
CREATE TABLE community_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50), -- reunion, actividad, mantenimiento, etc.
  
  -- Fecha y hora
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  
  -- Ubicación
  location VARCHAR(255),
  
  -- Organizador
  organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Vecindario
  neighborhood_id VARCHAR(100),
  neighborhood_name VARCHAR(255),
  neighborhood_code VARCHAR(50),
  
  -- Recurrencia
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB,
  
  -- Asistentes
  max_attendees INTEGER,
  
  -- Recordatorios
  reminders JSONB,
  
  -- Media
  images TEXT[],
  tags TEXT[],
  
  -- Visibilidad
  is_public BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: calendar_attendees (Asistentes al calendario)
-- ============================================
CREATE TABLE calendar_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES community_calendar(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- ============================================
-- TABLA: photos (Fotos)
-- ============================================
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  album_id UUID,
  url TEXT NOT NULL,
  caption TEXT,
  tags TEXT[],
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: photo_albums (Álbumes de fotos)
-- ============================================
CREATE TABLE photo_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: neighborhoods (Vecindarios/Unidades Vecinales)
-- ============================================
CREATE TABLE neighborhoods (
  id VARCHAR(100) PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  comuna VARCHAR(100),
  region VARCHAR(100),
  personas INTEGER DEFAULT 0,
  hogares INTEGER DEFAULT 0,
  geometry GEOMETRY(MultiPolygon, 4326),
  properties JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_neighborhood ON users(neighborhood_id);

-- Friendships
CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_friendships_friend ON friendships(friend_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- Posts
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_category ON posts(category);

-- Messages
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Events
CREATE INDEX idx_events_creator ON events(created_by);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_slug ON events(slug);

-- Groups
CREATE INDEX idx_groups_creator ON groups(created_by);
CREATE INDEX idx_groups_slug ON groups(slug);

-- Projects
CREATE INDEX idx_projects_creator ON projects(creator_id);
CREATE INDEX idx_projects_neighborhood ON projects(neighborhood_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_slug ON projects(slug);

-- Polls
CREATE INDEX idx_polls_creator ON polls(creator_id);
CREATE INDEX idx_polls_neighborhood ON polls(neighborhood_id);
CREATE INDEX idx_polls_status ON polls(status);

-- Local Businesses
CREATE INDEX idx_businesses_owner ON local_businesses(owner_id);
CREATE INDEX idx_businesses_neighborhood ON local_businesses(neighborhood_id);
CREATE INDEX idx_businesses_category ON local_businesses(category);
CREATE INDEX idx_businesses_verified ON local_businesses(is_verified);

-- Shared Resources
CREATE INDEX idx_resources_owner ON shared_resources(owner_id);
CREATE INDEX idx_resources_neighborhood ON shared_resources(neighborhood_id);
CREATE INDEX idx_resources_available ON shared_resources(is_available);
CREATE INDEX idx_resources_slug ON shared_resources(slug);

-- Help Requests
CREATE INDEX idx_help_requests_requester ON help_requests(requester_id);
CREATE INDEX idx_help_requests_neighborhood ON help_requests(neighborhood_id);
CREATE INDEX idx_help_requests_status ON help_requests(status);
CREATE INDEX idx_help_requests_slug ON help_requests(slug);

-- Community Calendar
CREATE INDEX idx_calendar_organizer ON community_calendar(organizer_id);
CREATE INDEX idx_calendar_neighborhood ON community_calendar(neighborhood_id);
CREATE INDEX idx_calendar_date ON community_calendar(date);

-- Neighborhoods (Spatial Index)
CREATE INDEX idx_neighborhoods_geometry ON neighborhoods USING GIST(geometry);
CREATE INDEX idx_neighborhoods_codigo ON neighborhoods(codigo);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON polls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON local_businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON shared_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_help_requests_updated_at BEFORE UPDATE ON help_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_updated_at BEFORE UPDATE ON community_calendar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Opcional
-- ============================================

-- Habilitar RLS en tablas sensibles
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de ejemplo (ajustar según necesidades)
-- Los usuarios pueden ver su propia información
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propia información
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- DATOS DE EJEMPLO (Opcional)
-- ============================================

-- Insertar usuario de prueba
INSERT INTO users (email, password, name, avatar, verified)
VALUES 
  ('admin@vecinoactivo.cl', '$2a$10$...', 'Admin', 'https://i.pravatar.cc/150?img=1', TRUE),
  ('usuario@vecinoactivo.cl', '$2a$10$...', 'Usuario Demo', 'https://i.pravatar.cc/150?img=2', TRUE);

-- ============================================
-- FIN DEL ESQUEMA
-- ============================================
