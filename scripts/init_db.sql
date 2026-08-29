-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- This script runs on first container startup
-- Alembic migrations will handle actual schema creation
SELECT 'Migrant Saathi AI database initialized' AS status;
