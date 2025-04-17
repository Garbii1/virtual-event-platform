// src/app/models/user.model.ts
export interface User {
    id: number;
    username: string;
    email: string;
    is_organizer: boolean;
    created_at: string; // ISO date string
  }