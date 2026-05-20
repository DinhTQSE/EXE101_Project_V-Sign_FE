## US-01
- Classification: Mismatch
- Why: Signup and login currently share a demo-style auth path, so registration intent is not fully represented.
- Evidence: Flow 25-31; `src/components/LoginModal.tsx:22-28`, `:56-86`.
- FE Solution: Split signup/login handlers and call dedicated register API with email/password validation + error states.
- US/AC Solution: Clarify real account-creation AC (or explicitly mark demo auth behavior).
- Release/Effort: v1.1 / M

## US-02
- Classification: Mismatch
- Why: Credential fields are collected but not used to authenticate against a dedicated login contract.
- Evidence: Flow 25-31; `src/components/LoginModal.tsx:22-28`, `:67-83`.
- FE Solution: Implement credential-based login API integration, loading/error states, and invalid-credential messaging.
- US/AC Solution: Require credential verification and negative-path AC.
- Release/Effort: v1.1 / M

## US-03
- Classification: Not Implemented
- Why: No OAuth trigger or callback state handling is present in the current auth entry flow.
- Evidence: `src/components/LoginModal.tsx:56-94`; no OAuth CTA/callback wiring.
- FE Solution: Add Google OAuth button, redirect flow, callback handling, and session sync.
- US/AC Solution: Move to v2 if deferred; otherwise include provider success/failure AC.
- Release/Effort: v2 / M

## US-06
- Classification: Not Implemented
- Why: Security/profile surfaces do not expose a password-change control or workflow.
- Evidence: No password-change controls in `LoginModal`, `Onboarding`, `Dashboard` auth entrypoints.
- FE Solution: Add Change Password form in profile/security area with validation and success/error feedback.
- US/AC Solution: Add policy + wrong-current-password + success AC.
- Release/Effort: v1.1 / M

## US-08
- Classification: Not Implemented
- Why: Auth modal does not include recovery entrypoints for forgotten credentials.
- Evidence: `src/components/LoginModal.tsx:56-94` has no forgot-password CTA/reset flow.
- FE Solution: Add forgot-password link, reset request screen, and reset completion UX.
- US/AC Solution: Add reset token lifecycle and user-notification AC.
- Release/Effort: v1.1 / M

## US-14
- Classification: Mismatch
- Why: Progress persistence is completion-only, while the story implies broader automatic checkpointing.
- Evidence: Flow 130/138/141; `src/pages/VocabularyPack.tsx:391-404`, `:447` only marks completion milestone.
- FE Solution: Add checkpoint autosave (start/in-progress/complete) with restore support.
- US/AC Solution: Define autosave granularity explicitly.
- Release/Effort: v1.1 / M

## US-17
- Classification: Mismatch
- Why: Implemented monetization behavior is modal paywall, not redirect-page behavior.
- Evidence: Flow 133-134; `src/pages/VocabularyPack.tsx:676-678`, `:724` opens modal, not redirect page.
- FE Solution: Keep modal, improve lock rationale text + direct upgrade CTA.
- US/AC Solution: Update wording from redirect-page to in-context modal paywall.
- Release/Effort: v1.1 / S

## US-18
- Classification: Mismatch
- Why: Resume behavior returns users to first incomplete lesson, not exact interrupted state.
- Evidence: Flow 132/139; `src/pages/VocabularyPack.tsx:453`, `:531-536` resumes first incomplete lesson only.
- FE Solution: Persist and restore exact lesson state (phase/question/video timestamp).
- US/AC Solution: Define resume scope as exact-state resume.
- Release/Effort: v1.1 / M

## US-26
- Classification: Mismatch
- Why: Current UX only shows answered count and allows direct submit without unanswered-warning confirmation.
- Evidence: `src/pages/MockExam.tsx:152`, `:165-167`, `:238-243` shows answered count but no submit warning modal.
- FE Solution: Add unanswered-question confirmation modal before final submit.
- US/AC Solution: Specify warning behavior and submit override AC.
- Release/Effort: v1.1 / S

## US-29
- Classification: Not Implemented
- Why: AI practice UI has no confidence metric state or confidence indicator rendering.
- Evidence: `src/pages/VocabularyPack.tsx:257-283` has no confidence score/bar state.
- FE Solution: Render real-time confidence bar from detector confidence output.
- US/AC Solution: Add refresh-rate and threshold AC for confidence.
- Release/Effort: v2 / M

