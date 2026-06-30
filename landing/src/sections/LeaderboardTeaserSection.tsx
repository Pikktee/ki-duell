import { useState } from "react";
import { Crown, Medal, Trophy } from "lucide-react";
import { clsx } from "clsx";
import { GlassPanel } from "../components/GlassPanel";
import { SectionLabel } from "../components/SectionLabel";
import { GAME_URL } from "../lib/constants";

interface Row {
  rank: number;
  player: string;
  score: number;
  hits: string;
  time: string;
}

const ROWS_TODAY: Row[] = [
  { rank: 1, player: "Anonym", score: 900, hits: "6/6", time: "0:42" },
  { rank: 2, player: "Henrik", score: 800, hits: "5/6", time: "1:01" },
  { rank: 3, player: "Plasma Mus", score: 700, hits: "5/6", time: "1:23" },
  { rank: 4, player: "Galerist", score: 600, hits: "4/6", time: "2:14" },
  { rank: 5, player: "Anonym", score: 500, hits: "4/6", time: "3:08" },
];
const ROWS_TOTAL: Row[] = [
  { rank: 1, player: "Curator_77", score: 12400, hits: "84/108", time: "—" },
  { rank: 2, player: "Henrik", score: 11200, hits: "76/108", time: "—" },
  { rank: 3, player: "Plasma Mus", score: 9800, hits: "68/108", time: "—" },
  { rank: 4, player: "Sammlerin", score: 8400, hits: "60/108", time: "—" },
  { rank: 5, player: "Atelier_K", score: 7200, hits: "54/108", time: "—" },
];

export function LeaderboardTeaserSection() {
  const [mode, setMode] = useState<"heute" | "gesamt">("heute");
  const rows = mode === "heute" ? ROWS_TODAY : ROWS_TOTAL;

  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <SectionLabel>Ranglisten</SectionLabel>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyber-light tracking-tight">
            Wer erkennt die KI am besten?
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-base sm:text-lg text-cyber-light/60 leading-relaxed">
            Tägliche Rangliste pro Stufe — global, wenn du eingeloggt bist.
          </p>
        </div>

        <div className="mt-10 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setMode("heute")}
            className={clsx(
              "px-5 py-2 font-mono text-[10px] font-bold tracking-[0.2em] uppercase border transition-all",
              mode === "heute"
                ? "bg-neon-cyan text-cyber-dark border-neon-cyan shadow-[0_0_18px_rgba(0,255,156,0.3)]"
                : "border-cyber-light/20 text-cyber-light/70 hover:border-neon-cyan/60 hover:text-neon-cyan",
            )}
          >
            Heute
          </button>
          <button
            type="button"
            onClick={() => setMode("gesamt")}
            className={clsx(
              "px-5 py-2 font-mono text-[10px] font-bold tracking-[0.2em] uppercase border transition-all",
              mode === "gesamt"
                ? "bg-neon-cyan text-cyber-dark border-neon-cyan shadow-[0_0_18px_rgba(0,255,156,0.3)]"
                : "border-cyber-light/20 text-cyber-light/70 hover:border-neon-cyan/60 hover:text-neon-cyan",
            )}
          >
            Gesamt
          </button>
        </div>

        <GlassPanel className="mt-8 px-0 sm:px-2 py-2">
          <table className="w-full font-mono text-xs sm:text-sm">
            <thead>
              <tr className="text-cyber-light/50 uppercase tracking-[0.2em] text-[10px]">
                <th className="text-left py-3 pl-4 pr-2 sm:pl-6 w-16">Rang</th>
                <th className="text-left py-3 px-2">Spieler</th>
                <th className="text-right py-3 px-2">Punkte</th>
                <th className="text-right py-3 px-2 hidden sm:table-cell">Treffer</th>
                <th className="text-right py-3 px-4 sm:pr-6">Zeit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.rank} className="border-t border-cyber-light/5">
                  <td className="py-3 pl-4 sm:pl-6 pr-2">
                    <span className="inline-flex items-center gap-2">
                      <RankIcon rank={r.rank} />
                      <span className={clsx(r.rank <= 3 ? "text-neon-cyan" : "text-cyber-light/60")}>
                        {r.rank}.
                      </span>
                    </span>
                  </td>
                  <td className="py-3 px-2 text-cyber-light">{r.player}</td>
                  <td className="py-3 px-2 text-right text-neon-cyan font-bold">{r.score}</td>
                  <td className="py-3 px-2 text-right text-cyber-light/60 hidden sm:table-cell">{r.hits}</td>
                  <td className="py-3 px-4 sm:pr-6 text-right text-cyber-light/60">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>

        <div className="mt-6 text-center">
          <a
            href={GAME_URL}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-neon-cyan/70 hover:text-neon-cyan underline decoration-neon-cyan/40 hover:decoration-neon-cyan underline-offset-4 transition-colors"
          >
            <Trophy className="w-4 h-4" strokeWidth={1.5} />
            Zur vollen Rangliste
          </a>
        </div>
      </div>
    </section>
  );
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-4 h-4 text-neon-cyan" strokeWidth={1.75} />;
  if (rank === 2) return <Medal className="w-4 h-4 text-cyber-light/80" strokeWidth={1.75} />;
  if (rank === 3) return <Medal className="w-4 h-4 text-neon-amber" strokeWidth={1.75} />;
  return <span className="w-4 inline-block" aria-hidden="true" />;
}
