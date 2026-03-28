import React, { useState, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { STORAGE_KEYS } from '../config/constants';
import { getJSON, setJSON } from '../utils/storage';

export default function SearchBar({ onSearch, loading = false }) {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef(null);
  const history = getJSON(STORAGE_KEYS.SEARCH_HISTORY, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    // 存入搜尋紀錄
    const updated = [query.trim(), ...history.filter((h) => h !== query.trim())].slice(0, 10);
    setJSON(STORAGE_KEYS.SEARCH_HISTORY, updated);
    setShowHistory(false);
    onSearch(query.trim());
  };

  const handleHistoryClick = (item) => {
    setQuery(item);
    setShowHistory(false);
    onSearch(item);
  };

  return (
    <div className="relative px-4 pt-2 pb-1">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden transition-shadow focus-within:shadow-card-hover focus-within:border-primary-200">
          <Search className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            placeholder="搜尋地址或地名..."
            className="flex-1 px-3 py-3 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
          />
          {loading && <Loader2 className="w-4 h-4 text-primary-500 animate-spin mr-2" />}
          {query && !loading && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="p-2 mr-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 py-3 bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            搜尋
          </button>
        </div>
      </form>

      {/* 搜尋紀錄下拉 */}
      {showHistory && history.length > 0 && (
        <div className="absolute left-4 right-4 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          <p className="px-4 py-2 text-xs text-gray-400 font-medium">最近搜尋</p>
          {history.slice(0, 5).map((item, i) => (
            <button
              key={i}
              onMouseDown={() => handleHistoryClick(item)}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-primary-50 flex items-center gap-2 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-gray-300" />
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
