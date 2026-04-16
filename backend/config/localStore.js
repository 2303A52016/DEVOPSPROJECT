const bcrypt = require('bcrypt');

const state = {
  users: [],
  planner: [],
  tasks: [],
  diary: [],
  vitality: [],
};

const counters = {
  users: 1,
  planner: 1,
  tasks: 1,
  diary: 1,
  vitality: 1,
};

function nextId(key) {
  const id = counters[key];
  counters[key] += 1;
  return id;
}

function createUser({ name, email, password }) {
  const user = {
    id: nextId('users'),
    name,
    email,
    password,
    created_at: new Date().toISOString(),
  };
  state.users.push(user);
  return user;
}

function findUserByEmail(email) {
  return state.users.find((user) => user.email === email) || null;
}

function createPlanner(payload) {
  const row = {
    id: nextId('planner'),
    ...payload,
    created_at: new Date().toISOString(),
  };
  state.planner.push(row);
  return row;
}

function listPlannerByUser(userId) {
  return state.planner
    .filter((item) => Number(item.user_id) === Number(userId))
    .sort((a, b) => {
      const dateCmp = String(b.date).localeCompare(String(a.date));
      if (dateCmp !== 0) {
        return dateCmp;
      }
      return String(a.start_time).localeCompare(String(b.start_time));
    });
}

function updatePlanner(id, updates) {
  const idx = state.planner.findIndex((item) => Number(item.id) === Number(id));
  if (idx === -1) {
    return null;
  }
  state.planner[idx] = { ...state.planner[idx], ...updates };
  return state.planner[idx];
}

function deletePlanner(id) {
  const before = state.planner.length;
  state.planner = state.planner.filter((item) => Number(item.id) !== Number(id));
  return state.planner.length !== before;
}

function createTask(payload) {
  const row = {
    id: nextId('tasks'),
    ...payload,
    created_at: new Date().toISOString(),
  };
  state.tasks.push(row);
  return row;
}

function listTasksByUser(userId) {
  return state.tasks
    .filter((item) => Number(item.user_id) === Number(userId))
    .sort((a, b) => Number(b.id) - Number(a.id));
}

function updateTask(id, updates) {
  const idx = state.tasks.findIndex((item) => Number(item.id) === Number(id));
  if (idx === -1) {
    return null;
  }
  state.tasks[idx] = { ...state.tasks[idx], ...updates };
  return state.tasks[idx];
}

function deleteTask(id) {
  const before = state.tasks.length;
  state.tasks = state.tasks.filter((item) => Number(item.id) !== Number(id));
  return state.tasks.length !== before;
}

function createOrReplaceDiary(payload) {
  const existingIdx = state.diary.findIndex(
    (item) => Number(item.user_id) === Number(payload.user_id) && String(item.date) === String(payload.date)
  );

  if (existingIdx !== -1) {
    state.diary[existingIdx] = {
      ...state.diary[existingIdx],
      mood: payload.mood,
      entry: payload.entry,
    };
    return state.diary[existingIdx];
  }

  const row = {
    id: nextId('diary'),
    ...payload,
    created_at: new Date().toISOString(),
  };
  state.diary.push(row);
  return row;
}

function listDiaryByUser(userId) {
  return state.diary
    .filter((item) => Number(item.user_id) === Number(userId))
    .sort((a, b) => {
      const dateCmp = String(b.date).localeCompare(String(a.date));
      if (dateCmp !== 0) {
        return dateCmp;
      }
      return Number(b.id) - Number(a.id);
    });
}

function createVitality(payload) {
  const row = {
    id: nextId('vitality'),
    ...payload,
    created_at: new Date().toISOString(),
  };
  state.vitality.push(row);
  return row;
}

function listVitalityByUser(userId) {
  return state.vitality
    .filter((item) => Number(item.user_id) === Number(userId))
    .sort((a, b) => {
      const dateCmp = String(b.date).localeCompare(String(a.date));
      if (dateCmp !== 0) {
        return dateCmp;
      }
      return Number(b.id) - Number(a.id);
    });
}

async function signup({ name, email, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = createUser({ name, email, password: hashedPassword });
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

async function login({ email, password }) {
  const user = findUserByEmail(email);
  if (!user) {
    return null;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return null;
  }

  const { password: pw, ...userData } = user;
  return userData;
}

module.exports = {
  signup,
  login,
  createPlanner,
  listPlannerByUser,
  updatePlanner,
  deletePlanner,
  createTask,
  listTasksByUser,
  updateTask,
  deleteTask,
  createOrReplaceDiary,
  listDiaryByUser,
  createVitality,
  listVitalityByUser,
};
