export const APP_CONFIG = {
  NAME: 'AMPP',
  VERSION: '1.0.0',
  DESCRIPTION: 'Smart financial management for students',
  DEMO_USER_ID: 'demo-user-1'
} as const;

export const BUDGET_CONFIG = {
  DEFAULT_MONTHLY: 8000,
  ALERT_THRESHOLDS: {
    HEALTHY: 60,
    WARNING: 85,
    CRITICAL: 100
  },
  COLORS: {
    HEALTHY: '#10B981',
    WARNING: '#F59E0B', 
    CRITICAL: '#EF4444'
  }
} as const;

export const GOAL_CONFIG = {
  MIN_AMOUNT: 100,
  MAX_AMOUNT: 100000,
  DEFAULT_DURATION_DAYS: 90,
  MILESTONE_COUNT: 3
} as const;

export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    EASE_OUT: [0.25, 0.46, 0.45, 0.94],
    EASE_IN: [0.55, 0.055, 0.675, 0.19],
    EASE_IN_OUT: [0.645, 0.045, 0.355, 1]
  }
} as const;

export const SECURITY_CONFIG = {
  SESSION_TIMEOUT_MS: 15 * 60 * 1000, // 15 minutes
  PIN_LENGTH: 4,
  MAX_LOGIN_ATTEMPTS: 3
} as const;
