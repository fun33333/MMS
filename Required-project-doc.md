
# 📌 1. PROJECT CHARTER (CORE DOCUMENT)

## Project Title

**Madrassa Basic Management System (MBMS)**

## Project Sponsor

Chairperson / Mohtamim of Madrassa

## Project Owner

Madrassa Administration

## Project Manager

(You) – Volunteer Technical Lead

## Project Purpose

To replace manual student admission and class registers with a **simple, web-based management system** that improves record accuracy, searchability, and reporting without increasing operational burden.

## Problem Statement

* Student records are maintained manually on paper
* Data is hard to search, duplicate, and easy to lose
* Student class/program changes are not properly tracked
* No centralized view of students, classes, and programs

## Project Objectives (SMART)

* Digitize **100% active student records**
* Enable **student assignment to multiple programs**
* Allow **class changes with history**
* Provide **printable student profiles and lists**
* Keep system **simple enough to use without training manuals**

## Success Criteria

* Office staff uses system daily instead of paper
* Student search takes < 10 seconds
* No loss of historical class/program data
* Monthly printed reports replace manual registers

## Constraints

* Zero budget
* Limited technical literacy
* One main computer, some smartphones
* Free hosting only

## Assumptions

* Internet is available intermittently
* One staff member will be responsible for data entry
* Chairperson supports gradual adoption

---

# 📌 2. PROJECT SCOPE DOCUMENT

## In Scope (Phase 1)

✔ Student registration & editing
✔ Campus management
✔ Program management
✔ Class management (with shifts)
✔ Student–Program–Class assignment & history
✔ Active / Inactive students
✔ CNIC / B-Form record (Optional but recommended)
✔ Basic dashboard (counts only)
✔ Printing (student profile, lists)

## Out of Scope (Explicitly)

❌ Attendance
❌ Fees & finance
❌ Hifz tracking
❌ Parent login
❌ SMS / WhatsApp
❌ Mobile app (native)

> **Rule:** If it doesn’t replace a paper register → it is out.

---

# 📌 3. STAKEHOLDER REGISTER

| Stakeholder        | Role          | Interest  | Influence |
| ------------------ | ------------- | --------- | --------- |
| Chairperson        | Sponsor       | High      | High      |
| Office Staff       | Daily User    | Very High | Medium    |
| Teachers           | Indirect User | Medium    | Medium    |
| IT Volunteer (You) | PM / Dev      | High      | High      |

---

# 📌 4. REQUIREMENTS DOCUMENT (HIGH-LEVEL)

## Functional Requirements

* Add/Edit/View Student
* Assign student to program & class
* Change class without losing history
* Activate / Deactivate student
* Print student information
* Search students by name, program, class
* Manage campuses, programs, classes

## Non-Functional Requirements

* Simple UI (Urdu-first labels)
* Mobile-friendly (Primary)
* No offline support (Online only)
* Printable outputs
* Secure login
* Fast load on low bandwidth

---

# 📌 5. DATA GOVERNANCE RULES

(Extremely important in madrassa setups)

1. **Single source of truth** → Web app only
2. **One data-entry authority**
3. **No deletion** — only deactivate
4. **Weekly backup** (Excel export)
5. **Print monthly snapshots**

---

# 📌 6. RISK REGISTER

| Risk              | Impact | Probability | Mitigation              |
| ----------------- | ------ | ----------- | ----------------------- |
| Staff resistance  | High   | Medium      | Keep UI like registers  |
| Internet downtime | Medium | High        | Simple retry + patience |
| Data entry errors | Medium | Medium      | Limited fields          |
| Feature creep     | High   | High        | Locked scope document   |
| Volunteer burnout | High   | Medium      | Fixed phases            |

---

# 📌 7. PHASE & MILESTONE PLAN

## Phase 1 – Core Registers (2–3 weeks)

* Student CRUD
* Campus/Program/Class
* Assignment logic
* Printing
* Basic dashboard

**Deliverable:**
Paper registers replaced.

---

## Phase 2 – Stabilization (1 month)

* Data cleanup
* UI polish
* Staff comfort
* Backup process

---

## Phase 3 – Optional Future

* Attendance
* Finance
* Hifz tracking

(Only if demanded by users)

---

# 📌 8. CHANGE CONTROL POLICY (THIS SAVES YOU)

Any new request must answer:

1. Which paper register does this replace?
2. Who will use it daily?
3. Can it be printed?

If **any answer is “no” → reject or defer**.

---

# 📌 9. COMMUNICATION PLAN

* Weekly 5-minute update to Chairperson
* Monthly printed report
* No WhatsApp support group (causes chaos)

---

# 📌 10. TECH DECISION RECORD (TDR)

## Selected Stack

* Backend: Django (Monolith)
* Frontend: Next.js (PWA/ Mobile First)
* API: Django Rest Framework/GraphQL (dashboard)
* Styling: TailwindCSS
* DB: SQLite (Phase 1)
* Hosting: Free-tier cloud
* Auth: Simple role-based login

## Reason

* Stability
* Built-in admin
* Low maintenance
* Easy data correction
* **Quality Assurance**: 90%+ Test Coverage, E2E Tests Required

---

# 📌 11. PROJECT GROUND RULES (PRINT THIS)

1. Simple > Powerful
2. Usable > Beautiful
3. Registers first, features later
4. No deletion, only history
5. If users don’t ask for it — don’t build it

---
