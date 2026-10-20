import { useEffect, useState } from 'react';
import { RefreshCw, WifiOff, X } from 'lucide-react';
import { useConnectionStatus } from '../hooks/useConnectionStatus';

const DISMISSED_KEY = 'stellar:offline-banner:dismissed';

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeDismissed(value: boolean) {
  try {
    if (value) {
      window.localStorage.setItem(DISMISSED_KEY, 'true');
    } else {
      window.localStorage.removeItem(DISMISSED_KEY);
    }
  } catch {
    /* localStorage unavailable (incognito / private mode) */
  }
}

export const OfflineBanner = () => {
  const { isDisconnected, reconnect } = useConnectionStatus();
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    setDismissed(readDismissed());
  }, []);

  useEffect(() => {
    if (!isDisconnected) {
      setReconnecting(false);
    }
  }, [isDisconnected]);

  if (!isDisconnected) return null;
  if (dismissed) return null;

  const handleReconnect = async () => {
    if (reconnecting) return;
    setReconnecting(true);
    try {
      await Promise.resolve(reconnect());
    } finally {
      setReconnecting(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    writeDismissed(true);
  };

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 flex items-center gap-3 border-b border-red-400/25 bg-[#0A0F1A]/95 px-4 py-2.5 text-white shadow-lg shadow-black/40 backdrop-blur-xl sm:px-6"
      role="alert"
      aria-live="assertive"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <WifiOff className="h-h-4 w-4 shrink-0 text-red-300" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-red-200">
              Connection lost
            </p>
            <p className="truncate text-sm text-slate-300">
              Live updates are paused. Reconnect to resume your session.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleReconnect}
            disabled={reconnecting}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-300/30 bg-red-400/10 px-2.5 py-1.5 text-xs font-semibold text-red-100 transition-colors hover/enabled:border-red-300/60 hover/enabled:bg-red-400/20 focus:outline-none focus:ring-2 focus:ring-red-300/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`${reconnecting ? 'animate-spin ' : ''}h-3.5 w-3.5`}
              aria-hidden="true"
            />
            {reconnecting ? 'Reconnecting…' : 'Reconnect'}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Dismiss connection alert"
          >
            <X className="h-w-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
