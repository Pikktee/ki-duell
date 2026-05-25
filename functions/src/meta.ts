import { onCall } from "firebase-functions/v2/https";
import { tiersOverview } from "./config/tiers";

// Liefert die Stufen samt verwendeter Modelle + lehrreicher Beschreibung.
// Für die Stufen-Auswahl im Spiel (Lerneffekt). Kein Login nötig.
export const getTiers = onCall({ timeoutSeconds: 15 }, async () => {
  return { tiers: tiersOverview() };
});
