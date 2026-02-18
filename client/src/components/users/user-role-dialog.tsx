"use client";

import { useState } from "react";
import { useChangeUserRoleMutation } from "@/store/api/users-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ROLE_LABELS } from "@/lib/constants";
import type { User, UserRole } from "@/types/api";

interface UserRoleDialogProps {
  user: User | null;
  onClose: () => void;
}

export function UserRoleDialog({ user, onClose }: UserRoleDialogProps) {
  const [role, setRole] = useState<UserRole | "">(user?.role ?? "");
  const [changeRole, { isLoading }] = useChangeUserRoleMutation();

  const handleSubmit = async () => {
    if (!user || !role) return;
    try {
      await changeRole({ id: user.id, role: role as UserRole }).unwrap();
      onClose();
    } catch {
      // Error handled by RTK Query
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role for {user?.displayName ?? user?.username}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Label>Role</Label>
          <Select value={role || user?.role} onValueChange={(v) => setRole(v as UserRole)}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !role}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
