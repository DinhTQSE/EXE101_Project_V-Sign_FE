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
