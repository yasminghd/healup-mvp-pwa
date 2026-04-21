# Feature Registry

This file is the human-readable source of truth for product scope tracking in this repository.

Related machine-readable source:
- `config/features.ts`

Status meanings:
- `mvp-active`: visible and intended to ship in the MVP
- `hidden-kept-for-later`: implemented in code but hidden from the MVP
- `disabled-no-ui`: kept in code but not exposed in UI
- `deleted`: permanently removed from code
- `planned`: not implemented yet, tracked for future scope
- `needs-review`: present but partial, mock-only, or unclear for MVP readiness

## Current Navigation

Mobile-first navigation:
- Bottom tab bar shows `Home`, `Track`, `Insights`, `Community`, and `Profile`
- `Community` opens `Pain Pulse`
- A persistent `SOS` button provides direct access to `Pain Pulse`

| Nav section | Label | View/component | Shown now | Status | Note |
| --- | --- | --- | --- | --- | --- |
| Main | Dashboard | `AppView.DASHBOARD` / `components/Dashboard.tsx` | Yes | `mvp-active` | Current home screen. |
| Journal | Track Symptoms | `AppView.TRACKER` / `components/Tracker.tsx` | Yes | `mvp-active` | Core symptom logging flow with optional suggested and custom symptom management, plus adjustable limits for lifestyle sliders. |
| Journal | Lab Results | `AppView.LAB_RESULTS` / `components/LabResults.tsx` | Yes | `mvp-active` | Biomarker tracking page. |
| Journal | AI Insights | `AppView.INSIGHTS` / `components/Insights.tsx` | Yes | `mvp-active` | AI-generated weekly summary. |
| Connect | Pain Pulse | `AppView.PAIN_PULSE` / `components/PainPulse.tsx` | Yes | `mvp-active` | Quiet anonymous support feature for pain check-ins; shown as `Community` in the mobile bottom tab bar. |
| Connect | Discover | `AppView.DISCOVER` / `components/Discover.tsx` | No | `hidden-kept-for-later` | Hidden from MVP nav, code preserved. |
| Connect | Groups | `AppView.GROUPS` / `components/Groups.tsx` | No | `hidden-kept-for-later` | Hidden from MVP nav, code preserved. |
| Connect | Messages | `AppView.COMMUNITY` / `components/Community.tsx` | No | `hidden-kept-for-later` | Hidden from MVP nav, code preserved. |
| Connect | Events | `AppView.EVENTS` / `components/Events.tsx` | No | `hidden-kept-for-later` | Hidden from MVP nav, code preserved. |
| Connect | Research & News | `AppView.RESEARCH` / `components/Research.tsx` | Yes | `mvp-active` | Restored in HealUp Connect. |
| Connect | Expert Portal | `AppView.EXPERTS` / `components/Experts.tsx` | No | `hidden-kept-for-later` | Hidden from MVP nav, code preserved. |
| Utility | HealUp Assistant | `AppView.CHAT` / `components/AiAssistant.tsx` | No | `hidden-kept-for-later` | Hidden from MVP nav, code preserved. |
| Utility | Settings | `AppView.SETTINGS` / `components/Settings.tsx` | Yes | `mvp-active` | Active settings page. |
| Profile shortcut | Profile card | `AppView.PROFILE` / `components/Profile.tsx` | Yes | `mvp-active` | Accessed from sidebar footer. |

## Feature Inventory

