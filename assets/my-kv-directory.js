(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.StegVerseMyKVDirectory = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var DOMAINS = [
    { id: "connected-accounts", label: "Connected Accounts", icon: "↔", path: "_Vault/SKAP/Accounts", href: "my-kv-connected-accounts.html", description: "Review connected provider accounts and choose which ones may be represented as non-secret account metadata in your KV." },
    { id: "pictures", label: "Pictures & Media", icon: "▣", path: "04_Media/Pictures", description: "Photos, image continuity, and related media records." },
    { id: "music", label: "Music", icon: "♫", path: "04_Media/Music", description: "Playlists, listening continuity, song moments, and music records." },
    { id: "email", label: "Email", icon: "✉", path: "03_Records/Email", description: "Governed email continuity records admitted into your KV." },
    { id: "finance", label: "Finance", icon: "$", path: "03_Records/Finance", description: "Accounts, spending, savings, retirement, tax analysis, rewards, and collateral." },
    { id: "assets", label: "Assets", icon: "◆", path: "03_Records/Assets", description: "Property, investments, cash-equivalents, valuables, and other owned resources." },
    { id: "liabilities", label: "Liabilities", icon: "−", path: "03_Records/Liabilities", description: "Loans, credit obligations, mortgages, and other amounts owed." },
    { id: "personal", label: "Personal Information", icon: "◉", path: "_Entities/Self", description: "Your self-profile and personal continuity records." },
    { id: "records", label: "Records", icon: "▤", path: "03_Records", description: "Private records and structured continuity documents." },
    { id: "projects", label: "Projects", icon: "◇", path: "05_Projects", description: "Project continuity, event records, and working context." },
    { id: "research", label: "Research", icon: "⌕", path: "02_Research", description: "Research notes, references, and inquiry continuity." },
    { id: "erl", label: "ERL", icon: "◎", path: "02_Research/ERL", description: "Evidence and research artifacts available to this KV. ERL references may be used to prepare StegSocials drafts without changing ERL provenance." },
    { id: "stegsocials-drafts", label: "StegSocials Drafts", icon: "✎", path: "02_Research/StegSocials/Drafts", description: "Private platform-shaped StegSocials preparation bundles. Draft preparation is standard; automated publication is a separately entitled premium capability." },
    { id: "archive", label: "Archive", icon: "□", path: "06_Archive", description: "Archived continuity material retained under your KV policy." }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getDomain(id) {
    var normalized = String(id || "").trim().toLowerCase();
    var match = DOMAINS.find(function (entry) { return entry.id === normalized; });
    if (!match) throw new Error("Unknown KnowledgeVault directory");
    return clone(match);
  }

  function listDomains() {
    return clone(DOMAINS);
  }

  function directoryHref(id) {
    var domain = getDomain(id);
    return domain.href || ("my-kv-directory.html?dir=" + encodeURIComponent(domain.id));
  }

  function assertSafeListing(value, path) {
    path = path || "listing";
    if (Array.isArray(value)) {
      value.forEach(function (item, index) { assertSafeListing(item, path + "[" + index + "]"); });
      return;
    }
    if (!value || typeof value !== "object") return;
    Object.keys(value).forEach(function (key) {
      var lower = key.toLowerCase();
      if (["password","secret","token","private_key","cvv","card_number","account_number","routing_number"].some(function (part) {
        return lower.indexOf(part) !== -1;
      })) throw new Error("Secret-bearing directory metadata prohibited at " + path + "." + key);
      assertSafeListing(value[key], path + "." + key);
    });
  }

  function loadDirectory(domainId, bridge) {
    var domain = getDomain(domainId);
    if (!bridge || typeof bridge.listDirectory !== "function") {
      return Promise.resolve({
        state: "BRIDGE_UNAVAILABLE",
        domain: domain,
        entries: [],
        message: "Current resident DEVICE_KV directory bridge unavailable. No private files were listed."
      });
    }
    return Promise.resolve(bridge.listDirectory({
      schema: "stegverse.site.my-kv.directory-list-request/v1",
      directory_id: domain.id,
      canonical_path: domain.path,
      access: "READ_ONLY",
      authority_effect: "NONE"
    })).then(function (result) {
      if (!result || result.canonical_path !== domain.path || !Array.isArray(result.entries)) {
        throw new Error("FAIL_CLOSED: canonical directory listing was not confirmed");
      }
      assertSafeListing(result);
      return {
        state: "KV_LISTED",
        domain: domain,
        entries: clone(result.entries),
        source_kind: bridge.bridge_kind || "DEVICE_KV_QUERY_RETURN",
        message: "Directory loaded from the current resident DEVICE_KV projection."
      };
    });
  }

  function connectSource(domainId, bridge) {
    var domain = getDomain(domainId);
    if (!bridge || typeof bridge.connectDirectSource !== "function") {
      return Promise.reject(new Error("FAIL_CLOSED: direct-source SKAP bridge unavailable"));
    }
    return Promise.resolve(bridge.connectDirectSource({
      schema: "stegverse.site.my-kv.direct-source-connect-request/v1",
      directory_id: domain.id,
      canonical_path: domain.path,
      access: "READ_ONLY",
      minimum_necessary: true,
      direct_source_required: true,
      credential_destination: "SKAP_VAULT",
      owner_authorized: true,
      authority_effect: "NONE"
    })).then(function (result) {
      assertSafeListing(result, "source_connection");
      if (!result || result.direct_source_required !== true) {
        throw new Error("FAIL_CLOSED: direct-source connection was not confirmed");
      }
      var skapBound = result.credential_boundary === "SKAP_VAULT";
      var ownerControlledPortable =
        result.credential_requirement === "NONE" &&
        result.credential_boundary === "NOT_REQUIRED_OWNER_CONTROLLED_SOURCE" &&
        result.source_class === "OWNER_CONTROLLED_FILE" &&
        result.state === "QUEUED_FOR_KV_ADMISSION" &&
        result.canonical_kv_persistence_observed === false &&
        result.provider_session_observed === false &&
        result.credential_material_present === false &&
        result.provider_operation_authorized === false;
      if (!skapBound && !ownerControlledPortable) {
        throw new Error("FAIL_CLOSED: direct-source credential or owner-controlled staging boundary was not confirmed");
      }
      return clone(result);
    });
  }

  var CONNECTION_STATES = [
    "UNASSEMBLED","ASSEMBLED_UNVERIFIED","VERIFIED","DEGRADED",
    "REVALIDATION_REQUIRED","BLOCKED_SOURCE_CHANGE","BLOCKED_SESSION",
    "BLOCKED_RUNTIME","RETIRED"
  ];

  function loadConnectionHealth(domainId, bridge) {
    var domain = getDomain(domainId);
    if (!bridge || typeof bridge.getDomainHealth !== "function") {
      return Promise.resolve({
        state: "BRIDGE_UNAVAILABLE",
        domain: domain,
        health: null,
        message: "Connected KnowledgeVault connection-health bridge unavailable. No connection state was inferred."
      });
    }
    return Promise.resolve(bridge.getDomainHealth({
      schema: "stegverse.site.my-kv.connection-health-request/v1",
      directory_id: domain.id,
      canonical_path: domain.path,
      access: "READ_ONLY",
      authority_effect: "NONE"
    })).then(function (result) {
      assertSafeListing(result, "connection_health");
      if (!result || result.canonical_path !== domain.path) {
        throw new Error("FAIL_CLOSED: canonical connection-health path was not confirmed");
      }
      if (CONNECTION_STATES.indexOf(result.compatibility_state) === -1) {
        throw new Error("FAIL_CLOSED: unsupported connection compatibility state");
      }
      if (result.credential_material_present !== false || result.provider_operation_authorized !== false) {
        throw new Error("FAIL_CLOSED: connection-health authority boundary was not confirmed");
      }
      return {
        state: "HEALTH_LISTED",
        domain: domain,
        health: clone(result),
        message: "Connection health loaded from your KnowledgeVault."
      };
    });
  }

  function openEntry(domainId, entry, bridge) {
    var domain = getDomain(domainId);
    if (!entry || typeof entry !== "object") return Promise.reject(new Error("Directory entry required"));
    if (!bridge || typeof bridge.openEntry !== "function") {
      return Promise.reject(new Error("FAIL_CLOSED: canonical KV file-open bridge unavailable"));
    }
    assertSafeListing(entry, "entry");
    return Promise.resolve(bridge.openEntry({
      schema: "stegverse.site.my-kv.open-entry-request/v1",
      directory_id: domain.id,
      canonical_path: domain.path,
      entry: clone(entry),
      access: "READ_ONLY",
      authority_effect: "NONE"
    }));
  }

  return {
    listDomains: listDomains,
    getDomain: getDomain,
    directoryHref: directoryHref,
    loadDirectory: loadDirectory,
    openEntry: openEntry,
    connectSource: connectSource,
    loadConnectionHealth: loadConnectionHealth,
    assertSafeListing: assertSafeListing
  };
}));