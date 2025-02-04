import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';

const API_URL = 'http://localhost:3000/api/models';
let selectedObject = null;
let defaultColorPicker = "#fff";
let model_container = document.querySelector('.webgl');

// Set up the Three.js scene
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  canvas: model_container
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

camera.position.set(4, 5, 11);

const stats = new Stats()
document.body.appendChild(stats.domElement);

// orbitcontrol setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

// groundMesh setup
const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x555555,
  side: THREE.DoubleSide
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.castShadow = false;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

// Add lights
const spotLight = new THREE.SpotLight(0xffffff, 3000, 100, 0.4, 1);
spotLight.position.set(0, 25, 0);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);

// Function to fetch models from the API
async function fetchModels() {
  const response = await fetch(API_URL);
  const models = await response.json();
  const selector = document.getElementById('modelSelector');
  models.forEach((model) => {
    const option = document.createElement('option');
    option.value = model.url;
    option.textContent = model.name;
    selector.appendChild(option);
  });
}

// Load the selected model
function loadModel(url) {
  // Remove the previous model
  resetScene();

  const loader = url.endsWith('.gltf') || url.endsWith('.glb') ? new GLTFLoader() : new OBJLoader();
  loader.load(
    url,
    (object) => {
      console.log('loading model');
      const model = object.scene || object;

      selectedObject = model;
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const color = pickr.getColor().toHEXA().toString();
          child.material.color.set(color);
        }
      });

      model.position.set(0, 1.05, -1);
      scene.add(model);

      document.getElementById('progress-container').style.display = 'none';
    },
    (xhr) => console.log(`loading ${xhr.loaded / xhr.total * 100}%`),
    (error) => console.error('Error loading model:', error)
  );
}

function resetScene() {
  const lastObject = scene.children[scene.children.length - 1];
  if (lastObject.type == "Mesh" || lastObject.type == "Group") {
    scene.remove(lastObject);
  }
}

const pickr = Pickr.create({
  el: '#colorPicker',
  theme: 'nano',
  default: defaultColorPicker,
  components: {
    preview: true,
    opacity: true,
    hue: true,
    interaction: {
      input: true,
      save: true,
      rgba: true,
    }
  }
});

// Listen for color changes
pickr.on('change', (color) => {
  const colorHex = color.toHEXA().toString();
  selectedObject.traverse((child) => {
    if (child.isMesh) {
      child.material.color.set(colorHex);
    }
  });
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  stats.update();
}

// Initialize
fetchModels();
document.getElementById('modelSelector').addEventListener('change', (event) => {
  const url = `http://localhost:3000${event.target.value}`;
  loadModel(url);
});
animate();