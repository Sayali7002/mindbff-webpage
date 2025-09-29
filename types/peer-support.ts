export interface PeerMatch {
  id: string;
  name: string;
  avatar?: string;
  matchScore?: number;
  supportPreferences?: string[];
  supportType?: string;
  location?: string;
  isActive?: boolean;
  rating?: number;
  totalRatings?: number;
  certifiedMentor?: boolean;
  email?: string; // Added for notifications
  peopleSupported?: number;
  journeyNote?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string | Date;
  isAnonymous: boolean;
  senderId?: string;
  receiverId?: string;
}

export interface SupportRequest {
  id: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  status: string;
  is_anonymous: boolean;
  email?: string; // Added for notifications
  sender?: {
    name: string;
    avatar_url: string;
    support_preferences: string[];
    location: string;
    journey_note: string;
  };
  receiver?: {
    name: string;
    avatar_url: string;
    support_preferences: string[];
    location: string;
  };
}

export interface PeerFilters {
  supportType?: string;
  supportPreferences?: string[];
  activeOnly?: boolean | null;
  sortBy?: 'match' | 'rating' | 'peopleSupported' | 'availability';
  totalCount?: number;
}