## US-30
- Classification: Not Implemented
- Why: Camera quiz completes after scan timeout without per-attempt correctness feedback.
- Evidence: `src/pages/VocabularyPack.tsx:260-265` completes after timeout without per-attempt correctness feedback.
- FE Solution: Add immediate result card (correct/incorrect/hint) and retry loop per attempt.
- US/AC Solution: Add explicit instant-feedback AC.
- Release/Effort: v2 / M

## US-31
- Classification: Not Implemented
- Why: No lighting-quality detection or low-light warning branch exists in the AI practice flow.
- Evidence: `src/pages/VocabularyPack.tsx:257-283` has no low-light detection/warning branch.
- FE Solution: Add ambient-light heuristic and pre-scan warning banner.
- US/AC Solution: Define low-light threshold and required warning behavior.
- Release/Effort: v2 / M

## US-32
- Classification: Mismatch
- Why: Basic users are hard-gated by paywall and do not receive a limited preview attempt.
- Evidence: Flow 133-134; `src/pages/VocabularyPack.tsx:474-475`, `:491-493` hard-locks AI review for basic users.
- FE Solution: Add limited AI preview attempt before upgrade prompt.
- US/AC Solution: Define preview quota + upgrade trigger AC.
- Release/Effort: v1.1 / S

## US-33
- Classification: Not Implemented
- Why: Lesson completion persists completed lessons and minutes only; XP state and XP award logic are absent.
- Evidence: docs/EXE101_FE_Business_Flows.md (Flow 130; Flow 138); `src/pages/VocabularyPack.tsx:396-404`; `src/contexts/AuthContext.tsx:178-186`.
- FE Solution: Add `xp` to `LearningStats`, increment on lesson completion, and persist with duplicate-award guard.
- US/AC Solution: Specify XP formula per lesson and AC for duplicate completion attempts.
- Release/Effort: v1.1 / M

## US-34
- Classification: Not Implemented
- Why: Quiz completion transitions to lesson completion but does not trigger a quiz-specific XP award path.
- Evidence: docs/EXE101_FE_Business_Flows.md (Flow 121; Flow 125; Flow 130); `src/pages/VocabularyPack.tsx:296`; `src/pages/VocabularyPack.tsx:373-375`; `src/contexts/AuthContext.tsx:178-186`.
- FE Solution: Add `grantXp("quiz_complete")` in quiz completion flow with correctness-aware payload.
- US/AC Solution: Define eligible quiz types, pass threshold, and retry policy for quiz XP.
- Release/Effort: v1.1 / M

## US-35
- Classification: Not Implemented
- Why: No XP animation/toast component is triggered after lesson or quiz completion.
- Evidence: docs/EXE101_FE_Business_Flows.md (Flow 130; no matching flow for XP reward popup); `src/pages/VocabularyPack.tsx:396-404`; `src/pages/Profile.tsx:157-181`.
- FE Solution: Add animated XP popup/toast showing reward amount and updated total XP.
- US/AC Solution: Define popup timing, duration, and behavior for consecutive rewards.
- Release/Effort: v1.1 / S

## US-36
- Classification: Not Implemented
- Why: Profile stat cards display streak/completed/minutes only; total XP is not modeled or rendered.
- Evidence: docs/EXE101_FE_Business_Flows.md (Flow 100; Flow 101); `src/pages/Profile.tsx:157-181`; `src/contexts/AuthContext.tsx:16-21`.
- FE Solution: Add XP into context stats and render a dedicated XP metric card on profile.
- US/AC Solution: Clarify whether XP display is lifetime or period-based.
- Release/Effort: v1.1 / S

## US-37
- Classification: Mismatch
- Why: Streak is currently incremented by login date checks, not by first learning action of the day.
- Evidence: docs/EXE101_FE_Business_Flows.md (Flow 28; Flow 31); `src/contexts/AuthContext.tsx:75-83`; `src/contexts/AuthContext.tsx:120-134`.
- FE Solution: Move streak increment trigger to first daily learning completion and keep login-time reconciliation fallback.
- US/AC Solution: Explicitly define streak trigger semantics (login vs learning completion) and timezone rule.
- Release/Effort: v1.1 / M

## US-38
- Classification: Mismatch
- Why: Streak value is displayed but no explicit "streak increased" visual feedback exists.
- Evidence: docs/EXE101_FE_Business_Flows.md (Flow 100; Flow 101); `src/pages/Profile.tsx:163-165`; `src/pages/Profile.tsx:270-274`.
- FE Solution: Add streak-delta animation/toast when streak increases.
- US/AC Solution: Define when feedback is shown and whether it appears once per day.
- Release/Effort: v1.1 / S

