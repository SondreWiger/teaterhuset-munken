-- Roles table (reusable role definitions like "Regissør", "Skuespiller", etc.)
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team roles junction table (links roles to teams, with optional character name)
CREATE TABLE team_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  actor_name TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, role_id, actor_name)
);

-- Indexes
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_team_roles_team_id ON team_roles(team_id);
CREATE INDEX idx_team_roles_role_id ON team_roles(role_id);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_roles ENABLE ROW LEVEL SECURITY;

-- Roles: public can read, admins can CRUD
CREATE POLICY "Public can read roles"
  ON roles FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert roles"
  ON roles FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update roles"
  ON roles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete roles"
  ON roles FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Team roles: public can read, admins can CRUD
CREATE POLICY "Public can read team roles"
  ON team_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      JOIN shows ON shows.id = teams.show_id
      WHERE teams.id = team_roles.team_id AND shows.published = true
    )
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert team roles"
  ON team_roles FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update team roles"
  ON team_roles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete team roles"
  ON team_roles FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
