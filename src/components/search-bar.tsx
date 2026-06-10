import { useState, useEffect, useRef } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

export function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const active = isExpanded || isFocused || query.length > 0;

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setIsExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === "Escape" && active) {
        setIsExpanded(false);
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active]);

  return (
    <motion.div 
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      animate={{ 
        width: active ? 280 : 40,
        backgroundColor: active ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.4)",
        borderColor: active ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"
      }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="flex items-center backdrop-blur-md border rounded-full h-10 overflow-hidden shadow-lg relative"
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
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
        className="bg-transparent text-sm text-white placeholder:text-gray-500 flex-1 min-w-0 h-full outline-none pr-10"
        style={{
          opacity: active ? 1 : 0,
          pointerEvents: active ? "auto" : "none",
        }}
      />

      <AnimatePresence>
        {active && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 10 }}
            transition={{ duration: 0.2 }}
            onClick={handleSearch}
            className="absolute right-1.5 w-7 h-7 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
            aria-label="Submit search"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
