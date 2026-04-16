import { useEffect, useMemo, useState } from "react";

const configuredApiBase = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
const isLocalHost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";
const API_BASE = configuredApiBase || (isLocalHost ? "http://localhost:5000" : browserOrigin);

const todayIso = new Date().toISOString().slice(0, 10);

function toMinutes(value) {
  if (!value || !value.includes(":")) {
    return 0;
  }
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function minutesToLabel(totalMinutes) {
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

function formatNiceDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function scoreDay(tasks, blocks) {
  const completed = tasks.filter((item) => item.completed).length;
  const taskScore = tasks.length ? (completed / tasks.length) * 60 : 0;
  const hours = blocks.reduce((sum, block) => {
    const minutes = Math.max(0, toMinutes(block.end_time) - toMinutes(block.start_time));
    return sum + minutes / 60;
  }, 0);
  const scheduleScore = Math.min(40, hours * 5);
  return Math.round(taskScore + scheduleScore);
}

function App() {
  const [userId, setUserId] = useState("1");
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [plannerItems, setPlannerItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [newBlock, setNewBlock] = useState({
    activity: "",
    start_time: "09:00",
    end_time: "10:00",
  });
  const [newTask, setNewTask] = useState("");
  const [mood, setMood] = useState("focused");
  const [entryText, setEntryText] = useState("");

  const filteredPlanner = useMemo(
    () =>
      plannerItems
        .filter((item) => item.date === selectedDate)
        .sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time)),
    [plannerItems, selectedDate]
  );

  const todayTasks = useMemo(() => tasks.slice().reverse(), [tasks]);

  const currentEntry = useMemo(
    () => diaryEntries.find((item) => item.date === selectedDate),
    [diaryEntries, selectedDate]
  );

  const totalFocusScore = useMemo(
    () => scoreDay(todayTasks, filteredPlanner),
    [todayTasks, filteredPlanner]
  );

  useEffect(() => {
    if (currentEntry) {
      setMood(currentEntry.mood);
      setEntryText(currentEntry.entry);
    } else {
      setMood("focused");
      setEntryText("");
    }
  }, [currentEntry]);

  useEffect(() => {
    let active = true;

    async function loadPlannerData() {
      setLoading(true);
      setError("");

      try {
        const [plannerRes, tasksRes, diaryRes] = await Promise.all([
          fetch(`${API_BASE}/api/planner/${userId}`),
          fetch(`${API_BASE}/api/tasks/${userId}`),
          fetch(`${API_BASE}/api/diary/${userId}`),
        ]);

        if (!plannerRes.ok || !tasksRes.ok || !diaryRes.ok) {
          throw new Error("Unable to load planner data.");
        }

        const plannerJson = await plannerRes.json();
        const tasksJson = await tasksRes.json();
        const diaryJson = await diaryRes.json();

        if (!active) {
          return;
        }

        setPlannerItems(plannerJson.planner || []);
        setTasks(tasksJson.tasks || []);
        setDiaryEntries(diaryJson.diary || []);
      } catch (err) {
        if (active) {
          if (err instanceof TypeError) {
            setError(`Cannot reach backend API at ${API_BASE || "(unknown)"}. Check backend availability and CORS.`);
          } else {
            setError(err.message || "Something went wrong while loading data.");
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (userId.trim()) {
      loadPlannerData();
    }

    return () => {
      active = false;
    };
  }, [userId]);

  async function createBlock(event) {
    event.preventDefault();
    if (!newBlock.activity.trim()) {
      return;
    }
    if (toMinutes(newBlock.end_time) <= toMinutes(newBlock.start_time)) {
      setError("End time must be later than start time.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/planner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(userId),
          activity: newBlock.activity.trim(),
          start_time: newBlock.start_time,
          end_time: newBlock.end_time,
          date: selectedDate,
        }),
      });

      if (!res.ok) {
        throw new Error("Could not save schedule block.");
      }

      const json = await res.json();
      setPlannerItems((prev) => [json.planner, ...prev]);
      setNewBlock({ activity: "", start_time: "09:00", end_time: "10:00" });
    } catch (err) {
      setError(err.message || "Could not create planner block.");
    } finally {
      setSaving(false);
    }
  }

  async function removeBlock(id) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/planner/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Could not delete planner block.");
      }
      setPlannerItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "Failed to remove planner block.");
    } finally {
      setSaving(false);
    }
  }

  async function createTask(event) {
    event.preventDefault();
    if (!newTask.trim()) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(userId),
          task: newTask.trim(),
          completed: false,
        }),
      });

      if (!res.ok) {
        throw new Error("Could not create task.");
      }

      const json = await res.json();
      setTasks((prev) => [json.task, ...prev]);
      setNewTask("");
    } catch (err) {
      setError(err.message || "Failed to create task.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    setError("");
    const oldState = tasks;
    const nextState = tasks.map((item) =>
      item.id === task.id ? { ...item, completed: !item.completed } : item
    );
    setTasks(nextState);

    try {
      const res = await fetch(`${API_BASE}/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!res.ok) {
        throw new Error("Could not update task.");
      }
    } catch (err) {
      setTasks(oldState);
      setError(err.message || "Failed to update task state.");
    }
  }

  async function removeTask(id) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Could not delete task.");
      }
      setTasks((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete task.");
    } finally {
      setSaving(false);
    }
  }

  async function saveDiary(event) {
    event.preventDefault();
    if (!entryText.trim()) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/diary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(userId),
          date: selectedDate,
          mood,
          entry: entryText.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Could not save reflection.");
      }

      const json = await res.json();
      setDiaryEntries((prev) => [json.diary, ...prev.filter((item) => item.date !== selectedDate)]);
    } catch (err) {
      setError(err.message || "Failed to save reflection.");
    } finally {
      setSaving(false);
    }
  }

  const completedCount = todayTasks.filter((item) => item.completed).length;

  return (
    <div className="planner-page">
      <header className="topbar">
        <div className="title-wrap">
          <p className="label">Life Planner</p>
          <h1>Daily Planner Board</h1>
          <p className="subtitle">Turn your day into blocks, priorities, and a clear finish line.</p>
        </div>
        <div className="controls">
          <label>
            User
            <input
              value={userId}
              onChange={(event) => setUserId(event.target.value.replace(/\D/g, ""))}
              className="compact-input"
              aria-label="User id"
            />
          </label>
          <label>
            Day
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="compact-input"
            />
          </label>
        </div>
      </header>

      <section className="summary-grid" aria-live="polite">
        <article className="summary-card glow">
          <p>Focus Score</p>
          <h2>{totalFocusScore}</h2>
          <small>Based on completed priorities and planned hours</small>
        </article>
        <article className="summary-card">
          <p>Tasks Done</p>
          <h2>{completedCount}/{todayTasks.length || 0}</h2>
          <small>Keep momentum through the day</small>
        </article>
        <article className="summary-card">
          <p>Schedule Blocks</p>
          <h2>{filteredPlanner.length}</h2>
          <small>{formatNiceDate(selectedDate)}</small>
        </article>
      </section>

      {error ? <p className="feedback error">{error}</p> : null}
      {loading ? <p className="feedback">Loading planner data...</p> : null}

      <main className="planner-layout">
        <section className="card timetable-card">
          <div className="section-head">
            <h3>Day Timeline</h3>
            <span>{formatNiceDate(selectedDate)}</span>
          </div>

          <form className="inline-form" onSubmit={createBlock}>
            <input
              type="text"
              placeholder="Activity"
              value={newBlock.activity}
              onChange={(event) =>
                setNewBlock((prev) => ({ ...prev, activity: event.target.value }))
              }
            />
            <input
              type="time"
              value={newBlock.start_time}
              onChange={(event) =>
                setNewBlock((prev) => ({ ...prev, start_time: event.target.value }))
              }
            />
            <input
              type="time"
              value={newBlock.end_time}
              onChange={(event) =>
                setNewBlock((prev) => ({ ...prev, end_time: event.target.value }))
              }
            />
            <button type="submit" disabled={saving}>
              Add Block
            </button>
          </form>

          <ul className="timeline-list">
            {filteredPlanner.length === 0 ? (
              <li className="empty">No schedule blocks yet. Add your first block above.</li>
            ) : (
              filteredPlanner.map((block) => (
                <li key={block.id} className="timeline-item">
                  <div className="timeline-time">
                    <strong>{minutesToLabel(toMinutes(block.start_time))}</strong>
                    <span>{minutesToLabel(toMinutes(block.end_time))}</span>
                  </div>
                  <div className="timeline-body">
                    <p>{block.activity}</p>
                  </div>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => removeBlock(block.id)}
                    disabled={saving}
                    aria-label="Delete schedule block"
                  >
                    Remove
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="card tasks-card">
          <div className="section-head">
            <h3>Priority Tasks</h3>
            <span>{todayTasks.length} total</span>
          </div>

          <form className="inline-form task-form" onSubmit={createTask}>
            <input
              type="text"
              placeholder="Add a priority task"
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
            />
            <button type="submit" disabled={saving}>
              Add Task
            </button>
          </form>

          <ul className="task-list">
            {todayTasks.length === 0 ? (
              <li className="empty">No tasks yet. Add one priority to get started.</li>
            ) : (
              todayTasks.map((task) => (
                <li key={task.id} className={task.completed ? "task-item done" : "task-item"}>
                  <label>
                    <input
                      type="checkbox"
                      checked={Boolean(task.completed)}
                      onChange={() => toggleTask(task)}
                    />
                    <span>{task.task}</span>
                  </label>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => removeTask(task.id)}
                    disabled={saving}
                    aria-label="Delete task"
                  >
                    Remove
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="card diary-card">
          <div className="section-head">
            <h3>Daily Reflection</h3>
            <span>End-of-day note</span>
          </div>

          <form className="diary-form" onSubmit={saveDiary}>
            <div className="mood-row">
              <label htmlFor="mood">Mood</label>
              <select id="mood" value={mood} onChange={(event) => setMood(event.target.value)}>
                <option value="focused">Focused</option>
                <option value="balanced">Balanced</option>
                <option value="stressed">Stressed</option>
                <option value="energized">Energized</option>
              </select>
            </div>
            <textarea
              value={entryText}
              onChange={(event) => setEntryText(event.target.value)}
              placeholder="What moved forward today? What should tomorrow start with?"
              rows={5}
            />
            <button type="submit" disabled={saving}>
              Save Reflection
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default App;
