# Security Specification for UB BERES

## 1. Data Invariants
- A `Job` must have a `clientId` matching the creator and start with `status: 'open'`.
- A `Bid` must have a `workerId` matching the creator and be associated with a valid `Job`.
- A `Job` status can only be updated in a specific sequence: `open` -> `assigned` -> `paid` -> `working` -> `submitting` -> `completed`.
- Users cannot modify their own `rating` or `totalRatings`.
- Only the `clientId` of a job can select a worker.
- Only the `workerId` assigned to a job can submit results.

## 2. The Dirty Dozen (Malicious Payloads)
1. **Identity Spoofing**: Creating a job with a `clientId` belonging to another user.
2. **Privilege Escalation**: Updating a user profile to change `role` or `rating`.
3. **Ghost Fields**: Adding `isVerified: true` to a user profile.
4. **State Shortcutting**: Updating a job status from `open` directly to `completed` without payment.
5. **Orphaned Write**: Submitting a bid for a non-existent `jobId`.
6. **Price Manipulation**: Updating a bid price after the job has been `assigned`.
7. **Cross-User Delete**: A worker trying to delete a job post created by a client.
8. **Unauthorized Assign**: A random user assigning a worker to someone else's job.
9. **Spamming IDs**: Creating a job with a 2MB string as an ID.
10. **Denial of Wallet**: Flooding a job with 10,000 low-quality bids (size limits needed).
11. **PII Leak**: A non-owner user reading another user's private info (email).
12. **History Tampering**: Updating `createdAt` on a job to make it appear older.

## 3. Test Runner (Conceptual)
All the above payloads MUST return `PERMISSION_DENIED` by the rules.
