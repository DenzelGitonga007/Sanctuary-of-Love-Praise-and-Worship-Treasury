-- Sanctuary of Love Worship Center – Praise & Worship Treasury Schema
-- Supabase PostgreSQL with Row Level Security (RLS)

-- 1. Create Members Table
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Contributions Table
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Tea', 'Gift', 'Equipment', 'Transaction Cost', 'Transport', 'Event', 'Other')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create System Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 6. Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies: Public Read Access (Everyone can see transparency records)
CREATE POLICY "Allow public read access to members" ON members FOR SELECT USING (true);
CREATE POLICY "Allow public read access to contributions" ON contributions FOR SELECT USING (true);
CREATE POLICY "Allow public read access to expenses" ON expenses FOR SELECT USING (true);
CREATE POLICY "Allow public read access to settings" ON settings FOR SELECT USING (true);

-- 8. RLS Policies: Authenticated Admin Full Access
CREATE POLICY "Allow authenticated users full access to members" ON members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to contributions" ON contributions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to expenses" ON expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to audit_logs" ON audit_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to settings" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- 9. Seed Initial 21 Members
INSERT INTO members (name, active) VALUES
('Min Enos Masasi', true),
('Min Ann Musyoka', true),
('Pst Priscah Enos', true),
('Purity Murugi', true),
('Denzel Gitonga', true),
('Margerete Waithera', true),
('Pst Lucas Omondi', true),
('Ev Elijah Kariuki', true),
('Quinter Adhiambo', true),
('Huldah Mweni', true),
('Pst Levies', true),
('Pst Josephine Robert', true),
('Cornel Otin', true),
('Mary Cornel', true),
('Nicholus Munyoki', true),
('Derrington Okwomi', true),
('Elizabeth Nyambura', true),
('Janet Omondi', true),
('Juliana Wayua', true),
('Mwendwa', true),
('Agnes Wambui', true)
ON CONFLICT DO NOTHING;
