-- Seed data for development
-- This assumes you have created a test user in Supabase Auth already
-- Replace the UUIDs with your actual user IDs

-- Sample show: "Rocke Ulven"
INSERT INTO shows (id, title, description, year, published) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Rocke Ulven', 'En musikalsk forestilling om ulven som ikke ville være slem. Med to lag — gule og blå — hver med sin unike fremføring.', 2025, true);

-- Teams for Rocke Ulven
INSERT INTO teams (id, show_id, name, color, description) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Gult lag', '#eab308', 'Det gule laget sin versjon av Rocke Ulven'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Blått lag', '#3b82f6', 'Det blå laget sin versjon av Rocke Ulven');

-- Videos for Gult lag
INSERT INTO videos (id, team_id, title, description, youtube_url, price, sort_order, published) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Rocke Ulven - Akt 1 (Gul)', 'Første akt av Rocke Ulven fremført av det gule laget', NULL, 149, 1, true),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Rocke Ulven - Akt 2 (Gul)', 'Andre akt av Rocke Ulven fremført av det gule laget', NULL, 149, 2, true),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Rocke Ulven - Hele forestillingen (Gul)', 'Hele Rocke Ulven forestillingen med det gule laget', NULL, 249, 0, true);

-- Videos for Blått lag
INSERT INTO videos (id, team_id, title, description, youtube_url, price, sort_order, published) VALUES
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'Rocke Ulven - Akt 1 (Blå)', 'Første akt av Rocke Ulven fremført av det blå laget', NULL, 149, 1, true),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'Rocke Ulven - Akt 2 (Blå)', 'Andre akt av Rocke Ulven fremført av det blå laget', NULL, 149, 2, true),
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'Rocke Ulven - Hele forestillingen (Blå)', 'Hele Rocke Ulven forestillingen med det blå laget', NULL, 249, 0, true);

-- Make first user admin (replace with actual user ID after signup)
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
