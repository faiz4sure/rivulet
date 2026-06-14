import { useState, useRef, useEffect } from "react";
import { ChevronDown, Server } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getInstalledPlugins, type InstalledPlugin } from "@/lib/plugin/manager";

interface ProviderSelectorProps {
  selected: string;
  onSelect: (provider: string) => void;
}

export function ProviderSelector({ selected, onSelect }: ProviderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [providers, setProviders] = useState<{id: string, name: string}[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProviders() {
      const plugins = await getInstalledPlugins();
      const allProviders = plugins.flatMap((plugin: InstalledPlugin) =>
        plugin.providers
          .filter(p => p.enabled !== false)
          .map(p => ({ id: p.id, name: p.name }))
      );
      setProviders(allProviders);
    }
    loadProviders();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedName = providers.find(p => p.id === selected)?.name || "Select Provider";

  return (
    <motion.div 
      className="relative" 
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <motion.button
        whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.6)" }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 text-white px-4 h-10 rounded-full font-medium transition-colors shadow-lg focus:outline-none cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Server className="w-4 h-4 text-neutral-300" />
        <span className="text-sm">{selectedName}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-neutral-300" />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-48 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1.5 origin-top-right z-50"
            role="listbox"
          >
            {providers.map((provider) => (
              <button
                  key={provider.id}
                  onClick={() => {
                    onSelect(provider.id);
                    setIsOpen(false);
                  }}
                className={`relative w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between group ${
                    selected === provider.id
                    ? "text-white font-medium" 
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                role="option"
                aria-selected={selected === provider.id}
                >
                <span className="relative z-10">{provider.name}</span>
                {selected === provider.id && (
                  <motion.div 
                    layoutId="activeProviderIndicator"
                    className="w-1.5 h-1.5 rounded-full bg-primary relative z-10" 
                  />
                )}
              </button>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
