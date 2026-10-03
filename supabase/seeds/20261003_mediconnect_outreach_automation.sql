-- Insert the supplied MediConnect outreach automation case study as a private draft.
-- Run only after 202609250001_create_content_tables.sql and 202610030001_add_case_study_project_overview.sql.
insert into public.case_studies (
  slug, client_name, project_title, summary, project_overview,
  problem, solution, tech_used, service_type, screenshots,
  client_approved_public, status
)
values (
  'mediconnect-outreach-automation',
  'MediConnect',
  'MediConnect Outreach Automation',
  'An AI-assisted healthcare stakeholder research and outreach system built with n8n, ChatGPT, Notion, and Gmail.',
  $mediconnect_overview$MediConnect was developing its healthcare interoperability platform while also conducting market validation with hospitals, administrators, clinicians, and other relevant healthcare stakeholders.

The challenge was not simply finding people to contact. The team needed a repeatable process for researching organizations, identifying relevant stakeholders, qualifying contacts, preparing personalized outreach, managing approvals, sending emails, following up, and capturing what was learned from conversations.

We built an internal automation system in **n8n** to structure that entire process.

The system was developed internally at **ProbeTech** for MediConnect, a health data interoperability platform operated by the same team. Rather than replacing human judgment, the automation was designed to handle repetitive operational work while keeping important decisions, especially outreach approval and validation interpretation, under human control.

---

# The Problem

Before the automation, MediConnect's outreach and validation process depended heavily on manual work.

For each potential stakeholder, the team could need to:

* Research the hospital or organization
* Identify relevant decision-makers or healthcare professionals
* Find publicly available professional information
* Record contact details and profile links
* Determine whether the person was actually relevant
* Prepare an appropriate outreach message
* Send the message
* Remember when to follow up
* Track whether the person responded
* Schedule interviews
* Capture findings from those conversations
* Connect findings back to MediConnect's validation assumptions

Doing this manually creates several problems as the number of contacts grows.

Information can become inconsistent, duplicate contacts can be created, follow-ups can be forgotten, and research findings can become scattered across different tools.

There was also an important constraint: **MediConnect was still validating its assumptions.**

The system therefore needed to avoid treating assumptions as facts. It had to distinguish between verified information, unknown information, and information that required human review.

---

# The Goal

We did not set out to build a fully autonomous sales system.

The objective was to create a structured **research-to-outreach-to-validation workflow** that could:

1. Reduce repetitive manual work
2. Keep stakeholder information organized
3. Use AI where it was useful without allowing it to invent information
4. Maintain human approval before outreach was sent
5. Automate follow-up scheduling and tracking
6. Capture interview evidence in a consistent structure
7. Make the validation process easier to analyze later

This distinction shaped the architecture of the automation.

---

# What We Built

The final system was built as a modular **n8n workflow**, with different stages handling different parts of the process.

Instead of creating one large automation that attempted to do everything, the workflow was structured around individual functions that could be maintained and improved independently.

### 1. Hospital Research

The workflow supports researching hospitals and healthcare organizations before stakeholder outreach begins.

The purpose is to establish basic organizational context and identify why an organization may be relevant to MediConnect's validation work.

The workflow was designed around **public professional information**, rather than attempting to access private or restricted data.

Information that could not be verified was not supposed to be presented as fact.

---

### 2. Stakeholder Discovery

After an organization is identified, the workflow moves toward identifying potentially relevant stakeholders.

The target was not simply "any healthcare employee." The workflow was designed to identify people who may have useful perspectives on areas such as:

* Hospital administration
* Clinical operations
* Health information systems
* Digital health
* IT
* Medical leadership
* Referral and care coordination
* Other relevant healthcare operations

The purpose was to find people who could provide useful evidence during MediConnect's validation process.

---

### 3. Contact Qualification

Not every person discovered should become an outreach candidate.

A qualification stage was therefore included to help determine whether a stakeholder was sufficiently relevant before outreach preparation.

The workflow takes into account available information such as:

* Organization
* Role
* Stakeholder type
* Hospital or facility
* Professional profile
* Relevance to the validation objective

This reduces the likelihood of treating every discovered contact as an appropriate prospect.

---

### 4. Contact Enrichment

The automation organizes the information available for each contact into a consistent structure.

The workflow also uses explicit states for uncertain information.

For example, information can be treated as:

**Verified**
Information supported by an available source.

**Unknown**
Information that could not be established.

**Requires Human Review**
Information that needs someone on the team to verify before it is used.

This was an important design choice because healthcare stakeholder research can become unreliable when automated systems fill gaps with assumptions.

---

### 5. Duplicate Detection

A contact should not enter the system multiple times simply because it was discovered from different sources.

The workflow therefore includes duplicate-handling logic.

A **LinkedIn URL** is treated as the strongest duplicate identifier where available.

Where that is not available, the workflow can use a combination such as:

**Name + Organization**

This helps keep the outreach pipeline cleaner as research expands.

---

### 6. AI-Assisted Processing

ChatGPT was incorporated into the workflow for AI-assisted processing.

The role of AI was not to independently decide who should be contacted or fabricate missing information.

Instead, AI supports tasks within the structured workflow, including processing available information and helping prepare outreach-related content.

The automation was designed around a key principle:

> **AI assists the workflow. It does not become the source of truth.**

Where information was unavailable, the system was designed to preserve uncertainty instead of inventing details.

---

### 7. Outreach Generation

Once a stakeholder has been qualified, the available information can be passed into the outreach-generation stage.

The purpose is to make communication more relevant to the individual rather than sending the same generic message to every person.

The outreach process was designed around **short, non-sales conversations** focused on learning from healthcare professionals and organizations.

The objective at this stage was validation, not aggressive selling.

---

### 8. Human Approval

One of the most important parts of the system is the human approval stage.

The automation does not simply generate an email and immediately send it.

Instead, a human remains involved before outreach is sent.

This creates a checkpoint where the team can review the proposed message and underlying information before it reaches a real stakeholder.

This is especially important because the workflow operates in a healthcare context where incorrect assumptions about an organization, person, role, or experience could undermine the quality of the validation process.

---

### 9. Gmail Integration

Gmail was connected to the n8n workflow to support the email stage of the process.

This connects the approved outreach generated by the workflow to the actual communication channel.

The email integration is therefore not an isolated sending tool. It sits downstream of the research, qualification, AI processing, and approval stages.

This creates a basic pipeline:

**Research → Qualification → AI Processing → Outreach Generation → Human Approval → Gmail**

---

### 10. Follow-Up Automation

The workflow also accounts for follow-up rather than treating the initial email as the end of the process.

Follow-up timing was structured around defined stages rather than relying on memory.

The workflow uses follow-up windows such as:

**Day 5 to Day 7**

and

**Day 12 to Day 14**

This creates a more consistent process for contacts who have not responded.

It also makes the next action explicit instead of leaving the team to remember when each person needs attention.

---

### 11. Interview Management

The workflow extends beyond outreach.

When a stakeholder agrees to participate, the process can move into interview management.

The purpose is to create continuity between:

**Who we contacted → what they said → what evidence was obtained → what this means for MediConnect**

This matters because the ultimate purpose of the system is not simply to generate a high number of emails.

The real output is **validated learning**.

---

### 12. Evidence Capture

The validation process was structured so that interview findings could be recorded rather than remaining in scattered notes.

The system provides fields for capturing information such as:

* Key findings
* Introductions
* Hospital connection
* Interview status
* Date contacted
* Follow-up date
* Next action

This gives the team a consistent record of what happened with each stakeholder.

---

### 13. Validation Tracking

The outreach system was designed around MediConnect's underlying validation work.

Rather than only tracking communication status, the broader workflow can connect interviews and evidence back to the assumptions being tested.

The validation framework distinguishes between states such as:

**Not Tested → Testing → Supported → Mixed Evidence → Contradicted**

This creates a path from individual stakeholder interactions to broader product learning.

---

# Notion as the Outreach Pipeline

Notion was used as the central operational database for the stakeholder pipeline.

The **INTERVIEW PIPELINE** database contains structured fields including:

| Field               | Purpose                                     |
| ------------------- | ------------------------------------------- |
| Person              | Stakeholder name                            |
| Organization        | Stakeholder's organization                  |
| Role                | Professional role                           |
| Stakeholder Type    | Category of stakeholder                     |
| Hospital/Facility   | Relevant healthcare facility                |
| LinkedIn            | Professional profile                        |
| Email               | Contact email where available               |
| Contact Status      | Current outreach status                     |
| Priority            | Relative processing priority                |
| Why Relevant        | Reason the person matters to validation     |
| Interview Status    | Interview progress                          |
| Date Contacted      | Initial outreach date                       |
| Follow-up Date      | Next planned follow-up                      |
| Next Action         | What should happen next                     |
| Key Findings        | Evidence from conversations                 |
| Introductions       | Relevant connections generated              |
| Hospital Connection | Relationship to the healthcare organization |

This effectively gives MediConnect a single structured place to manage stakeholder research, outreach, interviews, and follow-up.

---

# Workflow Architecture

At a high level, the system can be represented as:

**Hospital Research**
↓
**Stakeholder Discovery**
↓
**Qualification**
↓
**Contact Enrichment**
↓
**Duplicate Check**
↓
**AI-Assisted Processing**
↓
**Outreach Generation**
↓
**Human Approval**
↓
**Gmail Outreach**
↓
**Follow-Up Tracking**
↓
**Interview Management**
↓
**Evidence Capture**
↓
**Validation Analysis**

The important architectural decision was keeping these responsibilities distinct.

That makes it possible to improve one stage without rebuilding the entire process.

---

# Technology Stack

| Technology                      | Role in the system                                                  |
| ------------------------------- | ------------------------------------------------------------------- |
| **n8n**                         | Core workflow automation and orchestration                          |
| **ChatGPT**                     | AI-assisted processing and outreach support                         |
| **Notion**                      | Stakeholder pipeline, interview tracking, and evidence organization |
| **Gmail**                       | Outreach and email communication                                    |
| **Public professional sources** | Research inputs for stakeholder discovery and verification          |

---

# Human-in-the-Loop Design

A major design principle was that automation should reduce repetitive work without removing human judgment.

The system therefore uses automation for tasks that are structured and repetitive while leaving decisions that require context to humans.

For example:

**Automation handles**

Research processing, information organization, duplicate checks, AI-assisted content preparation, workflow transitions, and follow-up management.

**Human review handles**

Final outreach approval, uncertain information, decisions requiring context, and interpretation of validation evidence.

This creates a hybrid model rather than attempting to make the entire validation process autonomous.

---

# What We Deliberately Did Not Automate

The system was also defined by what it does **not** do.

It does not assume missing information is true.

It does not manufacture email addresses or professional credentials.

It does not treat AI-generated information as automatically verified.

It does not send every generated message without review.

It does not replace the team's judgment when evaluating interviews.

These constraints were important because the quality of MediConnect's validation depends on the quality of its evidence.

---

# What Changed

Before the automation, the outreach workflow depended on a collection of repeated manual actions.

After building the automation, those actions were connected into a defined process.

| Area                  | Previous Process                 | Automated Process                          |
| --------------------- | -------------------------------- | ------------------------------------------ |
| Research              | Manually performed and organized | Structured workflow                        |
| Stakeholder discovery | Manual                           | Incorporated into workflow                 |
| Qualification         | Manually assessed                | Structured qualification stage             |
| Contact organization  | Manual tracking                  | Notion pipeline                            |
| Outreach writing      | Manual preparation               | AI-assisted generation                     |
| Sending               | Manual                           | Gmail integration                          |
| Approval              | Informal/manual                  | Explicit human approval stage              |
| Follow-up             | Memory/manual reminders          | Defined follow-up workflow                 |
| Interview tracking    | Manual                           | Structured Notion fields                   |
| Evidence capture      | Scattered/manual                 | Standardized fields                        |
| Validation            | Difficult to consolidate         | Designed to connect evidence to validation |

---

# Results

At this stage, we are intentionally separating **system implementation** from **measured business results**.

The workflow has been built, but metrics such as response rate, hours saved, number of interviews completed, and outreach volume should only be reported after sufficient real-world runs.

We therefore do not claim improvements that have not yet been measured.

| Metric                       |         Before |          After |
| ---------------------------- | -------------: | -------------: |
| Time per qualified contact   | To be measured | To be measured |
| Contacts processed           | To be measured | To be measured |
| Emails sent                  | To be measured | To be measured |
| Response rate                | To be measured | To be measured |
| Interviews completed         | To be measured | To be measured |
| Follow-ups completed on time | To be measured | To be measured |
| Manual intervention required | To be measured | To be measured |

**Measurement period:** Pending initial production runs
**Sample size:** Pending

This gives the case study room to be updated later with actual evidence rather than estimated impact.

---

# What Broke During Development

Building the workflow also exposed several practical issues that would not have been visible from a workflow diagram alone.

One issue involved the email integration.

The workflow initially used a dummy Gmail configuration during setup. This resulted in an error when the workflow attempted to use the email connection for the approval and outreach stages.

The solution was to reconnect the Gmail integration using the actual email account that would be used by the MediConnect workflow and verify the relevant credentials and permissions.

This highlighted an important implementation lesson:

**A workflow can be logically correct while still failing because one of its external service connections is incorrectly configured.**

That distinction matters when building automation systems because integrations are part of the system, not an afterthought.

---

# What We Learned

### 1. The best automation starts with workflow design, not AI

The most important part of this project was not adding ChatGPT.

It was first understanding the complete process:

**Research → qualify → contact → approve → communicate → follow up → interview → learn**

Once that structure existed, AI could be placed where it actually provided value.

---

### 2. Human approval is a feature, not a failure of automation

For outreach involving real professionals, complete autonomy is not necessarily the goal.

Having a person approve the final communication creates an important quality-control layer without requiring the person to manually perform every previous step.

---

### 3. Unknown information should remain unknown

One of the most important principles in the system was avoiding fabricated certainty.

When the workflow cannot establish something reliably, it should preserve that uncertainty rather than filling the gap with an AI-generated guess.

This is particularly important in healthcare research, where incorrect information can affect both credibility and the quality of product decisions.

---

### 4. Validation requires evidence, not just activity

A successful automation cannot be measured only by how many emails it sends.

The real question is whether it helps MediConnect learn something useful.

That is why the workflow extends beyond outreach into interviews, evidence capture, and validation analysis.

---

### 5. Modular workflows are easier to improve

Breaking the system into distinct stages means problems can be isolated.

For example, an issue in outreach generation does not require redesigning the interview-management process.

This makes the automation easier to debug, maintain, and expand as MediConnect's validation process changes.

---

# What's Next

The next stage is to run the workflow against real validation activity and collect measurable operational data.

The initial focus should be on establishing a baseline for:

**processing time, contacts researched, outreach sent, response rate, interviews completed, follow-up completion, and manual intervention.**

Once there is enough activity, those measurements can be used to determine where the automation is genuinely reducing effort and where additional improvements are necessary.

The workflow itself is therefore not treated as a finished artifact.

It is a working internal system that can be observed, tested, measured, and iterated.

---

# Final Takeaway

The MediConnect Outreach Automation was built to solve a practical operational problem: **how to make healthcare stakeholder validation more structured and repeatable without removing human judgment from the process.**

Using n8n as the automation layer, ChatGPT for AI-assisted processing, Notion for structured pipeline management, and Gmail for communication, we created a workflow that connects research, qualification, outreach, approval, follow-up, interviews, and evidence capture.

The value of the system is not that it sends emails automatically.

It is that it turns a fragmented manual process into a **repeatable research and validation system** that can improve as real evidence comes in.

**Built internally at ProbeTech for MediConnect.**

**Have a similar repetitive workflow in your business? Book a discovery call.**$mediconnect_overview$,
  '',
  '',
  array[]::text[],
  'automation',
  '{}'::text[],
  false,
  'draft'
)
on conflict (slug) do nothing;
