"use strict";

// Preserve the established v15 cache contract while loading the released v13
// runtime plus the HIL same-device portable WorkerCoordinator projection.
// The changed service-worker source bytes trigger browser update/install; the
// HIL bridge install listener adds its exact package to the existing cache.
importScripts("./service-worker-v13-runtime.js");
importScripts("./hil-portable-state-bridge.js");
importScripts("./hil-portable-native-bridge.js");

CACHE_NAME = "stegos-web-bootstrap-v15";
