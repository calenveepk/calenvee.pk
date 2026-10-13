import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import { formatPKR } from '../../utils/formatters';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProducts = searchTerm.trim()
    ? PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const popularTags = ['Obsidian Chrono', 'Cuban Link Chain', 'Signet Ring', 'Y2K Shades', 'Aroma Diffuser', 'Urban Backpack'];

  const handleSelectProduct = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative mx-auto max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-100 bg-white">
          <Search className="w-5 h-5 text-[#F97316] mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search watches, jewelry, eyewear, fragrances, bags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-gray-400 hover:text-gray-900 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[10px] font-mono uppercase bg-gray-100 text-gray-500 px-2 py-1 rounded border border-gray-200"
          >
            ESC
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto bg-gray-50">
          {searchTerm.trim() === '' ? (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Popular Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:text-[#F97316] hover:border-[#F97316] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              No matching pieces found for "<span className="text-gray-900 font-semibold">{searchTerm}</span>".
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 px-2 pb-1">
                Results ({filteredProducts.length})
              </div>
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectProduct(p.slug)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-orange-50/50 border border-gray-200 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-12 h-12 rounded-lg object-contain bg-gray-50 border border-gray-100"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#F97316] transition-colors">
                        {p.name}
                      </h4>
                      <div className="text-[11px] text-gray-500">
                        {p.categoryLabel}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs sm:text-sm font-extrabold text-[#0B132B]">
                      {formatPKR(p.price)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#F97316] transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
