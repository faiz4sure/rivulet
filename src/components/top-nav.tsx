import { SearchBar } from "./search-bar";
import { ProviderSelector } from "./provider-selector";
import { Settings } from "lucide-react";
import { motion } from "framer-motion";

interface TopNavProps {
  activeProvider: string;
  onProviderSelect: (provider: string) => void;
}

export function TopNav({ activeProvider, onProviderSelect }: TopNavProps) {
  return (
    <div className="absolute top-6 right-10 z-50 flex items-center gap-3">
      <SearchBar />
      <ProviderSelector selected={activeProvider} onSelect={onProviderSelect} />
      <motion.button 
        whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.6)" }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-neutral-300 hover:text-white shadow-lg focus:outline-none cursor-pointer transition-colors"
        aria-label="Settings"
      >
        <Settings className="w-4 h-4" />
      </motion.button>
    </div>
  );
}
