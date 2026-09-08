"use strict";

// v15 reuses the exact released v13 runtime and adds only the bounded post-custody
// evidence-chain continuation endpoint. The extension grants no execution,
// governance, credential, custody, WorkerCoordinator, heartbeat, or publication
// authority; it validates authentic governed custody and retains the frozen SV002
// observation/disposition on the same current-device receipt journal.
importScripts("./service-worker-v13-runtime.js", "./sv001-evidence-chain-continuation.js");

CACHE_NAME = "stegos-web-bootstrap-v15";
