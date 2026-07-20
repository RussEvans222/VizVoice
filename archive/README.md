# VizVoice Archive

This directory preserves historical documentation from the VizVoice project development (July 2026). These files supported the build process but are not required for hackathon submission.

## 📁 Directory Structure

### planning/
Sprint plans, test scripts, and demo preparation:
- **CAMTASIA_CLIPS_NEEDED.md** — Video recording checklist
- **DOCUMENTATION_STATUS.md** — Documentation progress tracker
- **TEST_CONVERSATION_SCRIPT.md** — User testing script
- **TEST_QUESTIONS_WITH_FOLLOWUPS.md** — Multi-turn conversation tests
- **vizvoice-hackathon-demo.md** — Original demo outline
- **TEAM_STATUS.md** — Team progress tracking
- **HANDOFF.md** — Claude Code handoff document
- **NEXT_STEPS.md** — Post-hackathon roadmap
- **CALL_PREP.md** — Demo prep notes
- **DATASET_ACCESSIBILITY_PROPOSAL.md** — Enhanced dataset design proposal
- **DATASET_CURRENT_CAPABILITIES.md** — Dataset feature inventory
- **ADD_BRANDING_IMAGES.md** — Logo/branding integration guide

---

### config/
Agent configuration, Data Cloud setup, and semantic model specs:
- **AGENT.md** — Agent configuration reference (13KB - detailed action definitions)
- **AGENT_CONFIG_UPDATE.md** — Agent system prompt tuning history
- **DATA_CLOUD_SETUP.md** — Complete Data Cloud configuration walkthrough
- **LIBRARY_DATASET_SPEC.md** — Library dataset semantic model (alternative example)
- **RELATIONAL_DATASET_REQUIREMENTS.md** — Relational dataset design requirements

---

### data-samples/
CSV datasets used during development:
- **dc_tourism_hotels_timeseries*.csv** — Hotel occupancy time-series data (3 variants)
- **dc_tourism_restaurants_timeseries*.csv** — Restaurant traffic time-series (3 variants)
- **transit_performance_sample.csv** — Public transit metrics sample

---

### design/
UI/UX design iterations and color palette evolution:
- **COLOR_UPDATES_APPLIED.md** — Color branding changelog
- **COLOR_UPDATE_SUMMARY.md** — Summary of color changes
- **VIZVOICE_COLOR_PALETTE.md** — Complete brand color reference
- **DESIGN_CHANGES.md** — UI design iteration log
- **DESIGN_UNIFICATION_GUIDE.md** — Dashboard/app color coordination
- **PURPLE_COLOR_DEBUG.md** — Cache troubleshooting during color update
- **README_ACCESSIBILITY_UPDATES.md** — Accessibility feature documentation evolution
- **ACCESSIBILITY.md** — WCAG compliance review (early version)
- **QUICK_START_DESIGN.md** — Quick start guide design notes
- **UI_IMPROVEMENTS.md** — UI enhancement tracking

---

### troubleshooting/
Technical debugging notes and resolution logs:
- **MICROPHONE_TROUBLESHOOTING.md** — Browser permission handling fixes
- **TABLEAU_EMBEDDING_NOTES.md** — Tableau embedding API deep-dive
- **TABLEAU_LAYOUT_FIX.md** — Dashboard layout troubleshooting
- **AGENT_CONFIG_ANALYSIS.md** — Agent config diagnostics
- **AGENT_PROMPT_UPDATES.md** — System prompt tuning notes
- **AGENT_TEST_PROMPTS.md** — Agent test query library
- **DEPLOYMENT_INSTRUCTIONS.md** — UI Bundle deployment guide

---

### old-demos/
Previous demo iterations and proof-of-concept work.

---

## 🔍 Why Archive These Files?

For hackathon submission, judges need:
1. **Clean project structure** — Focus on running code, not dev history
2. **Core documentation** — Architecture, testing, submission answers
3. **GitHub polish** — Professional README, clear navigation

Archived files provide:
- Historical context for future maintainers
- Audit trail of design decisions
- Reference for similar projects

---

## 📂 Active Documentation

For current project documentation, see:
- **[../README.md](../README.md)** — Main project documentation
- **[../docs/](../docs/)** — Technical reference and required testing documentation
- **[../DEMO_SCRIPT.md](../DEMO_SCRIPT.md)** — Demo video script
- **[../DEVPOST_SUBMISSION_ANSWERS.md](../DEVPOST_SUBMISSION_ANSWERS.md)** — Devpost submission

---

## 🗑️ Deleted Files

The following generated files were removed during cleanup:
- `.DS_Store` files (Mac system metadata)
- Duplicate planning documents
- Obsolete color palette versions
- Redundant troubleshooting logs

---

## 📅 Archive Date

**July 20, 2026** — Pre-submission cleanup for Agentforce for Good Hackathon

---

## ♻️ Restoration

To restore any archived file to the project root:
```bash
cp archive/<directory>/<filename> .
```

Example:
```bash
# Restore agent configuration reference
cp archive/config/AGENT.md .

# Restore test conversation script
cp archive/planning/TEST_CONVERSATION_SCRIPT.md .
```
