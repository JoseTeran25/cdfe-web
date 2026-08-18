"use client";

interface Props {
  videoId: string;
  title: string;
}

/** Reproductor de YouTube compacto — no ocupa todo el ancho de la tarjeta. */
export function YoutubeEmbed({ videoId, title }: Props) {
  return (
    <div className="w-full max-w-[320px] aspect-video rounded-xl overflow-hidden bg-navy-950">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
