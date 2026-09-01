CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE categories (
                            id BIGSERIAL PRIMARY KEY,
                            user_id BIGINT NOT NULL REFERENCES users(id),
                            name VARCHAR(100) NOT NULL,
                            planned_budget NUMERIC(12,2),
                            created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE subcategories (
                               id BIGSERIAL PRIMARY KEY,
                               category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
                               name VARCHAR(100) NOT NULL,
                               planned_budget NUMERIC(12,2)
);

CREATE TABLE expenses (
                          id BIGSERIAL PRIMARY KEY,
                          user_id BIGINT NOT NULL REFERENCES users(id),
                          category_id BIGINT NOT NULL REFERENCES categories(id),
                          subcategory_id BIGINT REFERENCES subcategories(id),
                          name VARCHAR(255) NOT NULL,
                          amount NUMERIC(12,2) NOT NULL,
                          date DATE NOT NULL,
                          status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
                          vendor VARCHAR(255),
                          note TEXT,
                          receipt_url VARCHAR(500),
                          created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_expenses_user ON expenses(user_id);