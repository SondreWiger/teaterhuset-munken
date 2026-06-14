-- Show scheduling: publish_at timestamp + video bundles
ALTER TABLE shows ADD COLUMN publish_at TIMESTAMPTZ;
ALTER TABLE shows ADD COLUMN bundle_price NUMERIC(10, 2);

-- Gift cards / discount codes
CREATE TABLE gift_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  credit_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_percentage INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gift_cards_code ON gift_cards(code);

ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage gift cards"
  ON gift_cards FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Video trailer/preview URL
ALTER TABLE videos ADD COLUMN trailer_url TEXT;

-- Subscription settings
ALTER TABLE subscriptions ADD COLUMN price NUMERIC(10, 2) NOT NULL DEFAULT 99;
