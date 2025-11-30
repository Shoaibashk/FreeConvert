import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Browser event fired before the install prompt is shown.
 * This event can be captured to show a custom install button.
 */
interface BeforeInstallPromptEvent extends Event {
  /** Shows the install prompt */
  prompt: () => Promise<void>;
  /** Promise that resolves with the user's choice */
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface UsePWAReturn {
  /** Whether the app can be installed (install prompt available) */
  isInstallable: boolean;
  /** Whether the app is already installed (running in standalone mode) */
  isInstalled: boolean;
  /** Function to trigger the install prompt */
  installApp: () => Promise<boolean>;
}

// ============================================================================
// Constants
// ============================================================================

const STANDALONE_QUERY = '(display-mode: standalone)';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Safely checks if we're running in a browser environment.
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Checks if the app is running in standalone (installed) mode.
 */
function isRunningStandalone(): boolean {
  if (!isBrowser()) return false;
  return window.matchMedia(STANDALONE_QUERY).matches;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Custom hook for managing Progressive Web App (PWA) installation.
 *
 * Features:
 * - Detects if the app can be installed
 * - Detects if the app is already installed
 * - Provides a function to trigger the install prompt
 * - Updates state when the app is installed
 *
 * @example
 * ```tsx
 * const { isInstallable, installApp } = usePWA();
 *
 * if (isInstallable) {
 *   return <button onClick={installApp}>Install App</button>;
 * }
 * ```
 */
export function usePWA(): UsePWAReturn {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Set up event listeners for install prompt and app installation
  useEffect(() => {
    if (!isBrowser()) return;

    // Check if already installed on mount
    setIsInstalled(isRunningStandalone());

    /**
     * Handles the beforeinstallprompt event.
     * This event is fired when the browser determines the app can be installed.
     */
    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent the default browser install prompt
      event.preventDefault();

      // Store the event for later use
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    /**
     * Handles the appinstalled event.
     * This event is fired when the app has been successfully installed.
     */
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Register event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Triggers the install prompt and handles the user's response.
   * @returns Promise<boolean> - true if the user accepted, false otherwise
   */
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }

      // Clear the deferred prompt (can only be used once)
      setDeferredPrompt(null);

      return outcome === 'accepted';
    } catch {
      // Installation failed or was cancelled
      return false;
    }
  }, [deferredPrompt]);

  return {
    isInstallable,
    isInstalled,
    installApp,
  };
}