## US-39
- Classification: Mismatch
- Why: Reset-to-1 logic exists, but learners are not notified when a streak is reset.
- Evidence: docs/EXE101_FE_Business_Flows.md (no matching flow for streak-reset notification); `src/contexts/AuthContext.tsx:75-83`; `src/pages/Profile.tsx:270-274`.
- FE Solution: Track reset reason/time and surface a reset notification banner/toast on next session.
- US/AC Solution: Add AC for reset message copy, visibility, and dismiss behavior.
- Release/Effort: v1.1 / S

## US-40
- Classification: Not Implemented
- Why: Only current streak is tracked; no `longestStreak` metric is stored or shown.
- Evidence: docs/EXE101_FE_Business_Flows.md (no matching flow for longest-streak capture/display); `src/contexts/AuthContext.tsx:16-21`; `src/pages/Profile.tsx:157-181`.
- FE Solution: Add `longestStreak` to stats, update it during streak growth, and render in profile.
- US/AC Solution: Define longest-streak reset/carry-over behavior.
- Release/Effort: v1.1 / M

## US-41
- Classification: Not Implemented
- Why: No XP system or streak-milestone multiplier logic exists in current reward path.
- Evidence: docs/EXE101_FE_Business_Flows.md (no matching flow for XP multiplier rules); `src/contexts/AuthContext.tsx:16-21`; `src/pages/VocabularyPack.tsx:396-404`.
- FE Solution: Implement configurable multiplier table and apply it during XP grants.
- US/AC Solution: Specify milestone thresholds, multiplier values, and rounding rules.
- Release/Effort: v2 / M

## US-43
- Classification: Not Implemented
- Why: Leaderboard is fixed to weekly wording/data and has no monthly mode selector.
- Evidence: docs/EXE101_FE_Business_Flows.md (no matching flow for leaderboard period switching); `src/pages/Leaderboard.tsx:39`; `src/pages/Leaderboard.tsx:12-23`.
- FE Solution: Add Week/Month tabs with period state and monthly data branch.
- US/AC Solution: Define month-boundary, timezone, and tie-break rules.
- Release/Effort: v1.1 / M

## US-44
- Classification: Not Implemented
- Why: Current leaderboard does not identify current user row or pin self rank.
- Evidence: docs/EXE101_FE_Business_Flows.md (no matching flow for self-rank highlight interactions); `src/pages/Leaderboard.tsx:73-94`; `src/pages/Leaderboard.tsx:12-23`.
- FE Solution: Add `isCurrentUser` highlighting and "your rank" pinned row when outside top list.
- US/AC Solution: Define behavior for users outside top 10 and highlight accessibility requirements.
- Release/Effort: v1.1 / S

## US-46
- Classification: Mismatch
- Why: XP milestone badge exists but is hardcoded locked (`unlocked: false`) due missing XP tracking.
- Evidence: docs/EXE101_FE_Business_Flows.md (no matching flow for XP milestone badge unlock); `src/pages/Profile.tsx:242`; `src/pages/Profile.tsx:254`; `src/contexts/AuthContext.tsx:16-21`.
- FE Solution: Bind XP badge unlock rules to actual `stats.xp` thresholds.
- US/AC Solution: Define milestone ladder and unlock persistence behavior.
- Release/Effort: v1.1 / S

## US-48
- Classification: Mismatch
- Why: Perfect-score badge exists, but quiz flows do not persist perfect-score results and badge remains hardcoded locked.
- Evidence: docs/EXE101_FE_Business_Flows.md (Flow 117; Flow 125); `src/pages/VocabularyPack.tsx:195-201`; `src/pages/Profile.tsx:243`.
- FE Solution: Persist quiz accuracy/perfect-attempt outcomes and unlock badge when criteria are met.
- US/AC Solution: Define perfect-score criteria and retry constraints.
- Release/Effort: v1.1 / M

## US-50
- Classification: Mismatch
- Why: Dictionary is implemented as a Dashboard tab, so guest/public access path is not exposed in this module set.
- Evidence: docs/EXE101_FE_Business_Flows.md (Flow 55; Flow 67); `src/pages/Dashboard.tsx:42-50`; `src/pages/Dashboard.tsx:297`.
- FE Solution: Add a public `/dictionary` route and guest navigation entry, while preserving the dashboard tab for signed-in users.
- US/AC Solution: Clarify guest entrypoint and define expected behavior when guest taps "Luyen tap ngay" (redirect/login).
- Release/Effort: v1.1 / M

