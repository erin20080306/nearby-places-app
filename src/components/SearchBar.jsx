import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Search, X, Loader2, MapPin, Clock } from 'lucide-react';
import { STORAGE_KEYS } from '../config/constants';
import { getJSON, setJSON } from '../utils/storage';
import { searchSuggestions } from '../services/nominatimService';

const SearchBar = forwardRef(function SearchBar({ onSearch, loading = false }, ref) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [sugLoading, setSugLoading] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const history = getJSON(STORAGE_KEYS.SEARCH_HISTORY, []);

  // debounce 自動建議：輸入 2 字以上、停 400ms 後呼叫 Nominatim
  const fetchSuggestions = useCallback((q) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!q || q.trim().length < 2) { setSuggestions([]); return; }
    timerRef.current = setTimeout(async () => {
      setSugLoading(true);
      try {
        const res = await searchSuggestions(q.trim());
        setSuggestions(res);
      } catch { setSuggestions([]); }
      finally { setSugLoading(false); }
    }, 400);
  }, []);

  // 讓父元件可透過 ref 呼叫 focus
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    fetchSuggestions(val);
  };

  const saveHistory = (text) => {
    const updated = [text, ...history.filter((h) => h !== text)].slice(0, 10);
    setJSON(STORAGE_KEYS.SEARCH_HISTORY, updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveHistory(query.trim());
    setFocused(false);
    setSuggestions([]);
    onSearch(query.trim());
  };

  // 點擊建議項目 → 直接搜尋該地址
  const handleSuggestionClick = (sug) => {
    const label = sug.shortName || sug.displayName;
    setQuery(label);
    saveHistory(label);
    setFocused(false);
    setSuggestions([]);
    onSearch(sug.displayName);
  };

  const handleHistoryClick = (item) => {
    setQuery(item);
    setFocused(false);
    setSuggestions([]);
    onSearch(item);
  };

  // 下拉顯示邏輯
  const hasSuggestions = suggestions.length > 0;
  const showHistory_ = !hasSuggestions && !sugLoading && query.trim().length < 2 && history.length > 0;
  const showDropdown = focused && (hasSuggestions || sugLoading || showHistory_);

  return (
    <div className="relative px-4 pt-2 pb-1">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden transition-shadow focus-within:shadow-card-hover focus-within:border-primary-200">
          <Search className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 250)}
            placeholder="搜尋地址或地名..."
            className="flex-1 px-3 py-3 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
          />
          {(loading || sugLoading) && <Loader2 className="w-4 h-4 text-primary-500 animate-spin mr-2" />}
          {query && !loading && !sugLoading && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }}
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

      {/* 建議 / 歷史下拉 */}
      {showDropdown && (
        <div className="absolute left-4 right-4 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden max-h-72 overflow-y-auto">
          {/* 地址建議 */}
          {hasSuggestions && (
            <>
              <p className="px-4 py-2 text-xs text-gray-400 font-medium">相關地址</p>
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onMouseDown={() => handleSuggestionClick(sug)}
                  className="w-full px-4 py-2.5 text-left hover:bg-primary-50 flex items-start gap-2.5 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700 font-medium truncate">{sug.shortName}</p>
                    <p className="text-xs text-gray-400 truncate">{sug.displayName}</p>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* 載入中 */}
          {sugLoading && !hasSuggestions && (
            <div className="px-4 py-4 flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              搜尋建議中...
            </div>
          )}

          {/* 歷史紀錄 */}
          {showHistory_ && (
            <>
              <p className="px-4 py-2 text-xs text-gray-400 font-medium">最近搜尋</p>
              {history.slice(0, 5).map((item, i) => (
                <button
                  key={i}
                  onMouseDown={() => handleHistoryClick(item)}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-primary-50 flex items-center gap-2 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                  {item}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
});

export default SearchBar;
