// Ce que les deux routes de l'entretien partagent.
//
// Il vit ici et pas dans un `route.ts` parce qu'un fichier de route App Router
// n'admet que les verbes HTTP et ses propres constantes de configuration :
// exporter un utilitaire depuis une route casse la verification de types du
// build. Et parce que la route de la question et celle du dossier doivent lire
// un corps de requete de la MEME facon, sinon la transcription que Kilian
// recoit n'est pas celle que le modele a lue.

import { TOURS_MAX, LIMITE_REPONSE, LIMITE_TOTALE, type Echange } from "@/lib/entretien";

export function adresse(request: Request): string {
  const avance = request.headers.get("x-forwarded-for");
  return (avance ? avance.split(",")[0] : "").trim() || "inconnu";
}

// Le corps recu est du texte venu d'un navigateur : on ne lui fait confiance ni
// sur la forme, ni sur la longueur.
export function lisTours(brut: unknown): Echange[] {
  if (!Array.isArray(brut)) return [];
  const out: Echange[] = [];
  let total = 0;
  for (const t of brut.slice(0, TOURS_MAX + 4)) {
    if (!t || typeof t !== "object") continue;
    const o = t as Record<string, unknown>;
    const question = typeof o.question === "string" ? o.question.trim().slice(0, 400) : "";
    const reponse = typeof o.reponse === "string" ? o.reponse.trim().slice(0, LIMITE_REPONSE) : "";
    if (!question) continue;
    total += question.length + reponse.length;
    if (total > LIMITE_TOTALE) break;
    out.push({ question, reponse });
  }
  return out;
}

// Un frein, pas une serrure. En serverless la memoire est par instance, donc ce
// compteur ne voit qu'une part du trafic — il suffit a arreter une boucle ou un
// script maladroit, et c'est ce qu'on lui demande. Le vrai plafond est ailleurs :
// TOURS_MAX et LIMITE_TOTALE bornent chaque entretien.
const FENETRE_MS = 60 * 60 * 1000;
const compteurs = new Map<string, { n: number; debut: number }>();

export function tropDAppels(ip: string, plafond: number): boolean {
  const maintenant = Date.now();
  const cle = `${plafond}:${ip}`;
  const c = compteurs.get(cle);
  if (!c || maintenant - c.debut > FENETRE_MS) {
    compteurs.set(cle, { n: 1, debut: maintenant });
    // On purge en passant : sans ca la Map grandit tant que l'instance vit.
    if (compteurs.size > 5000) {
      for (const [k, v] of compteurs) if (maintenant - v.debut > FENETRE_MS) compteurs.delete(k);
    }
    return false;
  }
  c.n += 1;
  return c.n > plafond;
}
