# Auth Service Overview

This service handles user authentication and token management using JWT and OAuth2. It exposes APIs to login, register, refresh tokens, and validate users. It is structured for modularity and extensibility, following a clean folder layout with separation of concerns.

## Folder Structure

```
auth-service/
│
├── controllers/       # Business logic handlers (e.g., login, register)
├── middleware/        # Custom Express middleware (auth, error handling)
├── routes/            # API route declarations
├── services/          # Encapsulated logic (token handling, DB access)
├── utils/             # Helpers (e.g., logger, token validators)
├── models/            # Mongoose models (User, RefreshToken)
├── config/            # Environment configs, constants
├── tests/             # Unit and integration tests
└── app.js             # Main Express app entrypoint
```

## Key Endpoints

- `POST /login` — Authenticates a user and returns a JWT + refresh token.
- `POST /register` — Registers a new user, hashes password, stores in DB.
- `POST /refresh-token` — Returns a new JWT if refresh token is valid.
- `GET /me` — Returns user info from JWT (used for logged-in sessions).

## Token Strategy

- JWTs are issued for 15 minutes.
- Refresh tokens are stored in the DB, tied to the user and device.
- `refreshTokenService.validate()` ensures the token is valid and unexpired.

## Error Handling

All errors are processed by centralized `errorHandler` middleware:
- Validates schema errors via `express-validator`
- Logs stack trace in dev mode
- Returns proper HTTP codes (400, 401, 500)

Example:
```js
if (!email || !password) {
  return next(ApiError.badRequest('Email and password required'));
}
```

## How to Add a New Endpoint

1. Add a new route in `routes/authRoutes.js`
2. Create a controller function in `controllers/authController.js`
3. Add any service methods (e.g., `services/emailService.js`)
4. Test with `jest` in `tests/`

## Adding New Auth Methods

OAuth2 (Google, GitHub) is integrated using `passport.js`. To add a new provider:
1. Install the strategy, e.g. `passport-twitter`
2. Configure callback routes in `routes/oauthRoutes.js`
3. Add logic to `controllers/oauthController.js`
4. Update `.env` with provider secrets

## Code Modularity

Each domain (auth, user, token) is modular:
- Token logic lives in `services/tokenService.js`
- DB schema in `models/`
- Business rules in `controllers/`

This separation makes testing and future updates easier.

## Testing

- Run `npm test` to launch Jest tests
- Coverage reports output to `/coverage`
- Add unit tests per route, mocking DB/service layer

## Logging

- Uses `winston` logger in `utils/logger.js`
- In production, logs to file + error log service (e.g. Sentry)

## .env Keys

```
JWT_SECRET=supersecret
REFRESH_TOKEN_SECRET=refreshsecret
TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
MONGO_URI=mongodb://localhost:27017/auth
GOOGLE_CLIENT_ID=...
GITHUB_SECRET=...
```

## Deployment

- Dockerized with production-ready `Dockerfile`
- Env vars injected at runtime
- Mongo is used as backing store; Redis caching optional

## Future Improvements

- Add rate limiting to login API
- Enable 2FA using TOTP
- Integrate audit logs for login/logout
