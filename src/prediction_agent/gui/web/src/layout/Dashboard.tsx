import { useEffect, useMemo } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun, Activity, TrendingUp, FileText, Folder, File } from "lucide-react";
import type { NavigateCommand } from "../hooks/useWatchSocket";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useProjectInfo } from "@/hooks/useProjectInfo";
import { useFileTree } from "@/hooks/useFileTree";
import type { FileNode } from "@/hooks/useFileTree";

interface DashboardProps {
  connected: boolean;
  offline: boolean;
  dark: boolean;
  onToggleTheme: () => void;
  navigation: NavigateCommand | null;
  clearNavigation: () => void;
  treeVersion: number;
  projectInfo: { name: string; path: string } | null;
}

/** Recursive file tree rendered in the sidebar. Files navigate to /files/<path>. */
function FileTreeNodes({
  nodes,
  depth,
  currentPath,
  onOpen,
}: {
  nodes: FileNode[];
  depth: number;
  currentPath: string;
  onOpen: (path: string) => void;
}) {
  return (
    <>
      {nodes.map((node) => {
        if (node.type === "directory") {
          return (
            <div key={node.path}>
              <div
                className="flex items-center gap-2 px-2 py-1 text-xs text-foreground/50"
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
              >
                <Folder className="size-3.5 shrink-0" />
                <span className="truncate">{node.name}</span>
              </div>
              {node.children && (
                <FileTreeNodes
                  nodes={node.children}
                  depth={depth + 1}
                  currentPath={currentPath}
                  onOpen={onOpen}
                />
              )}
            </div>
          );
        }
        const route = `/files/${node.path}`;
        return (
          <SidebarMenuItem key={node.path}>
            <SidebarMenuButton
              isActive={currentPath === route}
              onClick={() => onOpen(route)}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              <File className="size-3.5" />
              <span className="truncate">{node.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}

export function Dashboard({
  connected,
  offline,
  dark,
  onToggleTheme,
  navigation,
  clearNavigation,
  treeVersion,
  projectInfo,
}: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const project = useProjectInfo();
  const projectName = projectInfo?.name || project.name;
  const fileTree = useFileTree(treeVersion);

  // Handle navigation commands pushed over the WebSocket.
  useEffect(() => {
    if (navigation) {
      navigate(navigation.path);
      clearNavigation();
    }
  }, [navigation, navigate, clearNavigation]);

  const currentPath = location.pathname;
  const title = useMemo(() => {
    if (currentPath === "/") return "Agent Feed";
    if (currentPath.startsWith("/files/")) {
      return decodeURIComponent(currentPath.replace(/^\/files\//, ""));
    }
    return currentPath;
  }, [currentPath]);

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="pointer-events-none">
                <TrendingUp className="size-5" />
                <span className="font-heading">Prediction Agent</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{projectName}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={currentPath === "/"}
                    onClick={() => navigate("/")}
                  >
                    <Activity className="size-4" />
                    <span>Agent Feed</span>
                    <span
                      className={`ml-auto inline-block size-2 rounded-full ${
                        offline
                          ? "bg-foreground/20"
                          : connected
                            ? "bg-green-500"
                            : "bg-red-500 animate-pulse"
                      }`}
                      title={offline ? "Offline" : connected ? "Connected" : "Disconnected"}
                    />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {fileTree.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-2">
                <FileText className="size-3.5" /> Files
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <FileTreeNodes
                    nodes={fileTree}
                    depth={0}
                    currentPath={currentPath}
                    onOpen={navigate}
                  />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="relative flex items-center gap-2 border-b-2 border-border bg-background px-4 py-2">
          <SidebarTrigger />
          <h2 className="absolute left-1/2 -translate-x-1/2 text-sm font-heading text-foreground">
            {title}
          </h2>
          <div className="ml-auto">
            <Button variant="neutral" size="icon" className="size-7" onClick={onToggleTheme}>
              {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 min-w-0 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </>
  );
}
