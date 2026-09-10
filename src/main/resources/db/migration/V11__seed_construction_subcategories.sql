-- Fix up subcategories that were already added by hand with slightly different
-- names/spellings, so this migration converges to the same end state whether
-- run against a fresh database or one that already has manual data.

UPDATE subcategories SET name = 'Priključak struje'
WHERE name = 'Prikljucak struje'
  AND category_id = (SELECT id FROM categories WHERE name = 'Papiri/Priključci' AND user_id = 1);

UPDATE subcategories SET name = 'Priključak vode'
WHERE name = 'Prikljucak vode'
  AND category_id = (SELECT id FROM categories WHERE name = 'Papiri/Priključci' AND user_id = 1);

UPDATE subcategories SET name = 'Unutarnja stolarija'
WHERE name = 'Unutarnja vrata'
  AND category_id = (SELECT id FROM categories WHERE name = 'Stolarija' AND user_id = 1);

UPDATE subcategories SET name = 'Kompletan razvod cijevi'
WHERE name = 'Kompletan razvod hidroinstalacija'
  AND category_id = (SELECT id FROM categories WHERE name = 'Hidroinstalacije' AND user_id = 1);

UPDATE subcategories SET name = 'Gletanje'
WHERE name = 'Gletanje + farbanje'
  AND category_id = (SELECT id FROM categories WHERE name = 'Unutarnji radovi' AND user_id = 1);

UPDATE subcategories SET name = 'Hidroizolacija'
WHERE name = 'Hidroizolacija poda'
  AND category_id = (SELECT id FROM categories WHERE name = 'Unutarnji radovi' AND user_id = 1);

UPDATE subcategories SET name = 'Keramika'
WHERE name = 'Keramika wc + kuhinja + balkon'
  AND category_id = (SELECT id FROM categories WHERE name = 'Unutarnji radovi' AND user_id = 1);

UPDATE subcategories SET name = 'Podovi parket/vinil'
WHERE name = 'Podovi vinil/parket'
  AND category_id = (SELECT id FROM categories WHERE name = 'Unutarnji radovi' AND user_id = 1);

-- 'Hidroizolacija wc + balkon' is now redundant with the renamed 'Hidroizolacija' above.
DELETE FROM subcategories
WHERE name = 'Hidroizolacija wc + balkon'
  AND category_id = (SELECT id FROM categories WHERE name = 'Unutarnji radovi' AND user_id = 1);

-- Unutarnji grubi radovi -> Unutarnji radovi (no-op if already renamed by hand)
UPDATE categories SET name = 'Unutarnji radovi' WHERE name = 'Unutarnji grubi radovi' AND user_id = 1;

-- Unutarnji fini radovi - remove (no-op if already removed by hand)
DELETE FROM categories WHERE name = 'Unutarnji fini radovi' AND user_id = 1;

-- Solar/Baterije - new category, split out of Grijanje/Hlađenje
INSERT INTO categories (user_id, name, description)
SELECT 1, 'Solar/Baterije', 'Fotonaponski sustav i baterijsko skladištenje energije.'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Solar/Baterije' AND user_id = 1);

UPDATE subcategories SET category_id = (SELECT id FROM categories WHERE name = 'Solar/Baterije' AND user_id = 1)
WHERE name IN ('Solarni paneli', 'Baterije')
  AND category_id = (SELECT id FROM categories WHERE name = 'Grijanje/Hlađenje' AND user_id = 1);

-- Insert every required subcategory that isn't already present under its category.
INSERT INTO subcategories (category_id, name)
SELECT c.category_id, v.name
FROM (VALUES
    ('Papiri/Priključci', 'Geodet'),
    ('Papiri/Priključci', 'Građevinska dozvola'),
    ('Papiri/Priključci', 'Nadzor'),
    ('Papiri/Priključci', 'Projekt'),
    ('Papiri/Priključci', 'Priključak vode'),
    ('Papiri/Priključci', 'Priključak struje'),
    ('Papiri/Priključci', 'Priključak interneta i telefona'),
    ('Papiri/Priključci', 'Komunalni i vodni doprinos'),
    ('Roh-Bau', 'Ruke'),
    ('Roh-Bau', 'Materijal'),
    ('Roh-Bau', 'Limarija'),
    ('Stolarija', 'Vanjska stolarija'),
    ('Stolarija', 'Unutarnja stolarija'),
    ('Hidroinstalacije', 'Kompletan razvod cijevi'),
    ('Hidroinstalacije', 'Septička'),
    ('Grijanje/Hlađenje', 'Podno grijanje'),
    ('Grijanje/Hlađenje', 'Dizalica topline'),
    ('Grijanje/Hlađenje', 'Klima uređaji'),
    ('Solar/Baterije', 'Solarni paneli'),
    ('Solar/Baterije', 'Baterije'),
    ('Unutarnji radovi', 'Hidroizolacija'),
    ('Unutarnji radovi', 'Termoizolacija poda'),
    ('Unutarnji radovi', 'Estrih'),
    ('Unutarnji radovi', 'Žbukanje'),
    ('Unutarnji radovi', 'Gletanje'),
    ('Unutarnji radovi', 'Farbanje'),
    ('Unutarnji radovi', 'Unutarnje klupice'),
    ('Unutarnji radovi', 'Keramika'),
    ('Unutarnji radovi', 'Sanitarije'),
    ('Unutarnji radovi', 'Podovi parket/vinil'),
    ('Unutarnji radovi', 'Stepenice + ograda'),
    ('Okućnica', 'Zidovi oko kuće')
) AS v(category_name, name)
CROSS JOIN LATERAL (
    SELECT id AS category_id FROM categories WHERE name = v.category_name AND user_id = 1
) c
WHERE NOT EXISTS (
    SELECT 1 FROM subcategories s WHERE s.category_id = c.category_id AND s.name = v.name
);
