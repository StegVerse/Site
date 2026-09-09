const assert = require("assert");
const fs = require("fs");
const path = require("path");
const api = require("../assets/my-kv-directory.js");

(async function testResidentDirectoryIdentity() {
  const bridge = {
    bridge_kind: "DEVICE_KV_QUERY_RETURN",
    listDirectory(request) {
      return { canonical_path: request.canonical_path, entries: [] };
    }
  };
  const result = await api.loadDirectory("erl", bridge);
  assert.strictEqual(result.state, "KV_LISTED");
  assert.strictEqual(result.source_kind, "DEVICE_KV_QUERY_RETURN");
  assert.strictEqual(result.entries.length, 0);
  assert.strictEqual(result.message, "Directory loaded from the current resident DEVICE_KV projection.");
})();

(function testEmptyErlRecoveryText() {
  const page = fs.readFileSync(path.join(__dirname, "../my-kv-directory.html"), "utf8");
  for (const marker of [
    "No ERL files in the current resident KV",
    "This read checked the current resident DEVICE_KV projection only.",
    "A separate Google Drive, iCloud, or other cloud KV is not included unless that KV has been connected/materialized into the active set.",
    "Import owner-controlled files",
    "The selected bytes are staged locally and will appear here only after canonical KV admission and readback."
  ]) assert(page.includes(marker), marker);
  assert(!page.includes("Directory loaded from your KnowledgeVault."));
})();

console.log("My KV ERL empty-state tests: PASS");
