"use client";
import { useState, useEffect } from "react";
import type { User, Role, Instrument, CreateUserDto } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Administrador" }, 
  { value: "DIRECTOR", label: "Director" },
  { value: "MUSICO", label: "Músico" }, 
  { value: "VOCALISTA", label: "Vocalista" },
  { value: "MULTIMEDIA", label: "Multimedia" },
];
const INSTRUMENT_OPTIONS = [
  { value: "", label: "Sin instrumento" }, { value: "GUITARRA", label: "Guitarra" },
  { value: "BAJO", label: "Bajo" }, { value: "BATERIA", label: "Batería" },
  { value: "TECLADO", label: "Teclado" }, { value: "PIANO", label: "Piano" },
  { value: "VIOLIN", label: "Violín" }, { value: "TROMPETA", label: "Trompeta" },
  { value: "VOZ_PRINCIPAL", label: "Voz Principal" }, { value: "VOZ_SECUNDARIA", label: "Voz Secundaria" },
  { value: "MEDIOS", label: "Medios" }, { value: "OTRO", label: "Otro" },
];

type FormState = CreateUserDto & { password: string };
const BLANK: FormState = { name: "", email: "", password: "", role: "MUSICO", instrument: undefined, phone: "" };

interface Props {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (data: Partial<CreateUserDto> & { password?: string }, id?: string) => Promise<void>;
}

export function UserModal({ open, user, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>(BLANK);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(user
      ? { name: user.name, email: user.email, password: "", role: user.role, instrument: user.instrument ?? undefined, phone: user.phone ?? "" }
      : BLANK
    );
  }, [user, open]);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.email || (!user && !form.password)) return;
    setSaving(true);
    try {
      const payload: any = { name: form.name, email: form.email, role: form.role, instrument: form.instrument || undefined, phone: form.phone || undefined };
      if (form.password) payload.password = form.password;
      await onSave(payload, user?.id);
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <Modal
      open={open} onClose={onClose} size="md"
      title={user ? "Editar Miembro" : "Nuevo Miembro"}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
            {user ? "Guardar cambios" : "Crear miembro"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Nombre completo" required placeholder="Juan Pérez" value={form.name}
          onChange={e => set("name", e.target.value)} className="sm:col-span-2" />
        <Input label="Email" required type="email" placeholder="juan@cdfe.com" value={form.email}
          onChange={e => set("email", e.target.value)} />
        <Input label={user ? "Nueva contraseña" : "Contraseña"} required={!user}
          type="password" placeholder={user ? "Dejar vacío para mantener" : "Mín. 6 caracteres"}
          value={form.password} onChange={e => set("password", e.target.value)} />
        <Select label="Rol" required value={form.role} onChange={e => set("role", e.target.value as Role)} options={ROLE_OPTIONS} />
        <Select label="Instrumento" value={form.instrument ?? ""} onChange={e => set("instrument", e.target.value || undefined)} options={INSTRUMENT_OPTIONS} />
        <Input label="Teléfono / WhatsApp" placeholder="0987654321" hint="Para mensajería de WhatsApp" value={form.phone ?? ""}
          onChange={e => set("phone", e.target.value)} className="sm:col-span-2" />
      </div>
    </Modal>
  );
}