## US-54
- Classification: Not Implemented
- Why: Dictionary entries and modal currently show word/category/description/video only, with no difficulty metadata or controls.
- Evidence: docs/EXE101_FE_Business_Flows.md (Flow 69; Flow 70; Flow 71; Flow 72); `src/pages/Dictionary.tsx:5-12`; `src/pages/Dictionary.tsx:14-46`; `src/pages/Dictionary.tsx:132-135`.
- FE Solution: Add `difficulty` in dictionary model/API mapping, render difficulty badge, and add difficulty filter/sort controls.
- US/AC Solution: Define difficulty taxonomy and acceptance rules for display/filter behavior.
- Release/Effort: v1.1 / M

## US-55
- Classification: Not Implemented
- Why: Dictionary detail modal has no "Luyen tap ngay" CTA to start related learning flow.
- Evidence: docs/EXE101_FE_Business_Flows.md (Flow 72; Flow 73; Flow 75); `src/pages/Dictionary.tsx:168-192`; `src/pages/Dashboard.tsx:46`.
- FE Solution: Add "Luyen tap ngay" CTA in dictionary modal and navigate to mapped lesson/mock-exam context with selected sign payload.
- US/AC Solution: Define guest-vs-logged-in behavior and mapping rule when a sign can map to multiple lessons.
- Release/Effort: v1.1 / M

## US-58
- Classification: Mismatch
- Why: MoMo/ZaloPay is shown only as shared e-wallet text, without provider-specific MoMo QR transaction flow/state.
- Evidence: docs/EXE101_FE_Business_Flows.md (Flow 37; Flow 44); `src/components/PremiumModal.tsx:11`; `src/components/PremiumModal.tsx:134-143`; `src/components/PremiumModal.tsx:237-250`.
- FE Solution: Add provider selection (`momo`/`zalopay`) and fetch provider-specific QR/deep-link payload tied to transaction state.
- US/AC Solution: Specify provider-specific steps, QR-expiry handling, and provider branding requirements.
- Release/Effort: v1.1 / M

## US-59
- Classification: Mismatch
- Why: QR flow is generic/static and does not expose a distinct ZaloPay-specific checkout branch.
- Evidence: docs/EXE101_FE_Business_Flows.md (Flow 37; Flow 43; Flow 44); `src/components/PremiumModal.tsx:134-143`; `src/components/PremiumModal.tsx:195-225`; `src/components/PremiumModal.tsx:237-250`.
- FE Solution: Implement explicit ZaloPay provider option and bind checkout status/QR to selected provider transaction context.
- US/AC Solution: Add AC for ZaloPay-specific success/failure and QR-regeneration behavior.
- Release/Effort: v1.1 / M

## US-62
- Classification: Not Implemented
- Why: Payment path is hardcoded to success and has no error state, failure message, or retry UX.
- Evidence: docs/EXE101_FE_Business_Flows.md (Flow 44); `src/components/PremiumModal.tsx:16-18`; `src/components/PremiumModal.tsx:38-44`; `src/components/PremiumModal.tsx:241-250`.
- FE Solution: Add explicit payment error state with failure messaging, retry CTA, and change-method option.
- US/AC Solution: Define failure-case AC (cancelled, insufficient funds, timeout) and required recovery path.
- Release/Effort: v1.1 / M

## US-63
- Classification: Not Implemented
- Why: UI only shows boolean premium badge; subscription status details (plan/expiry/remaining days/state) are absent.
- Evidence: docs/EXE101_FE_Business_Flows.md (Flow 55; Flow 67); `src/pages/Dashboard.tsx:66`; `src/pages/Dashboard.tsx:281-285`; `src/components/PremiumModal.tsx:43`.
- FE Solution: Extend auth state with structured subscription object and render subscription status card on dashboard/profile surfaces.
- US/AC Solution: Define required status lifecycle fields and refresh behavior after payment confirmation.
- Release/Effort: v1.1 / M

## US-64
- Classification: Not Implemented
- Why: There is no payment-history screen or navigation in dashboard tabs or premium modal.
- Evidence: docs/EXE101_FE_Business_Flows.md (Flow 55; Flow 67; Flow 33); `src/pages/Dashboard.tsx:42-50`; `src/pages/Dashboard.tsx:297-301`; `src/components/PremiumModal.tsx:106-252`.
- FE Solution: Add payment history page with transaction list, status tags, timestamps, amounts, and payment method/provider details.
- US/AC Solution: Specify filter/pagination AC, empty state, and visibility scope per account.
- Release/Effort: v1.1 / M
