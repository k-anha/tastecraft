import React, { useState } from 'react';
import { 
  Heart, MessageSquare, ThumbsUp, ThumbsDown, Minus, 
  Calendar, Utensils, DollarSign, HeartHandshake, Sparkles, Send, ShieldCheck, CornerDownRight,
  Edit2, Trash2, X, Check, AlertCircle 
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

  // Edit Review Mode
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(review.title || '');
  const [editContent, setEditContent] = useState(review.content || '');
  const [editFood, setEditFood] = useState(review.food_rating || 5);
  const [editPrice, setEditPrice] = useState(review.price_rating || 5);
  const [editService, setEditService] = useState(review.service_rating || 5);
  const [editAmbiance, setEditAmbiance] = useState(review.ambiance_rating || 5);
  const [editVisitDate, setEditVisitDate] = useState(review.visit_date || '');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAuthor = isAuthenticated && user?.id === review.user_id;
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const canModify = isAuthor || isAdmin;

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

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) {
      showError('Please provide both a headline and review story.');
      return;
    }

    setSavingEdit(true);
    try {
      const overall = parseFloat(((editFood + editPrice + editService + editAmbiance) / 4).toFixed(1));
      const payload = {
        title: editTitle.trim(),
        content: editContent.trim(),
        food_rating: parseFloat(editFood),
        price_rating: parseFloat(editPrice),
        service_rating: parseFloat(editService),
        ambiance_rating: parseFloat(editAmbiance),
        overall_rating: overall,
        visit_date: editVisitDate || null,
      };

      await api.put(`/reviews/${review.id}`, payload);
      showSuccess('Review updated successfully!');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to update review.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your review? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/reviews/${review.id}`);
      showSuccess('Review deleted successfully.');
      if (onUpdate) onUpdate();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete review.');
    } finally {
      setDeleting(false);
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

        {/* Overall Rating & Edit/Delete Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {canModify && (
            <div className="flex items-center gap-1 mr-1">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-brand-600 transition-colors text-xs flex items-center gap-1"
                title="Edit your review"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold hidden sm:inline">Edit</span>
              </button>
              <button
                type="button"
                onClick={handleDeleteReview}
                disabled={deleting}
                className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors text-xs flex items-center gap-1"
                title="Delete your review"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold hidden sm:inline">{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/70 px-3 py-1.5 rounded-xl">
            <RatingStars rating={review.overall_rating} size="sm" />
            <span className="text-sm font-extrabold text-amber-900">
              {Number(review.overall_rating).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Review Inline Form */}
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Edit2 className="w-3.5 h-3.5 text-brand-600" />
              Edit Your Review
            </span>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Headline</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Detailed Story</label>
            <textarea
              rows={3}
              required
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* 4 Pillars Ratings Editor */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div>
              <label className="block text-[10px] font-bold text-orange-700 uppercase">Food (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={editFood}
                onChange={(e) => setEditFood(parseFloat(e.target.value) || 1)}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white p-1.5 text-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-emerald-700 uppercase">Value (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={editPrice}
                onChange={(e) => setEditPrice(parseFloat(e.target.value) || 1)}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white p-1.5 text-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-blue-700 uppercase">Service (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={editService}
                onChange={(e) => setEditService(parseFloat(e.target.value) || 1)}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white p-1.5 text-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-purple-700 uppercase">Ambiance (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={editAmbiance}
                onChange={(e) => setEditAmbiance(parseFloat(e.target.value) || 1)}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white p-1.5 text-slate-800 font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingEdit}
              className="px-4 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold shadow-sm"
            >
              {savingEdit ? 'Saving...' : 'Save Updates'}
            </button>
          </div>
        </form>
      ) : (
        <>
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

          {/* Review Content */}
          <div className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 leading-snug">
              {review.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {review.content}
            </p>
          </div>
        </>
      )}

      {/* Dish-Specific Reviews & Comments */}
      {review.dish_reviews && review.dish_reviews.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Specific Dish Tasting Comments:
          </span>
          <div className="space-y-2">
            {review.dish_reviews.map((dish) => (
              <div
                key={dish.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{dish.dish_name}</span>
                    {dish.price_paid && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({formatPrice(dish.price_paid)})
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        dish.sentiment === 'recommended'
                          ? 'bg-emerald-100 text-emerald-800'
                          : dish.sentiment === 'not_recommended'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {dish.sentiment === 'recommended' && <ThumbsUp className="w-2.5 h-2.5" />}
                      {dish.sentiment === 'not_recommended' && <ThumbsDown className="w-2.5 h-2.5" />}
                      {dish.sentiment === 'neutral' && <Minus className="w-2.5 h-2.5" />}
                      {dish.sentiment === 'recommended' ? 'Must Try' : dish.sentiment === 'not_recommended' ? 'Skip' : 'Average'}
                    </span>
                  </div>
                  {dish.comment && (
                    <p className="text-xs text-slate-600 italic">"{dish.comment}"</p>
                  )}
                </div>

                {dish.rating && (
                  <div className="flex items-center gap-1 self-start sm:self-center">
                    <RatingStars rating={dish.rating} size="sm" />
                    <span className="text-xs font-bold text-slate-700">{dish.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Photos Showcase */}
      {images.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Uploaded Photos ({images.length}):
          </span>
          <div className="flex flex-wrap gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhoto(img)}
                className="relative group rounded-xl overflow-hidden border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <img
                  src={img}
                  alt={`Review photo ${idx + 1}`}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover group-hover:scale-105 transition-transform"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Photo Modal */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActivePhoto(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-black">
            <img src={activePhoto} alt="Review full photo" className="max-w-full max-h-[85vh] object-contain" />
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Action Footer: Likes & Replies */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleLike}
            disabled={likeLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
              isLiked
                ? 'bg-rose-50 border-rose-200 text-rose-600 font-bold'
                : 'hover:bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>{comments.length} {comments.length === 1 ? 'Reply' : 'Replies'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Comments / Owner Responses Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <div className="space-y-2">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-3 rounded-xl text-xs space-y-1 ${
                  comment.is_owner_response
                    ? 'bg-amber-50/80 border border-amber-200'
                    : 'bg-slate-50 border border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {comment.is_owner_response && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5" /> Official Owner Response
                      </span>
                    )}
                    <span className="font-bold text-slate-900">
                      {comment.user?.full_name || comment.user?.username || 'User'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed pl-1">{comment.content}</p>
              </div>
            ))}
          </div>

          {/* Add Reply Form */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder={
                  reviewer.id === user?.id ? 'Add a follow-up comment...' : 'Reply to this review...'
                }
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 text-xs rounded-xl border border-slate-200 px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
              />
              <button
                type="submit"
                disabled={commentSubmitting || !newComment.trim()}
                className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
              >
                <Send className="w-3 h-3" />
                <span>Post</span>
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-400 italic pt-1">
              Please sign in to reply to this review.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
