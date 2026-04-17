"use client";

import { PlusSquare, Share, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function PWAInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if it's already installed
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) {
      return;
    }

    // Check if dismissed previously
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Delay showing the prompt slightly to let the page load
      setTimeout(() => setShowPrompt(true), 2000);
    }

    // Handle beforeinstallprompt for Android / Desktop
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 bg-[#111111] border border-white/10 p-5 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-bottom-8 duration-500 fade-in">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors p-1"
        aria-label="Fechar"
      >
        <X size={16} />
      </button>

      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-semibold text-white text-lg">Instale o App</h3>
          <p className="text-sm text-white/60 mt-1 leading-relaxed">
            Adicione o AutoSystem à sua tela inicial para uma experiência mais
            rápida e em tela cheia.
          </p>
        </div>

        {isIOS ? (
          <div className="bg-white/5 p-4 rounded-xl text-sm text-white/80 flex flex-col gap-3 border border-white/5">
            <p className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-white/10 text-xs font-medium">
                1
              </span>
              <span>
                Toque em compartilhar{" "}
                <Share size={16} className="inline ml-1 text-blue-400" />
              </span>
            </p>
            <p className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-white/10 text-xs font-medium">
                2
              </span>
              <span>
                Selecione "Adicionar à Tela de Início"{" "}
                <PlusSquare size={16} className="inline ml-1" />
              </span>
            </p>
          </div>
        ) : (
          <Button
            onClick={handleInstallClick}
            className="w-full font-medium"
            size="lg"
          >
            Instalar Agora
          </Button>
        )}
      </div>
    </div>
  );
}
