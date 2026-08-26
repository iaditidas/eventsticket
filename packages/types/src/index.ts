export type Role = 'CUSTOMER' | 'ADMIN';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface TicketCategory {
  id: string;
  eventId: string;
  name: string;
  price: number;
  totalCapacity: number;
  ticketsSold: number;
  createdAt?: string;
}

export interface Event {
  id: string;
  organizerId: string;
  organizerName?: string;
  title: string;
  description: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  bannerImage: string;
  status: EventStatus;
  categories?: TicketCategory[];
  createdAt: string;
}

export interface BookingItemSelection {
  ticketCategoryId: string;
  quantity: number;
}

export interface BookingItem {
  id: string;
  bookingId: string;
  ticketCategoryId: string;
  categoryName?: string;
  quantity: number;
  unitPrice: number;
  tickets?: Ticket[];
}

export interface Ticket {
  id: string;
  bookingItemId: string;
  ticketCode: string;
  qrCode: string;
  isCheckedIn: boolean;
  checkedInAt?: string | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  eventTitle?: string;
  eventDate?: string;
  venue?: string;
  status: BookingStatus;
  totalAmount: number;
  paymentId?: string | null;
  items?: BookingItem[];
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface AdminAnalytics {
  totalRevenue: number;
  totalEvents: number;
  totalBookings: number;
  totalTicketsSold: number;
  categoryBreakdown: {
    eventName: string;
    categoryName: string;
    sold: number;
    capacity: number;
    revenue: number;
  }[];
  salesTimeline: {
    date: string;
    revenue: number;
    tickets: number;
  }[];
}
