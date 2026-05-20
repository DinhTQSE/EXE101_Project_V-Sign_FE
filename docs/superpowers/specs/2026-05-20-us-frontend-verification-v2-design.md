# US Frontend Verification v2 Design

Date: 2026-05-20  
Owner: Codex + Product Team  
Status: Draft approved in chat, awaiting user review

## 1. Objective

Create `docs/US_Frontend_Verification_Report_v2.md` that uses real frontend implementation evidence to:

- identify where User Stories (US) and frontend differ (`Mismatch`)
- identify where US features are missing in frontend (`Not Implemented`)
- propose concrete solutions for both doc alignment and frontend improvements
- provide release and effort planning (`v1.1`, `v2`, `phase-2 admin`; `S/M/L`)

## 2. Inputs and Sources of Truth

Primary source:

- `docs/EXE101_FE_Business_Flows.md`

Secondary source:

- `src/**` frontend code (route guards, pages, components, context, hooks)

Reference only:

- `docs/US_Frontend_Verification_Report.md` (legacy image-driven report)

## 3. Scope

In scope:

- Re-evaluate all 75 US using code-driven evidence
- Produce a new v2 report file only (do not overwrite legacy report)
- Add remediation solutions for every non-matched US

Out of scope:

- Implementing frontend code changes in this phase
- Backend/API contract changes
- Database schema changes

## 4. Decision Model

### 4.1 Status Types

- `Matched`: feature behavior exists and aligns with US intent
- `Mismatch`: feature exists but differs from US wording/expected UX
- `Not Implemented`: no frontend evidence for required behavior

### 4.2 Handling Rules

- `Matched`: no mandatory fix; optional AC precision update
- `Mismatch`: provide both `US/AC fix` and `Frontend improvement` solution
- `Not Implemented`: provide implementable frontend solution and delivery plan
- Admin or backoffice-only stories: classify as `Not Implemented` with `phase-2 admin` release

### 4.3 Evidence Confidence

- `High`: direct flow + code reference
- `Medium`: inferred from nearby behavior, partial trace
- `Low`: ambiguous, requires BA/PO confirmation

## 5. Output Design (`US_Frontend_Verification_Report_v2.md`)

### 5.1 Document Sections

1. Verification method and evidence policy  
2. Full US-by-US remediation matrix (75 stories)  
3. Prioritized delivery backlog by release phase  
4. Execution notes (risks, dependencies, DoD)

### 5.2 Matrix Columns

- `US ID`
- `US Name`
- `Current Frontend State`
- `Evidence`
- `Gap Type` (`Mismatch` / `Not Implemented`)
- `Root Cause`
- `Solution - Frontend`
- `Solution - US/AC`
- `Priority`
- `Release`
- `Effort (S/M/L)`
- `Dependencies`
- `Evidence Confidence`

### 5.3 Remediation Block Template

For each `Mismatch` or `Not Implemented` US:

1. `Problem`  
2. `Evidence`  
3. `Proposed Frontend Solution`  
4. `Proposed US/AC Update`  
5. `Delivery Planning` (`Priority`, `Release`, `Effort`, `Dependencies`)  
6. `Definition of Done`

## 6. Planning Model

Release mapping:

- `v1.1`: high-impact, low/medium complexity learning and assessment improvements
- `v2`: advanced AI UX and gamification enhancements
- `phase-2 admin`: admin/backoffice module items

Effort rubric:

- `S`: <= 1 dev day
- `M`: 2-4 dev days
- `L`: >= 5 dev days or multi-team dependency

Prioritization rule:

1. User-facing core learning flow first
2. Assessment reliability next
3. Gamification and polish next
4. Admin module deferred to phase-2

## 7. Data Flow for the Report Build

1. Parse legacy 75-US list from existing report
2. Cross-check each story against business-flow evidence and source files
3. Apply status classification rules
4. Generate remediation actions for non-matched stories
5. Assign release + effort + dependencies
6. Compile v2 matrix and phase backlog summary

## 8. Error Handling and Quality Controls

Potential issues:

- false gaps from extractor limitations
- outdated or legacy UI files included in flow evidence
- ambiguous US wording causing misclassification

Controls:

- add direct source-code references beside flow references
- mark confidence level and unknowns explicitly
- avoid `Matched` if only inferred evidence exists

## 9. Verification Strategy

Before finalizing v2 report:

1. Spot-check critical journeys: login, onboarding, premium gate, exam submit, leaderboard, profile
2. Verify all `Mismatch` rows include both spec-fix and frontend-fix proposals
3. Verify all `Not Implemented` rows include actionable implementation solutions
4. Confirm every row has `Release` and `Effort`
5. Ensure totals by status are internally consistent

## 10. Risks and Mitigations

- Risk: over-classifying as gaps due to limited static analysis  
  Mitigation: require code references for major decisions

- Risk: ambiguous v1 vs v2 boundaries  
  Mitigation: fixed release rubric and dependency notes

- Risk: admin stories polluting FE sprint scope  
  Mitigation: explicit `phase-2 admin` bucket

## 11. Deliverables

- New file: `docs/US_Frontend_Verification_Report_v2.md`
- Includes: complete remediation matrix + prioritized implementation roadmap

## 12. Transition Criteria to Implementation Planning

Move to implementation planning when:

- user approves this design spec
- v2 report is drafted using this structure
- top-priority remediation items are accepted for first implementation wave
