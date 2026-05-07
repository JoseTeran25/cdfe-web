"use client";

import { useMemo } from "react";
import { ChevronUp, ChevronDown, RotateCcw } from "lucide-react";

// ── Transposition ──────────────────────────────────────────────
const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const ENHARMONICS: Record<string, string> = {
  Db: "C#", Eb: "D#", Fb: "E", Gb: "F#", Ab: "G#", Bb: "A#", Cb: "B",
};

function transposeChord(chord: string, semitones: number): string {
  const match = chord.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return chord;
  const [, root, suffix] = match;
  const normalized = ENHARMONICS[root] ?? root;
  const idx = CHROMATIC.indexOf(normalized);
  if (idx === -1) return chord;
  return CHROMATIC[((idx + semitones) % 12 + 12) % 12] + suffix;
}

// ── ChordPro parser ────────────────────────────────────────────
interface Segment {
  chord: string | null;
  lyric: string;
}

function parseLine(line: string): Segment[] {
  if (!line.includes("[")) return [{ chord: null, lyric: line }];

  // split keeps the separators: ["", "[Am]", "Amazing ", "[G]", "grace"]
  const parts = line.split(/(\[[^\]]+\])/);
  const segments: Segment[] = [];

  if (parts[0]) segments.push({ chord: null, lyric: parts[0] });

  for (let i = 1; i < parts.length; i += 2) {
    segments.push({
      chord: parts[i].slice(1, -1),
      lyric: parts[i + 1] ?? "",
    });
  }
  return segments;
}

// ── Parsed line types ──────────────────────────────────────────
type ParsedLine =
  | { type: "header"; text: string }
  | { type: "empty" }
  | { type: "lyric"; segments: Segment[]; hasChords: boolean };

function buildLines(lyrics: string, semitones: number): ParsedLine[] {
  return lyrics.split("\n").map((raw): ParsedLine => {
    if (raw.startsWith("#")) return { type: "header", text: raw.replace(/^#+\s*/, "") };
    if (raw.trim() === "") return { type: "empty" };

    const segments = parseLine(raw).map(seg => ({
      ...seg,
      chord: seg.chord && semitones !== 0 ? transposeChord(seg.chord, semitones) : seg.chord,
    }));
    return { type: "lyric", segments, hasChords: segments.some(s => s.chord !== null) };
  });
}

// ── Props ──────────────────────────────────────────────────────
interface Props {
  lyrics: string;
  originalKey: string;
  semitones: number;
  onSemitonesChange: (s: number) => void;
}

export function ChordViewer({ lyrics, originalKey, semitones, onSemitonesChange }: Props) {
  const lines = useMemo(() => buildLines(lyrics, semitones), [lyrics, semitones]);
  const currentKey = semitones !== 0 ? transposeChord(originalKey, semitones) : originalKey;

  return (
    <div className="space-y-5">
      {/* Transpose bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Tono
        </span>
        <div className="flex items-center gap-1 bg-surface border border-surface-border rounded-xl p-0.5">
          <button
            onClick={() => onSemitonesChange(semitones - 1)}
            className="p-1.5 rounded-lg hover:bg-white hover:shadow-card text-gray-500 hover:text-navy transition-all"
            aria-label="Bajar semitono"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <span className="min-w-[3rem] text-center font-display font-bold text-navy text-sm px-2">
            {currentKey}
          </span>
          <button
            onClick={() => onSemitonesChange(semitones + 1)}
            className="p-1.5 rounded-lg hover:bg-white hover:shadow-card text-gray-500 hover:text-navy transition-all"
            aria-label="Subir semitono"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
        {semitones !== 0 && (
          <button
            onClick={() => onSemitonesChange(0)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-navy transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Restablecer ({originalKey})
          </button>
        )}
        {semitones !== 0 && (
          <span className="text-xs text-gray-400">
            {semitones > 0 ? `+${semitones}` : semitones} semitono{Math.abs(semitones) !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Lyrics + chords */}
      <div className="bg-surface rounded-2xl border border-surface-border p-5 sm:p-6 overflow-x-auto">
        <div className="font-mono text-sm min-w-max">
          {lines.map((line, i) => {
            if (line.type === "header") {
              return (
                <p
                  key={i}
                  className="font-display font-bold text-navy/50 text-[11px] uppercase tracking-widest mt-7 first:mt-0 mb-2 select-none"
                >
                  {line.text}
                </p>
              );
            }

            if (line.type === "empty") {
              return <div key={i} className="h-5" />;
            }

            return (
              <div key={i} className="flex flex-wrap mb-0.5 leading-none">
                {line.segments.map((seg, j) => (
                  <span key={j} className="inline-flex flex-col">
                    {/* Chord row — always reserve height even when null */}
                    <span
                      className={
                        "font-bold text-[11px] leading-tight pr-1 whitespace-pre " +
                        (seg.chord ? "text-navy" : "")
                      }
                    >
                      {/* non-breaking space keeps the row height consistent */}
                      {seg.chord ?? " "}
                    </span>
                    {/* Lyric row */}
                    <span className="text-gray-800 text-sm leading-relaxed whitespace-pre pr-0.5">
                      {seg.lyric || " "}
                    </span>
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
