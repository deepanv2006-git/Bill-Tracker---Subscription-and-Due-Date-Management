// Main array to store all bills
let bills = [];

// Tracks the bill currently being edited, null when adding new bill
let editingId = null;

// Loads bills from browser localStorage
function loadBills() {
  const savedData = localStorage.getItem("bills");
  if (savedData) {
    bills = JSON.parse(savedData);
  } else {
    bills = [];
  }
}

// Saves current bills array to browser localStorage
function saveBills() {
  localStorage.setItem("bills", JSON.stringify(bills));
}

// Calculates how many days are left until the due date
function calculateDaysLeft(dueDateString) {
  const parts = dueDateString.split("-");
  const dueYear = parseInt(parts[0], 10);
  const dueMonth = parseInt(parts[1], 10) - 1;
  const dueDay = parseInt(parts[2], 10);

  const dueDate = new Date(dueYear, dueMonth, dueDay);

  const today = new Date();
  const currentToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const oneDayInMs = 1000 * 60 * 60 * 24;
  const timeDifference = dueDate.getTime() - currentToday.getTime();
  const daysDifference = Math.round(timeDifference / oneDayInMs);

  return daysDifference;
}

// Returns status color and text based on days left
function getStatus(daysLeft) {
  if (daysLeft < 0) {
    const overdueCount = Math.abs(daysLeft);
    if (overdueCount === 1) {
      return { color: "red", text: "Overdue by 1 day" };
    }
    return { color: "red", text: "Overdue by " + overdueCount + " days" };
  } else if (daysLeft === 0) {
    return { color: "yellow", text: "Due today" };
  } else if (daysLeft <= 7) {
    if (daysLeft === 1) {
      return { color: "yellow", text: "Due in 1 day" };
    }
    return { color: "yellow", text: "Due in " + daysLeft + " days" };
  } else {
    return { color: "green", text: "Due in " + daysLeft + " days" };
  }
}

// Calculates total monthly spend from monthly bills and yearly bills divided by 12
function calculateMonthlyTotal() {
  let total = 0;
  for (let i = 0; i < bills.length; i++) {
    const bill = bills[i];
    if (bill.repeat === "Monthly") {
      total = total + bill.amount;
    } else if (bill.repeat === "Yearly") {
      total = total + (bill.amount / 12);
    }
  }
  return total;
}

// Validates form input and adds a new bill or updates an existing one
function addBill(event) {
  event.preventDefault();

  const nameInput = document.getElementById("billName");
  const amountInput = document.getElementById("billAmount");
  const categoryInput = document.getElementById("billCategory");
  const dueDateInput = document.getElementById("billDueDate");
  const repeatInput = document.getElementById("billRepeat");

  const nameError = document.getElementById("nameError");
  const amountError = document.getElementById("amountError");
  const dateError = document.getElementById("dateError");

  // Reset errors
  nameError.textContent = "";
  amountError.textContent = "";
  dateError.textContent = "";

  const nameValue = nameInput.value.trim();
  const amountValue = parseFloat(amountInput.value);
  const categoryValue = categoryInput.value;
  const dueDateValue = dueDateInput.value;
  const repeatValue = repeatInput.value;

  let isValid = true;

  if (nameValue === "") {
    nameError.textContent = "Please enter a bill name.";
    isValid = false;
  }

  if (isNaN(amountValue) || amountValue <= 0) {
    amountError.textContent = "Please enter an amount greater than 0.";
    isValid = false;
  }

  if (dueDateValue === "") {
    dateError.textContent = "Please select a due date.";
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  if (editingId !== null) {
    // Update existing bill
    for (let i = 0; i < bills.length; i++) {
      if (bills[i].id === editingId) {
        bills[i].name = nameValue;
        bills[i].amount = amountValue;
        bills[i].category = categoryValue;
        bills[i].dueDate = dueDateValue;
        bills[i].repeat = repeatValue;
        break;
      }
    }
    cancelEdit();
  } else {
    // Add new bill
    const newBill = {
      id: Date.now(),
      name: nameValue,
      amount: amountValue,
      category: categoryValue,
      dueDate: dueDateValue,
      repeat: repeatValue
    };
    bills.push(newBill);
    document.getElementById("billForm").reset();
  }

  saveBills();
  renderBills();
}

// Fills the form with a bill's data so the user can edit it
function editBill(id) {
  let selectedBill = null;
  for (let i = 0; i < bills.length; i++) {
    if (bills[i].id === id) {
      selectedBill = bills[i];
      break;
    }
  }

  if (selectedBill === null) {
    return;
  }

  editingId = selectedBill.id;

  document.getElementById("billName").value = selectedBill.name;
  document.getElementById("billAmount").value = selectedBill.amount;
  document.getElementById("billCategory").value = selectedBill.category;
  document.getElementById("billDueDate").value = selectedBill.dueDate;
  document.getElementById("billRepeat").value = selectedBill.repeat;

  document.getElementById("nameError").textContent = "";
  document.getElementById("amountError").textContent = "";
  document.getElementById("dateError").textContent = "";

  document.getElementById("formTitle").textContent = "Edit Bill";
  document.getElementById("submitBtn").textContent = "Update Bill";
  document.getElementById("cancelBtn").style.display = "inline-block";

  document.getElementById("billName").focus();
}

// Deletes a bill from the bills array
function deleteBill(id) {
  const updatedBills = [];
  for (let i = 0; i < bills.length; i++) {
    if (bills[i].id !== id) {
      updatedBills.push(bills[i]);
    }
  }
  bills = updatedBills;

  if (editingId === id) {
    cancelEdit();
  }

  saveBills();
  renderBills();
}

// Marks a bill as paid and updates its due date or removes it
function markAsPaid(id) {
  for (let i = 0; i < bills.length; i++) {
    if (bills[i].id === id) {
      const bill = bills[i];

      if (bill.repeat === "One-time") {
        deleteBill(id);
        return;
      } else if (bill.repeat === "Monthly") {
        const parts = bill.dueDate.split("-");
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);

        const nextDate = new Date(year, month + 1, day);
        const nextYear = nextDate.getFullYear();
        const nextMonth = String(nextDate.getMonth() + 1).padStart(2, "0");
        const nextDay = String(nextDate.getDate()).padStart(2, "0");

        bill.dueDate = nextYear + "-" + nextMonth + "-" + nextDay;
      } else if (bill.repeat === "Yearly") {
        const parts = bill.dueDate.split("-");
        const year = parseInt(parts[0], 10) + 1;
        const month = parts[1];
        const day = parts[2];

        bill.dueDate = year + "-" + month + "-" + day;
      }
      break;
    }
  }

  saveBills();
  renderBills();
}

