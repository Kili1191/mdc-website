"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { hasWebGL } from "@/lib/webgl";
import { houseFocus } from "@/lib/houseFocus";
import { stillness, breath } from "@/lib/stillness";
import { traverse } from "@/lib/traverse";
import { DURATION, EASE } from "@/lib/motion";

// Marbre + motif révélé au curseur, en fond fixe.
// Version allégée d'AlbatreHero : pas de scroll panels, pas de CTA, un seul motif.
// `calme={true}` réduit l'intensité de la révélation pour les pages de contenu
// (VISION §1 : marbre calme/apaisé sur les pages internes, lisibilité du texte).
export default function MarbleBackground({
  motif = "/motif-compo.jpg",
  calme = false,
}: { motif?: string; calme?: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    if (!hasWebGL()) { setWebgl(false); return; }
    const mount = mountRef.current;
    if (!mount) return;
    const W = () => mount.clientWidth;
    const H = () => mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    // Le noir est hors charte. Trois.js efface en noir par defaut : sur la
    // moindre frame rendue avant que le shader n'ait de quoi peindre, l'ecran
    // partirait au noir.
    renderer.setClearColor(0xEDE4D0, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.domElement.style.display = "block";
    // Invisible tant que les textures ne sont pas la. Le div parent porte deja
    // le parchemin : on voit donc du parchemin, puis le marbre s'y fond.
    renderer.domElement.style.opacity = "0";
    renderer.domElement.style.transition = `opacity ${DURATION.reveal}ms ${EASE.reveal}`;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const rtOpts = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
    let rtA = new THREE.WebGLRenderTarget(W(), H(), rtOpts);
    let rtB = new THREE.WebGLRenderTarget(W(), H(), rtOpts);
    const trailScene = new THREE.Scene();
    const trailCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const trailMat = new THREE.ShaderMaterial({
      uniforms: {
        uPrev: { value: null }, uMouse: { value: new THREE.Vector2(-10, -10) },
        uVel: { value: 0 }, uAspect: { value: W() / H() },
        uDecay: { value: 0.93 }, uRadius: { value: 0.29 }, uActive: { value: 1 },
        uRes: { value: new THREE.Vector2(W(), H()) }, uSpread: { value: 1.0 },
        uTrailTime: { value: 0 },
      },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position,1.0);}`,
      fragmentShader: `
        uniform sampler2D uPrev; uniform vec2 uMouse, uRes;
        uniform float uVel,uAspect,uDecay,uRadius,uActive,uSpread,uTrailTime;
        varying vec2 vUv;

        // Brique 2 : bords organiques via domain warping (value noise).
        // Le rayon reste verrouillé (uRadius 0.29), seule la position samplée
        // est perturbée par un bruit basse fréquence — la révélation acquiert
        // des contours mous et vivants au lieu d'un cercle net.
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
        float vnoise(vec2 p){
          vec2 i = floor(p); vec2 f = fract(p);
          vec2 u = f*f*(3.0-2.0*f);
          return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
                     mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
        }

        void main(){
          vec2 px = 1.0 / uRes;
          float c  = texture2D(uPrev, vUv).r;
          float n  = texture2D(uPrev, vUv + vec2(0.0,  px.y)).r;
          float s  = texture2D(uPrev, vUv + vec2(0.0, -px.y)).r;
          float e  = texture2D(uPrev, vUv + vec2( px.x, 0.0)).r;
          float w  = texture2D(uPrev, vUv + vec2(-px.x, 0.0)).r;
          float diffused = (c + n + s + e + w) / 5.0;
          float prev = mix(c, diffused, uSpread) * uDecay;
          vec2 d = vUv - uMouse; d.x *= uAspect;

          // domain warp — deux samples décalés du même champ noise
          vec2 wp = d * 6.0 + uTrailTime * 0.12;
          vec2 warp = vec2(vnoise(wp), vnoise(wp + vec2(17.3, 41.7))) - 0.5;
          vec2 dOrg = d + warp * 0.055;

          float stamp = uActive * smoothstep(uRadius, 0.0, length(dOrg)) * (0.6 + uVel*2.5);
          gl_FragColor = vec4(vec3(clamp(max(prev,stamp),0.0,1.0)),1.0);
        }`,
    });
    trailScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), trailMat));

    const loader = new THREE.TextureLoader();

    // TextureLoader.load rend la texture AVANT que l'image existe, et
    // echantillonner une texture incomplete donne du noir opaque. Le shader
    // final calculait donc mix(noir, noir) tant que les deux jpg n'etaient pas
    // telecharges : ecran noir a chaque ouverture et a chaque rafraichissement,
    // d'autant plus long que les fichiers etaient lourds.
    let pending = 2;                       // le voile et le motif portent la couleur
    const reveal = () => {
      if (--pending > 0) return;
      requestAnimationFrame(() => { renderer.domElement.style.opacity = "1"; });
    };

    // La camera se deplace sur la dalle a chaque changement de page : elle
    // sort donc du cadre de la texture. En ClampToEdge, la ligne de pixels du
    // bord s'etirait en trainee — le contraire de la pierre. En miroir, le
    // veinage se prolonge sans couture : la dalle parait simplement plus
    // grande que l'ecran, ce qui est exactement ce qu'on raconte.
    const load = (p: string, counts = false, wrap: THREE.Wrapping = THREE.ClampToEdgeWrapping) => {
      const t = loader.load(p, () => { onResize(); if (counts) reveal(); });
      t.wrapS = wrap; t.wrapT = wrap;
      return t;
    };
    const texMotif = load(motif, true, THREE.MirroredRepeatWrapping);
    const texVeil = load("/albatre-lisse.jpg", true, THREE.MirroredRepeatWrapping);
    // Le logo sert de burin : son alpha est le trace de l'incision.
    const texHouse = load("/logo.png");

    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const finalMat = new THREE.ShaderMaterial({
      uniforms: {
        uMotif: { value: texMotif }, uVeil: { value: texVeil }, uTrail: { value: null }, uTime: { value: 0 },
        uScreenRes: { value: new THREE.Vector2(W(), H()) },
        uRes: { value: new THREE.Vector2(2752, 1536) }, uZoom: { value: 1.0 },
        uReflet: { value: 0.05 }, uIrisation: { value: 0.09 },
        uHouseCenter: { value: new THREE.Vector2(0.5, 0.80) },
        uHouseInner: { value: 0.11 },
        uHouseOuter: { value: 0.24 },
        uEffectScale: { value: calme ? 0.35 : 1.0 },
        uHouseTex: { value: texHouse },
        uHouseAspect: { value: 574.0 / 480.0 },
        uHouseHalfH: { value: 0.17 },   // demi-hauteur, en fraction d'ecran
        uCarve: { value: 0.0 },         // 0 pierre intacte, 1 gravure achevee
        uPresence: { value: 0.0 },      // visibilite de la gravure
        uStill: { value: 0.0 },         // 0 on bouge, 1 on s'est arrete
        uBreath: { value: 0.0 },        // horloge de souffle partagee
        uPan: { value: new THREE.Vector2(0, 0) },    // ou l'on est sur la dalle
        uSmear: { value: new THREE.Vector2(0, 0) },  // vitesse de la camera
      },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position,1.0);}`,
      fragmentShader: `
        precision highp float;
        uniform sampler2D uMotif,uVeil,uTrail;
        uniform float uZoom,uTime,uReflet,uIrisation,uEffectScale;
        uniform vec2 uScreenRes,uRes;
        uniform vec2 uHouseCenter;
        uniform float uHouseInner,uHouseOuter;
        uniform sampler2D uHouseTex;
        uniform float uHouseAspect,uHouseHalfH,uCarve;
        uniform float uStill,uBreath,uPresence;
        uniform vec2 uPan,uSmear;
        varying vec2 vUv;

        // Le trace du burin, en espace ecran. Rien n'est dessine PAR-DESSUS
        // le marbre : on modifie la pierre elle-meme, donc le veinage et la
        // lumiere continuent a l'interieur du sillon.
        vec2 houseUV(){
          vec2 sc = vUv - 0.5;
          sc.x *= uScreenRes.x / uScreenRes.y;
          sc /= uHouseHalfH * 2.0;
          sc.x /= uHouseAspect;
          return sc + 0.5;
        }

        // Le sillon s'ouvre du faite vers le sol au fil du scroll : le burin
        // descend, il n'apparait pas d'un bloc.
        float chisel(vec2 h){
          if (h.x < 0.0 || h.x > 1.0 || h.y < 0.0 || h.y > 1.0) return 0.0;
          float ink = texture2D(uHouseTex, h).a;
          // d : distance le long du trace, 0 au faite, 1 au sol.
          // Un point est grave des que le burin l'a depasse.
          float d = 1.0 - h.y;
          float sweep = smoothstep(d - 0.14, d + 0.02, uCarve * 1.18);
          return ink * sweep;
        }

        vec2 coverUV(vec2 uv){
          float sa=uScreenRes.x/uScreenRes.y, ia=uRes.x/uRes.y; vec2 o=uv;
          if(sa>ia){float s=ia/sa; o.y=(o.y-0.5)*s+0.5;} else {float s=sa/ia; o.x=(o.x-0.5)*s+0.5;}
          o=(o-0.5)/uZoom+0.5;
          // La dalle ne bouge pas, la camera si. Chaque page a sa coordonnee.
          return o + uPan;
        }

        void main(){
          vec2 uv = coverUV(vUv);
          float reveal = texture2D(uTrail, vUv).r;
          float r = smoothstep(0.0, 0.85, reveal);

          vec2 hd = uv - uHouseCenter;
          hd.x *= uRes.x / uRes.y;
          float houseMask = smoothstep(uHouseInner, uHouseOuter, length(hd));
          r *= uEffectScale;

          // L'immobilite ouvre la pierre d'elle-meme. Le curseur n'est plus la
          // seule facon de voir le motif : rester tranquille suffit, et la
          // revelation respire au lieu de suivre la souris.
          // Le motif porte deja une maison gravee en haut au centre. Pendant
          // la station MAISON, la laisser remonter mettrait deux maisons a
          // l'ecran : la gravure du site et celle de la pierre. On retient
          // donc l'ouverture la ou le burin travaille.
          float calm = uStill * (0.58 + 0.42 * uBreath) * (1.0 - uPresence * 0.80);
          r = max(r, calm * 0.38 * uEffectScale);

          vec2 flow = vec2(sin(uv.y*16.0+uTime*1.3), cos(uv.x*16.0+uTime*1.1))*0.004*r*houseMask;
          vec2 uvMotif = uv + flow;

          // Pendant une traversee, le veinage file dans l'axe du deplacement.
          // Trois prises le long du trajet reel de la camera, ponderees par sa
          // vitesse : le file naît et meurt avec le mouvement, il n'a pas de
          // courbe a lui. Au repos uSmear vaut zero et les trois prises se
          // confondent — donc aucun cout perceptible hors trajet.
          vec2 sm = uSmear * 9.0;
          vec3 veil  = texture2D(uVeil,  uv).rgb;
          vec3 motifCol = (
            texture2D(uMotif, uvMotif).rgb * 0.50 +
            texture2D(uMotif, uvMotif - sm).rgb * 0.28 +
            texture2D(uMotif, uvMotif + sm * 0.6).rgb * 0.22
          );
          vec3 col = mix(veil, motifCol, r);

          vec3 warmLight = vec3(0.98, 0.92, 0.78);
          col += warmLight * r * uReflet;
          col += warmLight * calm * 0.040;

          vec3 sheen = vec3(
            0.5 + 0.5*sin(uv.x*12.0 + uTime*1.5),
            0.5 + 0.5*sin(uv.y*12.0 + uTime*1.2 + 2.0),
            0.5 + 0.5*sin((uv.x+uv.y)*12.0 + uTime + 4.0)
          );
          col += sheen * r * uIrisation;

          // ---- la maison, gravee DANS la pierre ----
          if (uPresence > 0.004) {
            // La gravure respire. Elle ne se contente pas de suivre le scroll :
            // dans la station, elle s'enfonce a l'inspiration et s'allege a
            // l'expiration, sur la meme horloge de 5500 ms que tout le reste.
            //
            // Deux amplitudes, pas une. La pierre elle-meme ne bouge que d'un
            // quart : une geometrie qui palpite trop se voit et devient un
            // effet. La braise au fond du sillon respire deux fois plus fort,
            // parce que c'est une lumiere, et qu'une lumiere a le droit de
            // vaciller la ou la pierre n'a pas le droit de bouger.
            float bStone = 0.76 + 0.24 * uBreath;
            float bEmber = 0.55 + 0.45 * uBreath;
            float pres = uPresence * bStone;

            vec2 h = houseUV();
            float m = chisel(h);
            // pente du sillon : difference du trace sur ses voisins
            float e = 0.0035;
            float dx = chisel(h + vec2(e,0.0)) - chisel(h - vec2(e,0.0));
            float dy = chisel(h + vec2(0.0,e)) - chisel(h - vec2(0.0,e));
            // lumiere rasante venue du haut-gauche, comme partout sur le site
            float lit = dx * -0.62 + dy * 0.78;

            // De l'onyx creme reste creme quand on le creuse. Le sillon est
            // plus profond, pas plus froid.
            //
            // La version precedente SOUSTRAYAIT vec3(0.34,0.24,0.16) pour
            // l'ombre : elle retirait plus de rouge que de bleu, donc elle
            // desaturait la pierre chaude vers un gris argent. Tout passe
            // desormais par des facteurs multiplicatifs qui mordent d'abord
            // dans le bleu : la valeur descend, la teinte reste.
            col *= 1.0 - m * pres * 0.34 * vec3(0.80, 1.00, 1.22);   // creux, chaud
            col *= 1.0 - max(-lit,0.0) * pres * vec3(0.50, 0.68, 0.88);  // ombre du bord
            col += vec3(0.86, 0.70, 0.46) * max(lit,0.0) * pres * 1.05;  // levre ocre
            // Rester immobile devant la maison enfonce le burin et ravive la
            // braise : la pierre repond a l'arret, pas au geste.
            col *= 1.0 - m * calm * pres * 0.16 * vec3(0.80, 1.00, 1.22);
            col += vec3(0.65, 0.35, 0.24) * m * uPresence * bEmber * (0.11 + calm * 0.16); // braise
          }

          float g = fract(sin(dot(vUv*900.0,vec2(12.9898,78.233)))*43758.5453)-0.5;
          col += g*0.010;
          gl_FragColor = vec4(col,1.0);
        }`,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), finalMat));

    // Brique 3 : grain + vignette cinématographique en post-processing plein écran.
    // Grain animé (film), vignette douce qui referme les bords sur le centre.
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, cam));
    const filmPass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(W(), H()) },
        uGrain: { value: 0.028 },
        uVignette: { value: 0.32 },
      },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uTime,uGrain,uVignette;
        uniform vec2 uRes;
        varying vec2 vUv;
        float grainHash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
        void main(){
          vec4 col = texture2D(tDiffuse, vUv);
          // grain animé — se renouvelle chaque frame
          float g = grainHash(vUv * uRes + uTime * 60.0) - 0.5;
          col.rgb += g * uGrain;
          // vignette douce, centrée
          vec2 uv = vUv - 0.5;
          float vig = smoothstep(0.90, 0.30, length(uv));
          col.rgb *= mix(1.0 - uVignette, 1.0, vig);
          gl_FragColor = col;
        }
      `,
    });
    composer.addPass(filmPass);

    const mouse = new THREE.Vector2(-10, -10), target = new THREE.Vector2(-10, -10), last = new THREE.Vector2(-10, -10);
    // Presence du doigt ou du curseur. Sans elle, le tampon de revelation
    // s'applique a chaque frame au dernier point connu : la decroissance du
    // trail (0.93/frame) ne peut jamais gagner, puisque le shader composite en
    // max(prev, stamp). Sur desktop on ne le voyait pas, la souris bouge
    // toujours un peu. Sur mobile, un tap laissait le marbre ouvert pour
    // toujours a l'endroit touche : rien ne disait que le doigt etait parti.
    let active = 1, activeTarget = 1;

    const setFromPoint = (cx: number, cy: number) => {
      const r = renderer.domElement.getBoundingClientRect();
      target.set((cx - r.left) / r.width, 1 - (cy - r.top) / r.height);
    };

    // Pointer events uniquement.
    //
    // La version precedente ecoutait mousemove ET les evenements tactiles, et
    // se faisait battre par l'ordre des evenements du navigateur. Mesure sur
    // un tap mobile :
    //
    //   pointerdown -> touchstart -> pointerup -> touchend -> mousemove -> ...
    //
    // Le mousemove de compatibilite arrive APRES touchend. On eteignait donc
    // la presence au lever du doigt, et le navigateur la rallumait aussitot,
    // pour toujours, puisque plus aucun mousemove ne suivait. Le marbre restait
    // ouvert exactement comme avant la correction.
    //
    // Les pointer events unifient souris et tactile sans ce doublon.
    const onPointer = (e: PointerEvent) => {
      // Un doigt ne compte que s'il touche encore l'ecran. Une souris compte
      // toujours : elle survole sans appuyer.
      if (e.pointerType !== "mouse" && e.buttons === 0 && e.type === "pointermove") return;
      activeTarget = 1;
      setFromPoint(e.clientX, e.clientY);
    };
    const onRelease = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;   // la souris ne se "leve" pas
      activeTarget = 0;
    };
    const onLeave = () => { activeTarget = 0; };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("pointerup", onRelease, { passive: true });
    window.addEventListener("pointercancel", onRelease, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    // Réactivité gyroscope (mobile). La position "curseur virtuel" glisse
    // dans le cadre en fonction de l'inclinaison de l'appareil.
    // beta = incliner avant/arrière (-180..180), gamma = gauche/droite (-90..90)
    const gyro = { has: false, x: 0.5, y: 0.5 };
    let gyroSmoothing = 0.06;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      gyro.has = true;
      const nx = 0.5 + Math.max(-1, Math.min(1, e.gamma / 30)) * 0.5;
      const ny = 0.5 - Math.max(-1, Math.min(1, (e.beta - 45) / 30)) * 0.5;
      gyro.x += (nx - gyro.x) * gyroSmoothing;
      gyro.y += (ny - gyro.y) * gyroSmoothing;
      target.set(gyro.x, gyro.y);
      // L'inclinaison deplace le point, elle ne l'allume pas : sans ca le
      // marbre resterait ouvert en permanence sur un telephone pose a plat.
    };
    // Ne s'active que sur mobile / capteurs présents (iOS demande permission
    // via un geste utilisateur : hors scope MVP, on écoute passivement).
    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", onOrient);
    }

    const clock = new THREE.Clock(); let raf = 0;
    const panOut = { x: 0, y: 0 };
    const smearOut = { x: 0, y: 0 };
    const animate = () => {
      const t = clock.getElapsedTime();
      finalMat.uniforms.uTime.value = t;
      // La gravure suit le scroll dans la station MAISON : plus on descend,
      // plus le burin est descendu.
      finalMat.uniforms.uCarve.value = houseFocus.progress();
      finalMat.uniforms.uPresence.value = houseFocus.presence();
      finalMat.uniforms.uStill.value = stillness.get();
      finalMat.uniforms.uBreath.value = breath();
      // La camera glisse d'une page a l'autre. Une seule lecture par frame :
      // `pan` avance l'horloge de la traversee, `smear` ne fait que la relire.
      traverse.pan(panOut);
      traverse.smear(smearOut);
      finalMat.uniforms.uPan.value.set(panOut.x, panOut.y);
      finalMat.uniforms.uSmear.value.set(smearOut.x, smearOut.y);
      trailMat.uniforms.uTrailTime.value = t;
      filmPass.uniforms.uTime.value = t;
      mouse.lerp(target, 0.65);
      // Fermeture douce : le tampon s'eteint, la decroissance du trail reprend
      // la main et le marbre se recouvre.
      active += (activeTarget - active) * (activeTarget > active ? 0.10 : 0.035);
      trailMat.uniforms.uActive.value = active;

      // Vitesse de recouvrement.
      //
      // uDecay 0,93 fait tomber la revelation a 10% en 0,53 s : le marbre
      // claquait sur l'image au lieu de la reprendre. Mais 0,93 est une des
      // valeurs verrouillees du trail, et c'est elle qui donne son grain au
      // sillage SOUS le doigt. On ne la remplace donc pas, on l'interpole :
      // 0,93 tant qu'un doigt ou un curseur est la, 0,985 des qu'il part.
      //
      // 0,985 rend la fermeture en 2,54 s, soit un demi-souffle. Le marbre
      // revient au rythme du site, il ne se referme pas comme un volet.
      // On suit l'INTENTION (activeTarget), pas la valeur lissee. Branche sur
      // `active`, la decroissance restait rapide juste apres le lever du doigt,
      // c'est-a-dire precisement au moment ou elle devait ralentir : la
      // fermeture durait encore 0,9 s au lieu de 2,5.
      trailMat.uniforms.uDecay.value = activeTarget > 0.5 ? 0.930 : 0.985;
      const vel = mouse.distanceTo(last); last.copy(mouse);
      trailMat.uniforms.uPrev.value = rtA.texture;
      trailMat.uniforms.uMouse.value.copy(mouse);
      trailMat.uniforms.uVel.value = Math.min(vel, 0.05);
      renderer.setRenderTarget(rtB); renderer.render(trailScene, trailCam); renderer.setRenderTarget(null);
      const tmp = rtA; rtA = rtB; rtB = tmp;
      finalMat.uniforms.uTrail.value = rtA.texture;
      composer.render();
      raf = requestAnimationFrame(animate);
    };
    animate();

    function onResize() {
      renderer.setSize(W(), H());
      composer.setSize(W(), H());
      finalMat.uniforms.uScreenRes.value.set(W(), H());
      filmPass.uniforms.uRes.value.set(W(), H());
      trailMat.uniforms.uAspect.value = W() / H();
      trailMat.uniforms.uRes.value.set(W(), H());
      rtA.setSize(W(), H()); rtB.setSize(W(), H());
      if (texMotif.image && texMotif.image.width) {
        finalMat.uniforms.uRes.value.set(texMotif.image.width, texMotif.image.height);
      }
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("pointerup", onRelease);
      window.removeEventListener("pointercancel", onRelease);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("deviceorientation", onOrient);
      rtA.dispose(); rtB.dispose(); texMotif.dispose(); texVeil.dispose(); renderer.dispose();
      if (renderer.domElement.parentNode) mount.removeChild(renderer.domElement);
    };
  }, [motif]);

  return (
    <div
      ref={mountRef}
      aria-hidden
      style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        overflow: "hidden", background: "#EDE4D0", zIndex: 0, pointerEvents: "none",
        // Sans WebGL, le voile d'albâtre reste en fond statique : la page
        // garde sa matière et son fond parchemin, elle perd seulement la
        // révélation au curseur.
        ...(webgl ? null : {
          backgroundImage: "url(/albatre-lisse.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }),
      }}
    />
  );
}
