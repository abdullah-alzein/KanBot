import {
  History,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Folder,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useMatch, useNavigate } from "react-router";
import { AiProvider } from "../features/ai/AiProvider";
import { useAi } from "../features/ai/useAi";
import { useAuth } from "../features/auth/useAuth";
import { useProject, useProjects } from "../hooks/useProjects";
import { ThemeToggle } from "../components/ThemeToggle";

function AskAiButton() {
  const { enabled, openAssistant } = useAi();
  if (!enabled) return null;
  return (
    <button
      type="button"
      className="btn btn-primary btn-sm"
      onClick={openAssistant}
    >
      <Sparkles size={14} aria-hidden="true" /> Ask AI
    </button>
  );
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const match = useMatch("/projects/:projectId/*");
  const projectId = match?.params.projectId;
  const projects = useProjects();
  const project = useProject(projectId);
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  const handleLogout = () => {
    navigate("/login", { replace: true });
    logout();
  };

  const base = projectId ? `/projects/${projectId}` : null;

  return (
    <AiProvider projectId={projectId}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className={`shell ${open ? "shell-open" : ""}`}>
        <aside className="sidebar" id="sidebar">
          <Link to="/projects" className="sidebar-logo" onClick={closeMenu}>
            <img src="/kanbot-logo-dark.png" alt="Kanbot" />
          </Link>

          <div className="sidebar-section">
            <label htmlFor="project-switcher" className="sidebar-label">
              Project
            </label>
            <select
              id="project-switcher"
              className="input"
              value={projectId ?? ""}
              onChange={(e) => {
                if (e.target.value) {
                  navigate(`/projects/${e.target.value}/backlog`);
                  closeMenu();
                }
              }}
            >
              {!projectId && <option value="">Select a project…</option>}
              {projects.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.key} · {p.name}
                </option>
              ))}
              {projectId && !projects.data?.some((p) => p.id === projectId) && (
                <option value={projectId}>
                  {project.data?.name ?? "Current project"}
                </option>
              )}
            </select>
          </div>

          <nav className="sidebar-nav" aria-label="Main">
            <NavLink to="/projects" end onClick={closeMenu}>
              <Folder size={16} aria-hidden="true" /> All projects
            </NavLink>
            {base && (
              <>
                <NavLink to={`${base}/backlog`} onClick={closeMenu}>
                  <ListTodo size={16} aria-hidden="true" /> Backlog
                </NavLink>
                <NavLink to={`${base}/board`} onClick={closeMenu}>
                  <LayoutDashboard size={16} aria-hidden="true" /> Board
                </NavLink>
                <NavLink to={`${base}/sprints`} onClick={closeMenu}>
                  <History size={16} aria-hidden="true" /> Sprints
                </NavLink>
              </>
            )}
          </nav>

          <div className="sidebar-user">
            <div className="sidebar-user-text">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={17} aria-hidden="true" />
            </button>
          </div>
        </aside>

        <div className="shell-main">
          <header className="topbar">
            <button
              type="button"
              className="icon-btn menu-btn"
              aria-label="Toggle navigation"
              aria-expanded={open}
              aria-controls="sidebar"
              onClick={() => setOpen((o) => !o)}
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <div className="topbar-title">
              {project.data ? (
                <>
                  <span className="key-chip">{project.data.key}</span>
                  <span>{project.data.name}</span>
                </>
              ) : (
                <span>Projects</span>
              )}
            </div>
            <div className="topbar-actions">
              <ThemeToggle />
              <AskAiButton />
            </div>
          </header>
          <main className="content" id="main" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
        {open && (
          <button
            type="button"
            className="scrim"
            aria-label="Close navigation"
            onClick={closeMenu}
          />
        )}
      </div>
    </AiProvider>
  );
}
