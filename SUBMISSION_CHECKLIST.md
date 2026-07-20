# VizVoice Hackathon Submission Checklist

**Hackathon:** Agentforce for Good — Builder Track (Accessibility)  
**Team:** 2-3 members  
**Deadline:** Check #a4g-hackathon-support for exact date  
**Submission Platform:** Devpost

---

## ✅ Required Deliverables

### 1. Demo Video (5 minutes max)
- [ ] **Length:** 4:30–5:00 minutes (target: 4:45)
- [ ] **Platform:** YouTube/Vimeo (unlisted or public link)
- [ ] **Content:**
  - [ ] Problem statement (inaccessible dashboards)
  - [ ] Solution demo (voice assistant in action)
  - [ ] Live agent conversation (3-4 sample questions)
  - [ ] Accessibility features showcase
  - [ ] Impact statement (253M people)
- [ ] **Captions:** Auto-generated or manual (YouTube auto-caption acceptable)
- [ ] **Script:** [DEMO_SCRIPT.md](DEMO_SCRIPT.md)

**Status:** ⏳ In progress  
**Link:** _[Paste YouTube/Vimeo URL here]_

---

### 2. Project Description (300-500 words)
- [x] **Drafted:** See [DEVPOST_SUBMISSION_ANSWERS.md](DEVPOST_SUBMISSION_ANSWERS.md)
- [ ] **Submitted:** Copy-paste to Devpost submission form

**Current Word Count:** 487 words ✅

---

### 3. Provisioned Org Credentials
- [x] **Org URL:** `https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com`
- [x] **Admin Username:** _[Ready to provide to judges]_
- [x] **Admin Password:** _[Secure, not in repo]_
- [ ] **Access Verified:** Test login from incognito browser

---

### 4. GitHub Repository
- [x] **Repo URL:** https://github.com/RussEvans222/VizVoice
- [x] **README.md:** Professional, clear navigation
- [x] **Documentation Organized:** docs/, archive/ structure
- [ ] **All Changes Committed:** Run `git status` to verify

**Visibility:** Public ✅

---

### 5. Required Testing Documentation

#### ACCESSIBILITY EXPERT SKILL
- [x] **Run Accessibility Expert Skill:** Completed July 17, 2026
- [x] **Document Results:** [docs/ACCESSIBILITY_REVIEW.md](docs/ACCESSIBILITY_REVIEW.md)
- [x] **Score:** 21/21 criteria passing (100%)
- [x] **Team Response:** All recommendations implemented
  - ARIA live regions for screen reader announcements
  - Keyboard-only navigation (Alt+V shortcut)
  - Focus indicators (4.5:1 contrast minimum)
  - Error recovery with contextual help

**Status:** ✅ Complete

---

#### RAI SELF-CHECK SKILL
- [x] **Run RAI Self-Check Skill:** Completed July 17, 2026
- [x] **Document Results:** [docs/RAI_SELF_CHECK.md](docs/RAI_SELF_CHECK.md)
- [x] **Gaps Identified:** 3 transparency gaps
- [x] **Team Response:** All 3 gaps addressed with code changes
  1. **AI Identity Disclosure** — Added "I'm VizVoice, an AI agent" to welcome message
  2. **Capability Boundaries** — Added Help button listing what agent can/cannot do
  3. **Uncertainty Expression** — Agent acknowledges ties and data limitations

**Status:** ✅ Complete

---

#### AGENT VALIDATION TESTING
- [x] **Test Query Bank:** 11 validated queries
- [x] **Document Results:** [docs/AGENT_TEST_RESULTS.md](docs/AGENT_TEST_RESULTS.md)
- [x] **Coverage:**
  - Simple facts (counts, totals)
  - Comparisons (month-over-month, line-to-line)
  - Rankings (top/bottom performers)
  - Aggregations (quarterly totals)
  - Edge cases (no data, ambiguous queries)

**Status:** ✅ Complete (11/11 queries passing)

---

### 6. Optional: Sustainability Documentation
- [x] **Compute Efficiency Analysis:** [hackathon-reference/SUSTAINABILITY.md](hackathon-reference/SUSTAINABILITY.md)
- [x] **Key Metrics:**
  - Browser-native speech (zero cloud STT/TTS)
  - One agent call per utterance (no retry loops)
  - 40-60% compute reduction vs typical chatbots
  - Aggressive caching (80-90% fewer API calls)

**Status:** ✅ Complete

---

## 📋 Pre-Submission Verification

