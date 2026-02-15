const STORAGE_KEYS = {
  PROFILE: 'df_profile',
  SUBJECTS: 'df_subjects',
  TASKS: 'df_tasks',
  THEME: 'df_theme'
};

let profile = { name: '' };
let subjects = [];
let tasks = [];

const welcomeTitle = document.getElementById('welcomeTitle');
const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');
const profileNameInput = document.getElementById('profileName');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const closeProfileModal = document.getElementById('closeProfileModal');

const subjectsList = document.getElementById('subjectsList');
const addSubjectBtn = document.getElementById('addSubjectBtn');
const addChapterBtn = document.getElementById('addChapterBtn');

const taskModal = document.getElementById('taskModal');
const taskModalTitle = document.getElementById('taskModalTitle');
const taskSubjectSelect = document.getElementById('taskSubject');
const taskChapterSelect = document.getElementById('taskChapter');
const taskTitleInput = document.getElementById('taskTitle');
const taskDescInput = document.getElementById('taskDesc');
const starRatingDiv = document.getElementById('starRating');
const taskDeadlineInput = document.getElementById('taskDeadline');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const closeTaskModal = document.getElementById('closeTaskModal');

const taskBoard = document.getElementById('taskBoard');
const completedBoard = document.getElementById('completedBoard');
const activeBoardContainer = document.getElementById('activeBoardContainer');
const completedBoardContainer = document.getElementById('completedBoardContainer');

const viewTasksBtn = document.getElementById('viewTasksBtn');
const viewCompletedBtn = document.getElementById('viewCompletedBtn');
const addTaskBtn = document.getElementById('addTaskBtn');

const themeToggle = document.getElementById('themeToggle');
const contextMenu = document.getElementById('contextMenu');
const editTaskBtn = document.getElementById('editTaskBtn');
const deleteTaskBtn = document.getElementById('deleteTaskBtn');

let currentEditingTaskId = null;
let currentRightClickTaskId = null;

function init() {
  loadData();
  renderProfile();
  renderSubjects();
  renderTaskSubjectOptions();
  renderTasks();
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  setTheme(savedTheme);
}

function loadData() {
  profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE) || '{"name":""}');
  subjects = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBJECTS) || '[]');
  tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
}

function saveData() {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

// Profile
profileBtn.addEventListener('click', () => {
  profileModal.classList.remove('hidden');
  profileNameInput.value = profile.name;
});

closeProfileModal.addEventListener('click', () => {
  profileModal.classList.add('hidden');
});

saveProfileBtn.addEventListener('click', () => {
  profile.name = profileNameInput.value.trim() || 'User';
  saveData();
  renderProfile();
  profileModal.classList.add('hidden');
});

function renderProfile() {
  welcomeTitle.textContent = `Hey, ${profile.name || 'User'}`;
}

// Theme
themeToggle.addEventListener('click', () => {
  setTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
});

function setTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

// Subjects
addSubjectBtn.addEventListener('click', () => {
  const name = prompt('Enter Subject Name');
  if (!name) return;
  if (subjects.find(s => s.name === name)) {
    alert('Subject already exists');
    return;
  }
  subjects.push({ name: name, chapters: [] });
  saveData();
  renderSubjects();
  renderTaskSubjectOptions();
});

addChapterBtn.addEventListener('click', () => {
  if (subjects.length === 0) {
    alert('Please add a subject first');
    return;
  }
  
  // Let user choose which subject to add chapter to
  let subjectNames = subjects.map(s => s.name).join('\n');
  const subj = prompt(`Which subject do you want to add a chapter to?\n\nAvailable subjects:\n${subjectNames}\n\nEnter subject name:`);
  
  if (!subj) return;
  
  const subjectObj = subjects.find(s => s.name === subj);
  if (!subjectObj) {
    alert(`Subject "${subj}" not found. Please enter exact subject name.`);
    return;
  }
  
  const ch = prompt(`Add new chapter to ${subj}:`);
  if (ch && !subjectObj.chapters.includes(ch)) {
    subjectObj.chapters.push(ch);
    saveData();
    renderSubjects();
    renderTaskChapterOptions();
  }
});

function renderSubjects() {
  subjectsList.innerHTML = '';
  subjects.forEach(s => {
    const li = document.createElement('li');
    li.textContent = s.name;
    const chList = document.createElement('ul');
    s.chapters.forEach(ch => {
      const chi = document.createElement('li');
      chi.textContent = ch;
      chList.appendChild(chi);
    });
    li.appendChild(chList);
    subjectsList.appendChild(li);
  });
}

// Task Modal
addTaskBtn.addEventListener('click', openAddTaskModal);

closeTaskModal.addEventListener('click', () => {
  taskModal.classList.add('hidden');
});

saveTaskBtn.addEventListener('click', saveTask);

function openAddTaskModal() {
  if (subjects.length === 0) {
    alert('Please add at least one subject first');
    return;
  }
  currentEditingTaskId = null;
  taskModalTitle.textContent = 'Add Task';
  taskTitleInput.value = '';
  taskDescInput.value = '';
  taskDeadlineInput.value = '';
  renderTaskSubjectOptions();
  renderTaskChapterOptions();
  renderStarRating(1);
  taskModal.classList.remove('hidden');
}

function renderTaskSubjectOptions() {
  taskSubjectSelect.innerHTML = '';
  subjects.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name;
    opt.textContent = s.name;
    taskSubjectSelect.appendChild(opt);
  });
  renderTaskChapterOptions();
}

