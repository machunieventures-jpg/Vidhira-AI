
export type EventName = 
  | 'REPORT_GENERATED'
  | 'PROFILE_EDITED'
  | 'REPORT_UNLOCKED'
  | 'BRAND_ANALYZED'
  | 'PHONE_ANALYZED'
  | 'YEARLY_FORECAST_GENERATED'
  | 'DAILY_HOROSCOPE_GENERATED'
  | 'CHAT_MESSAGE_SENT'
  | 'JYOTISH_REPORT_GENERATED'
  | 'COMPETITOR_ANALYZED'
  | 'LOGO_ANALYZED'
  | 'IMAGE_EDITED';

interface AnalyticsEvent {
  timestamp: string;
  eventName: EventName;
  payload?: Record<string, any>;
}

const ANALYTICS_STORAGE_KEY = 'vidhiraAnalyticsEvents';

/**
 * Tracks a user interaction event and stores it in localStorage.
 * This is a simple, local-only analytics solution.
 *
 * @param eventName The name of the event to track.
 * @param payload Optional data to include with the event.
 */
export const trackEvent = (eventName: EventName, payload?: Record<string, any>): void => {
  try {
    const newEvent: AnalyticsEvent = {
      timestamp: new Date().toISOString(),
      eventName,
      payload,
    };

    const existingEventsRaw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    const existingEvents: AnalyticsEvent[] = existingEventsRaw ? JSON.parse(existingEventsRaw) : [];

    existingEvents.push(newEvent);

    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(existingEvents));
  } catch (error) {
    console.error('Failed to track analytics event:', error);
  }
};