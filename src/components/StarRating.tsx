import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  reviews: number;
  maxStars?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ reviews, maxStars = 5 }) => {
  // Handle negative reviews (make them positive for display)
  const displayReviews = Math.abs(reviews);
  
  // Calculate a simple star rating based on the number of reviews
  // This is just for visual appeal - in a real app, you'd use actual ratings
  const calculatedRating = Math.min(Math.max(3 + (displayReviews / 100), 3), 5);
  const fullStars = Math.floor(calculatedRating);
  
  return (
    <div className="flex items-center">
      <div className="flex mr-1">
        {[...Array(maxStars)].map((_, i) => (
          <Star 
            key={i}
            className={`w-4 h-4 ${i < fullStars ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-600">({displayReviews})</span>
    </div>
  );
};

export default StarRating;