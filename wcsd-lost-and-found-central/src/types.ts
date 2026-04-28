export type Category = 'Clothing' | 'Electronics' | 'Books' | 'Musical' | 'Personal' | 'Other';

export interface SchoolTheme {
  id: string;
  name: string;
  logo: string;
  palette: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  contactInfo: {
    address: string;
    phone: string;
    email: string;
    principal: string;
  };
}

export interface LostItem {
  id: string;
  name: string;
  description: string;
  category: Category;
  schoolId: string;
  date: string;
  status: 'lost' | 'found' | 'pending_claim' | 'claimed';
  imageUrl?: string;
  reporterUserId?: string;
  reporterEmail?: string;
  foundLocation?: string;
  finderName?: string;
  claimantName?: string;
  claimantEmail?: string;
  claimantGrade?: string;
  claimantUserId?: string;
  claimantLastSeen?: string;
  claimantProof?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  grade?: string;
  studentId?: string;
  joinedAt: string;
  notifications: { id: string; text: string; date: string; read: boolean }[];
}

export interface WishlistItem {
  id: string;
  userId: string;
  text: string;
  category: string;
  addedAt: string;
}

export interface ClaimedLog {
  id: string;
  itemId: string;
  itemName: string;
  schoolId: string;
  claimedBy: string;
  claimedEmail: string;
  claimedAt: string;
  expiresAt: string;
}

export type View = 'HOME' | 'SCHOOL_SELECT' | 'BULLETIN_BOARD' | 'CONTACTS' | 'MEET_MAKERS' | 'ABOUT' | 'RULES' | 'GUIDE' | 'TOOLS' | 'LIVE_TRACKER' | 'ACCOUNT';
