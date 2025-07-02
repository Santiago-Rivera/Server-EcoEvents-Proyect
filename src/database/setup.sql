-- Active: 1750916293310@@127.0.0.1@5432@eco_eventos

-- Script para crear tablas del sistema EcoEvents
-- Incluye: Dashboard, Login, Register, Eventos, Usuarios

-- Crear restricción CHECK para roles de usuario (compatible con SQL Server y otros)
-- Elimina la línea ENUM y usa CHECK en la tabla users

-- Tabla de usuarios (para login/register)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER',
    CONSTRAINT chk_role CHECK (role IN ('USER', 'ADMIN', 'ORGANIZER')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de eventos
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    max_participants INTEGER,
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de registros/inscripciones a eventos
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id)
);

-- Tabla de sesiones de usuario (para manejo de login)
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de estadísticas para dashboard
CREATE TABLE IF NOT EXISTS dashboard_stats (
    id SERIAL PRIMARY KEY,
    total_users INTEGER DEFAULT 0,
    total_events INTEGER DEFAULT 0,
    total_registrations INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos iniciales para estadísticas
INSERT INTO dashboard_stats (total_users, total_events, total_registrations) 
VALUES (0, 0, 0) 
ON CONFLICT DO NOTHING;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);

-- Función para actualizar las estadísticas del dashboard
CREATE OR REPLACE FUNCTION update_dashboard_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE dashboard_stats SET
        total_users = (SELECT COUNT(*) FROM users),
        total_events = (SELECT COUNT(*) FROM events),
        total_registrations = (SELECT COUNT(*) FROM registrations),
        updated_at = CURRENT_TIMESTAMP;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar estadísticas automáticamente
CREATE TRIGGER trigger_update_stats_users
    AFTER INSERT OR DELETE ON users
    FOR EACH STATEMENT EXECUTE FUNCTION update_dashboard_stats();

CREATE TRIGGER trigger_update_stats_events
    AFTER INSERT OR DELETE ON events
    FOR EACH STATEMENT EXECUTE FUNCTION update_dashboard_stats();

CREATE TRIGGER trigger_update_stats_registrations
    AFTER INSERT OR DELETE ON registrations
    FOR EACH STATEMENT EXECUTE FUNCTION update_dashboard_stats();

-- Mensaje de confirmación
-- Tablas creadas exitosamente para EcoEvents
-- Incluye: users, events, registrations, user_sessions, dashboard_stats
