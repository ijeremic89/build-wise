CREATE TABLE attachments (
                             id BIGSERIAL PRIMARY KEY,
                             user_id BIGINT NOT NULL REFERENCES users(id),
                             owner_type VARCHAR(20) NOT NULL,
                             owner_id BIGINT NOT NULL,
                             file_name VARCHAR(255) NOT NULL,
                             content_type VARCHAR(100) NOT NULL,
                             file_size BIGINT NOT NULL,
                             storage_path VARCHAR(500) NOT NULL,
                             created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_attachments_owner ON attachments(owner_type, owner_id);
