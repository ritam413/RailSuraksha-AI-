# IRIS AI — Database Schema & Data Models

**System Name:** IRIS AI (Intelligent Railway Inspection and Restoration AI): Automatic Block Planning & Corridor Optimization  
**Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
**Document Version:** 3.1.0 (Grounded Multi-Horizon & Decoupled Architecture Specification)  
**Database Engine:** PostgreSQL 16 / Supabase / Embedded SQLite (Local Dev)  
**Governing Standards Reference:** IRPWM 2020, ACTM Vol II, IRSEM 2021, G&SR Chapter 15, RDSO/SPN/196/2020 Kavach Ver 4.0.

---

## 🗄️ 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    POLICY_CONFIGURATIONS ||--o{ JOINT_BLOCK_PLANS : governs
    ADAPTER_MAPPINGS ||--o{ MAINTENANCE_DEMANDS : transforms
    DEPARTMENTS ||--o{ MAINTENANCE_DEMANDS : submits
    TRACK_SECTIONS ||--|{ TRACK_CIRCUITS : contains
    TRACK_CIRCUITS ||--o{ MAINTENANCE_DEMANDS : maps_to
    TRACK_SECTIONS ||--o{ JOINT_BLOCK_PLANS : schedules
    JOINT_BLOCK_PLANS ||--|{ BUNDLED_DEMAND_MAPPINGS : contains
    MAINTENANCE_DEMANDS ||--o{ BUNDLED_DEMAND_MAPPINGS : bundled_into
    JOINT_BLOCK_PLANS ||--o{ KAVACH_TSR_RECORDS : generates
    JOINT_BLOCK_PLANS ||--|| DECISION_DOSSIERS : seals
    TRAIN_SCHEDULES ||--o{ TRACK_CIRCUITS : occupies

    POLICY_CONFIGURATIONS {
        string id PK "POL-CR-MUMBAI-2026-V1"
        string division_code "CR_MUMBAI"
        string version "1.2.0"
        int min_passenger_clearance_min "15"
        int ohe_earthing_buffer_min "10"
        int ohe_restoration_buffer_min "10"
        int default_tsr_speed_kmh "30"
        jsonb urgency_weights
        decimal secondary_delay_penalty_weight
        boolean is_locked
    }

    ADAPTER_MAPPINGS {
        string id PK
        string source_system "TMS | TDMS | SMMS | COA | CSV"
        string schema_version "1.0.0"
        jsonb field_mappings
        jsonb transformation_rules
    }

    DEPARTMENTS {
        string id PK
        string code UK "TMS_CIVIL | TDMS_ELECTRICAL | SMMS_SIGNAL"
        string name
        string directorate
    }

    TRACK_SECTIONS {
        string id PK "SEC-KYN-01"
        string corridor_name "CSMT-KYN-UP"
        decimal start_km
        decimal end_km
        int track_count
        jsonb metadata
    }

    TRACK_CIRCUITS {
        string id PK "TC-03"
        string section_id FK
        string name "Dadar Track Circuit"
        decimal start_km
        decimal end_km
        string status "CLEAR | OCCUPIED | BLOCKED_TSR"
        string signal_aspect "GREEN | YELLOW | DOUBLE_YELLOW | RED"
        jsonb metadata
    }

    MAINTENANCE_DEMANDS {
        string id PK "TMS-2026-804"
        string department_code FK
        string asset_type "RAIL_TRACK | OHE_CATENARY | POINT_MACHINE"
        string track_circuit_id FK
        string chainage_km "KM 108/4 - 112/2"
        string urgency_tier "P1_CRITICAL | P2_SCHEDULED | P3_ROUTINE"
        decimal urgency_score
        decimal tgi_score
        string usfd_class "IMR | OBS | REM"
        int duration_minutes
        jsonb required_assets "['CSM_TAMPER', 'GANG_04']"
        boolean can_shadow_block
        string status "PENDING_TRIAGE | SLOTTED | SANCTIONED | COMPLETED"
        jsonb raw_payload
        jsonb metadata
        timestamp created_at
    }

    TRAIN_SCHEDULES {
        string id PK
        string train_number "12127"
        string train_name "Intercity Express"
        string train_type "PREMIUM | EXPRESS | SUBURBAN | FREIGHT"
        int priority_rank
        string section_id FK
        timestamp entry_time
        timestamp exit_time
        int max_allowable_delay_min
        jsonb metadata
    }

    JOINT_BLOCK_PLANS {
        string id PK "BLK-JOINT-0906-01"
        string section_id FK
        string policy_id FK
        timestamp start_time
        timestamp end_time
        int duration_minutes
        int downtime_saved_minutes
        int passenger_delays "Strictly 0"
        int freight_delay_minutes
        int kavach_tsr_speed_kmh "30"
        string sanction_status "RECOMMENDED | SANCTIONED | REJECTED"
        string sanctioned_by "CTRL-MUM-402"
        string sha256_audit_seal
        jsonb metadata
        timestamp sanctioned_at
    }

    BUNDLED_DEMAND_MAPPINGS {
        string id PK
        string block_id FK
        string demand_id FK
    }

    KAVACH_TSR_RECORDS {
        string id PK "TSR-KAVACH-104"
        string block_id FK
        string track_circuit_id FK
        int permitted_speed_kmh "30"
        string broadcast_status "ARMED | BROADCASTING | CLEARED"
        timestamp broadcast_timestamp
    }

    DECISION_DOSSIERS {
        string id PK
        string block_id FK UK
        jsonb step_1_ingestion_evidence
        jsonb step_2_conflict_analysis
        jsonb step_3_shadow_bundling
        jsonb step_4_safety_actuation
        string sha256_verification_hash
        timestamp created_at
    }
```

---

## 📜 2. SQL Schema DDL Definitions

```sql
-- 1. Policy Configurations Table (Decoupled Rules)
CREATE TABLE policy_configurations (
    id VARCHAR(50) PRIMARY KEY, -- 'POL-CR-MUMBAI-2026-V1'
    division_code VARCHAR(30) NOT NULL,
    version VARCHAR(20) NOT NULL,
    min_passenger_clearance_min INTEGER DEFAULT 15,
    ohe_earthing_buffer_min INTEGER DEFAULT 10,
    ohe_restoration_buffer_min INTEGER DEFAULT 10,
    default_tsr_speed_kmh INTEGER DEFAULT 30,
    urgency_weights JSONB DEFAULT '{"safety": 0.40, "overdue": 0.35, "traffic": 0.25}'::jsonb,
    secondary_delay_penalty_weight NUMERIC(4, 2) DEFAULT 1.50,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Adapter Mappings Table (Pluggable Ingestion Schemas)
CREATE TABLE adapter_mappings (
    id VARCHAR(50) PRIMARY KEY,
    source_system VARCHAR(30) NOT NULL, -- 'TMS', 'TDMS', 'SMMS', 'COA'
    schema_version VARCHAR(20) NOT NULL,
    field_mappings JSONB NOT NULL,
    transformation_rules JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Departments Table
CREATE TABLE departments (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL, -- 'TMS_CIVIL', 'TDMS_ELECTRICAL', 'SMMS_SIGNAL'
    name VARCHAR(100) NOT NULL,
    directorate VARCHAR(100) NOT NULL
);

-- 4. Track Sections Table
CREATE TABLE track_sections (
    id VARCHAR(50) PRIMARY KEY,
    corridor_name VARCHAR(100) NOT NULL,
    start_km NUMERIC(7, 3) NOT NULL,
    end_km NUMERIC(7, 3) NOT NULL,
    track_count INTEGER DEFAULT 2,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 5. Track Circuits Table
CREATE TABLE track_circuits (
    id VARCHAR(50) PRIMARY KEY, -- 'TC-01' .. 'TC-06'
    section_id VARCHAR(50) REFERENCES track_sections(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_km NUMERIC(7, 3) NOT NULL,
    end_km NUMERIC(7, 3) NOT NULL,
    status VARCHAR(30) DEFAULT 'CLEAR', -- 'CLEAR', 'OCCUPIED', 'BLOCKED_TSR'
    signal_aspect VARCHAR(30) DEFAULT 'GREEN', -- 'GREEN', 'YELLOW', 'DOUBLE_YELLOW', 'RED'
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 6. Maintenance Demands Table
CREATE TABLE maintenance_demands (
    id VARCHAR(50) PRIMARY KEY, -- 'TMS-2026-804'
    department_code VARCHAR(30) REFERENCES departments(code),
    asset_type VARCHAR(50) NOT NULL,
    track_circuit_id VARCHAR(50) REFERENCES track_circuits(id),
    chainage_km VARCHAR(50) NOT NULL,
    urgency_tier VARCHAR(20) NOT NULL, -- 'P1_CRITICAL', 'P2_SCHEDULED', 'P3_ROUTINE'
    urgency_score NUMERIC(4, 3) NOT NULL,
    tgi_score NUMERIC(5, 2),
    usfd_class VARCHAR(10), -- 'IMR', 'OBS', 'REM'
    duration_minutes INTEGER NOT NULL,
    required_assets JSONB DEFAULT '[]'::jsonb,
    can_shadow_block BOOLEAN DEFAULT true,
    status VARCHAR(30) DEFAULT 'PENDING_TRIAGE',
    raw_payload JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Joint Block Plans Table
CREATE TABLE joint_block_plans (
    id VARCHAR(50) PRIMARY KEY, -- 'BLK-JOINT-0906-01'
    section_id VARCHAR(50) REFERENCES track_sections(id),
    policy_id VARCHAR(50) REFERENCES policy_configurations(id),
    version INTEGER DEFAULT 1, -- Optimistic concurrency lock token
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    downtime_saved_minutes INTEGER NOT NULL,
    passenger_delays INTEGER DEFAULT 0,
    freight_delay_minutes INTEGER DEFAULT 0,
    kavach_tsr_speed_kmh INTEGER DEFAULT 30,
    sanction_status VARCHAR(30) DEFAULT 'RECOMMENDED',
    sanctioned_by VARCHAR(50),
    sha256_audit_seal VARCHAR(64),
    metadata JSONB DEFAULT '{}'::jsonb,
    sanctioned_at TIMESTAMP WITH TIME ZONE
);

-- 8. Bundled Demand Mappings Table
CREATE TABLE bundled_demand_mappings (
    id VARCHAR(36) PRIMARY KEY,
    block_id VARCHAR(50) REFERENCES joint_block_plans(id) ON DELETE CASCADE,
    demand_id VARCHAR(50) REFERENCES maintenance_demands(id) ON DELETE CASCADE
);

-- 9. Kavach TSR Records Table
CREATE TABLE kavach_tsr_records (
    id VARCHAR(50) PRIMARY KEY,
    block_id VARCHAR(50) REFERENCES joint_block_plans(id) ON DELETE CASCADE,
    track_circuit_id VARCHAR(50) REFERENCES track_circuits(id),
    permitted_speed_kmh INTEGER NOT NULL DEFAULT 30,
    broadcast_status VARCHAR(30) DEFAULT 'ARMED',
    broadcast_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Explainable Decision Dossiers Table
CREATE TABLE decision_dossiers (
    id VARCHAR(36) PRIMARY KEY,
    block_id VARCHAR(50) UNIQUE REFERENCES joint_block_plans(id) ON DELETE CASCADE,
    step_1_ingestion_evidence JSONB NOT NULL,
    step_2_conflict_analysis JSONB NOT NULL,
    step_3_shadow_bundling JSONB NOT NULL,
    step_4_safety_actuation JSONB NOT NULL,
    sha256_verification_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Dead-Letter Ingestion Queue Table (Unparseable / Corrupt Feeds)
CREATE TABLE dead_letter_ingestion_queue (
    id VARCHAR(50) PRIMARY KEY,
    source_system VARCHAR(30) NOT NULL, -- 'TMS', 'TDMS', 'SMMS', 'COA'
    error_reason VARCHAR(255) NOT NULL, -- 'UNRESOLVED_SPATIAL_CHAINAGE', 'MALFORMED_SCHEMA'
    raw_payload JSONB NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT false,
    resolved_by VARCHAR(50),
    resolved_at TIMESTAMP WITH TIME ZONE
);
```


