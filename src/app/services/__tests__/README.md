# Service Test Suite

This directory contains unit tests for the service layer of the EatRite UI app, focusing on business logic that interacts with Supabase (excluding authentication and AI logic).

## Purpose
- Ensure all service functions behave as expected, including error handling and edge cases.
- Provide fast, isolated feedback for business logic changes.
- Document the contract and expected behavior of each service.

## Structure
- Each `*.test.ts` file tests a corresponding service module in `../`.
- Tests are grouped by function using `describe` and `it` blocks.
- All external dependencies (e.g., Supabase) are mocked for isolation and speed.

## Mocking Strategy
- Supabase clients are mocked using `jest.mock` with the correct relative path.
- All database operations (`from`, `insert`, `update`, `select`, etc.) are replaced with Jest mock functions.
- No real network or database calls are made during test execution.

## Running the Tests

```sh
npm test
# or
yarn test
```

- To run only the service tests:
  ```sh
  npx jest src/app/services/__tests__
  ```

## Conventions
- Use descriptive test names and groupings.
- Always mock external dependencies.
- Cover both success and error cases for each function.
- Use TypeScript for all test code.
- Avoid using `require()`; use ES imports and Jest mocks.

## Troubleshooting
- **Module not found errors:**
  - Ensure all import paths in tests and mocks are correct and relative to the test file location.
  - If you change the directory structure, update mock paths accordingly.
- **Type errors:**
  - Use explicit types for mocks and callbacks to satisfy the linter.
  - If you add new service functions, update the test mocks as needed.

## Contact
For questions or issues, contact the EatRite UI maintainers. 