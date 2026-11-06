-- V16: Add revocation fields to certificates table
ALTER TABLE certificates ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'VALID';
ALTER TABLE certificates ADD COLUMN revoked_at DATETIME(6) NULL DEFAULT NULL;
ALTER TABLE certificates ADD COLUMN revoked_by BIGINT NULL DEFAULT NULL;
ALTER TABLE certificates ADD COLUMN revoke_reason VARCHAR(500) NULL DEFAULT NULL;

CREATE INDEX idx_certificates_status ON certificates(status);

