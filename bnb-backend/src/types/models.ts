export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Property {
  id: string;
  user_id: string;
  name: string;
  description: string;
  location: string;
  price_per_night: number;
  available: boolean;
  image_urls: string[];
  created_at?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  property_id: string;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  status: string;
  created_at: string;
}
