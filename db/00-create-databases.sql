-- ============================
-- CREACION DE BASES DE DATOS
-- ============================

-- Crear base de datos para Keycloak
SELECT 'CREATE DATABASE keycloak_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'keycloak_db')\gexec

-- Nota: La base de datos principal (bolsa-horas-db) se crea automáticamente
-- por la variable POSTGRES_DB en docker-compose.yaml
