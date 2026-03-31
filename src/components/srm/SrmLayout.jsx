import { SrmHeader } from "./SrmHeader.jsx";
import { SrmSubNav } from "./SrmSubNav.jsx";
import { SrmPageBar } from "./SrmPageBar.jsx";
import { SrmSidebar } from "./SrmSidebar.jsx";
import { srmStyle as style } from "./srmStyles.js";

export function SrmLayout({
  user,
  onLogout,
  navigate,
  menuOpen,
  setMenuOpen,
  adminOpen,
  setAdminOpen,
  menuItems,
  adminItems,
  pageTitle,
  pageActions,
  children,
  sidebarAlerts,
  sidebarTasks,
  bookmarks,
}) {
  return (
    <div style={style.app}>
      <SrmHeader user={user} onLogout={onLogout} onTitleClick={() => navigate("dashboard")} />
      <SrmSubNav
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        adminOpen={adminOpen}
        setAdminOpen={setAdminOpen}
        menuItems={menuItems}
        adminItems={adminItems}
        onNavigate={navigate}
        onHome={() => navigate("dashboard")}
      />
      <div
        style={style.mainLayout}
        onClick={() => {
          if (menuOpen || adminOpen) {
            setMenuOpen(false);
            setAdminOpen(false);
          }
        }}
      >
        <div style={style.content}>
          <SrmPageBar title={pageTitle} actions={pageActions} />
          {children}
        </div>
        <SrmSidebar alerts={sidebarAlerts} tasks={sidebarTasks} bookmarks={bookmarks} onBookmarkNavigate={navigate} />
      </div>
    </div>
  );
}
