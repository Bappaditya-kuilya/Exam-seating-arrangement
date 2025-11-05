// state
const students = [];
const halls = [];

// DOM nodes
const studentForm = document.getElementById('studentForm');
const hallForm = document.getElementById('hallForm');
const studentTableBody = document.querySelector('#studentTable tbody');
const hallTableBody = document.querySelector('#hallTable tbody');
const studentCountEl = document.getElementById('studentCount');
const hallCountEl = document.getElementById('hallCount');
const sumStudents = document.getElementById('sumStudents');
const sumHalls = document.getElementById('sumHalls');
const sumCapacity = document.getElementById('sumCapacity');
const resultEl = document.getElementById('result');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');

// Utils
function updateSummary() {
  const capacity = halls.reduce((s, h) => s + (Number(h.capacity) || 0), 0);
  studentCountEl.textContent = students.length;
  hallCountEl.textContent = halls.length;
  sumStudents.textContent = students.length;
  sumHalls.textContent = halls.length;
  sumCapacity.textContent = capacity;
}

function renderStudents() {
  studentTableBody.innerHTML = '';
  students.forEach((s, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(s.roll)}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.dept || '-')}</td>
      <td><button class="btn danger" data-action="del-student" data-index="${i}">Delete</button></td>`;
    studentTableBody.appendChild(tr);
  });
}

function renderHalls() {
  hallTableBody.innerHTML = '';
  halls.forEach((h, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(h.name)}</td>
      <td>${escapeHtml(String(h.capacity))}</td>
      <td><button class="btn danger" data-action="del-hall" data-index="${i}">Delete</button></td>`;
    hallTableBody.appendChild(tr);
  });
}

// simple sanitizer
function escapeHtml(text) {
  const map = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  };
  return String(text || '').replace(/[&<>"']/g, m => map[m]);
}

// Fisher-Yates shuffle
function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Handlers
studentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const roll = document.getElementById('roll').value.trim();
  const name = document.getElementById('name').value.trim();
  const dept = document.getElementById('dept').value.trim();

  if (!roll || !name) {
    alert('Please provide Roll number and Name.');
    return;
  }

  // prevent duplicate roll
  if (students.some(s => s.roll === roll)) {
    alert('Roll number already added.');
    return;
  }

  students.push({ roll, name, dept });
  renderStudents();
  updateSummary();
  studentForm.reset();
});

hallForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('hallName').value.trim();
  const capacityRaw = document.getElementById('hallCapacity').value;
  const capacity = parseInt(capacityRaw, 10);

  if (!name || !capacity || capacity <= 0) {
    alert('Provide valid hall name and capacity (positive number).');
    return;
  }

  halls.push({ name, capacity });
  renderHalls();
  updateSummary();
  hallForm.reset();
});

// delegated delete buttons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const action = btn.dataset.action;
  const idx = btn.dataset.index !== undefined ? Number(btn.dataset.index) : null;

  if (action === 'del-student' && idx !== null) {
    students.splice(idx, 1);
    renderStudents();
    updateSummary();
  }

  if (action === 'del-hall' && idx !== null) {
    halls.splice(idx, 1);
    renderHalls();
    updateSummary();
  }
});

generateBtn.addEventListener('click', () => {
  // simple validation
  if (students.length === 0) { alert('No students added.'); return; }
  if (halls.length === 0) { alert('No halls added.'); return; }

  // create seat list
  const shuffled = shuffleArray(students);
  let out = '';
  let studentIndex = 0;
  const examName = document.getElementById('examName').value.trim() || 'Exam';
  const examDate = document.getElementById('examDate').value || '';

  out += `<div class="arr-header"><strong>${escapeHtml(examName)}</strong> ${examDate ? '— ' + escapeHtml(examDate) : ''}</div>`;

  halls.forEach(h => {
    out += `<div class="hall-block"><h3>${escapeHtml(h.name)} (Capacity: ${h.capacity})</h3><ol>`;
    for (let s = 1; s <= h.capacity; s++) {
      if (studentIndex < shuffled.length) {
        const stu = shuffled[studentIndex++];
        out += `<li>Seat ${s}: ${escapeHtml(stu.roll)} — ${escapeHtml(stu.name)} ${stu.dept ? '(' + escapeHtml(stu.dept) + ')' : ''}</li>`;
      } else {
        out += `<li>Seat ${s}: — (empty)</li>`;
      }
    }
    out += `</ol></div>`;
  });

  if (studentIndex < shuffled.length) {
    out += `<div class="warning">⚠️ Remaining students without seats: ${shuffled.length - studentIndex}</div>`;
    out += `<ul class="remaining">`;
    for (; studentIndex < shuffled.length; studentIndex++) {
      const stu = shuffled[studentIndex];
      out += `<li>${escapeHtml(stu.roll)} — ${escapeHtml(stu.name)}</li>`;
    }
    out += `</ul>`;
  }

  resultEl.innerHTML = out;
});

clearBtn.addEventListener('click', () => {
  if (!confirm('Clear all students, halls and results?')) return;
  students.length = 0;
  halls.length = 0;
  renderStudents();
  renderHalls();
  updateSummary();
  resultEl.innerHTML = '';
  document.getElementById('examName').value = '';
  document.getElementById('examDate').value = '';
});

// initial render
updateSummary();
renderStudents();
renderHalls();
