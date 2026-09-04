-- Sanctuary of Love Worship Center – Praise & Worship Treasury Schema
-- Supabase PostgreSQL with Row Level Security (RLS)

-- 1. Create Members Table
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY DEFAULT ('m-' || floor(extract(epoch from now()) * 1000)::text),
  name TEXT NOT NULL,
  phone TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Contributions Table
CREATE TABLE IF NOT EXISTS contributions (
  id TEXT PRIMARY KEY DEFAULT ('c-' || floor(extract(epoch from now()) * 1000)::text),
  member_id TEXT REFERENCES members(id) ON DELETE SET NULL,
  member_name TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('MONTHLY', 'TEA', 'TEA_URN', 'SPECIAL', 'OTHER')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  date_received DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY DEFAULT ('exp-' || floor(extract(epoch from now()) * 1000)::text),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Tea', 'Gift', 'Equipment', 'Transaction Cost', 'Transport', 'Event', 'Other')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create Special Projects Table
CREATE TABLE IF NOT EXISTS special_projects (
  id TEXT PRIMARY KEY DEFAULT ('proj-' || floor(extract(epoch from now()) * 1000)::text),
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT ('log-' || floor(extract(epoch from now()) * 1000)::text),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create System Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'primary_settings',
  organization_name TEXT NOT NULL DEFAULT 'Sanctuary of Love Worship Center',
  location TEXT NOT NULL DEFAULT 'Dandora, Kenya',
  team_name TEXT NOT NULL DEFAULT 'Praise & Worship',
  currency TEXT NOT NULL DEFAULT 'KES',
  expected_monthly NUMERIC NOT NULL DEFAULT 100,
  expected_tea NUMERIC NOT NULL DEFAULT 100,
  expected_tea_urn NUMERIC NOT NULL DEFAULT 200,
  opening_balance NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies: Allow Read & Write via Anon Client Key
-- Public Read (Transparency for all members)
CREATE POLICY "Allow public read members" ON members FOR SELECT USING (true);
CREATE POLICY "Allow public read contributions" ON contributions FOR SELECT USING (true);
CREATE POLICY "Allow public read expenses" ON expenses FOR SELECT USING (true);
CREATE POLICY "Allow public read special_projects" ON special_projects FOR SELECT USING (true);
CREATE POLICY "Allow public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow public read audit_logs" ON audit_logs FOR SELECT USING (true);

-- Treasurer Write (Insert, Update, Delete)
CREATE POLICY "Allow anon insert members" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update members" ON members FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete members" ON members FOR DELETE USING (true);

CREATE POLICY "Allow anon insert contributions" ON contributions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update contributions" ON contributions FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete contributions" ON contributions FOR DELETE USING (true);

CREATE POLICY "Allow anon insert expenses" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update expenses" ON expenses FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete expenses" ON expenses FOR DELETE USING (true);

CREATE POLICY "Allow anon write special_projects" ON special_projects FOR ALL USING (true);
CREATE POLICY "Allow anon write settings" ON settings FOR ALL USING (true);
CREATE POLICY "Allow anon write audit_logs" ON audit_logs FOR ALL USING (true);

-- 9. Insert Initial Default Settings Row
INSERT INTO settings (id, organization_name, location, team_name, currency, expected_monthly, expected_tea, expected_tea_urn, opening_balance)
VALUES ('primary_settings', 'Sanctuary of Love Worship Center', 'Dandora, Kenya', 'Praise & Worship', 'KES', 100, 100, 200, 0)
ON CONFLICT (id) DO NOTHING;

-- 10. Seed Initial 21 Members (Roster)
INSERT INTO members (id, name, active) VALUES
('m1', 'Min Enos Masasi', true),
('m2', 'Min Ann Musyoka', true),
('m3', 'Pst Priscah Enos', true),
('m4', 'Purity Murugi', true),
('m5', 'Denzel Gitonga', true),
('m6', 'Margerete Waithera', true),
('m7', 'Pst Lucas Omondi', true),
('m8', 'Ev Elijah Kariuki', true),
('m9', 'Quinter Adhiambo', true),
('m10', 'Huldah Mweni', true),
('m11', 'Pst Levies', true),
('m12', 'Pst Josephine Robert', true),
('m13', 'Cornel Otin', true),
('m14', 'Mary Cornel', true),
('m15', 'Nicholus Munyoki', true),
('m16', 'Derrington Okwomi', true),
('m17', 'Elizabeth Nyambura', true),
('m18', 'Janet Omondi', true),
('m19', 'Juliana Wayua', true),
('m20', 'Mwendwa', true),
('m21', 'Agnes Wambui', true)
ON CONFLICT (id) DO NOTHING;

-- 11. Seed Tea Urn Project as Completed
INSERT INTO special_projects (id, name, description, target_amount, status, notes)
VALUES ('proj-1', 'Tea Urn Drive', 'Fundraising for a 15L stainless steel commercial tea urn for overnight worship sessions.', 4200, 'COMPLETED', 'Purchased for KES 4,200. 7 members contributed KES 200 each (total KES 1,400). Remainder from general treasury.')
ON CONFLICT (id) DO NOTHING;
