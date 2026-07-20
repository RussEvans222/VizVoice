# VizVoice — Hackathon Project Plan

**Source:** Original team planning canvas from Slack

---

## 📢 Project Overview

**VizVoice** is an Agentforce-powered voice accessibility agent that allows blind, low-vision, and accessibility-dependent users to interact with Salesforce records and Tableau dashboards using natural spoken language — and receive spoken responses back.

This project is our submission for the **Agentforce for Good Employee Hackathon — Builder Track**.

### Official Hackathon Resources
* [Full FAQ & Builder Track Guide](https://salesforce.enterprise.slack.com/docs/T5J4Q04QG/F0B853929A6)
* [Register on Devpost](https://devpost.team/salesforce/hackathons/3825?org_uid=OSrxDRxqVCx73_fy67FGrQ&register=true)
* [Accessibility Expert Setup](https://github.com/salesforce-experience-platform-emu/adk-agent/blob/main/docs/A11Y_FTEST_FIX_WORKSPACE_GUIDE.md)
* [RAI Self Check Setup](https://git.soma.salesforce.com/olugo/hackathon-rai-self-check)
* [Agentforce + Slack Setup Guide (Trailhead)](https://trailhead.salesforce.com/content/learn/projects/connect-your-agentforce-org-with-slack/prepare-your-agentforce-playground)
* Support channel: #a4g-hackathon-support

---

## 👥 Team

- **Leandria Streeter**
- **Mahathi Devavallopally**  
- **Russell Evans**

---

## 🎯 Problem Statement

Tableau dashboards and Salesforce records are largely inaccessible to blind and low-vision users. Specific WCAG 2.1 violations include:

* **WCAG 4.1.2** – Form fields not announced by screen readers
* **WCAG 1.3.1** – Missing logical heading structure; tables not accessible
* **WCAG 2.4.3** – Focus order broken; notifications don't receive focus
* **WCAG 2.1.1** – Interactive elements can't be used via keyboard alone
* **WCAG 1.4.3** – Insufficient color contrast

**Bottom line:** Users who rely on screen readers or voice interaction cannot consume Tableau visualizations or navigate Salesforce efficiently today.

---

## 💡 Solution: VizVoice

An Agentforce agent with a React voice interface that:

1. **Listens** — captures user voice input via the Web Speech API
2. **Understands** — sends spoken query as text to an Agentforce Agent
3. **Retrieves** — agent queries Salesforce records AND pulls underlying Tableau data via the Tableau REST API (semantic understanding, not image parsing)
4. **Responds** — reads the answer back aloud via Web Speech Synthesis API

### Example Interaction

> 🎙️ *User says:* "Summarize my Q2 pipeline dashboard"
> 
> 🤖 *Agent queries Salesforce + Tableau REST API*
> 
> 🔊 *Spoken response:* "You have 12 open opportunities totaling $4.1M closing this quarter, led by Acme Corp at $800K in Stage 4..."

---

## 🔧 Technical Architecture

### Frontend
* React app
* Web Speech API (voice input)
* Web Speech Synthesis API (voice output)
* Agentforce Agent API integration

### Agentforce Agent
* Custom Agent Topic: "Data Accessibility"
* Agent Actions:
    * Query Salesforce Records
    * Pull Tableau viz data via REST API
    * Summarize data as natural language

### Data Layer
* Tableau REST API (underlying viz data — not screenshots)
* Salesforce Org with Agentforce enabled (provisioned)
* Optional: Data Cloud semantic model

---

## 📅 Key Dates & Build Timeline

| Milestone | Date |
|-----------|------|
| Registration Open | June 8, 2026 |
| Developer Orgs Available | June 15, 2026 |
| Submission Form Opens | June 20, 2026 at 9:00 AM ET |
| Registration Closes | July 10, 2026 |
| **Submission Deadline** | **July 20, 2026 at 5:00 PM ET** |
| Round 1 Judging | July 21-24, 2026 |
| Finalists Announced | On or around July 25, 2026 |
| Winners Announced | On or around July 31, 2026 |

---

## 🔨 Build Phases

| Status | Phase | Tasks | Owner | Target |
|--------|-------|-------|-------|--------|
| ✅ | **1 — Setup** | Register on Devpost, provision org, scaffold React app, configure Agent | Russell | Day 1 |
| ✅ | **2 — Voice Layer** | Web Speech API input + synthesis output in React | Mahathi | Day 1–2 |
| ✅ | **3 — Agent Config** | Define Agent Topic, Actions, Tableau REST connection | Mahathi, Russell | Day 2–3 |
| ✅ | **4 — Integration** | Connect React → Agent API → Salesforce + Tableau | All | Day 3–4 |
| ✅ | **5 — Accessibility Review** | Run Accessibility Expert Skill + RAI Self Check Skill | All | Day 4 |
| 🔄 | **6 — Demo Video** | Record 5-min demo, write project description (300–500 words) | All | Day 5 |
| ⏳ | **7 — Submit** | Publish on Devpost (not just save draft), add org credentials | All | Day 5 |

---

## 🎬 Demo Idea

**Original concept from planning:**

> The user asks aloud: "What is the graphic I'm looking at here? What type of data does this show?" The agent responds: "You're viewing a visual representation of business financial data showing quarter-over-quarter results with revenue increasing year-over-year for the last three years. Would you like to drill into any specific months or days?" The user might reply: "Yes, I'd like to see my sales data for June 17th, 2024," and the visualization would automatically adjust to show that filtered view. We'll need to explore how to implement this dynamic filtering, potentially using Tableau Next.

**What we actually built:**

Voice-first accessibility agent that lets users ask natural language questions about Tableau dashboards and receive spoken answers grounded in Data Cloud semantic models. Users can interact with visualizations entirely through voice, with no mouse or visual chart reading required.

---

## 🌐 Org Information

**GitHub Repo:** https://github.com/RussEvans222/VizVoice

**OrgFarm Demo Org:** https://login.salesforce.com  
**Username:** epic.0d666f471e01@orgfarm.salesforce.com  
**Password:** Salesforce1

**Additional Team Member Accounts:**
- lstre@orgfarmaa.com
- mdev@orgfarmaa.com

**Live App URL:** https://orgfarm-aac260ab62-dev-ed--c.develop.my.salesforce.app/app/c__vizvoice

---

## 📋 Submission Checklist

### Devpost Submission
- [x] Register on Devpost (all team members added)
- [x] Project title and description filled out (300–500 words)
- [ ] Submission **Published** on Devpost (not just saved as draft)
- [ ] Demo video uploaded — 5 min max (YouTube unlisted or Vimeo)
- [x] Org ID, admin username, and admin password included
- [x] Optional: GitHub repo link (https://github.com/RussEvans222/VizVoice)

### Required Tool Reviews
- [x] Accessibility Expert Skill run — document findings + team response (21/21 passing, 100% WCAG 2.2 AA)
- [x] RAI Self Check Skill run — document findings + team response (3 transparency gaps addressed)

### Submission Form Questions (Required)
- [x] One-sentence pitch
- [x] Equality Group Challenge selection (Abilityforce)
- [x] Accessibility Question: what did the Accessibility Expert Skill find? What did you fix, keep, and why?
- [x] Responsible AI Question: what did the RAI Self Check find? How did you address bias, fairness, transparency?
- [x] Sustainability: how did you minimize compute / unnecessary AI calls?
- [x] Special Award nominations: **Accessibility Excellence**, **Abilityforce Equality Group Champion**, **Platform Innovation**
- [x] Org credentials provided for judges

---

## ✅ Judging Criteria Alignment

| Criterion | Weight | How VizVoice Addresses It |
|-----------|--------|---------------------------|
| **Innovation** | — | Voice-first data accessibility — fresh approach to a documented WCAG gap |
| **Impact** | — | Directly serves blind/low-vision users; 1 in 6 people globally have a disability |
| **Execution** | — | React + Agentforce + Tableau REST API — fully demo-able in 5 min |
| **Use of Platform** | — | Agentforce Agent with custom Actions on a provisioned org + optional Slack integration |
| **Responsible AI** | — | RAI Self Check completed; bias, fairness, and transparency documented |
| **Demo Quality** | — | Clear voice interaction demo — compelling for judges who've never seen the project |

### Special Awards We're Eligible For
* 🦾 **Abilityforce Equality Group Champion** ($250/person) — directly addresses their challenge prompt
* ♿ **Accessibility Excellence Award** ($250/person) — WCAG-grounded, screen reader gap
* 🌱 **Sustainability Award** ($250/person) — if we right-size model calls and minimize compute
* **Platform Innovation Award** ($250/person) — novel use of Agentforce + Tableau REST API

---

## 📝 Notes & Decisions

* **Semantic data approach:** Tableau REST API pulls underlying data rows/columns — no vision model or screenshot parsing. This ensures accuracy and trustworthiness for accessibility use.
* **React frontend:** Chosen for Web Speech API support and demo-ability in browser. Voice enablement can be requested early via #a4g-hackathon-support.
* **Slack integration:** Optional — can connect provisioned Salesforce org to a Slack Sandbox via the Slack Platform Connector (package ID: `04t4S000000ybVn`)
* **Scope boundary:** Phase 1 targets Salesforce record queries + one Tableau dashboard. Tableau Data Cloud semantic model is a Phase 2 stretch goal.
* **Eligibility reminder:** Teams of 2–3 full-time Salesforce employees only. No contractors. Build only starts during the official window (June 8 onward).
* **Post-hackathon opportunity:** If packagable, consider publishing on AgentExchange via Salesforce Labs 🚀

---

## 🎯 What We've Accomplished

### ✅ Completed
1. **Voice Interface** — Full Web Speech API integration (STT + TTS), zero server compute
2. **Agent Integration** — Agentforce Analytics Agent via Apex REST proxy + Named Credential OAuth
3. **Data Cloud Integration** — C360_Semantic_Model_Extended_0ba semantic model
4. **Tableau Embedding** — Analytics SDK V3 with JWT Bearer Flow frontdoor auth
5. **100% WCAG 2.2 AA Compliance:**
   - ✅ ARIA live regions (SC 4.1.3)
   - ✅ Keyboard-only navigation (SC 2.1.1)
   - ✅ Focus indicators 4.5:1 contrast (SC 2.4.7)
   - ✅ Error recovery suggestions (SC 3.3.3)
   - ✅ Image alt text (SC 1.1.1)
   - ✅ No visual metaphors in responses
   - ✅ Colorblind-safe palette (Tableau 10)
6. **RAI Transparency Features:**
   - ✅ AI identity disclosure in welcome message (Fix 1)
   - ✅ Help button with capability/limitation disclosure (Fix 2)
   - ✅ Uncertainty expression in agent responses (Fix 3)
7. **Sustainability Optimizations:**
   - ✅ Browser-native speech (100% reduction in cloud STT/TTS)
   - ✅ One agent call per utterance (50-70% reduction vs typical chatbots)
   - ✅ Aggressive caching (80-90% fewer API calls)
   - ✅ 40-60% total compute reduction
8. **Testing & Validation:**
   - ✅ 11 test queries validated
   - ✅ Accessibility Expert Skill run (21/21 passing)
   - ✅ RAI Self-Check run (all 3 transparency gaps addressed)
9. **Documentation:**
   - ✅ Comprehensive README
   - ✅ ACCESSIBILITY_EXPERT_RESULTS.md (100% compliance verified)
   - ✅ RAI_SELF_CHECK_RESULTS.md (full transparency audit)
   - ✅ SUSTAINABILITY.md (compute efficiency analysis)
   - ✅ RAI_TRANSPARENCY_FIXES_APPLIED.md (code changes documented)
   - ✅ DEVPOST_SUBMISSION_ANSWERS.md (all form answers ready)

### ⏳ Remaining Tasks
1. **Demo Video** — Record 5-minute video (script ready in DEMO_SCRIPT.md)
2. **User Testing** — Optional validation with blind colleague (Gina)
3. **Final Devpost Submission** — Publish (not draft)
