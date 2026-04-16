import { useMemo, useState } from "react";

const metrics = [
  { label: "Uptime", value: "99.98%", note: "last 30 days" },
  { label: "Deploys", value: "184", note: "this month" },
  { label: "Active Nodes", value: "16", note: "healthy" },
  { label: "Avg MTTR", value: "12m", note: "incident response" },
];

const highlights = [
  {
    title: "Task Planner",
    text: "Plan work with priorities, due dates, and status tracking for individuals and teams.",
  },
  {
    title: "Daily Diary",
    text: "Capture daily progress, blockers, and lessons in a clean journaling flow.",
  },
  {
    title: "Vitality Monitor",
    text: "Track well-being metrics to keep your team productive and sustainable.",
  },
  {
    title: "Secure Auth",
    text: "JWT-based session handling with protected routes and backend API integration.",
  },
];

const environmentStatus = [
  { env: "Production", status: "Healthy", lastDeploy: "2h ago" },
  { env: "Staging", status: "Healthy", lastDeploy: "18m ago" },
  { env: "Development", status: "Active", lastDeploy: "5m ago" },
];

const navItems = ["Overview", "Features", "Status", "Roadmap", "Contact"];

function App() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Developer");
  const [messageSent, setMessageSent] = useState(false);

  const year = useMemo(() => new Date().getFullYear(), []);

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }
    setMessageSent(true);
    setEmail("");
  }

  return (
    <div className="page">
      <header className="site-header">
        <div className="brand-wrap">
          <span className="brand-dot" aria-hidden="true" />
          <p className="brand">DevOps Project</p>
        </div>
        <nav className="nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a key={item} href="#" className="nav-link">
              {item}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <section className="hero panel">
          <p className="eyebrow">Ship faster. Stay reliable.</p>
          <h1>Full-stack productivity suite for modern DevOps teams.</h1>
          <p className="hero-text">
            Your GitHub Pages frontend is now configured for subpath deployment and
            upgraded into a complete, responsive product website.
          </p>
          <div className="hero-cta">
            <button type="button" className="btn btn-primary">
              Explore Dashboard
            </button>
            <button type="button" className="btn btn-secondary">
              View API Modules
            </button>
          </div>
        </section>

        <section className="metrics-grid" aria-label="Key project metrics">
          {metrics.map((metric) => (
            <article key={metric.label} className="metric-card panel">
              <p className="metric-label">{metric.label}</p>
              <p className="metric-value">{metric.value}</p>
              <p className="metric-note">{metric.note}</p>
            </article>
          ))}
        </section>

        <section className="split-layout">
          <article className="panel features">
            <h2>Core Features</h2>
            <div className="feature-list">
              {highlights.map((item) => (
                <div key={item.title} className="feature-item">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="panel status-board">
            <h2>Environment Status</h2>
            <ul className="status-list">
              {environmentStatus.map((entry) => (
                <li key={entry.env} className="status-row">
                  <div>
                    <p className="status-env">{entry.env}</p>
                    <p className="status-deploy">Last deploy: {entry.lastDeploy}</p>
                  </div>
                  <span className="status-chip">{entry.status}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="panel roadmap">
          <h2>Roadmap</h2>
          <div className="roadmap-track" aria-label="Roadmap timeline">
            <div className="roadmap-step">
              <p className="step-tag">Phase 1</p>
              <h3>Foundation</h3>
              <p>Authentication, task CRUD, diary endpoints, and planner APIs.</p>
            </div>
            <div className="roadmap-step">
              <p className="step-tag">Phase 2</p>
              <h3>Experience</h3>
              <p>UX enhancements, analytics cards, and improved accessibility.</p>
            </div>
            <div className="roadmap-step">
              <p className="step-tag">Phase 3</p>
              <h3>Scale</h3>
              <p>Observability, CI validation checks, and deployment automation.</p>
            </div>
          </div>
        </section>

        <section className="panel contact">
          <h2>Stay in the loop</h2>
          <p>Get release notes and feature updates for your role.</p>
          <form className="contact-form" onSubmit={handleSubmit}>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (messageSent) {
                  setMessageSent(false);
                }
              }}
              required
            />

            <label htmlFor="role" className="sr-only">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option>Developer</option>
              <option>DevOps Engineer</option>
              <option>Team Lead</option>
              <option>Project Manager</option>
            </select>

            <button type="submit" className="btn btn-primary">
              Notify Me
            </button>
          </form>
          {messageSent ? (
            <p className="success-note">Thanks. Updates will be sent to your inbox.</p>
          ) : null}
        </section>
      </main>

      <footer className="site-footer">
        <p>© {year} DevOps Project. Built with React + Vite.</p>
      </footer>
    </div>
  );
}

export default App;
