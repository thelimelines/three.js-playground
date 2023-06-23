// Import modules and styles
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.setZ(30);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

// Group to contain light and knot
const group = new THREE.Group();
scene.add(group);

// Point Light
const pointLight = new THREE.PointLight(0xFFFFFF);
pointLight.position.set(0, 0, 0);
pointLight.castShadow = true;
group.add(pointLight);

// Light and Grid helpers
const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50, 0x220000, 0x111111);
gridHelper.position.set(0, -20, 0);
scene.add(lightHelper, gridHelper);

// Ambient Light
scene.add(new THREE.AmbientLight(0x332211));

// Torus Knot parameters
let scaleMultiplier = 1;
let hue = 0;
let p = 1;
let q = 2;
let knotUpdateFrequency = 2000;
let lastKnotUpdateTime = Date.now();

// Torus Knot
const geometry = new THREE.TorusKnotGeometry(10, 1 / (Math.max(p / 2, q) / 2), 1000, 16, p, q);
const material = new THREE.MeshStandardMaterial({ color: 0xFFFF00, wireframe: false });
const torusKnot = new THREE.Mesh(geometry, material);
torusKnot.castShadow = true;
torusKnot.receiveShadow = true;
group.add(torusKnot);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Window resize listener
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

// Cubes
Array(1000).fill().forEach(() => {
  const geometry = new THREE.BoxGeometry(4, 4, 4);
  const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true });
  let x, y, z;
  do {
    [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(1000));
  } while (x >= -20 && x <= 20 && y >= -20 && y <= 20 && z >= -20 && z <= 20);
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(x, y, z);
  scene.add(cube);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  group.rotation.x += 0.01;
  group.rotation.y += 0.015;
  group.rotation.z += 0.005;
  scaleMultiplier = 1 + Math.sin(Date.now() * 0.001) * 0.1;
  torusKnot.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);
  hue = (hue + 0.01) % 1;
  torusKnot.material.color.setHSL(hue, 1, 0.5);
  if (Date.now() - lastKnotUpdateTime > knotUpdateFrequency) {
    p = Math.floor(Math.random() * 10) + 1;
    q = Math.floor(Math.random() * 5) + 1;
    lastKnotUpdateTime = Date.now();
    torusKnot.geometry = new THREE.TorusKnotGeometry(10, 1 / (Math.max(p / 2, q) / 2), 1000, 16, p, q);
  }
  pointLight.position.set(0, 0, Math.sin(Date.now() * 0.002) * 15);
  controls.update();
  renderer.render(scene, camera);
}

animate();