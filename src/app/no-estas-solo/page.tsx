"use client";

import { useState } from "react";
import {
  Phone,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  Ear,
  UserCheck,
  Quote,
  CheckCircle2,
  Camera,
  Users,
  MapPin,
  Mail,
} from "lucide-react";
import { supportRequestsApi } from "@/lib/api";
import type { ContactMethod } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

const ENCOURAGEMENTS = [
  "Tu historia importa, y no tienes que cargarla solo o sola.",
  "Este es solo un capítulo, no el final de tu historia.",
  "Dios ve lo que estás viviendo, y nosotros también queremos acompañarte.",
  "Está bien no estar bien. Gracias por dar este paso.",
  "No sabes cuánta valentía tomó escribir esto. Estamos contigo.",
];

const CONTACT_METHODS: { value: ContactMethod; label: string }[] = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "LLAMADA", label: "Llamada" },
  { value: "MENSAJE_TEXTO", label: "Mensaje de texto" },
];

const REASSURANCES = [
  {
    icon: ShieldCheck,
    title: "Confidencial",
    text: "Lo que compartas se queda entre tú y quien te contacte.",
  },
  {
    icon: Ear,
    title: "Sin juicios",
    text: "No importa qué esté pasando, estamos para escuchar primero.",
  },
  {
    icon: UserCheck,
    title: "Alguien real",
    text: "Una persona de nuestro equipo te va a contactar, no un robot.",
  },
];

