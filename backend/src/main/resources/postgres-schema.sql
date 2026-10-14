-- =============================================================================
-- GramSeva — Digital Gram Panchayat Management System
-- PostgreSQL Production DDL Schema & Indexes
-- =============================================================================

CREATE TABLE IF NOT EXISTS panchayats (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    village VARCHAR(100) NOT NULL,
    block_taluka VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    pincode VARCHAR(10) NOT NULL,
    office_address VARCHAR(255),
    helpline_phone VARCHAR(20),
    official_email VARCHAR(100),
    sarpanch_name VARCHAR(100),
    secretary_name VARCHAR(100),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL,
    panchayat_id BIGINT REFERENCES panchayats(id) ON DELETE SET NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS citizens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    panchayat_id BIGINT REFERENCES panchayats(id) ON DELETE CASCADE,
    aadhaar_number VARCHAR(20) UNIQUE,
    ward_number VARCHAR(20) NOT NULL,
    house_number VARCHAR(50) NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    occupation VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
    id BIGSERIAL PRIMARY KEY,
    property_id VARCHAR(50) NOT NULL UNIQUE,
    panchayat_id BIGINT REFERENCES panchayats(id) ON DELETE CASCADE,
    owner_id BIGINT REFERENCES citizens(id) ON DELETE CASCADE,
    owner_name VARCHAR(100) NOT NULL,
    house_number VARCHAR(50) NOT NULL,
    ward_number VARCHAR(20) NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    construction_type VARCHAR(50) NOT NULL,
    carpet_area_sqft DOUBLE PRECISION NOT NULL,
    annual_rateable_value DOUBLE PRECISION NOT NULL,
    annual_tax_amount DOUBLE PRECISION NOT NULL,
    registration_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS water_connections (
    id BIGSERIAL PRIMARY KEY,
    connection_number VARCHAR(50) NOT NULL UNIQUE,
    panchayat_id BIGINT REFERENCES panchayats(id) ON DELETE CASCADE,
    citizen_id BIGINT REFERENCES citizens(id) ON DELETE CASCADE,
    property_id BIGINT REFERENCES properties(id) ON DELETE SET NULL,
    connection_type VARCHAR(50) NOT NULL,
    pipe_diameter_inch DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    ward_number VARCHAR(20) NOT NULL,
    monthly_fixed_rate DOUBLE PRECISION NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    installation_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tax_bills (
    id BIGSERIAL PRIMARY KEY,
    bill_number VARCHAR(50) NOT NULL UNIQUE,
    panchayat_id BIGINT REFERENCES panchayats(id) ON DELETE CASCADE,
    citizen_id BIGINT REFERENCES citizens(id) ON DELETE CASCADE,
    property_id BIGINT REFERENCES properties(id) ON DELETE SET NULL,
    water_connection_id BIGINT REFERENCES water_connections(id) ON DELETE SET NULL,
    tax_type VARCHAR(30) NOT NULL,
    financial_year VARCHAR(20) NOT NULL,
    period_label VARCHAR(50) NOT NULL,
    base_tax_amount DOUBLE PRECISION NOT NULL,
    sanitation_cess DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    lighting_cess DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    penalty_amount DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    rebate_amount DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total_amount DOUBLE PRECISION NOT NULL,
    amount_paid DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    due_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    notes VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL UNIQUE,
    tax_bill_id BIGINT NOT NULL REFERENCES tax_bills(id) ON DELETE RESTRICT,
    citizen_id BIGINT NOT NULL REFERENCES citizens(id) ON DELETE RESTRICT,
    panchayat_id BIGINT NOT NULL REFERENCES panchayats(id) ON DELETE RESTRICT,
    amount DOUBLE PRECISION NOT NULL,
    payment_mode VARCHAR(30) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
    gateway_reference VARCHAR(100),
    payment_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payer_mobile VARCHAR(20),
    payer_remarks VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS receipts (
    id BIGSERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    payment_id BIGINT NOT NULL UNIQUE REFERENCES payments(id) ON DELETE RESTRICT,
    tax_bill_id BIGINT NOT NULL REFERENCES tax_bills(id) ON DELETE RESTRICT,
    citizen_id BIGINT NOT NULL REFERENCES citizens(id) ON DELETE RESTRICT,
    panchayat_id BIGINT NOT NULL REFERENCES panchayats(id) ON DELETE RESTRICT,
    citizen_name VARCHAR(100) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    tax_type VARCHAR(30) NOT NULL,
    financial_year VARCHAR(20) NOT NULL,
    property_or_connection_ref VARCHAR(100),
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    digital_signature_hash VARCHAR(128) NOT NULL,
    pdf_file_path VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS complaints (
    id BIGSERIAL PRIMARY KEY,
    complaint_number VARCHAR(50) NOT NULL UNIQUE,
    panchayat_id BIGINT REFERENCES panchayats(id) ON DELETE CASCADE,
    citizen_id BIGINT REFERENCES citizens(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    ward_number VARCHAR(20) NOT NULL,
    location_details VARCHAR(255),
    photo_url VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    assigned_staff_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    assigned_staff_name VARCHAR(100),
    resolution_remarks TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    panchayat_id BIGINT REFERENCES panchayats(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    author_role VARCHAR(50) NOT NULL,
    publish_date DATE NOT NULL,
    expiry_date DATE,
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    attachment_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS water_supply_schedules (
    id BIGSERIAL PRIMARY KEY,
    panchayat_id BIGINT REFERENCES panchayats(id) ON DELETE CASCADE,
    ward_number VARCHAR(20) NOT NULL,
    area_name VARCHAR(100) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    pressure_rating VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    status VARCHAR(30) NOT NULL DEFAULT 'OPERATIONAL',
    interruption_reason VARCHAR(255),
    last_updated_by VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    panchayat_id BIGINT,
    user_id BIGINT,
    username VARCHAR(50),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    ip_address VARCHAR(45),
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
