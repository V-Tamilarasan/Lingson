const buttons = document.querySelectorAll(".btn");
const boxes = document.querySelectorAll(".product-box");

buttons.forEach((btnEl) => {
  btnEl.addEventListener("click", (e) => {
    document.querySelector(".clicked")?.classList.remove("clicked");
    btnEl.classList.add("clicked");

    const btnfilter = e.target.dataset.filter;

    boxes.forEach((box) => {
      if (btnfilter == "all" || box.dataset.item === btnfilter) {
        box.style.removeProperty("display");
      } else {
        box.style.display = "none";
      }
    });
  });
});

function togglemenu() {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const calendar = document.querySelector(".calender-container");

  sidebar.classList.toggle("active");
  document.body.classList.toggle("sidebar-active"); // body gets class that moves content
}
const menubtn = document.querySelectorAll(".option-button");
const content = document.querySelectorAll(".main-content");

menubtn.forEach((btnEl) => {
  btnEl.addEventListener("click", (e) => {
    const btnfilter = e.target.dataset.option;
    content.forEach((box) => {
      if (btnfilter == "all" || box.dataset.content === btnfilter) {
        box.style.removeProperty("display");
        togglemenu();
      } else {
        box.style.display = "none";
        togglemenu();
      }
    });
  });
});

// ======= Staff Data =======
const staffList = [
  { id: "101", name: "Ashok", photo: "./icon-assets/male.png" },
  { id: "102", name: "Ganesh", photo: "./icon-assets/male.png" },
  { id: "103", name: "Baskar", photo: "./icon-assets/male.png" },
  { id: "104", name: "Suresh", photo: "./icon-assets/male.png" },
  { id: "105", name: "Deepa", photo: "./icon-assets/female.png" },
  { id: "106", name: "Suganya", photo: "./icon-assets/female.png" },
  { id: "107", name: "Elumalai", photo: "./icon-assets/driver.png" },
  { id: "108", name: "Sathish", photo: "./icon-assets/driver.png" },
];

// ======= Attendance Storage Functions =======
function saveAttendance(date, staffId, status) {
  const key = `attendance_${date}`;
  const record = JSON.parse(localStorage.getItem(key)) || {};
  if (record.__locked) return;
  record[staffId] = status;
  localStorage.setItem(key, JSON.stringify(record));
  updateAttendanceSummary(date);
  updateSaveButtonState(date);
}

function getAttendance(date, staffId) {
  const key = `attendance_${date}`;
  const record = JSON.parse(localStorage.getItem(key));
  return record ? record[staffId] : null;
}

function isLocked(date) {
  const key = `attendance_${date}`;
  const record = JSON.parse(localStorage.getItem(key)) || {};
  return record.__locked || false;
}

function updateAttendanceSummary(date) {
  const key = `attendance_${date}`;
  const record = JSON.parse(localStorage.getItem(key)) || {};
  let present = 0,
    absent = 0;
  Object.entries(record).forEach(([k, status]) => {
    if (k !== "__locked") {
      if (status === "present") present++;
      else if (status === "absent") absent++;
    }
  });
  const summaryEl = document.getElementById("attendanceSummary");
  if (summaryEl) {
    summaryEl.textContent = `${present} Present, ${absent} Absent`;
  }
}

// ======= Load Staff for Date =======
const staffContainer = document.getElementById("staffContainer");
const dateDetailsDisplay = document.getElementById("dateDetails");
let currentLoadedDate = null;

function loadStaffForDate(date) {
  staffContainer.innerHTML = "";
  currentLoadedDate = date;
  if (dateDetailsDisplay) {
    dateDetailsDisplay.textContent = `Attendance for ${date}`;
  }

  const locked = isLocked(date);

  staffList.forEach((staff) => {
    const box = document.createElement("div");
    box.className = "staff-box";
    box.innerHTML = `
      <div class="staff-name">${staff.name}</div>
      <img src="${staff.photo}" alt="${staff.name}">
      <div class="attendance-button">
        <button class="present">Present</button>
        <button class="absent">Absent</button>
      </div>
    `;
    staffContainer.appendChild(box);

    const presentBtn = box.querySelector(".present");
    const absentBtn = box.querySelector(".absent");

    presentBtn.addEventListener("click", () => {
      if (isLocked(date)) return;
      saveAttendance(date, staff.id, "present");
      presentBtn.style.background = "#317007";
      absentBtn.style.background = "#112d4e";
    });

    absentBtn.addEventListener("click", () => {
      if (isLocked(date)) return;
      saveAttendance(date, staff.id, "absent");
      absentBtn.style.background = "#860808";
      presentBtn.style.background = "#112d4e";
    });

    const saved = getAttendance(date, staff.id);
    if (saved === "present") {
      presentBtn.style.background = "#317007";
      absentBtn.style.background = "#112d4e";
    }
    if (saved === "absent") {
      absentBtn.style.background = "#860808";
      presentBtn.style.background = "#112d4e";
    }

    if (locked) {
      presentBtn.disabled = true;
      absentBtn.disabled = true;
    }
  });

  updateAttendanceSummary(date);
  updateSaveButtonState(date);
}

function unlockAttendance(date) {
  const key = `attendance_${date}`;
  const record = JSON.parse(localStorage.getItem(key)) || {};
  record.__locked = false;
  localStorage.setItem(key, JSON.stringify(record));
}

function allAttendanceMarked(date) {
  const key = `attendance_${date}`;
  const record = JSON.parse(localStorage.getItem(key)) || {};
  return staffList.every((staff) => record.hasOwnProperty(staff.id));
}

function updateSaveButtonState(date) {
  const saveBtn = document.getElementById("saveAttendance");
  const key = `attendance_${date}`;
  const record = JSON.parse(localStorage.getItem(key)) || {};

  if (record.__locked) {
    saveBtn.textContent = "Saved";
    saveBtn.disabled = true;
    saveBtn.classList.add("saved-state");
  } else {
    saveBtn.textContent = "Save";
    saveBtn.disabled = !allAttendanceMarked(date);
    saveBtn.classList.remove("saved-state");
  }
}

// ======= Calendar Date Clicks =======
const allDates = document.querySelectorAll(".day:not(.pseudo)");

allDates.forEach((dateEl) => {
  dateEl.addEventListener("click", () => {
    const day = dateEl.textContent.padStart(2, "0");
    const month = "06";
    const year = "2025";
    const fullDate = `${year}-${month}-${day}`;

    allDates.forEach((el) => el.classList.remove("active-day"));
    dateEl.classList.add("active-day");

    loadStaffForDate(fullDate);
  });
});

// ======= Default Load (Today) =======
const today = new Date();
const defaultDate = `2025-06-${today.getDate().toString().padStart(2, "0")}`;
loadStaffForDate(defaultDate);

// ======= Clear Button for Each Page =======
const clearBtn = document.getElementById("clearAttendance");
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    if (!currentLoadedDate) return;
    localStorage.removeItem(`attendance_${currentLoadedDate}`);
    loadStaffForDate(currentLoadedDate);
  });
}

// ======= Save Button to Finalize Attendance =======
const saveBtn = document.getElementById("saveAttendance");
if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    if (!currentLoadedDate) return;
    if (!allAttendanceMarked(currentLoadedDate)) return;

    const key = `attendance_${currentLoadedDate}`;
    const record = JSON.parse(localStorage.getItem(key)) || {};
    record.__locked = true;
    localStorage.setItem(key, JSON.stringify(record));
    loadStaffForDate(currentLoadedDate);
  });
}