export default function NoEstasSoloPage() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [contactMethod, setContactMethod] = useState<ContactMethod>("WHATSAPP");
  const [situation, setSituation] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [encouragement] = useState(
    () => ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
  );

  const canSubmit = name.trim() && contact.trim() && consent && !submitting;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      await supportRequestsApi.create({
        name: name.trim(),
        contact: contact.trim(),
        contactMethod,
        situation: situation.trim() || undefined,
        consent,
      });
      setStep("success");
    } catch {
      setError("No pudimos enviar tu mensaje. Por favor intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const nameGreeting = name.trim() ? `, ${name.trim().split(" ")[0]}` : "";
  const contactMethodLabel =
    CONTACT_METHODS.find((m) => m.value === contactMethod)?.label ?? "WhatsApp";

  return (
    <div className="min-h-screen w-full bg-surface text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-5 sm:px-7 py-4 bg-white/80 backdrop-blur-md border-b border-surface-border shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-navy flex items-center justify-center text-gold font-display font-bold text-sm">
            CF
          </div>
          <div className="font-display font-semibold text-sm text-navy">
            Comunidad de Fe Sur
          </div>
        </div>
        <a
          href="tel:+59326205990"
          className="cursor-pointer no-underline text-xs font-semibold text-navy flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-surface-border hover:border-navy/30 hover:bg-navy/5 transition-colors duration-200"
        >
          <Phone className="w-3.5 h-3.5" strokeWidth={2.5} />
          262-0599
        </a>
      </header>

      {/* Hero */}
      <section
        className="relative px-6 pt-24 pb-28 text-center overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 65% at 50% 15%, rgba(201,168,76,0.28), transparent 60%), linear-gradient(135deg, #001F3F 0%, #000080 100%)",
        }}
      >
        {/* Decorative glow orbs */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[460px] h-[460px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.35),transparent_70%)] animate-pulse-dot pointer-events-none" />
        <div className="absolute bottom-0 left-[10%] w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-10 right-[8%] w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.15),transparent_70%)] pointer-events-none" />

        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase text-gold px-3.5 py-1.5 border border-gold/40 rounded-full mb-7 bg-gold/5">
            <Sparkles className="w-3.5 h-3.5" />
            Un espacio seguro para hablar
          </div>
          <h1 className="font-display font-bold text-[clamp(2.75rem,8vw,4.75rem)] leading-[1.02] text-white mb-6 tracking-tight">
            No estás <span className="text-gold">solo</span>.
          </h1>
          <p className="text-lg sm:text-xl leading-relaxed text-white/80 mb-10 max-w-lg mx-auto">
            ¿Necesitas un abrazo? Cuéntanos qué está pasando. Alguien de
            Comunidad de Fe Sur quiere escucharte y acompañarte — sin juicios,
            en confianza.
          </p>
          <div className="flex flex-col items-center gap-4">
            <a
              href="#form"
              className="cursor-pointer inline-flex items-center justify-center gap-2.5 [background:linear-gradient(135deg,#C9A84C,#e8c86a)] text-navy-950 font-bold text-base sm:text-lg px-8 py-4 rounded-xl no-underline shadow-sm hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <HeartHandshake className="w-5 h-5" strokeWidth={2.5} />
              Quiero hablar con alguien
            </a>
            <p className="text-xs text-white/45">
              Toma menos de un minuto · 100% confidencial
            </p>
          </div>
        </div>
      </section>

      {/* Reassurance */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {REASSURANCES.map((item, i) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.title}
              padding="lg"
              className={`text-center card-hover animate-fade-in-up stagger-${i + 1}`}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-navy/10 to-gold/15 flex items-center justify-center">
                <Icon className="w-6 h-6 text-navy" strokeWidth={1.75} />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-navy">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">{item.text}</p>
            </Card>
          );
        })}
      </section>

      {/* Trust / encouragement band */}
      <section className="px-6 py-14">
        <div className="max-w-xl mx-auto text-center">
          <Quote className="w-7 h-7 text-gold mx-auto mb-4" strokeWidth={2} />
          <p className="font-display text-xl sm:text-2xl leading-snug text-navy italic mb-3">
            &ldquo;El Señor está cerca de los quebrantados de corazón, y
            salva a los abatidos de espíritu.&rdquo;
          </p>
          <p className="text-xs font-semibold tracking-wide uppercase text-gray-400">
            Salmos 34:18
          </p>
        </div>
      </section>

      {/* Form section */}
      <section id="form" className="max-w-xl mx-auto px-6 pb-20">
        <Card padding="none" className="p-8 sm:p-10">
          {step === "form" ? (
            <div>
              <h2 className="font-display font-bold text-2xl sm:text-[1.75rem] text-navy mb-1.5">
                Cuéntanos qué pasa
              </h2>
              <p className="text-sm text-gray-400 mb-7 leading-relaxed">
                Con tu nombre y un número de contacto podemos comunicarnos
                contigo. Comparte lo que quieras, a tu ritmo.
              </p>

              <div className="flex flex-col gap-4.5">
                <Input
                  id="name"
                  label="Nombre completo"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="¿Cómo te llamas?"
                />

                <Input
                  id="contact"
                  label="Número de contacto"
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Tu celular o WhatsApp"
                />

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    ¿Cómo prefieres que te contactemos?
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {CONTACT_METHODS.map((m) => {
                      const active = contactMethod === m.value;
                      return (
                        <Button
                          key={m.value}
                          type="button"
                          size="sm"
                          variant={active ? "primary" : "secondary"}
                          className="rounded-full"
                          aria-pressed={active}
                          onClick={() => setContactMethod(m.value)}
                        >
                          {m.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <Textarea
                  id="situation"
                  label="¿Qué está pasando? (opcional)"
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="Comparte lo que sientas cómodo contarnos..."
                  rows={4}
                />

                <label className="flex gap-2.5 items-start cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-navy cursor-pointer"
                  />
                  <span className="text-[13px] leading-relaxed text-gray-600">
                    Acepto que Comunidad de Fe Sur se comunique conmigo para
                    conversar sobre esto.
                  </span>
                </label>

                {error && (
                  <p role="alert" aria-live="polite" className="text-xs text-red-500">
                    {error}
                  </p>
                )}

                <Button
                  type="button"
                  variant="gold"
                  size="lg"
                  fullWidth
                  loading={submitting}
                  disabled={!canSubmit}
                  onClick={onSubmit}
                  className="mt-1.5 py-4 text-base"
                >
                  Enviar y que me contacten
                </Button>
              </div>

              <div className="mt-7 px-4.5 py-4 rounded-2xl bg-navy/5 border border-navy/10">
                <p className="mb-1.5 text-xs font-bold text-navy uppercase tracking-wide">
                  Si es una emergencia ahora mismo
                </p>
                <p className="text-[13.5px] leading-relaxed text-gray-600">
                  Llama al <strong className="text-navy">911</strong> (ECU
                  911) o a la línea de salud mental del MSP:{" "}
                  <strong className="text-navy">171, opción 6</strong>. No
                  esperes a este formulario.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center animate-fade-in-up">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gold/15 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-gold" strokeWidth={2} />
              </div>
              <h2 className="font-display font-bold text-xl text-navy mb-3.5">
                Gracias por confiar en nosotros{nameGreeting}
              </h2>
              <p className="text-base leading-relaxed text-gray-800 mb-6 italic">
                &ldquo;{encouragement}&rdquo;
              </p>
              <p className="text-sm leading-relaxed text-gray-500 mb-7">
                Alguien de nuestro equipo se comunicará contigo por{" "}
                {contactMethodLabel} en los próximos días. Mientras tanto,
                aquí tienes más formas de acompañarte:
              </p>

              <div className="flex flex-col gap-2.5 text-left mb-7">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer flex items-center gap-2.5 px-4 py-3.5 rounded-xl bg-navy/5 hover:bg-navy/10 no-underline text-navy text-sm font-semibold transition-colors duration-150"
                >
                  <Camera className="w-4 h-4" strokeWidth={2} />
                  Síguenos en Instagram
                </a>
                <a
                  href="#form"
                  onClick={(e) => {
                    e.preventDefault();
                    setStep("form");
                  }}
                  className="cursor-pointer flex items-center gap-2.5 px-4 py-3.5 rounded-xl bg-navy/5 hover:bg-navy/10 no-underline text-navy text-sm font-semibold transition-colors duration-150"
                >
                  <Users className="w-4 h-4" strokeWidth={2} />
                  Únete a nuestros servicios
                </a>
              </div>

              <div className="px-4.5 py-4 rounded-2xl bg-navy/5 border border-navy/10 text-left">
                <p className="mb-1.5 text-xs font-bold text-navy uppercase tracking-wide">
                  Recuerda
                </p>
                <p className="text-[13.5px] leading-relaxed text-gray-600">
                  Si en algún momento sientes que es urgente, llama al{" "}
                  <strong className="text-navy">911</strong> o a la línea{" "}
                  <strong className="text-navy">171, opción 6</strong>.
                </p>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 text-center bg-navy-gradient">
        <p className="font-display font-semibold text-sm text-white mb-3">
          Comunidad de Fe Sur
        </p>
        <div className="flex flex-col items-center gap-1.5 text-[13px] leading-relaxed text-white/55">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            Cusubamba S 26-228 OE5 C y Chilla, Sector Santa Rita — Quito,
            Ecuador
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            262-0599 / 262-1087 / 2626-471
          </span>
          <a
            href="mailto:cdfesur@hotmail.com"
            className="cursor-pointer flex items-center gap-1.5 text-white/70 hover:text-gold transition-colors duration-150"
          >
            <Mail className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            cdfesur@hotmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}
