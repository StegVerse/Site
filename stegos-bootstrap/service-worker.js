"use strict";

// Preserve the established v15 cache contract while loading the released v13
// runtime plus same-device bridge projections. These wrapper bytes trigger a
// browser update/install but do not alter the released v13 runtime predecessor
// or its governance/authority model.
importScripts("./service-worker-v13-runtime.js");
importScripts("./hil-portable-state-bridge.js");
importScripts("./hil-portable-native-bridge.js");

CACHE_NAME = "stegos-web-bootstrap-v15";

// Extend only the wrapper-time shell projection. The canonical v13 runtime
// file remains exact/unchanged. This activation helper projects an already-
// registered canonical Node Receipt #1 into the StegOS Mobile custom scheme;
// it grants no execution, admission, custody, credential, or routing authority.
if (Array.isArray(SHELL) && SHELL.indexOf("./sv001-native-resident-activation.js") < 0) {
  SHELL.push("./sv001-native-resident-activation.js");
}
