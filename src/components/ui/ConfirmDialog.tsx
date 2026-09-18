"use client";
import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

type ConfirmVariant = "primary" | "secondary" | "ghost" | "gold" | "danger";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  loading?: boolean;
  confirmLabel?: string;
  confirmVariant?: ConfirmVariant;
  icon?: React.ElementType;
  iconClassName?: string;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirmar eliminación",
  message,
  loading,
  confirmLabel = "Eliminar",
  confirmVariant = "danger",
  icon: Icon = AlertTriangle,
  iconClassName = "bg-red-50 text-red-500",
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant={confirmVariant} size="sm" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconClassName}`}>
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </Modal>
  );
}
