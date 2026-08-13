// Hand-written mirror of supabase/migrations/0001_init.sql.
// If the schema changes, update this alongside the migration — there's no
// live codegen wired up here.
//
// Shape follows @supabase/postgrest-js's GenericTable/GenericSchema
// contract (Row/Insert/Update/Relationships per table) so the typed
// `createClient<Database>()` calls in src/lib/supabase.ts resolve properly
// instead of silently degrading to `never`.

export type GroupType = 'family_group' | 'golf_group';
export type FamilyRole = 'owner' | 'member';
export type MatchStatus = 'open' | 'planned' | 'declined';
export type MatchResponse = 'pending' | 'host' | 'suggest_activity' | 'declined';
export type GolfTimeWindow = 'morning' | 'afternoon' | 'evening' | 'flexible';
export type GolfSessionStatus = 'proposed' | 'confirmed' | 'cancelled';
export type GolfRsvpStatus = 'in' | 'maybe' | 'out';
export type ChatContextType = 'match' | 'golf_session';

// Tables that are only ever written by DB triggers — the app reads them but
// never inserts directly, so Insert/Update are intentionally uninhabited.
type NotDirectlyWritable = Record<string, never>;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          avatar_url?: string | null;
          phone?: string | null;
        };
        Update: {
          full_name?: string;
          avatar_url?: string | null;
          phone?: string | null;
        };
        Relationships: [];
      };
      families: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by: string;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
      family_members: {
        Row: {
          family_id: string;
          profile_id: string;
          role: FamilyRole;
          joined_at: string;
        };
        Insert: {
          family_id: string;
          profile_id: string;
          role?: FamilyRole;
        };
        Update: {
          role?: FamilyRole;
        };
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          name: string;
          type: GroupType;
          invite_code: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: GroupType;
          created_by: string;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          profile_id: string;
          family_id: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          profile_id: string;
          family_id?: string | null;
        };
        Update: {
          family_id?: string | null;
        };
        Relationships: [];
      };
      family_availability: {
        Row: {
          id: string;
          group_id: string;
          family_id: string;
          date: string;
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          family_id: string;
          date: string;
          note?: string | null;
          created_by: string;
        };
        Update: {
          note?: string | null;
        };
        Relationships: [];
      };
      golf_availability: {
        Row: {
          id: string;
          group_id: string;
          profile_id: string;
          date: string;
          time_window: GolfTimeWindow;
          course_preference: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          profile_id: string;
          date: string;
          time_window?: GolfTimeWindow;
          course_preference?: string | null;
        };
        Update: {
          time_window?: GolfTimeWindow;
          course_preference?: string | null;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          group_id: string;
          date: string;
          status: MatchStatus;
          created_at: string;
        };
        Insert: NotDirectlyWritable;
        Update: {
          status?: MatchStatus;
        };
        Relationships: [];
      };
      match_participants: {
        Row: {
          match_id: string;
          family_id: string;
          response: MatchResponse;
          responded_at: string | null;
        };
        Insert: NotDirectlyWritable;
        Update: {
          response?: MatchResponse;
          responded_at?: string | null;
        };
        Relationships: [];
      };
      activity_suggestions: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string | null;
          created_at: string;
        };
        Insert: NotDirectlyWritable;
        Update: NotDirectlyWritable;
        Relationships: [];
      };
      golf_sessions: {
        Row: {
          id: string;
          group_id: string;
          date: string;
          time_window: string | null;
          course: string | null;
          status: GolfSessionStatus;
          created_by: string | null;
          created_at: string;
        };
        Insert: NotDirectlyWritable;
        Update: {
          time_window?: string | null;
          course?: string | null;
          status?: GolfSessionStatus;
        };
        Relationships: [];
      };
      golf_session_participants: {
        Row: {
          session_id: string;
          profile_id: string;
          status: GolfRsvpStatus;
          joined_at: string;
        };
        Insert: {
          session_id: string;
          profile_id: string;
          status?: GolfRsvpStatus;
        };
        Update: {
          status?: GolfRsvpStatus;
        };
        Relationships: [];
      };
      chats: {
        Row: {
          id: string;
          context_type: ChatContextType;
          context_id: string;
          created_at: string;
        };
        Insert: NotDirectlyWritable;
        Update: NotDirectlyWritable;
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string | null;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          sender_id: string;
          body: string;
        };
        Update: NotDirectlyWritable;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Family = Database['public']['Tables']['families']['Row'];
export type FamilyMember = Database['public']['Tables']['family_members']['Row'];
export type Group = Database['public']['Tables']['groups']['Row'];
export type GroupMember = Database['public']['Tables']['group_members']['Row'];
export type FamilyAvailability = Database['public']['Tables']['family_availability']['Row'];
export type GolfAvailability = Database['public']['Tables']['golf_availability']['Row'];
export type Match = Database['public']['Tables']['matches']['Row'];
export type MatchParticipant = Database['public']['Tables']['match_participants']['Row'];
export type ActivitySuggestion = Database['public']['Tables']['activity_suggestions']['Row'];
export type GolfSession = Database['public']['Tables']['golf_sessions']['Row'];
export type GolfSessionParticipant = Database['public']['Tables']['golf_session_participants']['Row'];
export type Chat = Database['public']['Tables']['chats']['Row'];
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
