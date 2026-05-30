# 💸 Tracker.io — Personal Expense Tracker App

A personal finance tracking web application built as the final submission for the **Front-End Web Pemula** class on Dicoding. The app allows users to record income and expense transactions, monitor their current balance, and search through transaction history — all without any external libraries or frameworks.

---

## ✨ Features

- **Add Transactions** — Record income or expense entries with title, amount, date, and type
- **Live Dashboard** — Balance, total income, and total expense update automatically on every change
- **Edit & Delete** — Modify or remove any transaction with full form re-population on edit
- **Switch Type** — Toggle a transaction between income and expense with one click
- **Live Search** — Filter transactions in real time as you type; clears back to full list when empty
- **Persistent Storage** — All data is saved to `localStorage` and restored on page reload
- **Custom Event Architecture** — All UI updates are driven by a single `transaction:updated` custom event dispatcher

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (Semantic) |
| Styling | CSS3 (BEM, CSS Variables, Responsive Grid) |
| Logic | Vanilla JavaScript (ES6+) |
| Storage | Web Storage API (`localStorage`) |
| Events | Custom Events (`dispatchEvent`) |

No frameworks. No libraries. No build tools required.

---

## 📁 Project Structure

```
expense-tracker-app/
├── index.html   — Page structure and semantic markup
├── style.css    — BEM-based styling with CSS variables and responsive breakpoints
├── main.js      — All application logic (DOM manipulation, storage, events)
└── README.md    — This file
```

---

## 🚀 How to Run

**Option 1 — Live Server (Recommended):**
1. Open the project folder in VS Code
2. Right-click `index.html` → **Open with Live Server**
3. App opens at `http://127.0.0.1:5500`

**Option 2 — Direct Browser:**
Double-click `index.html` from File Explorer. No installation needed.

---

## 📐 Architecture Notes

### Data Model
Each transaction follows this structure:
```js
{
  id: number,      // Auto-generated via +new Date()
  title: string,
  amount: number,
  date: string,
  type: 'income' | 'expense'
}
```

### Custom Event Flow
```
User Action (add / edit / delete / change type)
  → saveToStorage()
  → dispatchEvent(new Event('transaction:updated'))
    → renderTransactions()
    → updateDashboard()
```

This pattern keeps side effects centralized and predictable.

---

## ✅ Submission Criteria Coverage

| Criteria | Level Achieved |
|---|---|
| DOM Manipulation — Form & Transaction List | ⭐⭐⭐⭐ Advanced |
| Data Persistence — Web Storage API | ⭐⭐⭐⭐ Advanced |
| Interactive Features — Type Switch & Search | ⭐⭐⭐⭐ Advanced |

---

## 📚 Course Context

Built as the final project for **Belajar Membuat Front-End Web untuk Pemula** on [Dicoding](https://www.dicoding.com).

Topics covered in the course:
- Browser Object Model (BOM) & Document Object Model (DOM)
- DOM Manipulation with JavaScript
- Interactivity with Events
- Data Persistence with Web Storage API

**Estimated course duration:** 45 hours

---

## 📄 License

This project is open for learning and portfolio purposes.
