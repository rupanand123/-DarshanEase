export type UserRole = "devotee" | "temple_admin" | "super_admin";

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  createdAt: string;
  role: UserRole;
  favorites?: string[]; // templeIds
}

export interface TempleComplexPOI {
  id: string;
  name: string;
  description: string;
  latOffset: number;
  lngOffset: number;
  icon?: string;
}

export interface Temple {
  templeId: string;
  name: string;
  location: string;
  state: string;
  type: string; // e.g. "Jyotirlinga", "Historic", "Hilltop", "Vedic"
  description: string;
  history: string;
  openingTime: string; // e.g. "06:00 AM"
  closingTime: string; // e.g. "09:00 PM"
  rating: number;
  ticketPrice: number; // base price for free/general, special/VIP will add premium
  availableSlots: string[]; // array of slot strings e.g. ["06:00 AM - 09:00 AM", "09:00 AM - 12:00 PM", ...]
  darshanTypes: {
    name: string; // "Free Darshan", "Special Entry", "VIP VIP Entry"
    price: number;
    description: string;
  }[];
  rules: string[];
  facilities: string[];
  image: string;
  images: string[];
  popular: boolean;
  latitude?: number;
  longitude?: number;
  complexPOIs?: TempleComplexPOI[];
}

export interface Booking {
  bookingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  templeId: string;
  templeName: string;
  templeLocation: string;
  date: string;
  slot: string;
  persons: number;
  price: number;
  darshanType: string;
  paymentStatus: "Pending" | "Paid" | "Failed";
  bookingStatus: "Upcoming" | "Completed" | "Cancelled";
  qrCode: string;
  createdAt: string;
}

export interface PaymentRecord {
  paymentId: string;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  status: "Success" | "Failed" | "Pending";
  transactionId: string;
  createdAt: string;
}

export interface NotificationRecord {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: "booking" | "reminder" | "festival" | "cancellation" | "general";
}

export interface FeedbackRecord {
  feedbackId: string;
  userId: string;
  userName: string;
  templeId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
