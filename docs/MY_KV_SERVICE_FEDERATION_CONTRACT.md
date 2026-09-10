# MyKV Service Federation Contract

Updated: 2026-09-10
Repository: `StegVerse-Labs/Site`
Canonical Goal Task ID: `KV-CONNECTION-REVALIDATION-WORKER-001`
COSV: `50000000102000`
Status: DESIGN CONTRACT / IMPLEMENTATION AND AUTHENTIC PROVIDER EXECUTION PENDING

## Purpose

MyKV is the primary user-facing interaction surface for provider-backed personal and organizational services. External provider applications and websites remain provider interfaces, but they are not required to remain the user's primary operating surface once an equivalent governed MyKV service binding exists.

MyKV MUST support multiple accounts, multiple providers, multiple KV instances, and multiple service classes simultaneously without erasing provenance, authority, provider ownership, or mutation routing.

The design objective is not to copy all external systems into one undifferentiated database. The objective is to provide one selectable sovereign interaction layer over independently owned services and data sources.

## Canonical federation key

Every provider-backed service binding is identified by the tuple:

```text
service_class × provider × account × kv_instance × relationship
```

Examples:

```text
MAIL × MICROSOFT365 × rigel@stegverse.org × KV#1 × CONNECTED
MAIL × GMAIL × rigelrandolph@gmail.com × KV#1 × CONNECTED
MAIL × GMAIL × stegverse@gmail.com × KV#2 × SYNCED
CALENDAR × MICROSOFT365 × rigel@stegverse.org × KV#1 × CONNECTED
FILES × GOOGLE_DRIVE × stegverse@gmail.com × KV#2 × SYNCED
NOTES × ICLOUD × personal-account-ref × KV#1 × AI_INTERACTION
```

The tuple is a routing and provenance key. It does not grant provider authority, credential authority, or permission to replicate data.

## Service classes

Initial service classes include:

```text
MAIL
CALENDAR
NOTES
FILES
CONTACTS
TASKS
DOCUMENTS
SOCIAL
MESSAGING
RESEARCH
BUSINESS
DEVELOPMENT
FINANCE
OTHER_REGISTERED_SERVICE
```

Additional classes may be registered without changing the federation model.

## Multi-account requirement

A service class MUST permit zero, one, or many account bindings. Multiple accounts from the same provider and multiple providers for the same service class are valid simultaneously.

The UI MUST permit selection of:

```text
one binding
multiple selected bindings
all bindings within one service class
all eligible bindings across a user-defined workspace
```

An `ALL` or unified view is a projection only. It MUST NOT erase the provider account that owns each object.

## Account onboarding contract

Adding an account SHOULD require the least possible user interaction. The preferred MyKV flow is:

```text
MyKV -> Add account
-> select or discover provider/account type
-> owner supplies only the provider-required credential or completes the provider-required authorization challenge
-> credential material is sealed into SKAP under the applicable TV/TVC credential class
-> MyKV receives only a non-secret account/service binding reference
-> provider capabilities are discovered
-> eligible service classes are presented for selection
-> Interlock/InTr governs requested service bindings and relationship states
-> MyKV materializes the approved account/service projections
-> exact provider/account provenance and mutation routes are retained
```

The user SHOULD NOT have to separately configure Mail, Calendar, Contacts, Notes, Files, Tasks, or other services when one provider account exposes several eligible service classes. After successful credential/authorization custody, MyKV SHOULD discover those capabilities and offer or materialize them according to the user's explicit account-level defaults and governance policy.

One provider account MAY therefore yield several independently governed bindings, for example:

```text
MICROSOFT365 account
-> MAIL
-> CALENDAR
-> CONTACTS
-> FILES / ONEDRIVE
-> TASKS
-> NOTES where provider capability exists
```

Each resulting binding retains its own relationship state. Supplying an account credential does not automatically authorize synchronization, AI interaction, destructive mutations, publication, sharing, or other higher-consequence operations.

