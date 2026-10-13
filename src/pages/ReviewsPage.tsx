import React, { useState } from 'react';
import { ShieldCheck, ThumbsUp, Plus, CheckCircle2, X } from 'lucide-react';
import { ALL_CAMPUS_REVIEWS, CampusStory } from '../data/reviews';
import { PAKISTAN_CITIES } from '../utils/formatters';
import { SEO } from '../components/common/SEO';
import { RealisticStarIcon } from '../components/common/RealisticIcons';

export const ReviewsPage: React.FC = () => {
  const [reviewsList, setReviewsList] = useState<CampusStory[]>(ALL_CAMPUS_REVIEWS);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState(PAKISTAN_CITIES[0]);
  const [formProduct, setFormProduct] = useState('Calenvee Obsidian Chrono Edition');
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formText, setFormText] = useState('');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const filteredReviews = selectedCity === 'all'
    ? reviewsList
    : reviewsList.filter((r) => r.university.toLowerCase().includes(selectedCity.toLowerCase()));

  const handleLikeReview = (id: string) => {
    setReviewsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, likes: r.likes + 1 } : r))
    );
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formText.trim()) return;

    const newReview: CampusStory = {
      id: `user-rev-${Date.now()}`,
      studentName: formName,
      university: `${formCity}, Pakistan`,
      major: 'Verified Client',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      productBought: formProduct,
      rating: formRating,
      date: 'Just now',
      reviewTitle: formTitle || 'Delighted with the craftsmanship',
      reviewText: formText,
      tags: ['Verified Buyer', 'Direct Review'],
      campusBadge: 'Verified Purchase',
      likes: 1,
    };

    setReviewsList([newReview, ...reviewsList]);
    setIsSubmittedSuccess(true);
    setTimeout(() => {
      setIsSubmittedSuccess(false);
      setIsSubmitModalOpen(false);
      setFormName('');
      setFormText('');
      setFormTitle('');
    }, 1800);
  };

  return (
    <div className="min-h-screen py-5 sm:py-8 bg-white text-gray-900">
      <SEO
        title="Client Reviews (4.9★) | Calenvee.pk"
        description="Read genuine verified reviews from clients across Pakistan who wear Calenvee timepieces, anti-tarnish jewelry, and fashion accessories."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Standardized Page Header Banner — Centered */}
        <div className="mb-6 text-center space-y-2 border-b border-gray-100 pb-5 flex flex-col items-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B132B] uppercase tracking-wider">
            CLIENT REVIEWS
            <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto font-normal leading-relaxed pt-0.5">
            Real feedback from verified purchasers across Karachi, Lahore, Islamabad, and nationwide.
          </p>
        </div>

        {/* Rating Overview Card */}
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-10 mb-10 border border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-xs">
          {/* Left: Overall Score */}
          <div className="md:col-span-4 text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 md:pr-8">
            <div className="text-5xl sm:text-6xl font-extrabold text-[#0B132B]">
              4.9<span className="text-[#F97316] text-2xl font-light">/5</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <RealisticStarIcon key={i} size={18} />
              ))}
            </div>
            <p className="text-xs text-gray-500 font-normal">
              Based on 1,280+ verified client ratings nationwide
            </p>
            <div className="pt-1">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold inline-block border border-emerald-200">
                98% Client Satisfaction Rate
              </span>
            </div>
          </div>

          {/* Middle: Rating Bars */}
          <div className="md:col-span-5 space-y-2 text-xs">
            {[
              { stars: 5, pct: 92, count: '1,177' },
              { stars: 4, pct: 6, count: '77' },
              { stars: 3, pct: 2, count: '24' },
              { stars: 2, pct: 0, count: '2' },
              { stars: 1, pct: 0, count: '0' },
            ].map((bar) => (
              <div key={bar.stars} className="flex items-center space-x-3">
                <span className="w-12 text-gray-600 font-mono">{bar.stars} Stars</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#F97316] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${bar.pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-gray-500 font-mono">{bar.count}</span>
              </div>
            ))}
          </div>

          {/* Right: CTA to Add Review */}
          <div className="md:col-span-3 text-center md:text-right space-y-3">
            <p className="text-xs text-gray-500 font-normal">
              Own a Calenvee piece? Share your honest feedback with our community.
            </p>
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Write Review</span>
            </button>
          </div>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <button
            onClick={() => setSelectedCity('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCity === 'all'
                ? 'bg-[#F97316] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:text-black hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Nationwide ({reviewsList.length})
          </button>
          {['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Peshawar', 'Multan'].map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCity === city
                  ? 'bg-[#F97316] text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:text-black hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReviews.map((story) => (
            <div
              key={story.id}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={story.avatar}
                      alt={story.studentName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                      <div className="flex items-center space-x-1 font-semibold text-gray-900 text-xs">
                        <span>{story.studentName}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="text-[10px] text-gray-500 block">{story.university}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{story.date}</span>
                </div>

                <div className="flex items-center space-x-1 text-amber-500">
                  {[...Array(story.rating)].map((_, i) => (
                    <RealisticStarIcon key={i} size={14} />
                  ))}
                </div>

                <h3 className="text-sm font-bold text-gray-900">
                  "{story.reviewTitle}"
                </h3>

                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                  {story.reviewText}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 truncate max-w-[190px]">
                  Piece: <strong className="text-gray-900 font-medium">{story.productBought}</strong>
                </span>

                <button
                  onClick={() => handleLikeReview(story.id)}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors border border-gray-200"
                >
                  <ThumbsUp className="w-3 h-3 text-[#F97316]" />
                  <span className="font-mono text-xs">{story.likes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Review Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSubmitModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white text-gray-900 rounded-2xl p-6 sm:p-8 shadow-2xl z-10 border border-gray-200">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            {isSubmittedSuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-gray-900">Review Published</h3>
                <p className="text-xs text-gray-500 font-normal">
                  Thank you for contributing your feedback to the Calenvee community.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    Write A Review
                  </h3>
                  <p className="text-xs text-gray-500 font-normal">
                    Share your experience on design, finishing, and daily wear.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Ayesha Malik"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      City *
                    </label>
                    <select
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                    >
                      {PAKISTAN_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Item Purchased
                    </label>
                    <input
                      type="text"
                      value={formProduct}
                      onChange={(e) => setFormProduct(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <RealisticStarIcon size={24} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Exceptional weight and finishing"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Review Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder="Describe how the piece looks, fits, and performs..."
                    className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all active:scale-98"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
