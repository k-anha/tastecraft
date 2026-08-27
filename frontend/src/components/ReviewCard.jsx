import React, { useState } from 'react';
import { 
  Heart, MessageSquare, ThumbsUp, ThumbsDown, Minus, 
  Calendar, Utensils, DollarSign, HeartHandshake, Sparkles, Send, ShieldCheck, CornerDownRight 
} from 'lucide-react';
import { RatingStars } from './RatingStars';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';

export const ReviewCard = ({ review, onUpdate }) => {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const { formatPrice } = useCurrency();
  
  const [likesCount, setLikesCount] = useState(review.likes_count || 0);
  const [isLiked, setIsLiked] = useState(review.is_liked_by_user || false);
  const [likeLoading, setLikeLoading] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(review.comments || []);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [activePhoto, setActivePhoto] = useState(null);

  // Parse images if stored as JSON string
  let images = [];
  try {
    if (typeof review.images === 'string' && review.images.trim().startsWith('[')) {
      images = JSON.parse(review.images);
    } else if (Array.isArray(review.images)) {
      images = review.images;
    }
  } catch (e) {
    images = [];
  }

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      showInfo('Please sign in to like reviews.');
      return;
    }

    setLikeLoading(true);
    try {
      const res = await api.post(`/reviews/${review.id}/like`);
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likes_count);
    } catch (err) {
      showError('Failed to update like.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showInfo('Please sign in to reply.');
      return;
    }
    if (!newComment.trim()) return;

    setCommentSubmitting(true);
    try {
      const res = await api.post(`/reviews/${review.id}/comments`, { content: newComment });
      setComments([...comments, res.data]);
      setNewComment('');
      showSuccess('Reply posted successfully!');
    } catch (err) {
      showError('Failed to post reply.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const reviewer = review.user || {};
  const formattedDate = new Date(review.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header: User & Rating */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <img
            src={reviewer.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reviewer.username || 'user'}`}
            alt={reviewer.full_name || 'Reviewer'}
            className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm">
                {reviewer.full_name || reviewer.username || 'Food Enthusiast'}
              </h4>
              {reviewer.role === 'owner' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Owner
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>@{reviewer.username || 'user'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {formattedDate}
              </span>
              {review.visit_date && (
                <>
                  <span>•</span>
                  <span className="text-slate-500 font-medium">Visited: {review.visit_date}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Overall Rating Pill */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/70 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
          <RatingStars rating={review.overall_rating} size="sm" />
          <span className="text-sm font-extrabold text-amber-900">
            {Number(review.overall_rating).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Multi-Criteria Score Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50/70 border border-orange-100">
          <Utensils className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-orange-700">Food</span>
            <span className="text-xs font-extrabold text-slate-800">{review.food_rating.toFixed(1)} / 5.0</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-emerald-700">Value</span>
            <span className="text-xs font-extrabold text-slate-800">{review.price_rating.toFixed(1)} / 5.0</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50/70 border border-blue-100">
          <HeartHandshake className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-blue-700">Service</span>
            <span className="text-xs font-extrabold text-slate-800">{review.service_rating.toFixed(1)} / 5.0</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50/70 border border-purple-100">
          <Sparkles className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-purple-700">Ambiance</span>
            <span className="text-xs font-extrabold text-slate-800">{review.ambiance_rating.toFixed(1)} / 5.0</span>
          </div>
        </div>
      </div>

      {/* Review Title & Content */}
      <div className="mt-3 space-y-2">
        <h3 className="font-serif-brand font-bold text-base sm:text-lg text-slate-900">
          {review.title}
        </h3>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {review.content}
        </p>
      </div>

      {/* Dish Reviews & Food Tasting Comments */}
      {review.dish_reviews && review.dish_reviews.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-brand-500" />
            Dish Tasting Notes & Food Comments ({review.dish_reviews.length})
          </h5>
          <div className="space-y-2.5">
            {review.dish_reviews.map((dish, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {dish.dish_name}
                    </span>
                    {dish.price_paid && (
                      <span className="text-xs text-slate-500">({formatPrice(dish.price_paid)})</span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        dish.sentiment === 'recommended'
                          ? 'bg-emerald-100 text-emerald-800'
                          : dish.sentiment === 'neutral'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {dish.sentiment === 'recommended' && <ThumbsUp className="w-2.5 h-2.5" />}
                      {dish.sentiment === 'neutral' && <Minus className="w-2.5 h-2.5" />}
                      {dish.sentiment === 'not_recommended' && <ThumbsDown className="w-2.5 h-2.5" />}
                      {dish.sentiment === 'recommended'
                        ? 'Recommended'
                        : dish.sentiment === 'neutral'
                        ? 'Average'
                        : 'Disliked'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    "{dish.comment}"
                  </p>
                </div>
                {dish.rating && (
                  <div className="flex-shrink-0 self-start">
                    <RatingStars rating={dish.rating} size="sm" showScore />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Photos Gallery */}
      {images.length > 0 && (
        <div className="mt-4 pt-3 flex flex-wrap gap-2.5">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Review photo ${idx + 1}`}
              onClick={() => setActivePhoto(img)}
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-slate-200 cursor-pointer hover:opacity-90 hover:scale-105 transition-all shadow-sm"
              loading="lazy"
            />
          ))}
        </div>
      )}

      {/* Footer Actions: Likes & Reply count */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleLike}
            disabled={likeLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isLiked
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{likesCount} {likesCount === 1 ? 'Helpful' : 'Helpful'}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>{comments.length} {comments.length === 1 ? 'Discussion' : 'Discussions'}</span>
          </button>
        </div>
      </div>

      {/* Expanded Discussion / Comments Thread */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 p-4 rounded-xl space-y-3">
          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Discussion & Replies
          </h5>

          {comments.length === 0 ? (
            <p className="text-xs text-slate-500">No replies yet. Be the first to join the conversation!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-xl border text-xs ${
                    c.is_owner_response
                      ? 'bg-amber-50/80 border-amber-200/80 text-amber-950'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold">
                        {c.user?.full_name || c.user?.username || 'Foodie'}
                      </span>
                      {c.is_owner_response && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-extrabold">
                          Restaurant Response
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="pl-5 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Reply Form */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Write a response or ask about the food..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 text-xs rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={commentSubmitting || !newComment.trim()}
                className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3 h-3" />
                Reply
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-500 pt-1 italic">
              Sign in to post a reply or ask the reviewer about their meal.
            </p>
          )}
        </div>
      )}

      {/* Lightbox Modal for Photo Zoom */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={activePhoto}
              alt="Expanded food review"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

