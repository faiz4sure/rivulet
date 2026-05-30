import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router";

export function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setIsExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  return (
    <div 
      className={`flex items-center transition-all duration-300 ease-in-out ${
        isExpanded ? "w-64 bg-black/80 border-white/30" : "w-10 bg-black/40 border-white/10"
      } backdrop-blur-md border rounded-full h-10 overflow-hidden shadow-lg focus-within:border-white/40`}
    >
      <button 
        onClick={() => {
          setIsExpanded(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="flex-shrink-0 flex items-center justify-center w-10 h-10 text-gray-300 hover:text-white transition-colors cursor-pointer"
        aria-label="Search"
      >
        <Search className="w-4 h-4" />
      </button>
      
      <input
        ref={inputRef}
        type="text"
        placeholder="Search... (/)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setIsExpanded(false);
          }
        }}
        onBlur={() => {
          if (!query) setIsExpanded(false);
        }}
        className={`bg-transparent text-sm text-white placeholder:text-gray-500 w-full h-full outline-none transition-opacity duration-300 ${
          isExpanded ? "opacity-100 pr-4" : "opacity-0 pointer-events-none"
        }`}
      />
    </div>
  );
}
