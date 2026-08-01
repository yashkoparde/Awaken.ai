# Security Specification: Awaken.ai

## 1. Data Invariants
- A user document at `/users/{uid}` must match the authenticated `request.auth.uid`.
- Users cannot modify their `capabilityScore` directly without a "Proof of Work" (simulated for now, but locked behind a state check).
- Skill nodes at `/users/{uid}/nodes/{nodeId}` belong exclusively to the parent user.
- All IDs must match `^[a-zA-Z0-9_\-]+$`.

## 2. The Dirty Dozen Payloads (Denial Targets)
1. **Identity Spoofing**: Attempting to create `/users/victim_id` while authenticated as `attacker_id`.
2. **Shadow Field Injection**: Attempting to set `isAdmin: true` on a profile.
3. **Ghost Node Orphanage**: Creating a node for a user that doesn't exist.
4. **Value Poisoning**: Setting `capabilityScore: "infinite"` (string instead of number).
5. **Path Poisoning**: Injecting 2MB string as a `{nodeId}`.
6. **Cross-User Leak**: Authenticated user trying to `list` the `/users` collection.
7. **Privilege Escalation**: Attempting to update `email` of another user.
8. **Malicious ID**: Creating a node with ID `../sneaky_doc`.
9. **Timestamp Fraud**: Manually setting `lastInitiation` to a future date instead of `serverTimestamp`.
10. **State Shortcut**: Attempting to add a "Master" level node without the required "Expert" parent state.
11. **Negative Score**: Setting `capabilityScore: -100`.
12. **Unverified Auth**: Attempting any write without `email_verified == true`.

## 3. Test Runner Concept (firestore.rules.test.ts)
I will implement validation helpers in the rules that catch all these cases, ensuring any payload failing these checks returns `PERMISSION_DENIED`.
