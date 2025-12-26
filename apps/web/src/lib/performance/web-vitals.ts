import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { addDatadogTiming } from '../monitoring/datadog';
import { captureMessage } from '../monitoring/sentry';

/**
 * Web Vitals thresholds (from Google)
 */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

type VitalRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Get the rating for a metric value
 */
function getRating(name: string, value: number): VitalRating {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Send vitals to analytics endpoint
 */
function sendToAnalytics(metric: Metric): void {
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  if (analyticsEndpoint) {
    fetch(analyticsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch((error) => {
      console.error('[Web Vitals] Failed to send to analytics:', error);
    });
  }

  // Log in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }
}

/**
 * Handle metric and send to monitoring services
 */
function handleMetric(metric: Metric): void {
  sendToAnalytics(metric);
  addDatadogTiming(metric.name, metric.value);

  if (metric.rating === 'poor') {
    captureMessage(`Poor ${metric.name}: ${metric.value}`, 'warning', {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      url: window.location.href,
    });
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals(): void {
  try {
    onLCP(handleMetric);
    onCLS(handleMetric);
    onINP(handleMetric);
    onFCP(handleMetric);
    onTTFB(handleMetric);

    console.log('[Web Vitals] Monitoring initialized');
  } catch (error) {
    console.error('[Web Vitals] Failed to initialize:', error);
  }
}

/**
 * Get current Web Vitals (for display in dev tools)
 */
export function getWebVitals(): Promise<Record<string, Metric>> {
  return new Promise((resolve) => {
    const vitals: Record<string, Metric> = {};
    let count = 0;
    const totalMetrics = 5;

    const checkComplete = (): void => {
      count++;
      if (count === totalMetrics) {
        resolve(vitals);
      }
    };

    onLCP((metric: Metric) => {
      vitals.LCP = metric;
      checkComplete();
    });

    onCLS((metric: Metric) => {
      vitals.CLS = metric;
      checkComplete();
    });

    onINP((metric: Metric) => {
      vitals.INP = metric;
      checkComplete();
    });

    onFCP((metric: Metric) => {
      vitals.FCP = metric;
      checkComplete();
    });

    onTTFB((metric: Metric) => {
      vitals.TTFB = metric;
      checkComplete();
    });

    setTimeout(() => resolve(vitals), 5000);
  });
}

/**
 * Export thresholds and rating function for external use
 */
export { THRESHOLDS, getRating };
