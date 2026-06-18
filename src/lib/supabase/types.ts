export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Omit<Profile, "id">>;
        Relationships: [];
      };
      shows: {
        Row: Show;
        Insert: Omit<Show, "id" | "created_at">;
        Update: Partial<Omit<Show, "id">>;
        Relationships: [];
      };
      teams: {
        Row: Team;
        Insert: Omit<Team, "id" | "created_at">;
        Update: Partial<Omit<Team, "id">>;
        Relationships: [];
      };
      videos: {
        Row: Video;
        Insert: Omit<Video, "id" | "created_at">;
        Update: Partial<Omit<Video, "id">>;
        Relationships: [];
      };
      purchases: {
        Row: Purchase;
        Insert: Omit<Purchase, "id" | "created_at">;
        Update: Partial<Omit<Purchase, "id">>;
        Relationships: [];
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | "created_at">;
        Update: Partial<Omit<Subscription, "id">>;
        Relationships: [];
      };
      qr_codes: {
        Row: QrCode;
        Insert: Omit<QrCode, "id" | "created_at" | "current_uses">;
        Update: Partial<Omit<QrCode, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "user" | "admin";
      subscription_type: "monthly" | "yearly";
    };
    CompositeTypes: Record<string, never>;
  };
}

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: "user" | "admin";
  created_at: string;
}

export interface Show {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  year: number;
  published: boolean;
  created_at: string;
}

export interface Team {
  id: string;
  show_id: string;
  name: string;
  color: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Video {
  id: string;
  team_id: string;
  title: string;
  description: string | null;
  youtube_url: string | null;
  vimeo_url: string | null;
  price: number;
  sort_order: number;
  published: boolean;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  video_id: string | null;
  subscription_id: string | null;
  qr_code_id: string | null;
  price_paid: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  type: "monthly" | "yearly";
  start_date: string;
  end_date: string;
  active: boolean;
  created_at: string;
}

export interface QrCode {
  id: string;
  video_id: string;
  code: string;
  discount_percentage: number;
  is_free: boolean;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  created_by: string;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface TeamRole {
  id: string;
  team_id: string;
  role_id: string;
  character_name: string | null;
  sort_order: number;
  created_at: string;
}
