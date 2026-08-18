// ── Transposition ──────────────────────────────────────────────
const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const ENHARMONICS: Record<string, string> = {
  Db: "C#", Eb: "D#", Fb: "E", Gb: "F#", Ab: "G#", Bb: "A#", Cb: "B",
};

const CHORD_TOKEN = /^[A-G](#|b)?(maj|min|m|sus|dim|aug|add)?[0-9]*(\/[A-G](#|b)?)?$/;

export function transposeChord(chord: string, semitones: number): string {
  const match = chord.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return chord;
  const [, root, suffix] = match;
  const normalized = ENHARMONICS[root] ?? root;
  const idx = CHROMATIC.indexOf(normalized);
  if (idx === -1) return chord;
  return CHROMATIC[((idx + semitones) % 12 + 12) % 12] + suffix;
}

/** Transpone únicamente los tokens que parecen acordes, preservando los espacios de alineación. */
function transposeChordLine(line: string, semitones: number): string {
  if (semitones === 0) return line;
  return line.replace(/\S+/g, tok => (CHORD_TOKEN.test(tok) ? transposeChord(tok, semitones) : tok));
}

function isChordLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  return tokens.length > 0 && tokens.every(t => CHORD_TOKEN.test(t));
}

// ── Directivas tipo {title: ...} / {start_of_chorus} ─────────────
const SECTION_LABELS: Record<string, string> = {
  chorus: "Coro", start_of_chorus: "Coro",
  verse: "Verso", start_of_verse: "Verso",
  bridge: "Puente", start_of_bridge: "Puente",
  tag: "Tag", start_of_tag: "Tag",
  intro: "Intro", start_of_intro: "Intro",
  outro: "Final", start_of_outro: "Final",
};

const COMMENT_DIRECTIVES = new Set(["comment", "c", "comment_italic", "ci", "comment_box", "cb"]);

function parseDirective(line: string): { kind: "section"; label: string } | { kind: "skip" } {
  const inner = line.slice(1, -1).trim();
  const colonIdx = inner.indexOf(":");
  const name = (colonIdx === -1 ? inner : inner.slice(0, colonIdx)).trim().toLowerCase();
  const value = colonIdx === -1 ? "" : inner.slice(colonIdx + 1).trim();

  // {comment: Verso 1} — el texto libre se usa tal cual como etiqueta de sección
  if (COMMENT_DIRECTIVES.has(name)) {
    return value ? { kind: "section", label: value } : { kind: "skip" };
  }
  // {start_of_verse: Verso 1} — si trae texto propio, se prefiere sobre la etiqueta genérica
  if (SECTION_LABELS[name]) return { kind: "section", label: value || SECTION_LABELS[name] };
  return { kind: "skip" }; // end_of_*, title/artist/key/tempo, etc. — ya se muestran en el encabezado
}

// ── Formato inline [Am]lyric (legado) ────────────────────────────
export interface Segment {
  chord: string | null;
  lyric: string;
}

function parseInlineChords(line: string, semitones: number): Segment[] {
  const parts = line.split(/(\[[^\]]+\])/);
  const segments: Segment[] = [];
  if (parts[0]) segments.push({ chord: null, lyric: parts[0] });
  for (let i = 1; i < parts.length; i += 2) {
    const rawChord = parts[i].slice(1, -1);
    segments.push({
      chord: semitones !== 0 ? transposeChord(rawChord, semitones) : rawChord,
      lyric: parts[i + 1] ?? "",
    });
  }
  return segments;
}

// ── Tipos de línea resultantes ────────────────────────────────────
export type ParsedLine =
  | { type: "section"; label: string }
  | { type: "empty" }
  | { type: "pair"; chordLine: string; lyricLine: string } // acordes arriba, letra abajo (alineados)
  | { type: "chordline"; text: string } // línea de acordes sin letra debajo
  | { type: "inline"; segments: Segment[] } // formato [Am]letra
  | { type: "plain"; text: string }; // letra normal, sin acordes

export function buildLines(lyrics: string, semitones: number): ParsedLine[] {
  const raw = lyrics.split("\n");
  const result: ParsedLine[] = [];

  for (let i = 0; i < raw.length; i++) {
    const line = raw[i];

    if (line.trim() === "") {
      result.push({ type: "empty" });
      continue;
    }

    if (/^\{.*\}$/.test(line.trim())) {
      const parsed = parseDirective(line.trim());
      if (parsed.kind === "section") result.push({ type: "section", label: parsed.label });
      continue; // skip: no agrega línea
    }

    if (line.startsWith("#")) {
      result.push({ type: "section", label: line.replace(/^#+\s*/, "") });
      continue;
    }

    if (line.includes("[")) {
      result.push({ type: "inline", segments: parseInlineChords(line, semitones) });
      continue;
    }

    if (isChordLine(line)) {
      const nextLine = raw[i + 1];
      const nextIsLyric =
        nextLine !== undefined &&
        nextLine.trim() !== "" &&
        !/^\{.*\}$/.test(nextLine.trim()) &&
        !nextLine.startsWith("#") &&
        !isChordLine(nextLine);

      if (nextIsLyric) {
        result.push({
          type: "pair",
          chordLine: transposeChordLine(line, semitones),
          lyricLine: nextLine,
        });
        i++; // consume la línea de letra ya usada
      } else {
        result.push({ type: "chordline", text: transposeChordLine(line, semitones) });
      }
      continue;
    }

    result.push({ type: "plain", text: line });
  }

  return result;
}
