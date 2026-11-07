import {
  Check,
  ChevronDown,
  History,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Folder,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const projectSwitcherRef = useRef<HTMLDivElement>(null);
  const projectSwitcherTriggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = () => setOpen(false);
  const closeProjectMenu = () => setProjectMenuOpen(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    if (!projectMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !projectSwitcherRef.current?.contains(event.target)
      ) {
        closeProjectMenu();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeProjectMenu();
        projectSwitcherTriggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [projectMenuOpen]);

  const selectedProject = projects.data?.find((p) => p.id === projectId);
  const selectedProjectName =
    selectedProject?.name ??
    project.data?.name ??
    (projectId ? "Current project" : "Select a project…");

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
            <div className="project-switcher" ref={projectSwitcherRef}>
              <button
                id="project-switcher"
                ref={projectSwitcherTriggerRef}
                type="button"
                className="project-switcher-trigger"
                aria-expanded={projectMenuOpen}
                aria-controls="project-switcher-menu"
                onClick={() => setProjectMenuOpen((isOpen) => !isOpen)}
              >
                <span className="project-switcher-current">
                  {selectedProject?.key && (
                    <span className="project-switcher-key">
                      {selectedProject.key}
                    </span>
                  )}
                  <span className="project-switcher-name">
                    {selectedProjectName}
                  </span>
                </span>
                <ChevronDown
                  className="project-switcher-chevron"
                  size={16}
                  aria-hidden="true"
                />
              </button>
              <div
                id="project-switcher-menu"
                className="project-switcher-menu"
                hidden={!projectMenuOpen}
              >
                {projects.isPending ? (
                  <p className="project-switcher-message" role="status">
                    Loading projects…
                  </p>
                ) : projects.isError ? (
                  <p className="project-switcher-message" role="alert">
                    Could not load projects.
                  </p>
                ) : projects.data?.length || projectId ? (
                  <ul>
                    {projects.data?.map((p) => (
                      <li key={p.id}>
                        {p.id === projectId ? (
                          <div
                            className="project-switcher-item is-current"
                            aria-current="page"
                          >
                            <span className="project-switcher-key">{p.key}</span>
                            <span className="project-switcher-name">
                              {p.name}
                            </span>
                            <Check
                              className="project-switcher-check"
                              size={15}
                              aria-hidden="true"
                            />
                          </div>
                        ) : (
                          <Link
                            className="project-switcher-item"
                            to={`/projects/${p.id}/backlog`}
                            onClick={closeProjectMenu}
                          >
                            <span className="project-switcher-key">{p.key}</span>
                            <span className="project-switcher-name">
                              {p.name}
                            </span>
                          </Link>
                        )}
                      </li>
                    ))}
                    {projectId && !selectedProject && (
                      <li>
                        <div
                          className="project-switcher-item is-current"
                          aria-current="page"
                        >
                          {project.data?.key && (
                            <span className="project-switcher-key">
                              {project.data.key}
                            </span>
                          )}
                          <span className="project-switcher-name">
                            {project.data?.name ?? "Current project"}
                          </span>
                          <Check
                            className="project-switcher-check"
                            size={15}
                            aria-hidden="true"
                          />
                        </div>
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="project-switcher-message">No projects yet.</p>
                )}
              </div>
            </div>
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
