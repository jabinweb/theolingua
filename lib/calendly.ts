export const CALENDLY_BOOKING_URL = 'https://calendly.com/sciolabs-info/30min';

const WIDGET_CSS = 'https://assets.calendly.com/assets/external/widget.css';
const WIDGET_JS = 'https://assets.calendly.com/assets/external/widget.js';

let loadPromise: Promise<void> | null = null;

function calendlyReady(): boolean {
  return typeof window !== 'undefined' && typeof window.Calendly?.initPopupWidget === 'function';
}

function injectCalendly(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (calendlyReady()) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${WIDGET_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = WIDGET_CSS;
      document.head.appendChild(link);
    }

    const finish = () => {
      if (calendlyReady()) resolve();
      else reject(new Error('Calendly unavailable'));
    };

    const existing = document.getElementById('calendly-widget-js') as HTMLScriptElement | null;
    if (existing) {
      if (calendlyReady()) {
        finish();
        return;
      }
      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener('error', () => reject(new Error('Calendly script failed')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = 'calendly-widget-js';
    script.src = WIDGET_JS;
    script.async = true;
    script.onload = finish;
    script.onerror = () => reject(new Error('Calendly script failed'));
    document.body.appendChild(script);
  });

  return loadPromise;
}

/** Loads Calendly assets if needed and opens the official popup embed. */
export async function openCalendlyPopup(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await injectCalendly();
    window.Calendly?.initPopupWidget({ url: CALENDLY_BOOKING_URL });
  } catch {
    window.open(CALENDLY_BOOKING_URL, '_blank', 'noopener,noreferrer');
  }
}

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget(options: { url: string }): void;
    };
  }
}
