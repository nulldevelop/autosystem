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
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 bg-card border border-border p-4 sm:p-5 rounded-xl shadow-xl z-40 animate-in slide-in-from-bottom-4 duration-300">
      <Button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
        aria-label="Fechar"
      >
        <X size={16} />
      </Button>

      <div className="flex flex-col gap-3">
        <div>
          <h3 className="font-semibold text-foreground text-base">Instale o App AutoSystem</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Adicione o sistema à sua tela inicial para acesso rápido e em tela cheia.
          </p>
        </div>

        {isIOS ? (
          <div className="bg-muted/50 p-3 rounded-lg text-xs text-foreground flex flex-col gap-2.5 border border-border">
            <p className="flex items-center gap-2.5">
              <span className="flex items-center justify-center size-5 rounded bg-muted text-xs font-semibold text-muted-foreground">
                1
              </span>
              <span>
                Toque no botão de compartilhar{" "}
                <Share size={14} className="inline ml-1 text-primary" />
              </span>
            </p>
            <p className="flex items-center gap-2.5">
              <span className="flex items-center justify-center size-5 rounded bg-muted text-xs font-semibold text-muted-foreground">
                2
              </span>
              <span>
                Selecione "Adicionar à Tela de Início"{" "}
                <PlusSquare size={14} className="inline ml-1 text-primary" />
              </span>
            </p>
          </div>
        ) : (
          <Button
            onClick={handleInstallClick}
            className="w-full text-xs font-medium h-9"
          >
            Instalar Agora
          </Button>
        )}
      </div>
    </div>
  );
}
