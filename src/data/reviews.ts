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

export const ALL_CAMPUS_REVIEWS: CampusStory[] = reviewsData as CampusStory[];
