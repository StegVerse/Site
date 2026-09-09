"use strict";

// Preserve the established v15 cache contract while loading the released v13
// runtime plus the HIL same-device portable WorkerCoordinator projection.
// These changed wrapper bytes trigger browser update/install so the existing
// v15 shell refreshes the sovereign-primary SV001 custody relay source while
// retaining the exact released v13 runtime predecessor and authority model.
importScripts("./service-worker-v13-runtime.js");
importScripts("./hil-portable-state-bridge.js");
importScripts("./hil-portable-native-bridge.js");
importScripts("./hil-browser-receiver.js");

CACHE_NAME = "stegos-web-bootstrap-v15";
