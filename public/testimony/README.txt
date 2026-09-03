Deposer ici les deux temoignages video : 01.mp4 et 02.mp4

La section « In their own words » de /coaching n'apparait QUE si au moins un de
ces deux fichiers existe. Tant qu'ils ne sont pas la, rien ne s'affiche — pas
de cadre vide, pas de titre orphelin.

Format : mp4 (H.264 + AAC), lu par tous les navigateurs sans plugin.
Poids : viser moins de 8 Mo par video. Au-dela, un visiteur sur telephone
attend, et personne n'attend pour un temoignage.

Avant de deposer : verifier que la personne a accepte PAR ECRIT d'etre vue
publiquement. La page Practitioner promet que personne n'est nomme sauf s'il
demande lui-meme a parler. Cette exception est la leur, pas la notre.

Note technique : tant que les fichiers ne sont pas la, /coaching emet deux
requetes HEAD qui repondent 404. C'est la sonde qui decide d'afficher ou non la
section — le meme procede qu'AssetFrame utilise pour les images. Ces 404
disparaissent des que les videos sont deposees. On a prefere ca a un fichier
manifeste a tenir a jour a la main : deposer une video doit suffire.

Pour publier un temoignage : deposer le fichier ici (par ex. 01.mp4) puis
ecrire son nom dans index.json — ["01.mp4"]. Tant que index.json est vide,
la section ne s'affiche pas et aucune requete n'echoue.
