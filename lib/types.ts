export type BusinessStatus = 'pending' | 'approved' | 'rejected'
export type SlotStatus = 'active' | 'claimed' | 'expired'

export interface Business {
  id: string
  name: string
  category: string
  email: string
  contact_name: string
  website?: string
  post_token?: string
  status: BusinessStatus
  created_at: string
}

export interface Slot {
  id: string
  business_id: string
  service_name: string
  slot_time: string
  original_price: number
  deal_price: number
  spots_total: number
  spots_remaining: number
  status: SlotStatus
  notes?: string
  created_at: string
  // joined from businesses
  business_name?: string
  business_category?: string
  business_address?: string
}

export interface Claim {
  id: string
  slot_id: string
  consumer_email: string
  created_at: string
}

export interface Application {
  id: string
  business_name: string
  category: string
  contact_name: string
  email: string
  website?: string
  status: BusinessStatus
  created_at: string
}

export interface Watch {
  id: string
  search_term: string
  max_price?: number
  consumer_email: string
  created_at: string
}

export interface Need {
  id: string
  service_name: string
  category: string
  when_needed: string
  budget?: number
  radius_miles: number
  consumer_email: string
  created_at: string
}

export const CATEGORIES = [
  'Salon & barber',
  'Fitness',
  'Golf',
  'Spa',
  'Dining',
  'Services',
  'Health',
  'Lessons',
  'Other',
] as const

export type Category = typeof CATEGORIES[number]
