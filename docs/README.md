# VizVoice Documentation

This directory contains the core technical documentation for the VizVoice project.

## 📋 Hackathon Submission Documentation

These documents are **required** for the Agentforce for Good Hackathon submission:

### [ACCESSIBILITY_REVIEW.md](ACCESSIBILITY_REVIEW.md)
**WCAG 2.2 Level AA Compliance Verification**  
Results from the Accessibility Expert Skill review showing 100% compliance across all 21 criteria:
- Keyboard navigation (Alt+V shortcut, Tab/Enter controls)
- ARIA live regions for screen reader announcements
- Focus indicators with 4.5:1 contrast minimum
- No visual metaphors in agent responses
- Error recovery with contextual help

**Status:** ✅ 21/21 criteria passing

---

### [RAI_SELF_CHECK.md](RAI_SELF_CHECK.md)
**Responsible AI Transparency Assessment**  
Self-check results identifying 3 transparency gaps and documenting fixes:
1. **AI Identity Disclosure** — Added explicit "I'm VizVoice, an AI agent" in welcome message
2. **Capability Boundaries** — Added Help button listing what the agent can/cannot do
3. **Uncertainty Expression** — Agent now acknowledges ties and data limitations

**Status:** ✅ All 3 gaps addressed with code changes

---

### [AGENT_TEST_RESULTS.md](AGENT_TEST_RESULTS.md)
**Agent Validation Testing**  
11 validated test queries covering:
- Simple facts ("How many trips were cancelled in December?")
- Comparisons ("Compare December to November")
- Rankings ("What line had the most delays?")
- Aggregations ("Total on-time trips in Q4")
- Edge cases (no data periods, ambiguous queries)

**Status:** ✅ 11/11 queries answering correctly with grounded data

---

## 🏗️ Technical Architecture

### [ARCHITECTURE.md](ARCHITECTURE.md)
**System Design and Data Flow**  
Complete technical architecture including:
- Component diagram (React UI → Apex Proxy → Agentforce → Data Cloud)
- Authentication flow (Named Credential OAuth)
- Voice processing pipeline (Web Speech API → Agent → TTS)
- Tableau Next embedding strategy

---

### [SEMANTIC_MODEL_UI_WALKTHROUGH.md](SEMANTIC_MODEL_UI_WALKTHROUGH.md)
**Data Cloud Configuration Guide**  
Step-by-step walkthrough of the semantic model:
- Field definitions and business names
- Relationships between objects
- Calculated metrics
- Synonyms for natural language queries

---

## 📊 Data Reference

### Field Documentation
- **[dc-tourism-hotels-fields.md](dc-tourism-hotels-fields.md)** — Hotels dataset schema
- **[dc-tourism-restaurants-fields.md](dc-tourism-restaurants-fields.md)** — Restaurants dataset schema
- **[dc-tourism-timeseries-semantic-model-fields.md](dc-tourism-timeseries-semantic-model-fields.md)** — Time-series model fields
- **[semantic-model-field-descriptions.md](semantic-model-field-descriptions.md)** — Complete field reference

### Test Questions
- **[dc-tourism-agent-test-questions.md](dc-tourism-agent-test-questions.md)** — Comprehensive test query bank

---

## 📚 Additional Resources

### Tableau Next API
- **[tableau-next-rest-api/](tableau-next-rest-api/)** — REST API documentation and examples

### External Guides
- **[Best_Practices_AI_Readiness.pdf](Best_Practices_AI_Readiness.pdf)** — Salesforce AI best practices

---

## 🔗 Related Documentation

- **[../DEMO_SCRIPT.md](../DEMO_SCRIPT.md)** — 5-minute demo video script
- **[../DEVPOST_SUBMISSION_ANSWERS.md](../DEVPOST_SUBMISSION_ANSWERS.md)** — Complete Devpost submission text
- **[../hackathon-reference/](../hackathon-reference/)** — Hackathon planning and sustainability docs
- **[../archive/](../archive/)** — Historical planning, config, and troubleshooting notes

---

## 📞 Support

For questions about VizVoice documentation:
- **GitHub Issues:** [github.com/RussEvans222/VizVoice/issues](https://github.com/RussEvans222/VizVoice/issues)
- **Hackathon Slack:** #a4g-hackathon-support
