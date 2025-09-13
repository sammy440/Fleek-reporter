"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({
  defaultValue = "",
  placeholder = "Search reports...",
  onSearch,
  onChange,
  debounceMs = 300,
  className = "",
  inputProps = {},
}) {
  const [query, setQuery] = useState(defaultValue);
  const timeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced search callback
  useEffect(() => {
    if (!onSearch) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Only call onSearch if there's actually a query
      if (query && query.trim() !== '') {
        onSearch(query);
      }
    }, debounceMs);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, onSearch, debounceMs]);

  const handleChange = (e) => {
    const next = e.target.value;
    setQuery(next);
    if (onChange) onChange(next);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (onSearch) onSearch(query);
    } else if (e.key === "Escape") {
      setQuery("");
      if (onChange) onChange("");
      if (onSearch) onSearch("");
      if (inputRef.current) inputRef.current.blur();
    }
  };

  const clear = () => {
    setQuery("");
    if (onChange) onChange("");
    if (onSearch) onSearch("");
    if (inputRef.current) inputRef.current.focus();
  };

  const containerClass = useMemo(
    () => `relative w-full ${className}`.trim(),
    [className]
  );

  return (
    <div className={`${containerClass} group`} role="search">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 transition-colors group-focus-within:text-gray-600">
        <Search className="w-4 h-4" aria-hidden="true" />
      </span>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-[300px] rounded-full border border-gray-200/80 bg-white/80 backdrop-blur-sm py-2.5 pr-10 pl-9 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent hover:bg-white transition-colors"
        {...inputProps}
      />
      {query ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 mr-2 flex items-center rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
      ) : null}
    </div>
  );
}
