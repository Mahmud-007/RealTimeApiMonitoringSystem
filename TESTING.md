# Testing Guide & Core Components

This document outlines the testing strategy for the Real-Time Monitoring System, identifying core components and their associated test coverage.

## Core Application Components

### 1. AI Service (`aiService.js`) - **CRITICAL**
*   **Role**: Orchestrates Gemini API calls, manages the context window, and handles persistent token tracking.
*   **Testing Priority**: Unit tests for cost estimation and logic branching. Integration tests for model interaction.
*   **Current Status**: Unit tested for cost precision.

### 2. Monitoring Service (`monitorService.js`) - **CORE**
*   **Role**: Executes periodic health checks and emits events for real-time updates.
*   **Testing Priority**: Unit tests for payload generation and error handling. E2E tests for the cron schedule.
*   **Current Status**: Coverage included in integration data flow.

### 3. API Controllers (`logController.js`, `aiController.js`) - **INTEGRATION**
*   **Role**: Exposes system metrics and AI insights to the frontend.
*   **Testing Priority**: Integration tests for aggregation logic (Success Rate, Avg Latency, AI Cost).
*   **Current Status**: Integration tested using Supertest.

## How to Run Tests

### Standard Test Run
Executes all unit and integration tests.
```bash
cd server
npm test
```

### Coverage Report
Generates a detailed HTML report of code coverage.
```bash
cd server
npm run test:coverage
```

## Test Categories Explained

### Unit Tests
Located in `tests/unit`. Focus on pure functions and isolated logic (e.g., `estimateCost`). These tests use virtual mocks to avoid external dependencies.

### Integration Tests
Located in `tests/integration`. Use `supertest` to hit real API routes. Mongoose models are mocked to avoid side effects on the production database.

### End-to-End (E2E)
Critical user flows (Dashboard loading, AI Chat) can be verified manually or using browser automation tools.
