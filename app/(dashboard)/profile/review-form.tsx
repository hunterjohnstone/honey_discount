'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useTranslation } from '@/hooks/useTranslation';

type Review = {
    userName: string | null;
    comment: string | null;
    date: Date;
    rating: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function StarIcon({ className }: { className?: string }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={className}
      >
        <path
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        />
      </svg>
    );
  }

export function ReviewForm({ productId }: { 
    productId: number, 
  }) {
  const t = useTranslation();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState<Review[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false);

    //fetch user data
    const { data: user } = useSWR<User>('/api/user', fetcher);

  const fetchData = async () => {
    try {
        const res = await fetch(`/api/product-review/get-review?productId=${productId}`)
        const data = await res.json();

        setComments(data)
    } catch (error) {
        console.log("Error fetching data: ", error);
        return;
    }

}

    useEffect(() => {
      fetchData();
    }, [])
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const response = await fetch('/api/product-review/post-review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId,
            rating,
            comment,
            userId: user?.id
          })
        });
    
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || 
            `Server responded with ${response.status}: ${response.statusText}`
          );
        }
    
        const commentObj = {
          userName: user?.name || "Anonymous",
          comment: comment,
          date: new Date(),
          rating: rating,
        };
        
        setComments(prev => [...prev, commentObj]);
        toast.success("Thank you for your review!");
    
      } catch (error) {
        console.error('Review submission failed:', error);
        toast.error("Failed to submit review");
        
      } finally {
        setComment('');
        setRating(0);
        setIsSubmitting(false);
      }
    };
    if (!user) {
      return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('comments')}</h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
                  <div className="flex">
                      <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                          </svg>
                      </div>
                      <div className="ml-3">
                          <p className="text-sm text-blue-700">
                              {t('sign_in_to_review_message')}
                              <Link href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500 underline">
                                  {t('sign in')}
                              </Link>
                              {' '}{t('or')}{' '}
                              <Link href="/sign-up" className="font-medium text-blue-600 hover:text-blue-500 underline">
                                  {t('create an account')}
                              </Link>
                          </p>
                      </div>
                  </div>
              </div>

              {comments.length > 0 ? (
                  comments.map((c) => (
                    <div key={c.userName} className="border-b border-gray-200 py-6 last:border-0">
                      <div className="flex gap-4">
                        {/* User avatar - replace with actual image if available */}
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            {c.userName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </div>
                    
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                            <span className="font-medium text-gray-900">{c.userName || 'Anonymous'}</span>
                            
                            {/* Star rating */}
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon 
                                  key={i} 
                                  className={`h-4 w-4 ${i < c.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            
                            <span className="text-gray-500 text-sm">
                              {new Date(c.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                    
                          <p className="text-gray-700 mt-1 whitespace-pre-line leading-relaxed">
                            {c.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                          ))
                        ) : (
                  <div className="text-center py-8">
                      <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                      </div>
                      <p className="text-gray-500">{t('be_first_review')}</p>
                  </div>
              )}
          </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('leave_review')}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`cursor-pointer w-8 h-8 rounded-full flex items-center justify-center transition-colors
                  ${rating >= star ? 'bg-yellow-400 text-yellow-800' : 'bg-gray-100 text-gray-400'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <textarea
            id="comment"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={comment}
            placeholder={t('share_thoughts')}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className={`cursor-pointer px-4 py-2 rounded-md text-white font-medium ${isSubmitting || rating === 0 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSubmitting ? t('submitting') : t('submit_review')}
        </button>
      </form>
      <div className="space-y-6">
    {comments.length > 0 ? (
      comments.map((c) => (
<div key={c.userName} className="border-b border-gray-200 py-6 last:border-0">
  <div className="flex gap-4">
    {/* User avatar - replace with actual image if available */}
    <div className="flex-shrink-0">
      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
        {c.userName?.charAt(0).toUpperCase() || 'U'}
      </div>
    </div>

    <div className="flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
        <span className="font-medium text-gray-900">{c.userName || 'Anonymous'}</span>
        
        {/* Star rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <StarIcon 
              key={i} 
              className={`h-4 w-4 ${i < c.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
            />
          ))}
        </div>
        
        <span className="text-gray-500 text-sm">
          {new Date(c.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      </div>

      <p className="text-gray-700 mt-1 whitespace-pre-line leading-relaxed">
        {c.comment}
      </p>
    </div>
  </div>
</div>
      ))
    ) : (
      <div className="text-center py-8">
        <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-gray-500">{t('be_first_review')}</p>
      </div>
    )}
  </div>
    </div>
  );
}