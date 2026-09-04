import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({
  rating = 0,
  maxRating = 5,
  interactive = false,
  onChange = () => {},
  size = 'md',
  showScore = false,
  label = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const effectiveRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[90px]">{label}</span>}
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => interactive && setHoverRating(0)}
      >
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = effectiveRating >= starValue;
          const isHalf = !isFilled && effectiveRating >= starValue - 0.5;

          return (
            <button
              key={index}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={() => interactive && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              className={`transition-transform ${
                interactive ? 'cursor-pointer hover:scale-110 focus:outline-none' : 'cursor-default'
              }`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                    : isHalf
                    ? 'fill-amber-300/60 text-amber-400'
                    : 'fill-slate-100 dark:fill-slate-800 text-slate-300 dark:text-slate-700'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showScore && (
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 ml-1">
          {rating ? Number(rating).toFixed(1) : 'New'}
        </span>
      )}
    </div>
  );
};