taskSubjectSelect.addEventListener('change', renderTaskChapterOptions);

function renderTaskChapterOptions() {
  const subject = subjects.find(s => s.name === taskSubjectSelect.value);
  taskChapterSelect.innerHTML = '';
  if (subject && subject.chapters) {
    subject.chapters.forEach(ch => {
      const opt = document.createElement('option');
      opt.value = ch;
      opt.textContent = ch;
      taskChapterSelect.appendChild(opt);
    });
  }
}

function renderStarRating(rating) {
  starRatingDiv.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.innerHTML = i <= rating ? '★' : '☆';
    star.addEventListener('click', () => {
      starRatingDiv.dataset.rating = i;
      renderStarRating(i);
    });
    starRatingDiv.appendChild(star);
  }
  starRatingDiv.dataset.rating = rating;
}

function saveTask() {
  const subject = taskSubjectSelect.value;
  const chapter = taskChapterSelect.value;
  const title = taskTitleInput.value.trim();
  const desc = taskDescInput.value.trim();
  const difficulty = parseInt(starRatingDiv.dataset.rating || 1);
  const deadline = taskDeadlineInput.value;

  if (!subject || !chapter || !title || !deadline) {
    alert('Please fill all required fields');
    return;
  }

  if (currentEditingTaskId) {
    const task = tasks.find(t => t.id === currentEditingTaskId);
    Object.assign(task, { subject, chapter, title, desc, difficulty, deadline });
  } else {
    tasks.push({
      id: Date.now(),
      subject,
      chapter,
      title,
      desc,
      difficulty,
      deadline,
      done: false
    });
  }

  saveData();
  taskModal.classList.add('hidden');
  renderTasks();
}

