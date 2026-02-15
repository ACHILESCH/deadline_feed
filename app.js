let data = JSON.parse(localStorage.getItem("momentumData")) || {
  profile: null,
  subjects: [],
  tasks: [],
  completed: [],
  theme: "light"
};

let selectedTaskIndex = null;
let currentRating = 3;

function saveData() {
  localStorage.setItem("momentumData", JSON.stringify(data));
}

function initTheme() {
  if (data.theme === "dark") {
    document.body.classList.add("dark");
  }
}

document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
  data.theme = document.body.classList.contains("dark") ? "dark" : "light";
  saveData();
};

function renderSubjects() {
  const list = document.getElementById("subjectsList");
  list.innerHTML = "";
  data.subjects.forEach((sub, i) => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${sub.name}</strong>`;
    div.onclick = () => addChapter(i);
    list.appendChild(div);
  });
}

function addChapter(index) {
  const name = prompt("Add Chapter Name");
  if (!name) return;
  data.subjects[index].chapters.push(name);
  saveData();
}

document.getElementById("addSubjectBtn").onclick = () => {
  const name = prompt("Subject Name?");
  if (!name) return;
  data.subjects.push({ name, chapters: [] });
  saveData();
  renderSubjects();
};

function deadlineClass(deadline) {
  const now = new Date();
  const d = new Date(deadline);
  const diff = (d - now) / (1000 * 60 * 60);
  if (diff < 0) return "overdue";
  if (diff < 24) return "soon";
  if (diff < 72) return "warning";
  return "safe";
}

function renderTasks() {
  const board = document.getElementById("taskBoard");
  const completed = document.getElementById("completedBoard");
  board.innerHTML = "";
  completed.innerHTML = "";

  data.tasks.forEach((task, i) => {
    const card = document.createElement("div");
    card.className = `task-card ${deadlineClass(task.deadline)}`;
    card.innerHTML = `
      <h4>${task.title}</h4>
      <p>${task.desc}</p>
      <small>${task.subject} - ${task.chapter}</small><br>
      <small>${new Date(task.deadline).toLocaleString()}</small>
    `;

    card.onclick = () => completeTask(i);

    card.oncontextmenu = (e) => {
      e.preventDefault();
      selectedTaskIndex = i;
      showContextMenu(e.pageX, e.pageY);
    };

    board.appendChild(card);
  });

  data.completed.forEach(task => {
    const card = document.createElement("div");
    card.className = "task-card safe";
    card.innerHTML = `<h4>${task.title}</h4>`;
    completed.appendChild(card);
  });
}

function completeTask(index) {
  const task = data.tasks.splice(index, 1)[0];
  data.completed.push(task);
  saveData();
  renderTasks();
}

function showContextMenu(x,y) {
  const menu = document.getElementById("contextMenu");
  menu.style.left = x + "px";
  menu.style.top = y + "px";
  menu.classList.remove("hidden");
}

document.addEventListener("click", () => {
  document.getElementById("contextMenu").classList.add("hidden");
});

document.getElementById("deleteTaskBtn").onclick = () => {
  data.tasks.splice(selectedTaskIndex,1);
  saveData();
  renderTasks();
};

function initStars() {
  const starContainer = document.getElementById("starRating");
  starContainer.innerHTML = "";
  for(let i=1;i<=5;i++){
    const span = document.createElement("span");
    span.innerHTML = "★";
    span.onclick = () => {
      currentRating = i;
      updateStars();
    };
    starContainer.appendChild(span);
  }
  updateStars();
}

function updateStars() {
  const stars = document.querySelectorAll("#starRating span");
  stars.forEach((star,i)=>{
    star.style.color = i < currentRating ? "gold" : "gray";
  });
}

document.getElementById("openTaskModal").onclick = () => {
  initSubjectDropdown();
  document.getElementById("taskModal").classList.remove("hidden");
};

document.getElementById("closeTaskModal").onclick = () => {
  document.getElementById("taskModal").classList.add("hidden");
};

function initSubjectDropdown() {
  const subSelect = document.getElementById("taskSubject");
  subSelect.innerHTML = "";
  data.subjects.forEach((s,i)=>{
    subSelect.innerHTML += `<option value="${i}">${s.name}</option>`;
  });
  subSelect.onchange = updateChapterDropdown;
  updateChapterDropdown();
}

function updateChapterDropdown() {
  const subIndex = document.getElementById("taskSubject").value;
  const chapterSelect = document.getElementById("taskChapter");
  chapterSelect.innerHTML = "";
  data.subjects[subIndex]?.chapters.forEach(ch=>{
    chapterSelect.innerHTML += `<option>${ch}</option>`;
  });
}

document.getElementById("saveTaskBtn").onclick = () => {
  const subIndex = document.getElementById("taskSubject").value;
  const chapter = document.getElementById("taskChapter").value;
  const title = document.getElementById("taskTitle").value;
  const desc = document.getElementById("taskDesc").value;
  const deadline = document.getElementById("taskDeadline").value;

  if(!title || !deadline) return alert("Fill required fields");

  data.tasks.push({
    subject: data.subjects[subIndex].name,
    chapter,
    title,
    desc,
    deadline,
    rating: currentRating
  });

  saveData();
  renderTasks();
  document.getElementById("taskModal").classList.add("hidden");
};

function initProfile() {
  if (!data.profile) {
    document.getElementById("profileModal").classList.remove("hidden");
  } else {
    document.getElementById("welcomeTitle").innerText = `Momentum – ${data.profile}`;
  }
}

document.getElementById("saveProfileBtn").onclick = () => {
  const name = document.getElementById("profileName").value;
  if(!name) return;
  data.profile = name;
  saveData();
  document.getElementById("profileModal").classList.add("hidden");
  initProfile();
};

initTheme();
initStars();
renderSubjects();
renderTasks();
initProfile();
