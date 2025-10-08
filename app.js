// Arjona, Stephanie Rose B.
// In-memory array to store classes
const classes = []; // each element: { code, course, day, start (HH:MM), end (HH:MM), instructor }

// Simple Student object with methods
function Student(name, id) {
  this.name = name;
  this.id = id;
  this.enrolledClasses = []; // store class codes
}

Student.prototype.addClass = function(classObj) {
  // Reject if time conflict with existing enrolled classes (same day and overlapping)
  const conflicts = this.enrolledClasses
    .map(code => classes.find(c => c.code === code))
    .filter(Boolean)
    .some(existing =>
      isOverlap(
        existing.day,
        existing.start,
        existing.end,
        classObj.day,
        classObj.start,
        classObj.end
      )
    );

  if (conflicts) {
    return { ok: false, msg: `Time conflict: cannot add ${classObj.code} for ${this.name}` };
  }

  this.enrolledClasses.push(classObj.code);
  return { ok: true, msg: `${this.name} enrolled in ${classObj.code}` };
};

Student.prototype.listClasses = function() {
  if (this.enrolledClasses.length === 0) return `${this.name} (${this.id}) has no classes.`;

  const list = this.enrolledClasses.map(code => {
    const c = classes.find(x => x.code === code);
    return c ? `${c.code} ${c.course} (${c.day} ${c.start}-${c.end})` : code;
  });

  return `${this.name} (${this.id}) enrolled in: ` + list.join('; ');
};

// example student (for demo of student methods)
const demoStudent = new Student("Ana", "S001");


// Utility functions
function timeToMinutes(t) {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

function isOverlap(dayA, startA, endA, dayB, startB, endB) {
  if (dayA !== dayB) return false;
  const sA = timeToMinutes(startA),
    eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB),
    eB = timeToMinutes(endB);
  return Math.max(sA, sB) < Math.min(eA, eB);
}


// DOM elements + state

const listEl = document.getElementById("list");
const summaryEl = document.getElementById("summary");
const form = document.getElementById("classForm");
const searchInput = document.getElementById("search");
const tableViewBtn = document.getElementById("tableViewBtn");
const cardViewBtn = document.getElementById("cardViewBtn");

let currentView = "table"; // 'table' or 'card'
let currentFilter = null;
let sortStates = { code: "asc", time: "asc" };


// Rendering

