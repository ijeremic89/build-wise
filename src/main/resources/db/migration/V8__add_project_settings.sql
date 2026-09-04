CREATE TABLE project_settings (
                                  id BIGSERIAL PRIMARY KEY,
                                  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
                                  planned_construction_cost NUMERIC(12,2) NOT NULL DEFAULT 250000
);

INSERT INTO project_settings (user_id, planned_construction_cost)
SELECT id, 250000 FROM users;
