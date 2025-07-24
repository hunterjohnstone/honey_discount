'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { promotionsAtomState } from '../atom_state';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';

type Promotion = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  isActive: boolean;
};

type Comment = {
  id: String,
  name: String
  text: String,
  date: String,
};

const fetcher = (url: string) => fetch(url).then((r) => r.json()); 

export default function PromotionPage() {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // Get ID from URL
  
  const promotionsAtom = useAtomValue<Promotion[]>(promotionsAtomState);
  const [promotion, setPromotionDisplay] = useState<Promotion | null>(null);

  const { data: user } = useSWR<User>('/api/user', fetcher)

  useEffect(() => {
    if (!id) return;
  
    const myPromotion = promotionsAtom.find(promotion => 
      promotion.id === id
    );
    
    if (!myPromotion) {
      // Optional: redirect if not found
      router.push('/dashboard');
      return;
    }
    
    setPromotionDisplay(myPromotion);
  }, [id, promotionsAtom, router]);


  const handleSubmitComment = (e: any) => {
    e.preventDefault();
    if (comment.trim()) {
      setComments([...comments, {
        name: "someone",
        id: Date.now().toString(),
        text: comment,
        date: new Date().toLocaleString()
      }]);
      setComment('');
    }
  };

  if (!promotion) {
    console.log("cant find promotion by ID")
    return;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button 
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
      >
        ← Back to Promotions
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="h-64 overflow-hidden">
          <img
            src={promotion.imageUrl}
            alt={promotion.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-800">{promotion.title}</h1>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-lg font-medium">
              ${promotion.price}
            </span>
          </div>
          <p className="text-gray-600 mb-4">{promotion.description}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              {promotion.category}
            </span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              {promotion.location}
            </span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              Ends: {new Date(promotion.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
  <h2 className="text-2xl font-bold mb-6 text-gray-800">Comments</h2>
  
  <form onSubmit={handleSubmitComment} className="mb-8">
    <textarea
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      placeholder="Share your thoughts..."
      className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4 text-gray-700 placeholder-gray-400"
      rows={4}
    />
    <button
      type="submit"
      className="cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow hover:shadow-md"
    >
      Post Comment
    </button>
  </form>

  <div className="space-y-6">
    {comments.length > 0 ? (
      comments.map((c) => (
        <div key={c.id.toString()} className="border-b border-gray-100 pb-6 last:border-0 group">
          <div className="flex items-start gap-3 mb-2">
            {/* User avatar placeholder - replace with actual user image if available */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {/* //GET USER DATA FROM CONTEXT */}
                <span className="font-semibold text-gray-800">{user?.name || 'UNKNOWN'}</span>
                <span className="text-gray-400 text-xs">•</span>
                <span className="text-gray-500 text-sm">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <p className="text-gray-700 mt-1 whitespace-pre-line">{c.text}</p>
              
              {/* Optional reply/like buttons */}
              <div className="flex gap-4 mt-3 text-sm text-gray-500">
                <button className="hover:text-blue-600 transition-colors">Reply</button>
                <button className="hover:text-blue-600 transition-colors">Like</button>
              </div>
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
        <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
      </div>
    )}
  </div>
</div>
    </div>
  );
}