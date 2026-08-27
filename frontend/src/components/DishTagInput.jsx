import React, { useState } from 'react';
import { Plus, Trash2, ThumbsUp, ThumbsDown, Minus, Utensils } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export const DishTagInput = ({ dishes = [], onChange = () => {}, availableMenuItems = [] }) => {
  const { currencySymbol, formatPrice } = useCurrency();
  const [dishName, setDishName] = useState('');
  const [sentiment, setSentiment] = useState('recommended');
  const [comment, setComment] = useState('');
  const [pricePaid, setPricePaid] = useState('');
  const [selectedMenuItemId, setSelectedMenuItemId] = useState(null);

  const handleSelectMenuItem = (e) => {
    const id = e.target.value;
    if (!id) {
      setSelectedMenuItemId(null);
      return;
    }
    const item = availableMenuItems.find((m) => m.id === parseInt(id));
    if (item) {
      setSelectedMenuItemId(item.id);
      setDishName(item.name);
      if (item.price) setPricePaid(item.price.toString());
    }
  };

  const handleAddDish = (e) => {
    e.preventDefault();
    if (!dishName.trim() || !comment.trim()) return;

    const newDish = {
      dish_name: dishName.trim(),
      menu_item_id: selectedMenuItemId,
      sentiment,
      comment: comment.trim(),
      price_paid: pricePaid ? parseFloat(pricePaid) : null,
      rating: sentiment === 'recommended' ? 5.0 : sentiment === 'neutral' ? 3.0 : 1.0,
    };

    onChange([...dishes, newDish]);

    // Reset inputs
    setDishName('');
    setComment('');
    setPricePaid('');
    setSelectedMenuItemId(null);
    setSentiment('recommended');
  };

  const handleRemoveDish = (index) => {
    onChange(dishes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Utensils className="w-4 h-4 text-brand-500" />
          Dish-Specific Reviews & Tasting Comments
        </label>
        <span className="text-xs text-slate-500">Optional, but foodies love dish details!</span>
      </div>

      {/* Added Dishes List */}
      {dishes.length > 0 && (
        <div className="space-y-3">
          {dishes.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{item.dish_name}</span>
                  {item.price_paid && (
                    <span className="text-xs text-slate-500 font-medium">(${Number(item.price_paid).toFixed(2)})</span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      item.sentiment === 'recommended'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.sentiment === 'neutral'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.sentiment === 'recommended' && <ThumbsUp className="w-3 h-3" />}
                    {item.sentiment === 'neutral' && <Minus className="w-3 h-3" />}
                    {item.sentiment === 'not_recommended' && <ThumbsDown className="w-3 h-3" />}
                    {item.sentiment === 'recommended'
                      ? 'Loved it'
                      : item.sentiment === 'neutral'
                      ? 'Average'
                      : 'Skip it'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 italic">"{item.comment}"</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveDish(idx)}
                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Dish Box */}
      <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {availableMenuItems.length > 0 && (
            <div className="sm:col-span-4">
              <select
                onChange={handleSelectMenuItem}
                value={selectedMenuItemId || ''}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">-- Select from Menu --</option>
                {availableMenuItems.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (${m.price})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className={availableMenuItems.length > 0 ? 'sm:col-span-5' : 'sm:col-span-8'}>
            <input
              type="text"
              placeholder="Or type dish name (e.g. Truffle Gnocchi)"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className={availableMenuItems.length > 0 ? 'sm:col-span-3' : 'sm:col-span-4'}>
            <input
              type="number"
              step="0.01"
              placeholder={`Price (${currencySymbol.trim()} optional)`}
              value={pricePaid}
              onChange={(e) => setPricePaid(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Sentiment Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 mr-1">Sentiment:</span>
          <button
            type="button"
            onClick={() => setSentiment('recommended')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              sentiment === 'recommended'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            Loved it
          </button>
          <button
            type="button"
            onClick={() => setSentiment('neutral')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              sentiment === 'neutral'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Minus className="w-3.5 h-3.5" />
            Okay
          </button>
          <button
            type="button"
            onClick={() => setSentiment('not_recommended')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              sentiment === 'not_recommended'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            Disliked
          </button>
        </div>

        {/* Dish Tasting Comment */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tasting commentary (e.g. Creamy sauce, pasta cooked perfectly al dente...)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="button"
            onClick={handleAddDish}
            disabled={!dishName.trim() || !comment.trim()}
            className="px-3 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Dish
          </button>
        </div>
      </div>
    </div>
  );
};

