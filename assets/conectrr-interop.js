(() => {
  'use strict';

  const FIXTURE_URL = 'data/conectrr-independent-evaluation.fixture.json';
  const GATEWAY_BINDING_URL = 'assets/ecosystem-node-gateway-binding.js';
  const FIXTURE_OPT_IN = new URLSearchParams(window.location.search).get('conectrr-fixture') === '1';

  document.documentElement.dataset.conectrrFixtureOptIn = FIXTURE_OPT_IN ? 'true' : 'false';
  if (!FIXTURE_OPT_IN) {
    document.documentElement.dataset.conectrrInterop = 'disabled';
    document.documentElement.dataset.conectrrBrowserTest = 'not-run';
    document.documentElement.dataset.conectrrExportReplay = 'not-run';
    return;
  }

  function loadGatewayBinding() {
    if (globalThis.StegVerseCanonicalGatewayBinding) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${GATEWAY_BINDING_URL}"]`);
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', () => reject(new Error('canonical gateway binding failed to load')), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = GATEWAY_BINDING_URL;
      script.dataset.loader = 'canonical-gateway-binding';
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', () => reject(new Error('canonical gateway binding failed to load')), { once: true });
      document.body.appendChild(script);
    });
  }

  function verifyExportReplay(api, sourceId, decisionId) {
    const events = api.getEvents();
    const json = JSON.stringify({ schema: 'stegverse.canonical-event-stream.v0.1', events });
    const jsonl = events.map((event) => JSON.stringify(event)).join('\n') + '\n';
    const replayedJson = JSON.parse(json).events;
    const replayedJsonl = jsonl.trim().split('\n').map((line) => JSON.parse(line));
    const required = [sourceId, decisionId];
    const jsonIds = new Set(replayedJson.map((event) => event.event_id));
    const jsonlIds = new Set(replayedJsonl.map((event) => event.event_id));
    if (!required.every((eventId) => jsonIds.has(eventId) && jsonlIds.has(eventId))) {
      throw new Error('Conectrr export replay omitted a correlated record');
    }
    const replayedDecision = replayedJsonl.find((event) => event.event_id === decisionId);
    if (replayedDecision?.parent_event_id !== sourceId || !replayedDecision?.evidence_refs?.includes(sourceId)) {
      throw new Error('Conectrr export replay broke source-decision correlation');
    }
    document.documentElement.dataset.conectrrExportReplay = 'pass';
  }

  async function load() {
    await loadGatewayBinding();
    const binding = globalThis.StegVerseCanonicalGatewayBinding;
    if (!binding || binding.authority_effect !== 'NONE' || binding.silent_repair_allowed !== false) {
      throw new Error('canonical gateway binding activation boundary failed');
    }
    document.documentElement.dataset.canonicalGatewayBinding = 'active';

    const api = window.StegVerseCanonicalEventStream;
    if (!api || typeof api.importCanonicalEvents !== 'function') return;

    const response = await fetch(FIXTURE_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Conectrr fixture load failed: ${response.status}`);
    const payload = await response.json();
    const source = structuredClone(payload.source_event);
    const decision = structuredClone(payload.downstream_event);
    const sourceSnapshot = JSON.stringify(source);

    api.importCanonicalEvents([source, decision]);

    if (JSON.stringify(source) !== sourceSnapshot) {
      throw new Error('Conectrr source mutated during import');
    }

    document.documentElement.dataset.conectrrInterop = 'loaded';
    document.documentElement.dataset.conectrrSourceEvent = source.event_id;
    document.documentElement.dataset.conectrrDecisionEvent = decision.event_id;

    const sourceRecord = document.querySelector(`[data-event-id="${CSS.escape(source.event_id)}"]`);
    const decisionRecord = document.querySelector(`[data-event-id="${CSS.escape(decision.event_id)}"]`);
    if (!sourceRecord || !decisionRecord) throw new Error('Conectrr governed records did not render');

    api.selectEvent(source.event_id, 'governed');
    if (!sourceRecord.classList.contains('correlated-active') || !decisionRecord.classList.contains('correlated-active')) {
      throw new Error('Source-to-decision correlation failed');
    }
    api.selectEvent(decision.event_id, 'governed');
    if (!sourceRecord.classList.contains('correlated-active') || !decisionRecord.classList.contains('correlated-active')) {
      throw new Error('Decision-to-source correlation failed');
    }

    verifyExportReplay(api, source.event_id, decision.event_id);
    document.documentElement.dataset.conectrrBrowserTest = 'pass';
  }

  load().catch((error) => {
    document.documentElement.dataset.canonicalGatewayBinding = 'failed';
    document.documentElement.dataset.conectrrInterop = 'failed';
    document.documentElement.dataset.conectrrBrowserTest = 'fail';
    document.documentElement.dataset.conectrrExportReplay = 'failed';
    console.error(error);
  });
})();
