import './style.css'
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.shadowMap.enabled = true; // Enable shadow maps in the renderer.

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// Group object that will contain the torusKnot and the pointLight
const group = new THREE.Group();

const pointLight = new THREE.PointLight(0xFFFFFF);
pointLight.position.set(0,0,0);
pointLight.castShadow = true; // Set the light source to cast shadows.

group.add(pointLight); // Add pointLight to the group

const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
gridHelper.position.set(0, -20, 0); // Adjusted Y-coordinate to move it down by two units
scene.add(lightHelper, gridHelper);

const ambLight = new THREE.AmbientLight(0x332211);
scene.add(ambLight);

let scaleMultiplier = 1;
let hue = 0;
let p = 1;
let q = 2;
let knotUpdateFrequency = 2000; // Update knot every 2000ms
let lastKnotUpdateTime = Date.now();

const geometry = new THREE.TorusKnotGeometry(10, 1/(Math.max(p/2,q)/2), 1000, 16, p, q);
const material = new THREE.MeshStandardMaterial({color: 0xFFFF00, wireframe: false});
const torusKnot = new THREE.Mesh(geometry, material);

torusKnot.castShadow = true; // Set the object to cast shadows.
torusKnot.receiveShadow = true; // Set the object to receive shadows.

group.add(torusKnot); // Add torusKnot to the group

scene.add(group); // Add the group to the scene

const controls = new OrbitControls(camera, renderer.domElement);

function addCubefield() {
  const geometry = new THREE.BoxGeometry(4,4,4);
  const material = new THREE.MeshBasicMaterial({color: 0xFFFFFF, wireframe: true});

  function getRandomCoordinate(range) {
    return THREE.MathUtils.randFloatSpread(range);
  }
  
  function isWithinExclusionZone(coordinate, exclusionMin, exclusionMax) {
    return coordinate.every(val => val >= exclusionMin && val <= exclusionMax);
  }
  
  let x, y, z;

  do {
    [x, y, z] = Array(3).fill().map(() => getRandomCoordinate(1000));
  } while (isWithinExclusionZone([x, y, z], -20, 20));

  const cube = new THREE.Mesh(geometry,material);
  cube.position.set(x, y, z);
  scene.add(cube); // Assuming you have a scene object already
}

Array(1000).fill().forEach(addCubefield);

function animate() {
  requestAnimationFrame(animate);

  // Apply the rotations to the group instead of the torusKnot
  group.rotation.x += 0.01;
  group.rotation.y += 0.015;
  group.rotation.z += 0.005;

  // Scale
  scaleMultiplier = 1 + Math.sin(Date.now() * 0.001) * 0.1;
  torusKnot.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);

  // Color
  hue = (hue + 0.01) % 1; // Hue ranges from 0 to 1
  torusKnot.material.color.setHSL(hue, 1, 0.5); // Saturated color, middle lightness

  // Knot parameters
  if (Date.now() - lastKnotUpdateTime > knotUpdateFrequency) {
    p = Math.floor(Math.random() * 10) + 1; // Random integer between 1 and 10
    q = Math.floor(Math.random() * 5) + 1;
    lastKnotUpdateTime = Date.now();
    
    // Geometry
    torusKnot.geometry = new THREE.TorusKnotGeometry(10, 1/(Math.max(p/2,q)/2), 1000, 16, p, q);
  }

  // Light movement
  let lightMovement = Math.sin(Date.now() * 0.002) * 15; // Multiplier controls speed, constant controls amplitude
  pointLight.position.set(0, 0, lightMovement); // Assuming light moves along the Y axis

  controls.update();

  renderer.render(scene, camera);
}

animate();