### Code & Deployment
- [ ] **UI Bundle builds successfully:** `npm run build` (no errors)
- [ ] **Deploys to org:** `sf project deploy start --source-dir force-app`
- [ ] **Voice assistant works:** Press Alt+V, ask "How many trips were cancelled in December?"
- [ ] **Agent responds correctly:** Grounded answer from Data Cloud
- [ ] **TTS speaks answer:** Hear spoken response

---

### Documentation
- [ ] **README.md links work:** Click all [internal](links) to verify
- [ ] **Required testing docs accessible:** All 3 docs in [docs/](docs/)
- [ ] **Archive organized:** All historical docs in [archive/](archive/)
- [ ] **No broken links:** Check docs/README.md links
- [ ] **No sensitive data in repo:** No passwords, API keys, tokens

---

### GitHub
- [ ] **All changes committed:** `git status` shows clean working tree
- [ ] **Pushed to origin:** `git push origin main`
- [ ] **Repository public:** Visible at https://github.com/RussEvans222/VizVoice
- [ ] **Clean root directory:** Only 3 .md files + LICENSE + configs

---

### Devpost Form
- [ ] **Project Name:** VizVoice
- [ ] **Tagline:** Voice-First Accessibility Agent for Tableau Next Dashboards
- [ ] **Description:** Copy from DEVPOST_SUBMISSION_ANSWERS.md (487 words)
- [ ] **Demo Video URL:** _[Paste YouTube/Vimeo link]_
- [ ] **GitHub Repo URL:** https://github.com/RussEvans222/VizVoice
- [ ] **Built With:** Salesforce Agentforce, Data Cloud, Tableau Next, React, Web Speech API
- [ ] **Track Selected:** Builder — Accessibility
- [ ] **Equality Group:** Abilityforce

---

## 🎯 Judging Criteria Alignment

### Innovation (30%)
- ✅ **Novel approach:** First voice-first agent for Tableau analytics
- ✅ **Technical sophistication:** Browser-native speech + Agentforce + Data Cloud integration
- ✅ **Differentiation:** Zero cloud STT/TTS compute (vs AWS Polly/Transcribe)

### Impact (25%)
- ✅ **Clear problem statement:** 253M people can't access dashboards
- ✅ **Measurable impact:** 100% WCAG 2.2 AA compliance
- ✅ **Scalability:** Works with any Data Cloud semantic model

### Design (20%)
- ✅ **User-centric:** Voice-first, keyboard-only navigation
- ✅ **Accessibility:** ARIA live regions, no visual metaphors, Alt+V shortcut
- ✅ **Clean architecture:** React UI Bundle + Apex proxy + Named Credential auth

### Execution (15%)
- ✅ **Fully functional:** End-to-end voice assistant working
- ✅ **Code quality:** Clean components, proper error handling
- ✅ **Documentation:** Professional README, organized docs/, clear archive/

### Engagement with Required Skills (10%)
- ✅ **Accessibility Expert:** 21/21 criteria passing, all recommendations implemented
- ✅ **RAI Self-Check:** 3 transparency gaps identified and addressed with code changes
- ✅ **Validation testing:** 11/11 test queries passing

---

## 🚨 Last-Minute Checks

**24 Hours Before Deadline:**
- [ ] Test voice assistant in incognito browser (clean cache)
- [ ] Verify org credentials work from different computer
- [ ] Spell-check all documentation
- [ ] Demo video uploaded and link tested
- [ ] Team members confirmed in Devpost submission

**1 Hour Before Deadline:**
- [ ] Final `git push origin main`
- [ ] Devpost submission form fully completed
- [ ] Submit and receive confirmation email
- [ ] Screenshot confirmation page

---

## 📞 Support

**Slack Channels:**
- #a4g-hackathon-support — Hackathon questions
- #help-tableau-next — Tableau embedding questions
- #ask-scct — Data Cloud questions

**Documentation:**
- [README.md](README.md) — Project overview
- [docs/README.md](docs/README.md) — Technical documentation index
- [DEMO_SCRIPT.md](DEMO_SCRIPT.md) — Demo video script

---

## ✅ Submission Confirmation

**Date Submitted:** _________________  
**Confirmation Number:** _________________  
**Team Members:** _________________  
**Submitted By:** _________________

---

## 🎉 Post-Submission

After submission:
- [ ] Share demo video in #a4g-hackathon-support
- [ ] Celebrate with the team! 🎉
- [ ] Plan post-hackathon improvements (see [hackathon-reference/project-plan.md](hackathon-reference/project-plan.md))
- [ ] Schedule user testing with blind colleague (Gina)

---

**Good luck, team! 🚀**