SKAP stores or resolves credential capability; ordinary KV records MUST NOT contain plaintext passwords, OAuth refresh tokens, API secrets, session tokens, or equivalent reusable credential material. MyKV receives non-secret provider/account references and operation capabilities only after the applicable TV/TVC and Interlock/InTr boundaries admit them.

Where a provider uses OAuth, passkeys, device approval, MFA, magic links, or another challenge instead of a reusable password, `Add account` MUST use that provider-native authorization flow rather than requiring the user to manufacture or expose a password. The UX objective remains the same: one owner-initiated account-add operation, after which SKAP/TVC/provider adapters and MyKV complete the discover/bind/project sequence without redundant manual setup.

Adding a second or later account uses the same contract. Account identity and provider provenance remain distinct even when multiple accounts expose identical service classes.

## Provenance requirement

Every projected object MUST remain traceable to its originating binding. At minimum the projection MUST preserve:

```text
service_class
provider
provider_account_ref
provider_object_ref
kv_instance_ref
relationship_state
retrieved_or_observed_at
mutation_route_ref when mutation is supported
content/evidence commitment when applicable
```

Provider-native identifiers MAY remain opaque. MyKV MUST NOT invent a replacement canonical provider identity and represent it as provider truth.

## Relationship states

The existing MyKV relationship model applies independently to every service/account binding:

```text
NOT_CONNECTED
CONNECTED
SYNCED
AI_INTERACTION
```

Semantics:

- `NOT_CONNECTED`: no inter-service communication or provider operation is available.
- `CONNECTED`: MyKV may access the admitted provider surface and may move or act on data only through explicitly admitted operations.
- `SYNCED`: selected provider data is replicated into the applicable KV according to explicit synchronization scope and custody policy.
- `AI_INTERACTION`: data admitted from the binding may participate in the authorized AI interaction corpus as part of the user's selected combined context.

A higher relationship MUST NOT be inferred from a lower relationship. Relationship state is independently selectable by service/account binding.

Example: Microsoft 365 Mail may be `AI_INTERACTION` while the same account's OneDrive binding remains `CONNECTED` only.

## Unified UI semantics

The preferred MyKV navigation model is service-first and then account-selectable:

```text
MyKV
  Mail
    All Inboxes
    account A
    account B
    account C
    + Add account

  Calendar
    All Calendars
    account/calendar A
    account/calendar B
    + Add account/calendar

  Notes
    All Notes
    provider/account A
    provider/account B
    KV-native
    + Add source

  Files
    All Files
    iCloud Drive
    Google Drive A
    Google Drive B
    OneDrive
    KV-local
    + Add source
```

The same selection semantics apply to Contacts, Tasks, Documents, Social, Messaging, Research, Business, Development, Finance, and future registered classes.

## Mutation routing

A unified projection MUST NOT become ambiguous mutation authority.

When the user performs a provider-affecting action, MyKV MUST route the action to the exact source binding unless the user explicitly selects a different destination.

Examples:

```text
reply to email -> source mail account/provider
archive email -> source mail account/provider
edit provider calendar event -> source calendar account/provider
move provider file -> source file provider/account
publish social post -> selected social provider/account
```

Cross-provider movement is a distinct operation and MUST be explicit.

## Credential and authority boundary

MyKV is the user interaction/control plane. It is not automatically the provider credential authority.

Canonical provider operations remain behind the applicable provider adapter and TV/TVC + Interlock/InTr authority boundaries where those are the StegVerse canonical paths.

Credential material MUST NOT be copied into ordinary KV records merely because MyKV presents the service UI. Provider credentials, refresh tokens, session tokens, one-time authentication links, and equivalent secrets remain under their declared custody/runtime boundaries.

MyKV may retain non-secret references and commitments sufficient to reconstruct what operation was requested, which binding it targeted, and what result was observed.

## Email-specific behavior

Mail is the first concrete service intended to prove the broader federation model.

A normalized MyKV mail projection SHOULD support at least:

