ALTER TABLE expenses
    ADD COLUMN contractor_id BIGINT REFERENCES contractors(id);

ALTER TABLE expenses
    DROP COLUMN vendor;
