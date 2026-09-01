import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /lineage a existe. C'etait une page entiere consacree a expliquer ce que la
  // maison ne dirait pas — de qui Kilian tient son travail. Retiree : expliquer
  // longuement ce qu'on tait attire l'attention sur le fait qu'on cache, et
  // produit de la mefiance la ou on cherchait de la confiance. Ce qui doit se
  // dire se dit en conversation, un a un.
  //
  // La redirection reste, parce que l'adresse a pu etre partagee ou indexee.
  async redirects() {
    return [{ source: "/lineage", destination: "/practitioner", permanent: true }];
  },
};

export default nextConfig;