```text
kv_message_id
provider
provider_account_ref
provider_message_ref
provider_thread_ref
from
to
cc
subject
received_at
body or body_ref according to relationship/custody policy
attachments or attachment_refs
read/unread state
folder/label state
content commitment
sync/reference state
```

User operations SHOULD include:

```text
read
search
compose
reply
reply-all
forward
archive
delete
mark read/unread
move
attachment access
create task from email
associate with project/entity
summarize
extract dates/actions/links
invoke governed external-link action
```

### Magic-link authentication

One-time authentication URLs are ephemeral capabilities, not ordinary durable mail content.

For a same-browser magic-link flow:

```text
MyKV Mail observes/selects authentication message
-> admitted mailbox adapter extracts link transiently
-> raw link is handed to the originating StegBrowser session
-> originating session navigates and completes authentication
-> MyKV retains only permitted message/session/result references or commitments
-> usable one-time token/session material is destroyed according to the ephemeral-session contract
```

Forwarding or displaying a message in another mailbox may be useful for review, but does not replace the originating-session requirement when the provider binds the magic link to the requesting browser.

## Calendar, Notes, Files, and other services

The same provider-neutral pattern applies to other classes.

Calendar consolidates events from multiple providers while preserving source calendars and exact mutation routing.

Notes consolidates provider-native and KV-native notes while preserving source ownership and relationship state. Sync and AI interaction are independently governed per binding.

Files consolidates iCloud Drive, Google Drive, OneDrive, local KV storage, and future providers as selectable sources. A unified file view does not imply that bytes have been replicated into KV.

Contacts, Tasks, Documents, Social, Messaging, Research, Business, Development, Finance, and later services use the same federation tuple and provenance rules.

## Storage/custody modes

Provider-backed data may be exposed through different custody postures. The implementation may distinguish at least:

```text
REFERENCE_ONLY
SYNCED_TO_KV
KV_PRIMARY_OR_SOVEREIGN
```

These are custody/storage postures and are separate from provider permission or execution authority.

`REFERENCE_ONLY` retains sufficient metadata/references/commitments for interaction while provider content remains provider-held.

`SYNCED_TO_KV` permits explicitly scoped encrypted replication into the selected KV.

`KV_PRIMARY_OR_SOVEREIGN` means KV is the durable user-controlled corpus for that admitted data class while an external service may function primarily as transport or interoperability surface.

No posture may be inferred solely from the presence of a provider connection.

## AI interaction

AI access is not an automatic consequence of connection or synchronization.

Only bindings whose relationship state explicitly admits `AI_INTERACTION` may contribute their admitted data to the combined AI context. The UI SHOULD allow users to select or exclude bindings at interaction time even when AI interaction is generally enabled.

The combined AI view remains provenance-aware: information from multiple sources may be considered together, but source identity MUST remain reconstructable.

## Failure and ambiguity

If account identity, provider identity, destination, mutation route, relationship state, or applicable authority is ambiguous, MyKV MUST fail closed or require clarification before a consequential operation.

A unified view MUST NOT guess which account should send, mutate, delete, publish, or share an object.

Missing provider state MUST remain unknown rather than being inferred from cached KV state.

## UI objective

The long-term product objective is that the user can conduct the majority of routine phone-based digital work from MyKV without needing to operate each provider's native UI.

External provider applications remain available as provider-native fallback or specialized interfaces. MyKV becomes the preferred federated sovereign interaction shell when the necessary provider adapter, authority, and evidence paths exist.

## Current evidence boundary

This document records agreed architecture and does not claim runtime activation.

Existing MyKV multi-instance/provider work establishes the direction for multiple KV instances and provider relationships, while existing TVC provider work supplies some provider-specific operation paths. Authentic multi-account federated Mail/Calendar/Notes/Files execution through one MyKV UI remains to be implemented and observed.

No provider authorization, account connection, synchronization, AI-corpus admission, or external mutation is created by this document.
