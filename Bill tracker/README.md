# Bill Tracker

A simple web application to track upcoming bills and subscriptions, monitor monthly expenses, and stay on top of payment due dates.

## What It Does

- **Add and Update Bills**: Add bills with a name, amount (in ₹), category, due date, and repeat frequency (Monthly, Yearly, One-time).
- **Summary Dashboard**: View estimated monthly spend, the count of bills due within 7 days, and any overdue bills.
- **Color Coded Status**:
  - Green: More than 7 days left until due date.
  - Yellow: Due within 7 days or due today.
  - Red: Overdue.
- **Sorted by Due Date**: Automatically shows the bills with the nearest due dates first.
- **Category Filter**: Filter bills by category (Entertainment, Utilities, Education, Food, Other).
- **Mark as Paid**:
  - For Monthly bills, advances the due date by one month.
  - For Yearly bills, advances the due date by one year.
  - For One-time bills, removes the bill from the list.
- **Edit and Delete**: Easily edit bill details or remove them completely.
- **Data Persistence**: Uses browser `localStorage` to save your bills so data stays when you close or refresh the page.
- **Form Validation**: Checks that the name is filled, amount is greater than 0, and a due date is selected.

## Files

- `index.html` - The HTML structure of the application.
- `style.css` - Clean, responsive layout styling using CSS Flexbox.
- `script.js` - Application logic, state management, and calculations.

## How to Run

1. Download or locate the project folder.
2. Double-click `index.html` to open it directly in any modern web browser (Google Chrome, Firefox, Microsoft Edge, Safari).
3. No build tools, web servers, or external internet connection required.