// Render Tasks
function renderTasks() {
  taskBoard.innerHTML = '';
  completedBoard.innerHTML = '';

  tasks.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const dA = new Date(a.deadline);
    const dB = new Date(b.deadline);
    if (dA.getTime() !== dB.getTime()) return dA - dB;
    if (a.difficulty !== b.difficulty) return b.difficulty - a.difficulty;
    return a.title.localeCompare(b.title);
  });

  tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'task-card';
    if (task.done) card.classList.add('completed-task');

    const info = document.createElement('div');
    info.className = 'task-info';

    const stars = '★'.repeat(task.difficulty) + '☆'.repeat(5 - task.difficulty);

    info.innerHTML = `
      <strong>${task.title}</strong>
      <div style="font-size: 0.9rem; opacity: 0.7; margin-bottom: 6px;">[${task.subject} - ${task.chapter}]</div>
      <div style="margin-bottom: 8px;">${task.desc || ''}</div>
      <div style="font-size: 0.9rem;">
        <span style="color: #fbbf24;">Difficulty: ${stars}</span><br>
        <span style="opacity: 0.8;">Deadline: ${formatDeadline(task.deadline)}</span>
      </div>
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => {
      task.done = checkbox.checked;
      saveData();
      renderTasks();
    });

    card.appendChild(info);
    card.appendChild(checkbox);

    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      currentRightClickTaskId = task.id;
      showContextMenu(e.pageX, e.pageY);
    });

    const now = new Date();
    const deadline = new Date(task.deadline);
    const diff = (deadline - now) / (1000 * 60 * 60 * 24);

    if (task.done) {
      card.style.borderLeft = '4px solid #6b7280';
    } else if (diff < 0) {
      card.style.borderLeft = '4px solid #ef4444';
    } else if (diff <= 1) {
      card.style.borderLeft = '4px solid #f97316';
    } else if (diff <= 3) {
      card.style.borderLeft = '4px solid #fbbf24';
    } else if (diff <= 7) {
      card.style.borderLeft = '4px solid #84cc16';
    } else {
      card.style.borderLeft = '4px solid #10b981';
    }

    if (task.done) {
      completedBoard.appendChild(card);
    } else {
      taskBoard.appendChild(card);
    }
  });

  if (taskBoard.children.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.padding = '60px 20px';
    emptyMsg.style.opacity = '0.5';
    emptyMsg.style.fontSize = '1.1rem';
    emptyMsg.textContent = '🎯 No active tasks. Click "+ ADD TASK" to create one!';
    taskBoard.appendChild(emptyMsg);
  }

  if (completedBoard.children.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.padding = '60px 20px';
    emptyMsg.style.opacity = '0.5';
    emptyMsg.style.fontSize = '1.1rem';
    emptyMsg.textContent = '✅ No completed tasks yet. Keep going!';
    completedBoard.appendChild(emptyMsg);
  }
}

function formatDeadline(deadline) {
  const date = new Date(deadline);
  const now = new Date();
  const diff = (date - now) / (1000 * 60 * 60 * 24);

  const formatted = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  if (diff < 0) {
    return `${formatted} ⚠️ OVERDUE`;
  } else if (diff < 1) {
    return `${formatted} 🔥 TODAY`;
  } else if (diff < 2) {
    return `${formatted} 📅 Tomorrow`;
  }

  return formatted;
}

// View Toggle
viewTasksBtn.addEventListener('click', () => {
  activeBoardContainer.classList.remove('hidden');
  completedBoardContainer.classList.add('hidden');
  viewTasksBtn.classList.add('active-btn');
  viewCompletedBtn.classList.remove('active-btn');
});

viewCompletedBtn.addEventListener('click', () => {
  activeBoardContainer.classList.add('hidden');
  completedBoardContainer.classList.remove('hidden');
  viewCompletedBtn.classList.add('active-btn');
  viewTasksBtn.classList.remove('active-btn');
});

// Context Menu
document.addEventListener('click', () => {
  contextMenu.classList.add('hidden');
});

function showContextMenu(x, y) {
  contextMenu.style.left = x + 'px';
  contextMenu.style.top = y + 'px';
  contextMenu.classList.remove('hidden');
}

editTaskBtn.addEventListener('click', () => {
  const task = tasks.find(t => t.id === currentRightClickTaskId);
  if (task) {
    currentEditingTaskId = task.id;
    taskModalTitle.textContent = 'Edit Task';
    taskTitleInput.value = task.title;
    taskDescInput.value = task.desc;
    taskDeadlineInput.value = task.deadline;
    taskSubjectSelect.value = task.subject;
    renderTaskChapterOptions();
    taskChapterSelect.value = task.chapter;
    renderStarRating(task.difficulty);
    taskModal.classList.remove('hidden');
    contextMenu.classList.add('hidden');
  }
});

deleteTaskBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter(t => t.id !== currentRightClickTaskId);
    saveData();
    renderTasks();
  }
  contextMenu.classList.add('hidden');
});

init();
