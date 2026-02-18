"use client";

import { useSelector, useDispatch } from "react-redux";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { selectCurrentUser } from "@/store/slices/auth-slice";
import { selectTheme, setTheme } from "@/store/slices/ui-slice";
import { AUTH_LOGOUT } from "@/store/sagas/auth-saga";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/constants";

export function Topbar() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const theme = useSelector(selectTheme);

  const handleThemeToggle = () => {
    dispatch(setTheme(theme === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    dispatch({ type: AUTH_LOGOUT });
  };

  const initials = user
    ? (user.displayName ?? user.username)
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div />

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleThemeToggle}>
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatarUrl ?? undefined} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              {user && (
                <span className="text-sm font-medium">
                  {user.displayName ?? user.username}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <span>{user?.displayName ?? user?.username}</span>
                <Badge variant="secondary" className="w-fit text-xs">
                  {user ? ROLE_LABELS[user.role] : ""}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/settings" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                Profile
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
