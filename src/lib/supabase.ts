import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'STUDENT' | 'ALUMNI' | 'PROFESSOR' | 'ADMIN'
  college_id: string
  department?: string
  batch?: string
  location?: string
  bio?: string
  phone?: string
  website?: string
  linkedin?: string
  github?: string
  twitter?: string
  is_verified: boolean
  is_online: boolean
  rating: number
  profile_views: number
  joined: string
  last_active: string
  created_at: string
  updated_at: string
}

export interface College {
  id: string
  name: string
  domain: string
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED'
  description?: string
  website?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface Connection {
  id: string
  sender_id: string
  receiver_id: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  message?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  type: 'TEXT' | 'IMAGE' | 'FILE'
  is_read: boolean
  created_at: string
}

export interface CallRequest {
  id: string
  sender_id: string
  receiver_id: string
  title: string
  description?: string
  scheduled_at: string
  duration: number
  type: 'VIDEO' | 'AUDIO'
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'
  created_at: string
  updated_at: string
} 