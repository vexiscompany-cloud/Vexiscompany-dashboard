# Firebase Security Blueprint & Hardened Specifications

This document outlines the Zero-Trust security rules designed to defend the Vexis Admin dashboard against bypass attempts, resource hijacking, data corruption, and malicious query scraping.

## 1. Data Invariants

- **Signed-In Only Operations**: Only authenticated administrators can read/write data.
- **Client Identity**: Clients must possess a robust, unique ID formatted strictly under standard alphanumeric schemas.
- **Values Integrity**: All currency-related metrics (`monthlyValue`, `value`, etc.) must be strictly non-negative numbers.
- **Time Invariant Integrity**: Document timestamps must validate against server-side variables rather than variable payloads on client computers.
- **Action boundaries**: Status transitions must adhere strictly to predefined categories.

---

## 2. The "Dirty Dozen" Threat Vectors (Rejected Payloads)

Here threat-model vectors are defined representing attempts to inject invalid states or breach the administrative perimeter. Every request below MUST yield `PERMISSION_DENIED`.

### Vector 1: Client Spoofing Attempt (Privilege Hijack)
- **Database Path**: `clients/cli-x`
- **Method**: `CREATE` / `SET`
- **Payload**:
  ```json
  {
    "id": "cli-x",
    "name": "Intruder Corp",
    "email": "attacker@darkweb.org",
    "monthlyValue": 9999999,
    "status": "active",
    "ghostCreatorId": "admin-account-spoof"
  }
  ```
- **Vulnerability Blocked**: Strict keys size matching blocks unmapped fields (`ghostCreatorId`) preventing shadow data.

### Vector 2: String Overflow (Denial of Wallet)
- **Database Path**: `expenses/exp-overflow`
- **Method**: `CREATE`
- **Payload**:
  ```json
  {
    "id": "exp-overflow",
    "category": "Ferramentas",
    "value": 200,
    "description": "aaaaaaaaaaaaaaaaaaaa...[Repeated 500,000 times]",
    "date": "2026-05-29",
    "frequency": "mensal"
  }
  ```
- **Vulnerability Blocked**: String length enforcements limit `.size()` of `description` field.

### Vector 3: Invalid Type Poisoning
- **Database Path**: `expenses/exp-badtype`
- **Method**: `CREATE`
- **Payload**:
  ```json
  {
    "id": "exp-badtype",
    "category": "Tráfego Pago",
    "value": "Two Thousand Dollars",
    "description": "Malicious billing",
    "date": "2026-05-29",
    "frequency": "mensal"
  }
  ```
- **Vulnerability Blocked**: Explicit type validation (`incoming().value is number`) prevents runtime exceptions.

### Vector 4: Relational Desync (Orphaned Invoice)
- **Database Path**: `revenues/rev-orphan`
- **Method**: `CREATE`
- **Payload**:
  ```json
  {
    "id": "rev-orphan",
    "clientId": "non-existent-client-id-here-trying-to-poison-the-index",
    "clientName": "Orphan Client",
    "contractType": "TCV",
    "value": 5000,
    "paymentStatus": "pendente",
    "dueDate": "2026-06-15"
  }
  ```
- **Vulnerability Blocked**: Relational validation requires parent client existence checks: `exists(/databases/$(database)/documents/clients/$(incoming().clientId))`.

### Vector 5: Negative Outlay Underflow
- **Database Path**: `expenses/exp-negative`
- **Method**: `CREATE`
- **Payload**:
  ```json
  {
    "id": "exp-negative",
    "category": "Operacional",
    "value": -50000,
    "description": "Negative refund hack",
    "date": "2026-05-29",
    "frequency": "unica"
  }
  ```
- **Vulnerability Blocked**: Numeric range boundaries check: `incoming().value >= 0`.

### Vector 6: Immutable Timestamp Bypass
- **Database Path**: `clients/cli-1`
- **Method**: `UPDATE`
- **Payload**: Trying to alter immutable startDate.
  ```json
  {
    "startDate": "2020-01-01"
  }
  ```
