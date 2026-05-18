import { useState, useRef, useEffect } from "react";
import { ChevronDown, Server } from "lucide-react";

interface ProviderSelectorProps {
  selected: string;
  onSelect: (provider: string) => void;
}

const AVAILABLE_PROVIDERS = ["None", "SuperStream", "SoraStream", "MegaCloud", "AniList", "dummyProvider"];

export function ProviderSelector({ selected, onSelect }: ProviderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white px-4 h-10 rounded-full font-medium transition-all shadow-lg focus:outline-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Server className="w-4 h-4 text-gray-300" />
        <span className="text-sm">{selected}</span>
        <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 origin-top-right animate-in fade-in zoom-in-95 duration-200"
          role="listbox"
        >
          {AVAILABLE_PROVIDERS.map((provider) => (
            <button
              key={provider}
              onClick={() => {
                onSelect(provider);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                selected === provider 
                  ? "bg-primary/20 text-white font-semibold" 
                  : "text-gray-300 hover:bg-accent/50 hover:text-white"
              }`}
              role="option"
              aria-selected={selected === provider}
            >
              {provider}
              {selected === provider && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
