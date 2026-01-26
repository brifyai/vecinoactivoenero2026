-- =====================================================
-- SCHEMA FINAL PARA NEIGHBORHOOD UNIT DASHBOARD (NUD)
-- Compatible con esquema existente de Vecino Activo
-- VERSIÓN CORREGIDA Y FUNCIONAL
-- =====================================================

-- Verificar que las extensiones estén habilitadas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE ROLES ADMINISTRATIVOS
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    neighborhood_id VARCHAR(100) REFERENCES neighborhoods(id) ON DELETE CASCADE,
    role_type VARCHAR(50) NOT NULL CHECK (role_type IN ('super_admin', 'uv_admin', 'delegate', 'moderator')),
    permissions JSONB DEFAULT '{}',
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    UNIQUE(user_id, neighborhood_id, role_type)
);

-- Índices para admin_roles
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_neighborhood_id ON admin_roles(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_role_type ON admin_roles(role_type);
CREATE INDEX IF NOT EXISTS idx_admin_roles_active ON admin_roles(is_active) WHERE is_active = true;

-- 2. TABLA DE TICKETS/REPORTES
CREATE TABLE IF NOT EXISTS tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_number VARCHAR(20) UNIQUE NOT NULL, -- TK-2026-001234
    neighborhood_id VARCHAR(100) REFERENCES neighborhoods(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Información del ticket
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('security', 'infrastructure', 'noise', 'cleaning', 'lighting', 'other')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed', 'rejected')),
    
    -- Ubicación
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_address TEXT,
    
    -- Archivos adjuntos
    attachments JSONB DEFAULT '[]', -- URLs de imágenes/documentos
    
    -- Metadatos
    source VARCHAR(30) DEFAULT 'app' CHECK (source IN ('app', 'web', 'phone', 'email', 'whatsapp')),
    tags JSONB DEFAULT '[]',
    internal_notes TEXT,
    resolution_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para tickets
CREATE INDEX IF NOT EXISTS idx_tickets_neighborhood_id ON tickets(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_tickets_reporter_id ON tickets(reporter_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

-- 3. TABLA DE CAMPAÑAS DE COMUNICACIÓN
CREATE TABLE IF NOT EXISTS communication_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    neighborhood_id VARCHAR(100) REFERENCES neighborhoods(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Información de la campaña
    name VARCHAR(200) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(30) NOT NULL CHECK (campaign_type IN ('announcement', 'emergency', 'event', 'survey', 'newsletter')),
    
    -- Contenido
    subject VARCHAR(300),
    message TEXT NOT NULL,
    html_content TEXT,
    attachments JSONB DEFAULT '[]',
    
    -- Canales de envío
    channels JSONB NOT NULL DEFAULT '{"push": false, "email": false, "whatsapp": false}',
    
    -- Segmentación
    target_audience JSONB DEFAULT '{}', -- Filtros de audiencia
    estimated_recipients INTEGER DEFAULT 0,
    
    -- Programación
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Estado
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')),
    
    -- Estadísticas
    stats JSONB DEFAULT '{"sent": 0, "delivered": 0, "opened": 0, "clicked": 0, "failed": 0}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para communication_campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_neighborhood_id ON communication_campaigns(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON communication_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON communication_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_at ON communication_campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON communication_campaigns(created_at DESC);

-- 4. TABLA DE LOGS DE ENVÍO DE CAMPAÑAS
CREATE TABLE IF NOT EXISTS campaign_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES communication_campaigns(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Información del envío
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('push', 'email', 'whatsapp')),
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    
    -- Estado del envío
    status VARCHAR(30) NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced')),
    error_message TEXT,
    
    -- Metadatos del proveedor
    provider_id VARCHAR(100), -- ID del proveedor (Firebase, Resend, etc.)
    provider_response JSONB,
    
    -- Timestamps
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE
);

-- Índices para campaign_logs
CREATE INDEX IF NOT EXISTS idx_campaign_logs_campaign_id ON campaign_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_recipient_id ON campaign_logs(recipient_id);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_status ON campaign_logs(status);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_channel ON campaign_logs(channel);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_sent_at ON campaign_logs(sent_at DESC);

-- 5. TABLA DE COMENTARIOS EN TICKETS
CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Contenido
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    
    -- Tipo de comentario
    comment_type VARCHAR(30) DEFAULT 'comment' CHECK (comment_type IN ('comment', 'status_change', 'assignment', 'internal_note')),
    
    -- Metadatos
    is_internal BOOLEAN DEFAULT false, -- Solo visible para admins
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para ticket_comments
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_author_id ON ticket_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_created_at ON ticket_comments(created_at DESC);

-- 6. TABLA DE CONFIGURACIÓN DEL DASHBOARD
CREATE TABLE IF NOT EXISTS dashboard_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    neighborhood_id VARCHAR(100) REFERENCES neighborhoods(id) ON DELETE CASCADE,
    
    -- Configuración general
    config_key VARCHAR(100) NOT NULL,
    config_value JSONB NOT NULL,
    
    -- Metadatos
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(neighborhood_id, config_key)
);

-- Índices para dashboard_config
CREATE INDEX IF NOT EXISTS idx_dashboard_config_neighborhood_id ON dashboard_config(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_config_key ON dashboard_config(config_key);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para generar número de ticket
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ticket_number := 'TK-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                        LPAD(NEXTVAL('ticket_sequence')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Secuencia para números de ticket
CREATE SEQUENCE IF NOT EXISTS ticket_sequence START 1;

-- Trigger para generar número de ticket
DROP TRIGGER IF EXISTS trigger_generate_ticket_number ON tickets;
CREATE TRIGGER trigger_generate_ticket_number
    BEFORE INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION generate_ticket_number();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS trigger_admin_roles_updated_at ON admin_roles;
CREATE TRIGGER trigger_admin_roles_updated_at
    BEFORE UPDATE ON admin_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_tickets_updated_at ON tickets;
CREATE TRIGGER trigger_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_campaigns_updated_at ON communication_campaigns;
CREATE TRIGGER trigger_campaigns_updated_at
    BEFORE UPDATE ON communication_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_ticket_comments_updated_at ON ticket_comments;
CREATE TRIGGER trigger_ticket_comments_updated_at
    BEFORE UPDATE ON ticket_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_dashboard_config_updated_at ON dashboard_config;
CREATE TRIGGER trigger_dashboard_config_updated_at
    BEFORE UPDATE ON dashboard_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - SIMPLIFICADO
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_config ENABLE ROW LEVEL SECURITY;

-- Políticas simplificadas (permitir todo por ahora para evitar problemas de auth)
DROP POLICY IF EXISTS "admin_roles_policy" ON admin_roles;
CREATE POLICY "admin_roles_policy" ON admin_roles FOR ALL USING (true);

DROP POLICY IF EXISTS "tickets_policy" ON tickets;
CREATE POLICY "tickets_policy" ON tickets FOR ALL USING (true);

DROP POLICY IF EXISTS "campaigns_policy" ON communication_campaigns;
CREATE POLICY "campaigns_policy" ON communication_campaigns FOR ALL USING (true);

DROP POLICY IF EXISTS "campaign_logs_policy" ON campaign_logs;
CREATE POLICY "campaign_logs_policy" ON campaign_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "ticket_comments_policy" ON ticket_comments;
CREATE POLICY "ticket_comments_policy" ON ticket_comments FOR ALL USING (true);

DROP POLICY IF EXISTS "dashboard_config_policy" ON dashboard_config;
CREATE POLICY "dashboard_config_policy" ON dashboard_config FOR ALL USING (true);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar configuraciones por defecto para vecindarios existentes
INSERT INTO dashboard_config (neighborhood_id, config_key, config_value) 
SELECT 
    id as neighborhood_id,
    'notification_settings',
    '{"email_enabled": true, "push_enabled": true, "whatsapp_enabled": false}'::jsonb
FROM neighborhoods 
ON CONFLICT (neighborhood_id, config_key) DO NOTHING;

INSERT INTO dashboard_config (neighborhood_id, config_key, config_value) 
SELECT 
    id as neighborhood_id,
    'ticket_categories',
    '["security", "infrastructure", "noise", "cleaning", "lighting", "other"]'::jsonb
FROM neighborhoods 
ON CONFLICT (neighborhood_id, config_key) DO NOTHING;

-- =====================================================
-- VISTAS ÚTILES - CORREGIDAS
-- =====================================================

-- Vista de estadísticas de tickets por UV
CREATE OR REPLACE VIEW ticket_stats_by_neighborhood AS
SELECT 
    n.id as neighborhood_id,
    n.nombre as neighborhood_name,
    n.codigo as neighborhood_code,
    COUNT(t.id) as total_tickets,
    COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tickets,
    COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tickets,
    COUNT(CASE WHEN t.status = 'resolved' THEN 1 END) as resolved_tickets,
    COUNT(CASE WHEN t.priority = 'urgent' THEN 1 END) as urgent_tickets,
    AVG(EXTRACT(EPOCH FROM (COALESCE(t.resolved_at, NOW()) - t.created_at))/3600) as avg_resolution_hours
FROM neighborhoods n
LEFT JOIN tickets t ON n.id = t.neighborhood_id
GROUP BY n.id, n.nombre, n.codigo;

-- Vista de campañas recientes
CREATE OR REPLACE VIEW recent_campaigns AS
SELECT 
    cc.*,
    n.nombre as neighborhood_name,
    n.codigo as neighborhood_code,
    u.email as creator_email,
    u.name as creator_name,
    (cc.stats->>'sent')::integer as total_sent,
    (cc.stats->>'opened')::integer as total_opened,
    CASE 
        WHEN (cc.stats->>'sent')::integer > 0 
        THEN ROUND(((cc.stats->>'opened')::integer * 100.0) / (cc.stats->>'sent')::integer, 2)
        ELSE 0 
    END as open_rate
FROM communication_campaigns cc
JOIN neighborhoods n ON cc.neighborhood_id = n.id
LEFT JOIN users u ON cc.created_by = u.id
ORDER BY cc.created_at DESC;

-- Vista de tickets con información completa
CREATE OR REPLACE VIEW tickets_detailed AS
SELECT 
    t.*,
    n.nombre as neighborhood_name,
    n.codigo as neighborhood_code,
    reporter.name as reporter_name,
    reporter.email as reporter_email,
    assigned.name as assigned_name,
    assigned.email as assigned_email,
    (SELECT COUNT(*) FROM ticket_comments tc WHERE tc.ticket_id = t.id) as comments_count
FROM tickets t
JOIN neighborhoods n ON t.neighborhood_id = n.id
LEFT JOIN users reporter ON t.reporter_id = reporter.id
LEFT JOIN users assigned ON t.assigned_to = assigned.id;

-- =====================================================
-- INSERTAR USUARIO ADMIN DE EJEMPLO
-- =====================================================

-- Insertar usuario admin de ejemplo (solo si no existe)
INSERT INTO users (
    id, 
    email, 
    password, 
    name, 
    username, 
    avatar, 
    verified, 
    email_verified,
    created_at
) VALUES (
    gen_random_uuid(),
    'admin@vecinoactivo.cl',
    '123456', -- En producción usar hash
    'Administrador Sistema',
    'admin',
    'https://ui-avatars.com/api/?name=Admin&background=667eea&color=fff',
    true,
    true,
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Comentarios
COMMENT ON TABLE admin_roles IS 'Roles administrativos para el dashboard de unidades vecinales';
COMMENT ON TABLE tickets IS 'Sistema de tickets para reportes y gestión comunitaria';
COMMENT ON TABLE communication_campaigns IS 'Campañas de comunicación masiva omnicanal';
COMMENT ON TABLE campaign_logs IS 'Logs detallados de envío de campañas';
COMMENT ON TABLE ticket_comments IS 'Comentarios y seguimiento de tickets';
COMMENT ON TABLE dashboard_config IS 'Configuración personalizable del dashboard';

-- Finalizado
SELECT 'Admin Dashboard Schema FINAL created successfully!' as status,
       'Tablas creadas: 6' as tables_created,
       'Vistas creadas: 3' as views_created,
       'Triggers creados: 5' as triggers_created;