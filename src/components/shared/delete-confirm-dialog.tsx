"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type DeleteConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  entityName: string;
  consequences: string[];
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  /** Tema oscuro para el panel /admin */
  dark?: boolean;
};

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  entityName,
  consequences,
  confirmLabel = "Eliminar definitivamente",
  loading = false,
  onConfirm,
  dark = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          dark && "border-neutral-800 bg-neutral-900 text-neutral-100",
        )}
        onPointerDownOutside={(e) => loading && e.preventDefault()}
        onEscapeKeyDown={(e) => loading && e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                dark ? "bg-red-950/60 text-red-400" : "bg-destructive/10 text-destructive",
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1.5 pt-0.5">
              <DialogTitle className={dark ? "text-neutral-100" : undefined}>
                {title}
              </DialogTitle>
              <DialogDescription className={dark ? "text-neutral-400" : undefined}>
                Vas a eliminar{" "}
                <span className="font-semibold text-foreground dark:text-neutral-200">
                  {entityName}
                </span>
                . Esta acción es permanente y no se puede deshacer.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ul
          className={cn(
            "space-y-2 rounded-xl border px-4 py-3 text-sm",
            dark
              ? "border-neutral-800 bg-neutral-950 text-neutral-400"
              : "border-destructive/20 bg-destructive/5 text-muted-foreground",
          )}
        >
          {consequences.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span
                className={cn(
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  dark ? "bg-red-400" : "bg-destructive",
                )}
              />
              {item}
            </li>
          ))}
        </ul>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className={cn(dark && "border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-800")}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={onConfirm}
            className={cn(
              dark && "bg-red-600 text-white hover:bg-red-700",
            )}
          >
            {loading ? "Eliminando…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
