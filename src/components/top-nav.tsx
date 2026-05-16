import { SearchBar } from "./search-bar";
import { ProviderSelector } from "./provider-selector";
import { Settings } from "lucide-react";

interface TopNavProps {
  activeProvider: string;
  onProviderSelect: (provider: string) => void;
}

export function TopNav({ activeProvider, onProviderSelect }: TopNavProps) {
  return (
    <div className="absolute top-6 right-10 z-50 flex items-center gap-3">
      <SearchBar />
      <ProviderSelector selected={activeProvider} onSelect={onProviderSelect} />
      <button 
        className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-gray-300 hover:text-white transition-all shadow-lg focus:outline-none cursor-pointer"
        aria-label="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
}
