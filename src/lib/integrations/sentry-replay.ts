import { addIntegration, getClient } from '@sentry/astro';

/**
 * Consent-gated Sentry error replay. The replay recorder is imported on demand
 * from its own package so visitors who have not opted in never download it.
 */
export async function enableErrorReplay(): Promise<void> {
  if (!getClient()) return;
  try {
    const { getReplay, replayIntegration } = await import('@sentry/replay');
    const replay = getReplay();
    if (replay) {
      replay.startBuffering();
      return;
    }
    addIntegration(
      replayIntegration({ maskAllText: true, blockAllMedia: true }),
    );
  } catch {
    // Replay is best-effort; never let it break the page.
  }
}

export async function disableErrorReplay(): Promise<void> {
  try {
    const { getReplay } = await import('@sentry/replay');
    await getReplay()?.stop();
  } catch {
    // Nothing to stop.
  }
}