| Feature name | Nav/tab label | Route/page/component | Current status | Part of MVP | Current state | Short note |
| --- | --- | --- | --- | --- | --- | --- |
| Dashboard Overview | Dashboard | `AppView.DASHBOARD` / `components/Dashboard.tsx` | `mvp-active` | Yes | visible | Top consistency/rewards panel, warm self-care progress messaging, gentle care reminders, one-metric cards, uncluttered charts, and a shared care-focused footer in the app shell. |
| Symptom Tracker | Track Symptoms | `AppView.TRACKER` / `components/Tracker.tsx` | `mvp-active` | Yes | visible | Calendar-based daily logging with one-tap Sjögren’s symptom selection, optional suggested symptoms, custom symptom tracking, adjustable limits for quantifiable lifestyle fields, and a simplified rest-mode view. |
| Rest Mode | None | `App.tsx`, `components/Dashboard.tsx`, `components/Tracker.tsx`, `components/Settings.tsx` | `mvp-active` | Yes | visible | Shared simplified-view toggle for lower-energy days that reduces cognitive load on the dashboard and tracker. |
| Gentle Onboarding | None | `App.tsx`, `components/OnboardingModal.tsx` | `mvp-active` | Yes | visible | First-run onboarding uses four calm steps with skip options and stores completion locally on the device. |
| Care Footer | None | `App.tsx` | `mvp-active` | Yes | visible | Shared footer provides simple navigation shortcuts, contact access, and a care-focused community message. |
| Symptom Report Export | None | `components/Tracker.tsx` | `mvp-active` | Yes | visible | Exports symptom history as CSV. |
| Lab Results | Lab Results | `AppView.LAB_RESULTS` / `components/LabResults.tsx` | `mvp-active` | Yes | visible | Manual lab logging, trend chart, recent history. |
| Lab Scan Import | Scan Result | `components/LabResults.tsx`, `services/geminiService.ts` | `mvp-active` | Yes | visible | AI image parsing for lab reports; depends on Gemini setup. |
| Lab Results Export | Export CSV | `components/LabResults.tsx` | `mvp-active` | Yes | visible | Exports lab history as CSV. |
| AI Insights | AI Insights | `AppView.INSIGHTS` / `components/Insights.tsx` | `mvp-active` | Yes | visible | Gemini-powered weekly analysis page. |
| Pain Pulse | Pain Pulse | `AppView.PAIN_PULSE` / `components/PainPulse.tsx` | `mvp-active` | Yes | visible | Connect feature for anonymous pain signals, support responses, custom support notes, preset affirmations, and received-support feedback. |
| Profile Management | Profile card | `AppView.PROFILE` / `components/Profile.tsx` | `mvp-active` | Yes | visible | User profile editing, demographics, interests, and friend list. |
| AI Avatar Generation | None | `components/Profile.tsx`, `services/geminiService.ts` | `mvp-active` | Yes | visible | Generates avatar artwork while editing profile. |
| Settings Core | Settings | `AppView.SETTINGS` / `components/Settings.tsx` | `mvp-active` | Yes | visible | Language, privacy, rest mode, dark mode, text size, and reduced motion preferences are wired to state, with added privacy-first trust messaging. |
| Appearance Theme Toggle | Dark Mode | `components/Settings.tsx`, `App.tsx`, `index.html` | `mvp-active` | Yes | visible | Dark mode is now wired to app state and persisted locally on the device. |
| Settings Mock Actions | Notifications, Appearance, Support | `components/Settings.tsx` | `needs-review` | No | visible | Notifications, text size, support links, and sign-out are still mostly mock or no-op. |
| HealUp Assistant | HealUp Assistant | `AppView.CHAT` / `components/AiAssistant.tsx` | `hidden-kept-for-later` | No | hidden | AI chat assistant still implemented but hidden for MVP focus. |
| Community Messaging | Messages | `AppView.COMMUNITY` / `components/Community.tsx` | `hidden-kept-for-later` | No | hidden | Friend chat UI with translation flow; mostly mock conversations. |
| Discover | Discover | `AppView.DISCOVER` / `components/Discover.tsx` | `hidden-kept-for-later` | No | hidden | Includes people matching and discoverable groups tabs. |
| Groups | Groups | `AppView.GROUPS` / `components/Groups.tsx` | `hidden-kept-for-later` | No | hidden | Group browsing and create-group UI using mock content. |
| Events | Events | `AppView.EVENTS` / `components/Events.tsx` | `hidden-kept-for-later` | No | hidden | Event filters and registration toggles using mock content. |
| Expert Portal | Expert Portal | `AppView.EXPERTS` / `components/Experts.tsx` | `hidden-kept-for-later` | No | hidden | Provider directory and partner CTA remain preserved. |
| Research Center | Research & News | `AppView.RESEARCH` / `components/Research.tsx` | `mvp-active` | Yes | visible | Journals, news, trials, and recruitment tabs are restored in HealUp Connect. |
| Soundscapes & Breathing Support | None | Not yet implemented | `planned` | No | planned | Future scope may include soft soundscapes or guided breathing support if the product expands beyond the MVP. |

## Implementation Notes

- There are no explicit feature deletions tracked in the current codebase.
- Hidden features are currently controlled by `config/features.ts` and guarded in `App.tsx` and `components/Sidebar.tsx`.
- Several preserved future features are mock-data driven and should be reviewed before reactivation.
- If a feature is added, hidden, restored, disabled, removed, renamed, or moved, update this file and `config/features.ts` in the same task.
