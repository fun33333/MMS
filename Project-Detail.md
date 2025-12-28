
## 1️⃣ System definition (very important)

This is a:

> **Basic Madrassa Management System (Administrative Core)**

It is **NOT**:

* ❌ LMS
* ❌ Parent portal
* ❌ Hifz tracker
* ❌ Finance system

Its job is:

* Maintain **correct student records**
* Track **programs, classes, campuses**
* Handle **student movement** (assign / unassign / inactive)
* Provide **clear printable records**

---

## 2️⃣ Core entities (minimum but solid)

### A) Campus

Because madrassas grow and split.

**Fields**

* Campus Name
* Location (optional text)
* Capacity (maximum students)
* Status (Active / Inactive - no deletion, only deactivation)

---

### B) Program

A madrassa offering (Nazra, Hifz, Dars-e-Nizami, etc.)

**Fields**

* Program Name
* Description (optional)
* Status (Active / Inactive)

👉 Programs are **independent**, not tied to class.

---

### C) Class

Classes belong to **Campus + Program**.

**Fields**

* Class Name (e.g., Nazra A, Dars 1st Year)
* Campus
* Program
* Shift (Morning / Afternoon / Night) - bound with time slots
* Capacity (soft limit - admin can override)
* Status (Active / Inactive)

---

### D) Student (CORE)

This is your most important table.

**Essential fields (balanced, not overloaded):**

* Student Name (English)
* Father / Guardian Name (English)
* CNIC / B-Form (Optional but recommended - validate Pakistani format: XXXXX-XXXXXXX-X)
* Mobile Number (Required - validate Pakistani format: +92-XXX-XXXXXXX)
* Address (short text)
* Date of Admission
* Status (Active / Left with reason)
* Remarks

❗ No program or class directly stored here.

Why?
Because **students can change programs & classes**.

---

### E) Student–Program–Class Mapping (VERY IMPORTANT)

This is the key design decision.

Think of it like a **register entry**, not a concept.

**Fields**

* Student
* Program
* Class
* Shift
* Start Date
* End Date (nullable)
* Status (Active / Completed / Withdrawn)

This allows:

* One student → multiple programs
* Class changes (close old, create new)
* History preservation (very important for madrassas)

---

## 3️⃣ How class change / assignment works (simple logic)

### Assign student to class

* Select Student
* Select Program
* Select Class
* Select Shift
* Save

System creates **one active mapping**.

---

### Change class

System does NOT delete old record.

Instead:

* Old mapping → Status = Completed
* End Date = today
* New mapping → Active

This gives:

* History
* Clean reports
* No confusion

---

### Unassign student

* Set mapping status = Withdrawn
* Student remains in system (Inactive if needed)

### Additional Business Rules

* **Multiple Programs**: Students can enroll in multiple programs simultaneously (e.g., Morning Nazra + Night Dars-e-Nizami).
* **Class Changes**: Must record **Admin User** who made the change + **Reason** (Required).
* **Shifts**: Morning, Afternoon, Night (Time-bound).
* **Deactivation**: Applies to all entities (Students, Classes, etc.). No hard deletes.

---

## 4️⃣ Features (locked for Phase 1)

### Student Register

* Add student
* Edit student
* View full profile
* Print single student info
* Print student list
* Activate / Deactivate student

---

### Program & Class Management

* Create / Edit programs
* Create / Edit classes
* Assign classes to campus
* Activate / Deactivate classes

---

### Assignment Management

* Assign student to class
* Change class
* View assignment history

---

### Dashboard (BASIC, not fancy)

Just **numbers**, no charts needed:

* Total Students
* Active Students
* Programs Count
* Classes Count
* Active Campuses

This reassures management:

> “System is working.”

---

## 5️⃣ UI structure (clean & understandable)

### Left Sidebar (fixed)

* Dashboard
* Students
* Programs
* Classes
* Campuses
* Assignments

No hidden menus. No nesting.

---

### Student Page

* List view (search + filter)
* “Add Student” button
* Click student → Profile page

  * Basic info
  * Current programs/classes
  * Assignment history
  * Print button

---

### Design rules

* Urdu labels (primary)
* English subtitles (small)
* Large buttons
* No animations
* No icons dependency
* White background

---

## 6️⃣ Authentication (keep calm)

Roles:

* **Admin**: Full authority (CRUD on all entities, activate/deactivate, audit trail access)
* **Staff**: Read-only access (can view students, programs, classes, campuses - CANNOT create/delete/edit)

**Audit Trail**: Track who made changes and when (admin user + timestamp)

No complex permissions beyond these two roles.

---

## 7️⃣ Tech stack (BEST for THIS madrassa)

I am **not choosing what you like**.
I am choosing what is:

* Stable
* Simple
* Cheap
* Easy to maintain
* Forgiving for mistakes

### Backend

**Django (monolith)**

* Built-in admin panel (huge win)
* Mature auth system
* Easy data corrections
* SQLite initially (zero cost)
* PostgreSQL later (drop-in)

Why not Node-only?

* Django Admin saves **months**
* Less chance of data loss
* Non-dev-friendly fixes

---

### Frontend

**Next.js (PWA/ Mobile First)**

If madrassa staff is new:

* Django templates = safest

If phones are primary:

* Next.js (PWA) + Django API

👉 I’d recommend:

> **Django backend + simple Next.js frontend**

---

### Hosting (Free)

* Backend: Railway / Render
* Frontend: Vercel
* Database: SQLite initially

---

## 8️⃣ What we intentionally DO NOT build

* ❌ Fees
* ❌ Hifz tracking
* ❌ Attendance
* ❌ Parent portal
* ❌ Reports beyond printing

These can wait.

---

## 9️⃣ Phase discipline (this saves projects)

**Phase 1 goal:**

> “Replace admission + class registers.”

If that works → success.

---
