import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import fs from 'fs';

const svg = fs.readFileSync('/home/user/mdc-website/public/mdc-logo.svg','utf8');
const data = new SVGLoader().parse(svg);
console.log('paths:', data.paths.length);

const allShapes = [];
const bboxPts = new THREE.Box2();
for (const path of data.paths) {
  const shapes = SVGLoader.createShapes(path);
  console.log('  shapes in path:', shapes.length);
  for (const s of shapes) {
    const pts = s.getPoints();
    for (const p of pts) bboxPts.expandByPoint(p);
    allShapes.push(s);
  }
}
const sizePts = bboxPts.getSize(new THREE.Vector2());
console.log('bbox via getPoints():', bboxPts.min.toArray(), bboxPts.max.toArray(), '=> size', sizePts.toArray());

// verite terrain : bbox de la GEOMETRIE reellement rendue
const gb = new THREE.Box3();
for (const s of allShapes) {
  const g = new THREE.ShapeGeometry(s, 24);
  g.computeBoundingBox();
  gb.union(g.boundingBox);
}
const sizeGeo = gb.getSize(new THREE.Vector3());
console.log('bbox via ShapeGeometry :', gb.min.toArray(), gb.max.toArray(), '=> size', sizeGeo.toArray());

const TARGET = 2.6;
const scaleUsed = TARGET / Math.max(sizePts.x, sizePts.y);
const scaleTrue = TARGET / Math.max(sizeGeo.x, sizeGeo.y);
console.log('\nscale calcule par le code :', scaleUsed);
console.log('scale correct            :', scaleTrue);
console.log('facteur d erreur         :', (scaleUsed/scaleTrue).toFixed(2), 'x trop grand');

const worldH = sizeGeo.y * scaleUsed * 0.48;
const visibleH = 2*5*Math.tan(42*Math.PI/180/2);
console.log('\nhauteur maison a scale max :', worldH.toFixed(3), 'unites');
console.log('hauteur visible camera     :', visibleH.toFixed(3), 'unites');
console.log('=> occupe', (100*worldH/visibleH).toFixed(0)+'% de la hauteur ecran');
