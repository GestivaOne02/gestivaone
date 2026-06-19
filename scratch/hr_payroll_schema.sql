-- =========================================================================
-- MIGRACIÓN DE BASE DE DATOS: RECURSOS HUMANOS Y NÓMINA (GESTIVAONE)
-- Ejecuta este script en el editor SQL de Supabase
-- =========================================================================

-- Habilitar extensión UUID si no está instalada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Conceptos de Nómina
CREATE TABLE IF NOT EXISTS payroll_concepts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL, -- Tenant isolation
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('accrued', 'deduction')), -- accrued (devengado), deduction (deducido)
    formula TEXT NOT NULL, -- e.g. "salary * 0.04"
    is_system BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_company_concept_code UNIQUE (company_id, code)
);
CREATE INDEX IF NOT EXISTS idx_payroll_concepts_company ON payroll_concepts(company_id);

-- 2. Tabla de Empleados de RRHH (perfil laboral extendido de la empresa)
CREATE TABLE IF NOT EXISTS hr_employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL, -- Tenant isolation
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    document_id VARCHAR(50) NOT NULL,
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    termination_date DATE,
    salary NUMERIC(15, 2) NOT NULL DEFAULT 1300000.00, -- Salario Mínimo Legal Colombia 2026
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'candidate', 'suspended')),
    arl_class VARCHAR(20) DEFAULT 'clase_1', -- clase_1 a clase_5 para tarifas de riesgo laboral
    bank_account VARCHAR(100),
    bank_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_hr_employees_company ON hr_employees(company_id);

-- 3. Tabla de Corridas de Nómina (payroll_runs)
CREATE TABLE IF NOT EXISTS payroll_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL, -- Tenant isolation
    name VARCHAR(100) NOT NULL, -- e.g. "Nómina Junio 2026"
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'simulated', 'calculated', 'approved', 'paid')),
    total_accrued NUMERIC(15, 2) DEFAULT 0.00,
    total_deductions NUMERIC(15, 2) DEFAULT 0.00,
    total_net NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_company ON payroll_runs(company_id);

-- 4. Tabla de Resultados de Nómina por Empleado (payroll_results)
CREATE TABLE IF NOT EXISTS payroll_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL, -- Tenant isolation
    payroll_run_id UUID REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES hr_employees(id) ON DELETE CASCADE,
    salary_base NUMERIC(15, 2) NOT NULL,
    total_accrued NUMERIC(15, 2) NOT NULL,
    total_deductions NUMERIC(15, 2) NOT NULL,
    total_net NUMERIC(15, 2) NOT NULL,
    details_json JSONB, -- desglose detallado en JSON para auditoría histórica
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_payroll_results_company ON payroll_results(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_results_run ON payroll_results(payroll_run_id);

-- 5. Tabla de Ítems Detallados de Nómina (payroll_result_items)
CREATE TABLE IF NOT EXISTS payroll_result_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL, -- Tenant isolation
    payroll_result_id UUID REFERENCES payroll_results(id) ON DELETE CASCADE,
    concept_id UUID REFERENCES payroll_concepts(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('accrued', 'deduction')),
    amount NUMERIC(15, 2) NOT NULL,
    formula_applied TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_payroll_result_items_company ON payroll_result_items(company_id);

-- 6. Tabla de Vacaciones (hr_vacations)
CREATE TABLE IF NOT EXISTS hr_vacations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL, -- Tenant isolation
    employee_id UUID REFERENCES hr_employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    requested_days INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_hr_vacations_company ON hr_vacations(company_id);

-- 7. Tabla de Candidatos de Reclutamiento (hr_recruitment_candidates)
CREATE TABLE IF NOT EXISTS hr_recruitment_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL, -- Tenant isolation
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    position VARCHAR(100) NOT NULL,
    stage VARCHAR(20) DEFAULT 'applied' CHECK (stage IN ('applied', 'interview', 'offer', 'hired', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_hr_recruitment_company ON hr_recruitment_candidates(company_id);

-- 8. Tabla de Suscripciones (para validación de límites)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL UNIQUE,
    plan VARCHAR(50) NOT NULL DEFAULT 'free', -- free, basic, pro, one360
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    active_employees_limit INTEGER DEFAULT 5,
    payroll_runs_limit INTEGER DEFAULT 1,
    billing_period_start DATE,
    billing_period_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_company ON subscriptions(company_id);

-- 9. Tabla de Tracking de Uso
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'active_employees', 'payroll_runs', 'ia_queries'
    current_usage INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_company ON usage_tracking(company_id);

-- =========================================================================
-- CONFIGURACIÓN DE SEGURIDAD (RLS - Row Level Security)
-- =========================================================================

-- Activar RLS en todas las nuevas tablas
ALTER TABLE payroll_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_result_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_vacations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_recruitment_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Crear políticas básicas basadas en el company_id del usuario autenticado
-- Se asume la existencia de la función get_user_company_id() en Supabase
-- Si no existe, las políticas pueden hacer un join directo con profiles:
-- (company_id = (select company_id from profiles where id = auth.uid()))

CREATE POLICY "Aislamiento por Empresa en payroll_concepts" ON payroll_concepts
    FOR ALL USING (company_id = (select company_id from profiles where id = auth.uid()));

CREATE POLICY "Aislamiento por Empresa en hr_employees" ON hr_employees
    FOR ALL USING (company_id = (select company_id from profiles where id = auth.uid()));

CREATE POLICY "Aislamiento por Empresa en payroll_runs" ON payroll_runs
    FOR ALL USING (company_id = (select company_id from profiles where id = auth.uid()));

CREATE POLICY "Aislamiento por Empresa en payroll_results" ON payroll_results
    FOR ALL USING (company_id = (select company_id from profiles where id = auth.uid()));

CREATE POLICY "Aislamiento por Empresa en payroll_result_items" ON payroll_result_items
    FOR ALL USING (company_id = (select company_id from profiles where id = auth.uid()));

CREATE POLICY "Aislamiento por Empresa en hr_vacations" ON hr_vacations
    FOR ALL USING (company_id = (select company_id from profiles where id = auth.uid()));

CREATE POLICY "Aislamiento por Empresa en hr_recruitment_candidates" ON hr_recruitment_candidates
    FOR ALL USING (company_id = (select company_id from profiles where id = auth.uid()));

CREATE POLICY "Aislamiento por Empresa en subscriptions" ON subscriptions
    FOR ALL USING (company_id = (select company_id from profiles where id = auth.uid()));

CREATE POLICY "Aislamiento por Empresa en usage_tracking" ON usage_tracking
    FOR ALL USING (company_id = (select company_id from profiles where id = auth.uid()));
