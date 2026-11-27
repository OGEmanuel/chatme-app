import * as Amplitude from '@amplitude/analytics-react-native';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

export type AnalyticsEventName =
  | 'app_opened'
  | 'screen_viewed'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'otp_requested'
  | 'otp_verification_failed'
  | 'signup_completed'
  | 'login_completed'
  | 'logout_completed'
  | 'conversation_opened'
  | 'conversation_creation_confirmed'
  | 'history_load_failed'
  | 'history_retry_started'
  | 'message_send_attempted'
  | 'message_send_confirmed'
  | 'message_send_failed'
  | 'message_delivery_observed'
  | 'message_read_observed'
  | 'message_retry_started'
  | 'message_recovery_completed'
  | 'attachment_selected'
  | 'media_upload_started'
  | 'media_upload_completed'
  | 'media_upload_failed'
  | 'attachment_opened'
  | 'attachment_open_failed'
  | 'voice_recording_started'
  | 'voice_recording_cancelled'
  | 'voice_playback_started'
  | 'message_action_completed'
  | 'group_member_added'
  | 'group_left'
  | 'search_completed'
  | 'contact_discovery_completed'
  | 'permission_result'
  | 'push_registration_completed'
  | 'push_registration_failed'
  | 'notification_opened'
  | 'deep_link_opened'
  | 'navigation_destination_resolved'
  | 'conversation_setting_changed'
  | 'security_setting_changed';

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

const allowedProperties = new Set([
  'environment',
  'screen_name',
  'app_version',
  'platform',
  'session_identifier',
  'login_kind',
  'entry_step',
  'error_code',
  'retryable',
  'outcome',
  'failure_stage',
  'attempt_number',
  'operation_id',
  'message_type',
  'conversation_type',
  'is_reply',
  'attachment_count',
  'receipt_scope',
  'load_kind',
  'duration_ms',
  'network_status',
  'setting',
  'enabled',
  'result',
  'permission_type',
  'notification_type',
  'destination_type',
  'app_state',
  'entry_point',
  'required_step',
  'action',
  'member_count_bucket',
  'search_scope',
  'result_count_bucket',
  'query_length_bucket',
  'matched_count_bucket',
  'unmatched_count_bucket',
  'duration_bucket',
  'playback_source',
  'feature',
]);

let initialized = false;
let appOpened = false;

export function initializeAnalytics() {
  if (initialized) return;
  initialized = true;

  const apiKey = __DEV__
    ? (process.env.EXPO_PUBLIC_AMPLITUDE_DEV_API_KEY ??
      process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY)
    : process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY;

  if (!apiKey) {
    if (__DEV__) console.info('Analytics disabled: no Amplitude API key');
    return;
  }

  try {
    Amplitude.init(apiKey, undefined, {
      logLevel: __DEV__ ? 3 : 0,
    });
  } catch (error) {
    console.warn('Analytics initialization failed');
  }
}

export function setAnalyticsUser(userId: string | null) {
  try {
    if (userId) Amplitude.setUserId(userId);
  } catch {
    // Analytics must never block app behaviour.
  }
}

export function resetAnalyticsIdentity() {
  try {
    Amplitude.reset();
  } catch {
    // Analytics must never block app behaviour.
  }
}

export function track(
  eventName: AnalyticsEventName,
  properties: AnalyticsProperties = {},
) {
  const sanitized: AnalyticsProperties = {};
  for (const [key, value] of Object.entries(properties)) {
    if (allowedProperties.has(key) && value !== undefined) {
      sanitized[key] = value;
    }
  }

  const eventProperties = {
    event_id: Crypto.randomUUID(),
    schema_version: 1,
    occurred_at: new Date().toISOString(),
    source: 'app',
    environment: __DEV__ ? 'development' : 'production',
    app_version: Constants.expoConfig?.version ?? '1.0.0',
    platform: Platform.OS,
    ...sanitized,
  };

  try {
    Amplitude.track(eventName, eventProperties);
  } catch {
    // Tracking is intentionally non-blocking.
  }
}

export function trackAppOpened() {
  if (appOpened) return;
  appOpened = true;
  track('app_opened');
}
