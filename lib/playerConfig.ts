// Phase II 1H.5: Player configuration and thresholds
// Centralized config for easy tweaking of auto-completion thresholds

export const PLAYER_CONFIG = {
  // Scroll depth threshold (0-1): lesson completes when user scrolls this much
  SCROLL_DEPTH_THRESHOLD: 0.9, // 90%

  // Video watch threshold (0-1): lesson completes when user watches this percentage
  VIDEO_WATCH_THRESHOLD: 0.9, // 90%

  // Minimum time threshold (seconds): lesson completes after spending this much time
  MIN_TIME_SEC: 120, // 2 minutes

  // Telemetry update interval (milliseconds): how often to save progress
  TELEMETRY_SAVE_INTERVAL_MS: 5000, // 5 seconds

  // Scroll tracking interval (milliseconds): how often to check scroll depth
  SCROLL_CHECK_INTERVAL_MS: 500, // 0.5 seconds
} as const;


