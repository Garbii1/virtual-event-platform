// src/app/models/event.model.ts
export interface Event {
    id: number;
    title: string;
    description?: string;
    start_time: string; // ISO date string
    end_time?: string; // ISO date string
    location?: string;
    organizer_id: number;
    organizer_username?: string; // Added from backend serialization
    created_at: string; // ISO date string
    attendee_count?: number; // Added from backend serialization
    isRegistered?: boolean; // Frontend helper flag
  }