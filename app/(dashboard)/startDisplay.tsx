import { StarIcon } from "lucide-react";

interface RatingDisplayProps {
  averageRating: number;
  reviewCount: number;
  size?: "sm" | "md" | "lg";
}

export function RatingDisplay({
  averageRating,
  reviewCount,
  size = "md",
}: RatingDisplayProps) {
  // Size variants
  const sizeClasses = {
    sm: {
      text: "text-sm",
      star: "h-4 w-4",
      count: "text-xs",
    },
    md: {
      text: "text-base",
      star: "h-5 w-5",
      count: "text-sm",
    },
    lg: {
      text: "text-lg",
      star: "h-6 w-6",
      count: "text-base",
    },
  };

  // Calculate full and partial stars
  const fullStars = Math.floor(averageRating);
  const hasHalfStar = averageRating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      {/* Stars container */}
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <StarIcon
                key={i}
                className={`${sizeClasses[size].star} text-yellow-400`}
                aria-hidden="true"
              />
            );
          } else if (i === fullStars && hasHalfStar) {
            return (
              <div key={i} className="relative">
                <StarIcon
                  className={`${sizeClasses[size].star} text-gray-300`}
                  aria-hidden="true"
                />
                <div className="absolute left-0 top-0 w-1/2 overflow-hidden">
                  <StarIcon
                    className={`${sizeClasses[size].star} text-yellow-400`}
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          } else {
            return (
              <StarIcon
                key={i}
                className={`${sizeClasses[size].star} text-gray-300`}
                aria-hidden="true"
              />
            );
          }
        })}
      </div>

      <div className="flex items-center gap-1">
        <span className={`${sizeClasses[size].text} font-medium text-gray-900`}>
            {averageRating}
        </span>
        <span className="text-gray-500">·</span>
        <div
          className={`${sizeClasses[size].count} text-gray-600 hover:text-gray-900`}
        >
          {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
        </div>
      </div>
    </div>
  );
}