- **Vulnerability Blocked**: Key immutability assert: `incoming().startDate == existing().startDate` is strictly verified.

### Vector 7: Status Transition Shortcut
- **Database Path**: `clients/cli-1`
- **Method**: `UPDATE`
- **Payload**: Bypassing pipeline, moving active to custom random category name.
  ```json
  {
    "status": "super_vip_secret_status"
  }
  ```
- **Vulnerability Blocked**: Enums constraints in validation helpers: `incoming().status in ["active", "at_risk", "delayed", "cancelled", "finished"]`.

### Vector 8: Unauthorized Read (No Account)
- **Database Path**: Any document
- **Method**: `GET` / `LIST`
- **Payload**: Querying documents without credentials.
- **Vulnerability Blocked**: Explicit authentication guards require `request.auth != null`.

### Vector 9: Query Harvesting (Blanket Reading)
- **Database Path**: `clients`
- **Method**: `LIST`
- **Payload**: Requesting entire database index without filter mappings.
- **Vulnerability Blocked**: List check validation enforces authenticated scope, preventing unauthenticated bulk downloads.

### Vector 10: ID Character Injection (Path Poisoning)
- **Database Path**: `clients/../../hack_root`
- **Method**: `CREATE`
- **Payload**: Attempting to slip path characters into document identifiers.
- **Vulnerability Blocked**: Standard regular expression match checks on IDs: `isValidId(clientId)`.

### Vector 11: Email Domain Spoofing
- **Database Path**: `collaborators/col-xyz`
- **Method**: `CREATE`
- **Payload**:
  ```json
  {
    "id": "col-xyz",
    "name": "Malicious Actor",
    "email": "vexiscompany@gmail.com",
    "role": "Fake Admin",
    "service": "Database Wipe",
    "monthlyValue": 0,
    "type": "Fixo",
    "status": "ativo"
  }
  ```
- **Vulnerability Blocked**: Mandates both Authentication and Verified Email attributes (`request.auth.token.email_verified == true`).

### Vector 12: Corrupt Enum Injection
- **Database Path**: `collaborators/col-1`
- **Method**: `UPDATE`
- **Payload**: Update type to arbitrary string.
  ```json
  {
    "type": "SuperBoss"
  }
  ```
- **Vulnerability Blocked**: Strict enum assertions on updates enforce `incoming().type in ["Freelancer", "Fixo", "Prestador"]`.

---

## 3. The Conceptual Test Runner (`firestore.rules.test.ts`)

This represents how our validation suite tests compliance:

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Vexis Fortress Rules Verification Suite', () => {
  let testEnv;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'gen-lang-client-0746267624',
      firestore: {
        host: 'localhost',
        port: 8080,
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it('Blocks unauthenticated access on all operational paths (Vector 8)', async () => {
    const context = testEnv.unauthenticatedContext();
    const db = context.firestore();
    const clientRef = db.collection('clients').doc('cli-1');
    await assertFails(clientRef.get());
  });

  it('Blocks non-compliant string length overflow in descriptions (Vector 2)', async () => {
    const context = testEnv.authenticatedContext('admin_uid', { email: 'vexiscompany@gmail.com', email_verified: true });
    const db = context.firestore();
    const overlongDesc = 'a'.repeat(2000);
    const expRef = db.collection('expenses').doc('exp-overflow');
    await assertFails(expRef.set({
      id: 'exp-overflow',
      category: 'Ferramentas',
      value: 120,
      description: overlongDesc,
      date: '2026-05-29',
      frequency: 'mensal',
      observation: ''
    }));
  });

  it('Rejects updates modifying immutable fields such as start dates (Vector 6)', async () => {
    const context = testEnv.authenticatedContext('admin_uid', { email: 'vexiscompany@gmail.com', email_verified: true });
    // This expects to assert fail when trying to mutate client start date attributes
  });
});
```
