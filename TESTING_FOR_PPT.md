# Testing Summary for PPT

## Testing approach used in TradeFairBook

- **Unit testing:** backend controller logic was tested using Node.js built-in test APIs in a single-process test file.
- **API testing:** the project already includes a Postman collection to validate major backend endpoints.
- **Manual functional testing:** frontend flows were checked by navigating through the user and admin screens.

## Modules covered

- User authentication: register and login APIs
- Dome management: create, update, list, delete domes
- Stall management: create, list, update, delete stalls
- Booking management: booking creation, booking status update, cancellation
- Aadhaar verification and document upload
- Admin dashboard and protected routes

## Automated test cases added

- Create multiple stalls successfully
- Prevent duplicate stall creation inside the same dome
- Fetch all stalls with dome details
- Fetch stalls by dome
- Update stall price and status
- Return 404 when updating a missing stall
- Delete stall successfully
- Return 404 when fetching a missing stall

## Tools used

- Node.js `node:test` for automated backend unit testing
- Postman collection: `TradeFairBook.postman_collection.json`
- Browser-based manual testing for frontend pages

## Test result snapshot

- Total automated test cases executed: **8**
- Passed: **8**
- Failed: **0**

## PPT-ready points

### Short version

> Testing for TradeFairBook was carried out using unit testing, API testing, and manual functional testing. Automated backend tests were created for the stall management module using Node.js built-in test runner, and all 8 test cases passed successfully. API endpoints were also validated using the Postman collection, while frontend user and admin flows were verified manually.

### Table version

| Test Type | Scope | Tool | Result |
| --- | --- | --- | --- |
| Unit Testing | Stall controller backend logic | Node.js `node:test` | 8/8 passed |
| API Testing | Auth, domes, stalls, bookings | Postman | Verified |
| Functional Testing | User and admin workflows | Browser manual testing | Verified |

## Command used

```powershell
cd backend
npm test
```
