import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "No estás solo",
  description:
    "¿Necesitas un abrazo? Cuéntanos qué está pasando. Alguien de Comunidad de Fe Sur quiere escucharte y acompañarte.",
};

export default function NoEstasSoloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
