# V-Sign PayOS Frontend Integration Plan

This plan outlines the integration of the PayOS backend payment system into the Vite/React frontend, including user subscription verification from `GET /me`.

## User Review Required

> [!IMPORTANT]
> - **Dependency Check**: We will use standard Fetch API in the new `paymentService.ts` to keep in line with the API clients pattern in `vsignApi.ts`. No new dependencies (e.g. `axios`) will be installed, making the bundle lighter.
> - **Redirect Flow**: Unlike the previous MoMo/ZaloPay QR mock modal which completed in-app, PayOS uses a redirect flow. Clicking "Thanh toán" will redirect the user to the PayOS gateway. After scanning/paying, the user is redirected back to V-Sign at `/payment/result` or `/payment/cancel`.
> - **Subscription Verification (`GET /me`)**: Subscription details will now be parsed from the `GET /me` profile response. The app checks if `data.subscription.planType` is `"PLUS"` or `"PRO"`, and that `data.subscription.status` is `"ACTIVE"` to verify premium access. If it is `"INACTIVE"`, the user falls back to the basic/free tier.

---

## Proposed Changes

### API Service Layer

#### [MODIFY] [vsignApi.ts](file:///c:/Users/KHAI/Documents/Exe201/main-source/FE/EXE101_Project_V-Sign_FE/src/services/vsignApi.ts)
- Extend `AuthUserDto` with `subscription` object containing:
  ```typescript
  subscription?: {
    planType: "FREE" | "PLUS" | "PRO" | string;
    status: "ACTIVE" | "INACTIVE" | string;
    startDate: string;
    endDate: string;
  }
  ```
- Update the `toAuthUser` parser function to extract `subscription` from the unwrapped payload if present.

#### [NEW] [paymentService.ts](file:///c:/Users/KHAI/Documents/Exe201/main-source/FE/EXE101_Project_V-Sign_FE/src/services/paymentService.ts)
Create a clean and typescript-safe service to communicate with the PayOS backend endpoints:
- `getTiers()`: Fetches available active tiers.
- `createCheckout(tierId)`: Creates order and returns checkout link from backend.
- `syncReturnStatus(payload)`: Synchronizes the redirected checkout result status back to the backend.

### Authentication Context

#### [MODIFY] [AuthContext.tsx](file:///c:/Users/KHAI/Documents/Exe201/main-source/FE/EXE101_Project_V-Sign_FE/src/contexts/AuthContext.tsx)
- Expose a `refreshUser` callback inside `AuthContextType` which wraps `hydrateBackendState(accessToken)`. This allows components to trigger a profile reload to sync the premium subscription status.
- Update `hydrateBackendState` to process the new subscription structure nested within the `GET /me` response:
  - Verify `user.subscription?.status === "ACTIVE"`.
  - Set `isPremium` state to `true` if active, else `false` (falling back to free access behavior).
  - Sync subscription attributes with UI layout modes and courses locking logic.

### Frontend Components & Pages

#### [MODIFY] [PremiumModal.tsx](file:///c:/Users/KHAI/Documents/Exe201/main-source/FE/EXE101_Project_V-Sign_FE/src/components/PremiumModal.tsx)
- Adapt the modal to call `paymentService.getTiers()` on open.
- Display premium tiers fetched from backend dynamically (Plus, Pro) instead of static mock plans.
- Simplify checkout action: call `paymentService.createCheckout(tierId)` and redirect user to PayOS payment page using `window.location.href`.

#### [NEW] [PaymentResult.tsx](file:///c:/Users/KHAI/Documents/Exe201/main-source/FE/EXE101_Project_V-Sign_FE/src/pages/PaymentResult.tsx)
Create a gorgeous page mapped to both `/payment/result` and `/payment/cancel` routes:
- Display verification loader while synchronizing order details with the backend.
- Use `framer-motion` for transitions.
- If successful (`PAID`), trigger `refreshUser()` to unlock premium contents and display a premium success card with a route redirect to home/courses.
- Handle cancelled state elegantly by showing cancellation feedback and options to try again.

### Routing

#### [MODIFY] [App.tsx](file:///c:/Users/KHAI/Documents/Exe201/main-source/FE/EXE101_Project_V-Sign_FE/src/App.tsx)
- Import `PaymentResult` lazily.
- Register `/payment/result` and `/payment/cancel` as routes in `BrowserRouter`.

---

## Verification Plan

### Automated Tests
- Run `npm run build` or `vite build` to verify that there are no TypeScript compile-time errors.
- Run `npm run lint` if needed.

### Manual Verification
- Trigger pricing modal, check if subscription tiers are loaded from the backend API.
- Click a tier to check redirect to PayOS checkout page.
- Simulating redirect to `/payment/result` and `/payment/cancel` with mock query parameters to verify loader, verification request to backend, and success/cancel UI states.
