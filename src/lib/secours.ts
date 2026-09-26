// Les ressources de crise. Ecrites en dur, verifiees, et JAMAIS generees.
//
// Elles vivent dans leur propre fichier pour une raison precise : la page les
// affiche, donc le fichier qui les contient part dans le navigateur. Les
// consignes de l'assistant, elles, restent cote serveur — un visiteur qui lit
// les regles de l'entretien est un visiteur qui peut les contourner.
//
// Samaritans : 116 123, gratuit depuis n'importe quel telephone au Royaume-Uni,
// 24 heures sur 24, tous les jours de l'annee.
// NHS 111 : option 2 pour une urgence de sante mentale.
// 999 : urgence, quand quelqu'un est en danger maintenant.
//
// Si l'un de ces numeros change, il change ICI, et nulle part ailleurs.
export const SECOURS = [
  { quoi: "Samaritans", numero: "116 123", note: "Free, day or night, any day of the year." },
  { quoi: "NHS 111", numero: "111, then option 2", note: "For urgent mental health help." },
  { quoi: "Emergency", numero: "999", note: "If someone is in danger now." },
] as const;
