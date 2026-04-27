// Condition-based waiting utilities — complete implementation example.
// Replaced 15 arbitrary setTimeout calls with condition polling, fixing flaky tests.

/**
 * Wait for a specific event type to appear in a thread.
 */
export function waitForEvent(
  threadManager: ThreadManager,
  threadId: string,
  eventType: string,
  timeoutMs = 5000
): Promise<Event> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const events = threadManager.getEvents(threadId);
      const event = events.find((e) => e.type === eventType);

      if (event) {
        resolve(event);
      } else if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`Timeout waiting for ${eventType} event after ${timeoutMs}ms`));
      } else {
        setTimeout(check, 10); // Poll every 10ms
      }
    };

    check();
  });
}

/**
 * Wait for a specific number of events of a given type.
 */
export function waitForEventCount(
  threadManager: ThreadManager,
  threadId: string,
  eventType: string,
  count: number,
  timeoutMs = 5000
): Promise<Event[]> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const events = threadManager.getEvents(threadId);
      const matchingEvents = events.filter((e) => e.type === eventType);

      if (matchingEvents.length >= count) {
        resolve(matchingEvents);
      } else if (Date.now() - startTime > timeoutMs) {
        reject(
          new Error(
            `Timeout waiting for ${count} ${eventType} events after ${timeoutMs}ms (got ${matchingEvents.length})`
          )
        );
      } else {
        setTimeout(check, 10);
      }
    };

    check();
  });
}

/**
 * Wait for an event matching a custom predicate.
 * Use when you need to check event data, not just type.
 */
export function waitForEventMatch(
  threadManager: ThreadManager,
  threadId: string,
  predicate: (event: Event) => boolean,
  description: string,
  timeoutMs = 5000
): Promise<Event> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const events = threadManager.getEvents(threadId);
      const event = events.find(predicate);

      if (event) {
        resolve(event);
      } else if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`Timeout waiting for ${description} after ${timeoutMs}ms`));
      } else {
        setTimeout(check, 10);
      }
    };

    check();
  });
}

// Before and after comparison from the actual debugging session:
//
// BEFORE (flaky — 60% pass rate):
//   const messagePromise = agent.sendMessage('Execute tools');
//   await new Promise(r => setTimeout(r, 300)); // Hope tools start in 300ms
//   agent.abort();
//   await messagePromise;
//   await new Promise(r => setTimeout(r, 50));  // Hope results arrive in 50ms
//   expect(toolResults.length).toBe(2);         // Fails randomly
//
// AFTER (reliable — 100% pass rate, 40% faster):
//   const messagePromise = agent.sendMessage('Execute tools');
//   await waitForEventCount(threadManager, threadId, 'TOOL_CALL', 2);
//   agent.abort();
//   await messagePromise;
//   await waitForEventCount(threadManager, threadId, 'TOOL_RESULT', 2);
//   expect(toolResults.length).toBe(2);