function renderList() {
  const q = searchInput.value.trim().toLowerCase();
  let visible = classes.slice();

  if (currentFilter && currentFilter.type === "day") {
    visible = visible.filter(c => c.day === currentFilter.value);
  }

  if (q) {
    visible = visible.filter(c => {
      return (
        c.code.toLowerCase().includes(q) ||
        c.course.toLowerCase().includes(q) ||
        (c.instructor || "").toLowerCase().includes(q)
      );
    });
  }

  if (currentView === "table") {
    listEl.innerHTML = `
      <table>
        <thead>
          <tr><th>Code</th><th>Course</th><th>Day</th><th>Time</th><th>Instructor</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${visible
            .map(c => {
              const eveningClass = timeToMinutes(c.start) >= 18 * 60 ? "evening" : "";
              return `<tr>
                <td class="${eveningClass}">${c.code}</td>
                <td>${c.course}</td>
                <td>${c.day}</td>
                <td>${c.start} - ${c.end}</td>
                <td>${c.instructor || ""}</td>
                <td>
                  <button onclick="editRecord('${c.code}')">Edit</button>
                  <button onclick="deleteRecord('${c.code}')">Delete</button>
                </td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>`;
  } else {
    listEl.innerHTML = visible
      .map(c => {
        const eveningClass = timeToMinutes(c.start) >= 18 * 60 ? "evening" : "";
        return `<div class="card">
          <div><strong class="${eveningClass}">${c.code} - ${c.course}</strong></div>
          <div>${c.day} ${c.start} - ${c.end}</div>
          <div>Instructor: ${c.instructor || "—"}</div>
          <div style="margin-top:6px;">
            <button onclick="editRecord('${c.code}')">Edit</button>
            <button onclick="deleteRecord('${c.code}')">Delete</button>
          </div>
        </div>`;
      })
      .join("");
  }

  renderSummary(visible);
}

function renderSummary(visibleList) {
  const total = classes.length;
  const visible = visibleList.length;
  const studentReport = demoStudent.listClasses();

  summaryEl.innerHTML = `
    <div><strong>Total classes stored:</strong> ${total}</div>
    <div><strong>Currently visible:</strong> ${visible}</div>
    <div style="margin-top:8px;"><strong>Student demo report:</strong><br/> ${studentReport}</div>
  `;
}

// CRUD operations

form.addEventListener("submit", function(e) {
  e.preventDefault();
  const code = document.getElementById("code").value.trim();
  const course = document.getElementById("course").value.trim();
  const day = document.getElementById("day").value;
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;
  const instructor = document.getElementById("instructor").value.trim();

  if (!code || !course || !start || !end) {
    alert("Please fill required fields (code, course, start, end).");
    return;
  }

  if (timeToMinutes(start) >= timeToMinutes(end)) {
    alert("Start time must be before end time.");
    return;
  }

  const existing = classes.find(c => c.code === code);
  const newObj = { code, course, day, start, end, instructor };

  if (existing) {
    Object.assign(existing, newObj);
    console.log("Updated class:", existing);
  } else {
    classes.push(newObj);
    console.log("Added class:", newObj);
  }

  const enrollment = demoStudent.addClass(newObj);
  if (!enrollment.ok) console.log("Enrollment rejected:", enrollment.msg);
  else console.log("Enrollment ok:", enrollment.msg);

  form.reset();
  renderList();
});

window.editRecord = function(code) {
  const c = classes.find(x => x.code === code);
  if (!c) return alert("Record not found.");

  document.getElementById("code").value = c.code;
  document.getElementById("course").value = c.course;
  document.getElementById("day").value = c.day;
  document.getElementById("start").value = c.start;
  document.getElementById("end").value = c.end;
  document.getElementById("instructor").value = c.instructor;
};

window.deleteRecord = function(code) {
  if (!confirm(`Delete class ${code}? This cannot be undone.`)) return;
  const idx = classes.findIndex(x => x.code === code);
  if (idx === -1) return alert("Record not found.");

  const removed = classes.splice(idx, 1)[0];
  console.log("Deleted:", removed);

  demoStudent.enrolledClasses = demoStudent.enrolledClasses.filter(c => c !== code);
  renderList();
};


 // Filters / Sort / Search / Views

document.getElementById("filterFriday").addEventListener("click", function() {
  currentFilter = { type: "day", value: "Friday" };
  renderList();
});

document.getElementById("clearFilter").addEventListener("click", function() {
  currentFilter = null;
  renderList();
});

searchInput.addEventListener("input", function() {
  renderList();
});

tableViewBtn.addEventListener("click", function() {
  currentView = "table";
  renderList();
});

cardViewBtn.addEventListener("click", function() {
  currentView = "card";
  renderList();
});

document.getElementById("sortCode").addEventListener("click", function() {
  const dir = sortStates.code === "asc" ? 1 : -1;
  classes.sort((a, b) => a.code.localeCompare(b.code) * dir);
  sortStates.code = sortStates.code === "asc" ? "desc" : "asc";
  this.textContent = `Sort: Code ${sortStates.code === "asc" ? "⤴" : "⤵"}`;
  renderList();
});

document.getElementById("sortTime").addEventListener("click", function() {
  const dir = sortStates.time === "asc" ? 1 : -1;
  classes.sort((a, b) => (timeToMinutes(a.start) - timeToMinutes(b.start)) * dir);
  sortStates.time = sortStates.time === "asc" ? "desc" : "asc";
  this.textContent = `Sort: Start Time ${sortStates.time === "asc" ? "⤴" : "⤵"}`;
  renderList();
});

document.getElementById("resetBtn").addEventListener("click", function() {
  form.reset();
});

// Initial demo data
 
(function seedDemo() {
  const demo = [
    { code: "MATH101", course: "Calculus I", day: "Monday", start: "08:00", end: "09:30", instructor: "Dr. Santos" },
    { code: "COMP202", course: "Data Structures", day: "Tuesday", start: "10:00", end: "11:30", instructor: "Mr. Reyes" },
    { code: "ENG150", course: "English Lit", day: "Friday", start: "14:00", end: "15:30", instructor: "Ms. Dela Cruz" },
    { code: "HIST210", course: "Philippine History", day: "Friday", start: "18:30", end: "20:00", instructor: "Dr. Lim" },
    { code: "SCI120", course: "Physics", day: "Wednesday", start: "16:00", end: "17:30", instructor: "Ms. Tan" }
  ];

  demo.forEach(d => classes.push(d));
  console.log("Seeded demo classes:", classes);

  demoStudent.addClass(classes[0]);
  demoStudent.addClass(classes[2]);
  demoStudent.addClass(classes[3]);

  renderList();
})();

// Exposed helpers (for debugging)

window.classes = classes;
window.demoStudent = demoStudent;
