"use client";
import { useState, useEffect } from "react";
import type { ApiService } from "@/lib/api";
import type { ServiceType, CreateServiceDto } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

const TYPE_OPTIONS = [{ value: "DOMINGO", label: "Domingo" }, { value: "MIERCOLES", label: "Miércoles" }];
const BLANK: CreateServiceDto = { date: "", type: "DOMINGO", title: "", notes: "" };

interface Props {
  open: boolean;
  service: ApiService | null;
  onClose: () => void;
  onSave: (data: CreateServiceDto, id?: string) => Promise<void>;
}

export function ServiceModal({ open, service, onClose, onSave }: Props) {
  const [form, setForm] = useState<CreateServiceDto>(BLANK);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(service
      ? { date: new Date(service.date).toISOString().slice(0, 16), type: service.type, title: service.title ?? "", notes: service.notes ?? "" }
      : BLANK
    );
  }, [service, open]);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.date || !form.type) return;
    setSaving(true);
    try {
      await onSave({ ...form, date: new Date(form.date).toISOString() }, service?.id);
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <Modal
      open={open} onClose={onClose} size="md"
      title={service ? "Editar Servicio" : "Nuevo Servicio"}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
            {service ? "Guardar cambios" : "Crear servicio"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Fecha y hora" required type="datetime-local" value={form.date} onChange={e => set("date", e.target.value)} />
        <Select label="Tipo" required value={form.type} onChange={e => set("type", e.target.value as ServiceType)} options={TYPE_OPTIONS} />
        <Input label="Título" placeholder="Servicio Dominical" value={form.title ?? ""} onChange={e => set("title", e.target.value)} className="sm:col-span-2" />
        <Textarea label="Notas" placeholder="Observaciones..." value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} className="sm:col-span-2" rows={3} />
      </div>
    </Modal>
  );
}
