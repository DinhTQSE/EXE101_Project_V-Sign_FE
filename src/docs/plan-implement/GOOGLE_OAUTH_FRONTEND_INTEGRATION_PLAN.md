# V-Sign Google OAuth2 & Password Reset Frontend Integration Plan

This plan outlines the integration of Google OAuth2 login and Forgot/Reset Password flows on the Vite/React frontend.

## User Review Required

> [!IMPORTANT]
> - **OAuth Redirect Interception**: To prevent the React Router (`AuthenticatedRoute`) from redirecting logged-in Google users back to landing page `/` (due to initial `isLoggedIn === false` on load), we will intercept the `accessToken` query parameters in the root `AuthProvider`'s initialization `useEffect`. This sets the authenticated state *before* routing decisions are executed.
> - **Secure URL Cleanup**: We will immediately invoke `window.history.replaceState` after token extraction to clean the query params from the browser address bar, ensuring security.

---

## Proposed Changes

### API Service Layer

#### [MODIFY] [vsignApi.ts](file:///c:/Users/KHAI/Documents/Exe201/main-source/FE/EXE101_Project_V-Sign_FE/src/services/vsignApi.ts)
- Add the `CompleteResetPasswordRequest` interface:
  ```typescript
  export interface CompleteResetPasswordRequest {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }
  ```
- Add `completePasswordReset` in `authApi`:
  ```typescript
  async completePasswordReset(input: CompleteResetPasswordRequest): Promise<void> {
    await requestJson<void>("/auth/password-reset/complete", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }
  ```

### Authentication Context

#### [MODIFY] [AuthContext.tsx](file:///c:/Users/KHAI/Documents/Exe201/main-source/FE/EXE101_Project_V-Sign_FE/src/contexts/AuthContext.tsx)
- Inside the initialization `useEffect` in `AuthProvider`, parse `accessToken` and `email` from query parameters (`window.location.search`).
- If present, set states `setAccessToken(token)` and `setIsLoggedIn(true)`, save them to `localStorage`, hydrate the profile data via `hydrateBackendState(token)`, and call `window.history.replaceState` to clear the URL parameters.

### Frontend Components & Pages

#### [MODIFY] [LoginModal.tsx](file:///c:/Users/KHAI/Documents/Exe201/main-source/FE/EXE101_Project_V-Sign_FE/src/components/LoginModal.tsx)
- Render a "Tiếp tục với Google" (Continue with Google) button under the email form when in `login` or `signup` modes.
- Implement the click handler `handleGoogleLogin` to call `GET /auth/google/login-url` from the backend and redirect to the returned consent page URL (`window.location.href`).

#### [MODIFY] [Landing.tsx](file:///c:/Users/KHAI/Documents/Exe201/main-source/FE/EXE101_Project_V-Sign_FE/src/pages/Landing.tsx)
- Add a `useEffect` to check if `error` query param exists on landing (e.g. `?error=account_disabled`).
- If present, show a toast notification with the error (e.g., *"Tài khoản của bạn đã bị khóa"* or *"Đăng nhập thất bại"*), and clear parameters using `window.history.replaceState`.

#### [NEW] [ResetPassword.tsx](file:///c:/Users/KHAI/Documents/Exe201/main-source/FE/EXE101_Project_V-Sign_FE/src/pages/ResetPassword.tsx)
Create a premium-designed `/reset-password` page to handle password reset complete flow:
- Extract `token` parameter from URL query string.
- Render New Password and Confirm Password form.
- Validate: minimum 8 characters, at least one uppercase letter, and one number.
- On submit, call `authApi.completePasswordReset` and display success screen with link to navigate back to login.

### Routing

#### [MODIFY] [App.tsx](file:///c:/Users/KHAI/Documents/Exe201/main-source/FE/EXE101_Project_V-Sign_FE/src/App.tsx)
- Register route `/reset-password` pointing to `ResetPassword` page component.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify compilation.
- Run `npm run lint` to check lint errors.

### Manual Verification
- Click Google Login in login modal, verify consent page redirection.
- Test landing callback with mock redirect query parameters `?accessToken=...&email=...` to confirm immediate login hydration and URL cleaning.
- Test landing error callback `?error=account_disabled` to confirm toast warning displays.
- Test `/reset-password?token=...` UI page, validation rules, and error handling.
