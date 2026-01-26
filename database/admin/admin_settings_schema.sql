-- =====================================================
-- ESQUEMA DE CONFIGURACIÓN ADMINISTRATIVA
-- Tabla para almacenar configuraciones del dashboard admin
-- =====================================================

-- Tabla de configuraciones administrativas
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE,
  
  -- Notificaciones
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  ticket_alerts BOOLEAN DEFAULT true,
  campaign_alerts BOOLEAN DEFAULT true,
  emergency_alerts BOOLEAN DEFAULT true,
  
  -- Información de la UV
  uv_name TEXT,
  uv_address TEXT,
  uv_phone TEXT,
  uv_email TEXT,
  uv_website TEXT,
  
  -- Canales de comunicación
  enable_email BOOLEAN DEFAULT true,
  enable_push BOOLEAN DEFAULT true,
  enable_whatsapp BOOLEAN DEFAULT false,
  enable_sms BOOLEAN DEFAULT false,
  
  -- Personalización de tema
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  primary_color TEXT DEFAULT '#3b82f6',
  accent_color TEXT DEFAULT '#10b981',
  
  -- Seguridad
  two_factor_auth BOOLEAN DEFAULT false,
  session_timeout INTEGER DEFAULT 30,
  password_expiry INTEGER DEFAULT 90,
  login_attempts INTEGER DEFAULT 5,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  
  -- Constraint: Una configuración por UV
  UNIQUE(neighborhood_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_admin_settings_neighborhood ON admin_settings(neighborhood_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();

-- =====================================================
-- TABLA DE ADMINISTRADORES
-- Gestión de usuarios con permisos administrativos
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE,
  
  -- Información del admin
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  permissions JSONB DEFAULT '[]'::jsonb,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: Un usuario puede ser admin de múltiples UVs
  UNIQUE(user_id, neighborhood_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_admin_users_user ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_neighborhood ON admin_users(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Vista para obtener administradores con información del usuario
CREATE OR REPLACE VIEW admin_users_detailed AS
SELECT 
  au.id,
  au.user_id,
  au.neighborhood_id,
  au.role,
  au.permissions,
  au.is_active,
  au.last_login,
  au.created_at,
  u.name as user_name,
  u.email as user_email,
  u.avatar_url as user_avatar,
  n.nombre as neighborhood_name
FROM admin_users au
LEFT JOIN users u ON au.user_id = u.id
LEFT JOIN neighborhoods n ON au.neighborhood_id = n.id;

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Política: Los admins pueden ver y editar settings de su UV
CREATE POLICY admin_settings_select_policy ON admin_settings
  FOR SELECT
  USING (
    neighborhood_id IN (
      SELECT neighborhood_id 
      FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY admin_settings_update_policy ON admin_settings
  FOR UPDATE
  USING (
    neighborhood_id IN (
      SELECT neighborhood_id 
      FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY admin_settings_insert_policy ON admin_settings
  FOR INSERT
  WITH CHECK (
    neighborhood_id IN (
      SELECT neighborhood_id 
      FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Política: Los admins pueden ver otros admins de su UV
CREATE POLICY admin_users_select_policy ON admin_users
  FOR SELECT
  USING (
    neighborhood_id IN (
      SELECT neighborhood_id 
      FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Política: Solo super_admins pueden modificar admins
CREATE POLICY admin_users_update_policy ON admin_users
  FOR UPDATE
  USING (
    neighborhood_id IN (
      SELECT neighborhood_id 
      FROM admin_users 
      WHERE user_id = auth.uid() 
        AND role = 'super_admin' 
        AND is_active = true
    )
  );

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar configuración por defecto para UVs existentes
INSERT INTO admin_settings (neighborhood_id, uv_name)
SELECT id, nombre 
FROM neighborhoods
WHERE id NOT IN (SELECT neighborhood_id FROM admin_settings)
ON CONFLICT (neighborhood_id) DO NOTHING;

-- Comentarios
COMMENT ON TABLE admin_settings IS 'Configuraciones administrativas por unidad vecinal';
COMMENT ON TABLE admin_users IS 'Usuarios con permisos administrativos';
COMMENT ON COLUMN admin_settings.theme IS 'Tema del dashboard: light, dark, auto';
COMMENT ON COLUMN admin_users.role IS 'Rol del administrador: super_admin, admin, moderator';
COMMENT ON COLUMN admin_users.permissions IS 'Array JSON de permisos específicos';
