# Security Specification for DarshanEase Firestore Rules

This document outlines the Security Specifications, Data Invariants, and "Dirty Dozen" malicious payloads designed to test and harden the Firestore security rules.

## 1. Data Invariants

1. **User Profile Invariant**: A user profile document's ID (`userId`) must exactly match `request.auth.uid`. Normal users can only read and write their own profile document. The `role` field must be immutable upon registration or restricted from self-escalation (cannot self-assign "super_admin" or "temple_admin").
2. **Temple Registry Invariant**: Anyone can read temple details. Only validated admins (`super_admin` or `temple_admin`) can create, update, or delete temples.
3. **Booking Ticket Invariant**: A booking is owned by a specific user. Devotees can only read their own bookings. For creation, the booking's `userId` must equal `request.auth.uid`. Users cannot update a booking once it is cancelled (terminal state locking), and can only update `bookingStatus` to `Cancelled` during standard operations; all other fields are immutable for devotees.
4. **Payment Transaction Invariant**: Payments must be linked to a valid booking. Only the user who owns that booking or an admin can read the payment records. Payments are immutable after creation.
5. **Notification Invariant**: Notifications are private. Only the target `userId` can read or write (mark as read) their notifications. No other user can access them.
6. **Feedback Invariant**: Feedback can be read by any visitor. Only authenticated users can write feedback, and the `userId` in the payload must strictly match `request.auth.uid`.

---

## 2. The "Dirty Dozen" Payloads (Malicious Attacks)

Here are 12 specific payloads representing attacks that the security rules must actively reject:

### Attack 1: Self-Role Escalation (Identity Spoofing)
*   **Target**: `/users/attacker_uid`
*   **Attack Payload**:
    ```json
    {
      "userId": "attacker_uid",
      "email": "attacker@gmail.com",
      "role": "super_admin"
    }
    ```
*   **Objective**: Register as a `super_admin` directly to bypass all administrative gates.
*   **Assertion**: Must return `PERMISSION_DENIED` unless authorized by a trusted admin look-up.

### Attack 2: Profile Hijacking (Targeting other users)
*   **Target**: `/users/victim_uid`
*   **Attack Payload**:
    ```json
    {
      "userId": "victim_uid",
      "name": "Hacked User",
      "email": "hacked@victim.com",
      "role": "devotee"
    }
    ```
*   **Objective**: Modify someone else's user profile.
*   **Assertion**: Must return `PERMISSION_DENIED`.

### Attack 3: Unauthorized Temple Injection
*   **Target**: `/temples/fake_temple_id`
*   **Attack Payload**:
    ```json
    {
      "templeId": "fake_temple_id",
      "name": "Malicious Fake Temple",
      "location": "Nowhere",
      "ticketPrice": 9999
    }
    ```
*   **Objective**: Create a fake temple to divert ticket booking funds.
*   **Assertion**: Must return `PERMISSION_DENIED` for standard devotees or unauthenticated users.

### Attack 4: Unauthorized Temple Mutation
*   **Target**: `/temples/tirupati`
*   **Attack Payload**:
    ```json
    {
      "ticketPrice": 0
    }
    ```
*   **Objective**: Modify ticket prices of existing sacred temples to zero.
*   **Assertion**: Must return `PERMISSION_DENIED`.

### Attack 5: Booking Spoofing (Creating bookings for others)
*   **Target**: `/bookings/malicious_booking_123`
*   **Attack Payload**:
    ```json
    {
      "bookingId": "malicious_booking_123",
      "userId": "victim_uid",
      "templeId": "tirupati",
      "date": "2026-08-15",
      "slot": "09:00 AM - 12:00 PM",
      "price": 0,
      "paymentStatus": "Paid"
    }
    ```
*   **Objective**: Create a booking under a victim's user ID with `paymentStatus` set to `"Paid"` for free.
*   **Assertion**: Must return `PERMISSION_DENIED` because the payload `userId` does not match `request.auth.uid`.

### Attack 6: Booking Hijacking / Theft
*   **Target**: `/bookings/victim_booking_id`
*   **Attack Payload**:
    ```json
    {
      "userId": "attacker_uid"
    }
    ```
*   **Objective**: Re-assign someone else's booking to the attacker's UID.
*   **Assertion**: Must return `PERMISSION_DENIED`.

### Attack 7: Status Shortcutting (Self-Approving Booking)
*   **Target**: `/bookings/attacker_booking_id`
*   **Attack Payload**:
    ```json
    {
      "paymentStatus": "Paid",
      "bookingStatus": "Upcoming"
    }
    ```
*   **Objective**: Advance a booking status from `Pending` to `Paid` directly from the client without completing payment.
*   **Assertion**: Must return `PERMISSION_DENIED` as this transition must be secure or restricted.

