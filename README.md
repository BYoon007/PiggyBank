# PiggyBank

`PiggyBank` is a modern, student-focused full-stack web application designed to track college-specific expenses (such as textbooks, rent, and groceries) while actively promoting financial literacy. By moving beyond a standard ledger, the platform integrates the structured **50/30/20 budgeting framework** to automatically classify expenditures, dynamically calculate financial goals, and provide real-time behavioral feedback to help users optimize their spending habits.

---

## 📱 Features

* **Full CRUD Functionality:** Seamlessly executes Create, Read, Update, and Delete operations to manage personal expense and budget records securely within the system database.
* **50/30/20 Budgeting Engine:** Dynamically calculates and allocates income according to the classic financial literacy standard:
  * **50%** towards essential **Needs** (rent, bills, groceries)
  * **30%** towards flexible **Wants** (entertainment, dining out)
  * **20%** towards **Savings & Debt Repayment**
* **Automated Smart Alerts:** Features a real-time tracking mechanism that detects budget overages. If spending within a category (e.g., "Wants") exceeds the targeted percentage, an intuitive modal popup instantly guides the user with actionable advice to reduce nonessential costs.
* **Goal-Oriented Customization:** Allows students to set, modify, and track progress toward specific short-term and long-term savings goals.
* **Student-Centric UI:** Designed with a modern, high-efficiency user interface tailored to remove the complexity from everyday financial management.

---

## ⚙️ Tech Stack & Architecture

* **Frontend:** React.js
* **Backend:** Node.js, Express
* **Database:** MySQL
* **Architectural Style:** RESTful API Design
* **Key Mechanisms Implemented:**
  * Relational database schemas optimized for user-to-expense data mapping.
  * State-controlled modal rendering for dynamic budget alerts.
  * Backend routing for secure data persistence.
