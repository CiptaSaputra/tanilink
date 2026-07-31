import React, { useState, useEffect, useRef } from "react";
import { searchRegions } from "../utils/geocoding";
import { Search, MapPin, Loader2 } from "lucide-react";

interface RegionAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (lat: number, lng: number, name: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RegionAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Ketik kota/daerah...",
  className = "",
}: RegionAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<
    { lat: number; lng: number; name: string; displayName: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync internal query state with prop value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Don't search if the query is exactly the selected value (to prevent re-fetching on select)
    if (query === value) {
        return;
    }

    setIsLoading(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      const data = await searchRegions(query);
      setResults(data);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, value]);

  const handleSelect = (lat: number, lng: number, name: string) => {
    setQuery(name);
    onChange(name);
    onSelect(lat, lng, name);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full bg-white border border-nat-border rounded px-2 py-1 text-nat-dark font-bold focus:outline-none focus:ring-1 focus:ring-nat-green pl-7 ${className}`}
        />
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-nat-sage animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5 text-nat-sage" />
          )}
        </div>
      </div>

      {isOpen && (query.trim().length >= 3) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-nat-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {isLoading && results.length === 0 ? (
            <div className="p-3 text-center text-xs text-nat-sage">
              Mencari lokasi...
            </div>
          ) : results.length > 0 ? (
            <ul className="py-1">
              {results.map((res, i) => (
                <li
                  key={i}
                  onClick={() => handleSelect(res.lat, res.lng, res.name)}
                  className="px-3 py-2 hover:bg-nat-light-cream cursor-pointer border-b border-nat-border/50 last:border-0 flex items-start gap-2 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-nat-green shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-nat-dark leading-tight">
                      {res.name}
                    </span>
                    <span className="text-[10px] text-nat-sage leading-tight mt-0.5">
                      {res.displayName}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-center text-xs text-nat-sage">
              Lokasi tidak ditemukan
            </div>
          )}
        </div>
      )}
    </div>
  );
}
