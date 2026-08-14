import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useWatchSocket } from "./hooks/useWatchSocket";
import { Dashboard } from "./layout/Dashboard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ActiveView } from "./layout/ActiveView";
import { FileViewer } from "@/panels/FileViewer";

export function App() {
  const { events, connected, offline, navigation, clearNavigation, treeVersion, projectInfo } = useWatchSocket();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDark(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <HashRouter>
      <SidebarProvider>
        <Routes>
          <Route
            element={
              <Dashboard
                connected={connected}
                offline={offline}
                dark={dark}
                onToggleTheme={() => setDark((d) => !d)}
                navigation={navigation}
                clearNavigation={clearNavigation}
                treeVersion={treeVersion}
                projectInfo={projectInfo}
              />
            }
          >
            <Route index element={<ActiveView events={events} offline={offline} />} />
            <Route path="files/*" element={<FileViewerRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </SidebarProvider>
    </HashRouter>
  );
}

function FileViewerRoute() {
  const location = useLocation();
  // Route: /files/data/pikachu.json → file: data/pikachu.json
  const file = decodeURIComponent(location.pathname.replace(/^\/files\//, ""));
  return <FileViewer file={file} />;
}