### Attack 8: Post-Cancellation Tampering (Terminal State Modification)
*   **Target**: `/bookings/cancelled_booking_id`
*   **Attack Payload**:
    ```json
    {
      "bookingStatus": "Upcoming",
      "date": "2026-09-01"
    }
    ```
*   **Objective**: Change a completed or cancelled booking back to active status to re-use tickets.
*   **Assertion**: Must return `PERMISSION_DENIED` because the resource is in a terminal state.

### Attack 9: Ghost Field Injection (Resource Poisoning)
*   **Target**: `/payments/attacker_payment_123`
*   **Attack Payload**:
    ```json
    {
      "paymentId": "attacker_payment_123",
      "bookingId": "attacker_booking_id",
      "amount": 300,
      "status": "Success",
      "isRefunded": false,
      "ghost_hack_field": "unwanted_malicious_bloat_data_here_extending_database_storage"
    }
    ```
*   **Objective**: Inject untracked fields into documents to bloat Firestore and crash schema parsing in the client.
*   **Assertion**: Must return `PERMISSION_DENIED` due to strict key verification (`hasOnly`).

### Attack 10: Private Notification Eavesdropping
*   **Target**: `/notifications/victim_notif_123`
*   **Objective**: Query or retrieve a notification sent to another user.
*   **Assertion**: Must return `PERMISSION_DENIED` when queried by a different authenticated user.

### Attack 11: Feedback Deletion (Reputation Manipulation)
*   **Target**: `/feedback/negative_feedback_id`
*   **Objective**: An authenticated user attempts to delete a negative review left on a temple.
*   **Assertion**: Must return `PERMISSION_DENIED` for normal devotees; only admins can delete feedback.

### Attack 12: Feedback Spoofing
*   **Target**: `/feedback/spoofed_feedback_id`
*   **Attack Payload**:
    ```json
    {
      "feedbackId": "spoofed_feedback_id",
      "userId": "victim_uid",
      "userName": "Victim User",
      "templeId": "tirupati",
      "rating": 1,
      "comment": "Terrible experience!",
      "createdAt": "2026-07-05T06:52:10"
    }
    ```
*   **Objective**: Write fake bad reviews under other users' names.
*   **Assertion**: Must return `PERMISSION_DENIED` because `userId` does not match the requester's authenticated UID.

---

## 3. Test Runner Concept

The unit tests verifying that all Dirty Dozen payloads are rejected can be structured as follows in `firestore.rules.test.ts`. This utilizes standard Firestore emulator testing packages.

```typescript
// Conceptual firestore.rules.test.ts
import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "remixed-project-id",
    firestore: {
      rules: require("fs").readFileSync("firestore.rules", "utf8"),
    }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("DarshanEase Security Rules - Attack Mitigation", () => {
  test("Attack 1: Self-Role Escalation must be blocked", async () => {
    const attackerContext = testEnv.authenticatedContext("attacker_uid");
    const db = attackerContext.firestore();
    const userDocRef = doc(db, "users", "attacker_uid");
    
    await expect(setDoc(userDocRef, {
      userId: "attacker_uid",
      email: "attacker@gmail.com",
      role: "super_admin"
    })).rejects.toThrow();
  });

  test("Attack 2: Profile Hijacking must be blocked", async () => {
    const attackerContext = testEnv.authenticatedContext("attacker_uid");
    const db = attackerContext.firestore();
    const userDocRef = doc(db, "users", "victim_uid");
    
    await expect(setDoc(userDocRef, {
      userId: "victim_uid",
      name: "Hacked User",
      email: "hacked@victim.com",
      role: "devotee"
    })).rejects.toThrow();
  });

  test("Attack 3: Unauthorized Temple Injection must be blocked", async () => {
    const attackerContext = testEnv.authenticatedContext("attacker_uid");
    const db = attackerContext.firestore();
    const templeRef = doc(db, "temples", "fake_temple_id");
    
    await expect(setDoc(templeRef, {
      templeId: "fake_temple_id",
      name: "Malicious Fake Temple",
      location: "Nowhere",
      ticketPrice: 9999
    })).rejects.toThrow();
  });

  test("Attack 5: Booking Spoofing must be blocked", async () => {
    const attackerContext = testEnv.authenticatedContext("attacker_uid");
    const db = attackerContext.firestore();
    const bookingRef = doc(db, "bookings", "malicious_booking_123");
    
    await expect(setDoc(bookingRef, {
      bookingId: "malicious_booking_123",
      userId: "victim_uid",
      templeId: "tirupati",
      date: "2026-08-15",
      slot: "09:00 AM - 12:00 PM",
      price: 0,
      paymentStatus: "Paid"
    })).rejects.toThrow();
  });
});
```
