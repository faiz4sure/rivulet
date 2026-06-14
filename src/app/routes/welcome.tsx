import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, Download, Package, Settings, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { installPlugin, type InstallProgress, type InstallStep } from "@/lib/plugin/manager";

const STEP_CONFIG: Record<InstallStep, { icon: typeof Loader2; color: string; label: string }> = {
  resolving:    { icon: Loader2,      color: "text-white/60",   label: "Resolving" },
  validated:    { icon: Check,        color: "text-white",      label: "Validated" },
  downloading:  { icon: Download,     color: "text-white/70",   label: "Downloading" },
  extracting:   { icon: Package,      color: "text-white/70",   label: "Extracting" },
  installing:   { icon: Settings,     color: "text-white/60",   label: "Installing" },
  ready:        { icon: Sparkles,     color: "text-white",      label: "Ready" },
  error:        { icon: AlertCircle,  color: "text-red-400",    label: "Error" },
};

function WelcomePage() {
  const navigate = useNavigate();
  const [showInput, setShowInput] = useState(false);
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState<InstallProgress | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = useCallback(async () => {
    if (!url.trim() || isInstalling) return;

    setIsInstalling(true);
    try {
      await installPlugin(url.trim(), (p) => {
        setProgress({ ...p });
      });
      await new Promise((r) => setTimeout(r, 1500));
      navigate("/", { replace: true });
    } catch {
      setIsInstalling(false);
    }
  }, [url, isInstalling, navigate]);

  const handleReset = () => {
    setProgress(null);
    setIsInstalling(false);
    setUrl("");
  };

  const currentStep = progress ? STEP_CONFIG[progress.step] : null;
  const StepIcon = currentStep?.icon || Loader2;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[700px] h-[700px] rounded-full opacity-[0.04] blur-[120px]"
          style={{
            background: "radial-gradient(circle, white, transparent 70%)",
            top: "-25%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.02] blur-[100px]"
          style={{
            background: "radial-gradient(circle, white, transparent 70%)",
            bottom: "-20%",
            right: "10%",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{
          opacity: 1,
          y: showInput ? -40 : 0,
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center text-center px-6"
      >
        <motion.h1
          className="text-6xl font-bold tracking-tight text-white mb-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Rivulet
        </motion.h1>

        <motion.p
          className="text-base text-white/35 max-w-sm mb-14 font-light leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          A streaming experience powered by plugins.
          <br />
          Add a plugin to get started.
        </motion.p>

        <AnimatePresence mode="wait">
          {!showInput ? (
            <motion.button
              key="add-btn"
              onClick={() => setShowInput(true)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl text-white/80 font-medium text-[15px] cursor-pointer overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                backdropFilter: "blur(24px) saturate(1.2)",
                WebkitBackdropFilter: "blur(24px) saturate(1.2)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
                transition: "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.15s ease",
              }}
              whileHover={{
                y: -2,
                scale: 1.03,
                boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
              whileTap={{
                y: 2,
                scale: 0.96,
                boxShadow: "0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.02)",
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)",
                }}
              />
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Add Plugin</span>
            </motion.button>
          ) : (
            <motion.div
              key="input-area"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-lg"
            >
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(40px) saturate(1.1)",
                  WebkitBackdropFilter: "blur(40px) saturate(1.1)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInstall()}
                    placeholder="Paste manifest.json URL..."
                    disabled={isInstalling}
                    className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white/90 placeholder:text-white/20 text-sm focus:outline-none focus:border-white/15 transition-all disabled:opacity-30"
                    autoFocus
                  />
                  <motion.button
                    onClick={() => {
                      setShowInput(false);
                      handleReset();
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
                {!progress && (
                  <motion.button
                    onClick={handleInstall}
                    disabled={!url.trim() || isInstalling}
                    className="w-full py-3 rounded-xl font-medium text-sm cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed overflow-hidden relative"
                    style={{
                      background: url.trim()
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(255, 255, 255, 0.02)",
                      color: url.trim() ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      transition: "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.15s ease",
                    }}
                    whileHover={url.trim() ? {
                      y: -1,
                      scale: 1.01,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
                    } : {}}
                    whileTap={url.trim() ? {
                      y: 1,
                      scale: 0.98,
                    } : {}}
                  >
                    Install Plugin
                  </motion.button>
                )}

                <AnimatePresence>
                  {progress && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-3 py-3">
                        <div className="relative w-5 h-5 flex items-center justify-center">
                          <AnimatePresence mode="popLayout">
                            <motion.div
                              key={progress.step}
                              initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                              exit={{ opacity: 0, scale: 1.5, filter: "blur(4px)" }}
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <StepIcon className={`w-5 h-5 ${currentStep?.color}`} />
                            </motion.div>
                          </AnimatePresence>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${currentStep?.color}`}>
                            {currentStep?.label}
                          </p>
                          <p className="text-xs text-white/25 truncate">
                            {progress.message}
                          </p>
                        </div>
                      </div>
                      {progress.step !== "error" && (
                        <div className="h-[2px] bg-white/[0.04] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-white/30"
                            initial={{ width: "0%" }}
                            animate={{
                              width:
                                progress.step === "resolving"
                                  ? "15%"
                                  : progress.step === "validated"
                                    ? "30%"
                                    : progress.step === "downloading"
                                      ? "50%"
                                      : progress.step === "extracting"
                                        ? "70%"
                                        : progress.step === "installing"
                                          ? "85%"
                                          : "100%",
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                      )}

                      {progress.step === "error" && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={handleReset}
                          className="mt-3 w-full py-2 rounded-lg text-sm text-white/40 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-colors cursor-pointer"
                        >
                          Try Again
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export const Component = WelcomePage;
