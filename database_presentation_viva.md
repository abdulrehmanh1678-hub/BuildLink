# BuildLink Pro: Database Presentation (Viva Guide)

This document is designed to help your 4-person group present the Database Implementation of BuildLink Pro specifically focusing on our **frontend-only architectural implementation**. 

## 1. Project Architecture Overview
Since this is a database-focused project but implemented purely in the frontend for demonstration purposes, it's crucial to explain **how** the data is structured and stored.

*   **Database Schema:** We designed a robust, 18-table relational schema using MySQL conventions (with proper constraints, foreign keys, and indexes).
*   **Frontend Data Store:** Because we are presenting a frontend-only demo, the physical database engine (like MySQL) has been simulated using **HTML5 LocalStorage**. 
*   **The Bridge:** When you view the platform (e.g., user profiles, project quotes), the JavaScript layer (`js/database.js`) acts as our "Database Engine." It intercepts queries, converts them into JSON, and stores/retrieves them from LocalStorage. The data strictly adheres to our 18-table schema.

## 2. The Relational Schema (18 Core Tables)
We have simplified the database from its original conceptual form by removing unnecessary lines (such as dynamic drops, generated columns, and overly complex triggers/stored procedures) to focus on the **core tables** essential for the application's CRUD operations.

The 18 tables are conceptually divided into 5 main modules:

### A. Authentication & Roles
1.  **`roles`**: Defines the user types (`owner`, `constructor`, `admin`).
2.  **`users`**: The central entity for all platform members. Stores credentials, trust scores, and links to a specific role.

### B. Profiles & Regions
3.  **`service_regions`**: Dictionary of physical areas where constructors can operate.
4.  **`constructor_profiles`**: Extended metadata for builders (license numbers, experience).
5.  **`specializations`**: List of constructor skills (e.g., commercial, residential).
6.  **`constructor_specializations`**: Intersect table mapping constructors to their specializations (Many-to-Many).
7.  **`constructor_service_regions`**: Intersect table mapping constructors to regions they cover (Many-to-Many).

### C. Projects Core Workflow
8.  **`plots`**: Properties owned by standard users (includes utility fields directly built-in for efficiency).
9.  **`project_requests`**: A request created by a user demanding a constructor for a specific plot.
10. **`request_constructor_targets`**: M2M bridge when specific constructors are invited to a project request.
11. **`quotes`**: Cost estimations submitted by constructors for a `project_request`.
12. **`projects`**: The final agreed-upon contract once a `quote` is accepted. Links owner, constructor, and quote.
13. **`project_progress_updates`**: Timeline updates for active projects.

### D. Communication & Feedback
14. **`reviews`**: Ratings and feedback given after a project is completed.
15. **`message_threads`**: P2P chat containers linking two participants.
16. **`messages`**: Individual messages within a thread.
17. **`contact_messages`**: Public-facing contact forms sent to the platform administrators.

### E. AI / Extras
18. **`budget_analyses`**: System-generated cost estimates based on plot specs before an actual request is made.

## 3. How We "Cleaned" the Database (For the Viva)
When asked about how the DB script was optimized, highlight the following:
*   **UUIDs replaced with INT AUTO_INCREMENT:** UUIDs (CHAR 36) are heavy on indices. Switching Primary Keys to Auto-Increment Integers significantly improves join performance.
*   **Inline Constraints:** Instead of separate alter tables, we integrated `CHECK` constraints directly into the table definitions (e.g., `trust_score BETWEEN 0 AND 5`).
*   **Merged Utility Tables:** We merged `plot_utilities` directly into the `plots` table as boolean flags (`has_water`, `has_gas`) to reduce unnecessary JOINs for a 1-to-1 relationship.
*   **Removed complex triggers & Drops:** We removed `DROP TABLE` lines and complex stored procedures so the DDL is clean, highly readable, and represents a pure relational schema structure.

## 4. Demonstrating the DB to the Examiner
We built a custom UI specifically to prove the database is working.

1.  Navigate the app to the **DB Admin** interface. (Click the `[ DB Admin ]` link in the website footer).
2.  There you will visually see all **18 tables** mapped directly from our SQL schema on the left sidebar.
3.  Explain that `js/database.js` intercepts data and saves it exactly according to these 18 relational mappings into local memory.
4.  You can open Chrome DevTools (F12) -> Application -> Local Storage during the presentation to show the real-time JSON storage formatting of the tables.

## 5. Group Distribution Ideas (For 4 Members)
If your group needs to speak individually, here is how you can divide the system:
*   **Speaker 1:** Discusses the Schema Architecture, the ER conceptual design, and the 18-table breakdown.
*   **Speaker 2:** Discusses the Optimization (Why we removed UUIDs, merged utility tables, and used INT primary keys).
*   **Speaker 3:** Explains Data Integrity (Foreign Keys, cascading deletes, and Check Constraints).
*   **Speaker 4:** Demonstrates the Implementation via the UI (The DB admin dashboard and how LocalStorage mocks a true DB).
