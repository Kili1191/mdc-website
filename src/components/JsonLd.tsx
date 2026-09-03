// Le porteur des donnees structurees.
//
// Un composant serveur : le script est dans le HTML rendu, donc lisible par un
// crawler qui n'execute pas de JavaScript. C'est le meme raisonnement que
// SeoNav — ce qui compte pour le referencement ne doit jamais dependre de
// l'hydratation, ni du WebGL.
//
// `JSON.stringify` echappe le contenu ; les donnees viennent de src/lib/jsonld.ts
// et ne contiennent aucune saisie utilisateur.

export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
