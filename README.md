<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

# Transaction Aggregator (Spirii Challenge)

A NestJS microservice that periodically pulls game-score transactions from an external API(ITS mocked), aggregates per-user stats in-memory, and exposes two REST endpoints—with zero installs beyond `npm install`.

Repository: https://github.com/dronIshan/transaction-aggregator-spirii

## 🚀 Getting Started

1. **Clone the repo**
   ```
   git clone https://github.com/dronIshan/transaction-aggregator-spirii.git
   cd transaction-aggregator-spirii
   ```

2. **Environment**
   Copy the example env file and adjust it as .env :
   ```
   cp .env.dev.example .env
   ```
   ```env
   # .env.dev.example
   TRANSACTION_API_URL='http://localhost:3000'
   TRANSACTION_API_LIMIT=1000
   ```

3. **Install dependencies**
   ```
   npm install
   ```

4. **Run**
   ```
   npm run start:dev
   ```
   - Listens on **port 3000**
   - Swagger UI: http://localhost:3000/api-docs

5. **Smoke Test** (after ~60 s for first cron run)
   ```
   curl http://localhost:3000/aggregation/u1/balance
   curl http://localhost:3000/aggregation/payouts/requests
   ```

## 🔧 Environment Variables

| Key                     | Description                                     | Default                         |
|-------------------------|-------------------------------------------------|---------------------------------|
| `TRANSACTION_API_URL`   | Base URL of the external transactions API       | **required**                    |
| `TRANSACTION_API_LIMIT` | Max transactions per API call (rate-limit cap)  | `1000`                          |

Copy `.env.dev.example` → `.env` and update as needed.

## 🧪 Testing Strategy

We ensure quality via **layered testing**:

1. **Unit Tests** (Jest)
   - **`AggregationService`**:
     - Mock out `HttpService` and `AggregationStore`.
     - Verify logic in `handleCron()`, `aggregateBatch()`, `getUserSummary()`, `listPayoutRequests()`.
   - **`TransactionsService`**:
     - Simulate rate-limit, verify exception thrown on >5 calls/min.
     - Verify random-generator boundaries (1–1000 items).

2. **Integration Tests** (Supertest + in-memory store)
   - Boot the Nest app (with only the in-memory store).
   - Hit `GET /aggregation/:id/balance` and `GET /aggregation/payouts/requests`.
   - Assert correct JSON structure and HTTP status codes.

3. **E2E Tests** (Optional Docker-backed Redis)
   - Start Redis via Docker in CI.
   - Run full app, let the cron job fire, then query endpoints.

4. **Continuous Integration**
   - On each push:
     ```
     npm test        # unit & integration
     npm run lint    # code style
     ```
   - Fail fast on test or lint errors.

## ⏱️ TDD Approach (if i had more time)

1. **Red**: Write a _failing_ unit test first.
   ```ts
   it('should compute balance = earned - spent - paidOut', async () => {
     await service.aggregateBatch([
       { userId:'u1', type:'earned', amount:5 },
       { userId:'u1', type:'spent',  amount:2 },
       { userId:'u1', type:'payout', amount:1 },
     ]);
     const summary = await service.getUserSummary('u1');
     expect(summary).toEqual({
       earned:5, spent:2, payout:1, paidOut:1, balance:2
     });
   });
   ```
2. **Green**: Implement the minimal code to make it pass.
3. **Refactor**: Clean up, extract helpers, update documentation—without breaking tests.

Repeat for **controller** endpoints (using Supertest), for **TransactionsService** rate-limiting, and any new features (filtering, sorting, pagination) you’d add.
