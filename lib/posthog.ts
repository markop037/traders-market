import posthog from 'posthog-js';

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_TRADERS_MARKET_POSTHOG_KEY || '';
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_TRADERS_MARKET_POSTHOG_HOST || 'https://us.i.posthog.com';

export function initPostHog() {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    // We manually emit `$pageview` on Next.js route changes (see `components/PostHogProvider.tsx`).
    // Keeping PostHog's built-in capture disabled avoids duplicate `$pageview` events.
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
  });
}

// --- User Identification ---

export function identifyUser(
  uid: string,
  properties?: Record<string, any>,
) {
  posthog.identify(uid, properties);
}

export function resetUser() {
  posthog.reset();
}

// --- Custom Event Helpers ---

export function capture(event: string, properties?: Record<string, any>) {
  posthog.capture(event, properties);
}

// Auth events
export function trackSignupStarted(method: 'email' | 'google') {
  capture('signup_started', { method });
}

export function trackSignupCompleted(method: 'email' | 'google', userId: string) {
  capture('signup_completed', { method, user_id: userId });
}

export function trackSignupFailed(method: 'email' | 'google', error: string) {
  capture('signup_failed', { method, error });
}

export function trackLoginStarted(method: 'email' | 'google') {
  capture('login_started', { method });
}

export function trackLoginCompleted(method: 'email' | 'google', userId: string) {
  capture('login_completed', { method, user_id: userId });
}

export function trackLoginFailed(method: 'email' | 'google', error: string) {
  capture('login_failed', { method, error });
}

export function trackUserLoggedOut() {
  capture('user_logged_out');
}

/** UX path where the user opened external checkout (funnel filtering in PostHog). */
export type CheckoutInitiatedSource = 'bundle' | 'bundle-offer' | 'dashboard-bots';

// Purchase / checkout events
export function trackBundleInfoPageViewed() {
  capture('bundle_info_page_viewed');
}

export function trackBundleCheckoutPageViewed(isLoggedIn: boolean, hasPaid: boolean) {
  capture('bundle_checkout_page_viewed', { is_logged_in: isLoggedIn, has_paid: hasPaid });
}

export function trackCheckoutInitiated(source: CheckoutInitiatedSource, checkoutUrl: string) {
  capture('checkout_initiated', {
    source,
    is_external: true,
    checkout_url: checkoutUrl,
  });
}

/**
 * Logged-in user on /dashboard/bots with locked bots clicked through to external checkout.
 * Use with `checkout_initiated` (source `dashboard-bots`) for paywall → checkout funnels.
 */
export function trackBotsDashboardPaywallCheckoutClicked(checkoutUrl: string) {
  capture('bots_dashboard_paywall_checkout_clicked', {
    source: 'dashboard-bots',
    has_paid: false,
    is_external_checkout: true,
    checkout_url: checkoutUrl,
  });
}

export function trackCheckoutLoginRequired() {
  capture('checkout_login_required');
}

/** Dedupe `payment_completed` per Stripe/session id (polling, Strict Mode, retries). */
const paymentCompletedForSessionId = new Set<string>();

export function trackPaymentCompleted(amount: number, currency: string, sessionId: string) {
  if (paymentCompletedForSessionId.has(sessionId)) return;
  paymentCompletedForSessionId.add(sessionId);

  capture('payment_completed', {
    amount,
    currency,
    session_id: sessionId,
    confirmation_path: 'payment_done',
  });
}

export function trackPaymentStatusCheckFailed(sessionId: string, retries: number) {
  capture('payment_status_check_failed', { session_id: sessionId, retries });
}

// Download events
export function trackIndicatorDownloaded(indicatorName: string, indicatorId: string) {
  capture('indicator_downloaded', { indicator_name: indicatorName, indicator_id: indicatorId });
}

export function trackBotDownloaded(botName: string) {
  capture('bot_downloaded', { bot_name: botName });
}

export function trackAllBotsDownloaded() {
  capture('all_bots_downloaded');
}

// Bot picker events
export function trackBotPickerStarted() {
  capture('bot_picker_started');
}

export function trackBotPickerQuestionAnswered(question: string, answer: string) {
  capture('bot_picker_question_answered', { question, answer });
}

export function trackBotPickerCompleted(
  strategyType: string | null,
  timeframe: string | null,
  tradeFrequency: string | null,
  topMatch: string,
) {
  capture('bot_picker_completed', {
    strategy_type: strategyType,
    timeframe,
    trade_frequency: tradeFrequency,
    top_match: topMatch,
  });
}

export function trackBotPickerReset() {
  capture('bot_picker_reset');
}

export function trackBotPickerCtaClicked(destination: string) {
  capture('bot_picker_cta_clicked', { destination });
}

// Lead magnet events
export function trackPdfLeadFormViewed(page: string) {
  capture('pdf_lead_form_viewed', { page });
}

export function trackPdfGuideRequested(email: string, page: string) {
  // Set/refresh email on the current (possibly anonymous) person so it’s available in PostHog before signup.
  // When the user later signs up, `identifyUser()` will map the anonymous session onto their account id.
  if (email) {
    posthog.setPersonProperties({
      email,
      lead_page: page,
    });
  }
  capture('pdf_guide_requested', { email, page });
}

// Blog events
export function trackBlogPostViewed(title: string, slug: string, category?: string) {
  capture('blog_post_viewed', { title, slug, category });
}

export function trackBlogPostSelected(slug: string, title: string) {
  capture('blog_post_selected', { slug, title });
}

// Engagement events
export function trackStrategyCardExpanded(strategyName: string) {
  capture('strategy_card_expanded', { strategy_name: strategyName });
}

export function trackBacktestImageViewed(botName: string) {
  capture('backtest_image_viewed', { bot_name: botName });
}

export function trackWelcomeModalShown() {
  capture('welcome_modal_shown');
}

export function trackWelcomeModalDismissed() {
  capture('welcome_modal_dismissed');
}

export function trackCtaClicked(ctaName: string, ctaText: string, ctaLocation: string, destination: string) {
  capture('cta_clicked', { cta_name: ctaName, cta_text: ctaText, cta_location: ctaLocation, destination });
}

// Dashboard events
export function trackDashboardVisited(section: string) {
  capture('dashboard_visited', { section });
}

export function trackBotsPaywallShown() {
  capture('bots_paywall_shown');
}

export function trackUnlockBotsClicked() {
  capture('unlock_bots_clicked');
}

export function trackProfileUpdated(fieldsChanged: string[]) {
  capture('profile_updated', { fields_changed: fieldsChanged });
}

export function trackPasswordChanged() {
  capture('password_changed');
}

// Error forwarding
export function trackErrorEvent(
  message: string,
  severity: string,
  context?: Record<string, any>,
) {
  capture('error_tracked', { message, severity, ...context });
}
