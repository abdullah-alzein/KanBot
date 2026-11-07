import { useLayoutEffect } from "react";
import { Outlet } from "react-router";
import { useTheme } from "../theme/useTheme";

export function AuthLayout() {
  const { setAuthMode } = useTheme();

  useLayoutEffect(() => {
    setAuthMode(true);
    return () => setAuthMode(false);
  }, [setAuthMode]);

  return (
    <div className="auth-layout">
      <aside className="auth-hero" aria-hidden="false">
        <span className="dot dot-yellow" aria-hidden="true" />
        <span className="dot dot-pink" aria-hidden="true" />
        <span className="dot dot-mint" aria-hidden="true" />
        <span className="dot dot-sky" aria-hidden="true" />
        <span className="dot dot-peach" aria-hidden="true" />
        <img src="/kanbot-logo-dark.png" alt="Kanbot" className="auth-logo" />
        <h2>Plan the sprint. Let the bot do the typing.</h2>
        <p>
          Backlog, board and sprint history for one person, with an AI teammate
          that drafts todos and summarises the week.
        </p>
      </aside>
      <main className="auth-main">
        <Outlet />
      </main>
    </div>
  );
}
