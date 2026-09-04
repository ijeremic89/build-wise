CREATE TABLE contractors (
                             id BIGSERIAL PRIMARY KEY,
                             user_id BIGINT NOT NULL REFERENCES users(id),
                             name VARCHAR(255) NOT NULL,
                             company_name VARCHAR(255),
                             phone VARCHAR(50),
                             email VARCHAR(255),
                             note TEXT,
                             created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_contractors_user ON contractors(user_id);

CREATE TABLE todo_items (
                            id BIGSERIAL PRIMARY KEY,
                            user_id BIGINT NOT NULL REFERENCES users(id),
                            title VARCHAR(255) NOT NULL,
                            done BOOLEAN NOT NULL DEFAULT false,
                            due_date DATE,
                            created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_todo_items_user ON todo_items(user_id);