// Updates summary counters and renders the bills sorted by nearest due date
function renderBills() {
  const monthlyTotal = calculateMonthlyTotal();
  document.getElementById("totalMonthly").textContent = "₹" + monthlyTotal.toFixed(2);

  let dueSoonCount = 0;
  let overdueCount = 0;

  for (let i = 0; i < bills.length; i++) {
    const days = calculateDaysLeft(bills[i].dueDate);
    if (days < 0) {
      overdueCount++;
    } else if (days <= 7) {
      dueSoonCount++;
    }
  }

  document.getElementById("dueSoonCount").textContent = dueSoonCount;
  document.getElementById("overdueCount").textContent = overdueCount;

  // Sort bills by nearest due date
  const sortedBills = bills.slice();
  sortedBills.sort(function(a, b) {
    return a.dueDate.localeCompare(b.dueDate);
  });

  // Filter bills by selected category
  const selectedCategory = document.getElementById("categoryFilter").value;
  const displayedBills = [];

  for (let i = 0; i < sortedBills.length; i++) {
    if (selectedCategory === "All" || sortedBills[i].category === selectedCategory) {
      displayedBills.push(sortedBills[i]);
    }
  }

  const billsList = document.getElementById("billsList");
  billsList.innerHTML = "";

  if (displayedBills.length === 0) {
    billsList.innerHTML = '<div class="empty-state">No bills found.</div>';
    return;
  }

  for (let i = 0; i < displayedBills.length; i++) {
    const bill = displayedBills[i];
    const daysLeft = calculateDaysLeft(bill.dueDate);
    const status = getStatus(daysLeft);

    const billCard = document.createElement("div");
    billCard.className = "bill-card status-" + status.color;

    billCard.innerHTML = `
      <div class="bill-header">
        <div class="bill-title-group">
          <span class="bill-name">${bill.name}</span>
          <span class="tag category-tag">${bill.category}</span>
          <span class="tag repeat-tag">${bill.repeat}</span>
        </div>
        <span class="bill-amount">₹${bill.amount.toFixed(2)}</span>
      </div>
      <div class="bill-body">
        <div class="bill-meta">
          <span class="due-date-text">Due: ${bill.dueDate}</span>
          <span class="status-badge badge-${status.color}">${status.text}</span>
        </div>
        <div class="bill-actions">
          <button type="button" class="btn-small btn-paid" onclick="markAsPaid(${bill.id})">Mark as paid</button>
          <button type="button" class="btn-small btn-edit" onclick="editBill(${bill.id})">Edit</button>
          <button type="button" class="btn-small btn-delete" onclick="deleteBill(${bill.id})">Delete</button>
        </div>
      </div>
    `;

    billsList.appendChild(billCard);
  }
}

// Resets the form and exits edit mode
function cancelEdit() {
  editingId = null;
  document.getElementById("billForm").reset();
  document.getElementById("formTitle").textContent = "Add Bill";
  document.getElementById("submitBtn").textContent = "Add Bill";
  document.getElementById("cancelBtn").style.display = "none";
  document.getElementById("nameError").textContent = "";
  document.getElementById("amountError").textContent = "";
  document.getElementById("dateError").textContent = "";
}

// Initial setup when page loads
loadBills();
renderBills();

// Event listeners
document.getElementById("billForm").addEventListener("submit", addBill);
document.getElementById("cancelBtn").addEventListener("click", cancelEdit);
document.getElementById("categoryFilter").addEventListener("change", renderBills);
