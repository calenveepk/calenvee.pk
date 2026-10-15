import reviewsData from './reviews.json';

export interface CampusStory {
  id: string;
  studentName: string;
  university: string;
  major: string;
  avatar: string;
  productBought: string;
  rating: number;
  date: string;
  reviewTitle: string;
  reviewText: string;
  tags: string[];
  campusBadge: string;
  likes: number;
}

export const ALL_CAMPUS_REVIEWS: CampusStory[] = (reviewsData as any[]).map((r) => ({
  id: r.id,
  studentName: r.customerName || r.studentName || 'Calenvee Client',
  university: r.city ? `${r.city}, Pakistan` : (r.university || 'Pakistan'),
  major: r.major || 'Verified Client',
  avatar: r.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  productBought: r.productBought || 'Calenvee Timepiece',
  rating: Number(r.rating || 5),
  date: r.date || 'Recent',
  reviewTitle: r.reviewTitle || 'Verified Purchase',
  reviewText: r.reviewText || '',
  tags: r.tags || ['Verified Buyer'],
  campusBadge: r.campusBadge || 'Verified Purchase',
  likes: Number(r.likes || 0),
}));
