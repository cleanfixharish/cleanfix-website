export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type InstallState = {
  prompt: BeforeInstallPromptEvent | null;
  installed: boolean;
};

const listeners = new Set<(state: InstallState) => void>();
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let initialized = false;

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function snapshot(): InstallState {
  return { prompt: deferredPrompt, installed: isStandalone() };
}

function publish() {
  const state = snapshot();
  listeners.forEach((listener) => listener(state));
}

export function initializePwaInstall() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    publish();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    publish();
  });
}

export function subscribeToPwaInstall(listener: (state: InstallState) => void) {
  listeners.add(listener);
  listener(snapshot());
  return () => {
    listeners.delete(listener);
  };
}

export async function requestPwaInstall() {
  if (!deferredPrompt) return 'unavailable' as const;

  const prompt = deferredPrompt;
  await prompt.prompt();
  const { outcome } = await prompt.userChoice;
  deferredPrompt = null;
  publish();
  return outcome;
}
