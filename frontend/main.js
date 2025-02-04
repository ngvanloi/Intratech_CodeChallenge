import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import * as dat from "https://cdn.skypack.dev/dat.gui";

const API_URL = 'http://localhost:3000/api/models';
const modelContainer = document.querySelector('.webgl');
const progressContainer = document.getElementById('progress-container');
const params = { model: 'Select a model', color: "#fff" };

let selectedObject = null;

// Three.js initialization
const gui = new dat.GUI();
const scene = new THREE.Scene();
const camera = createCamera();
const renderer = createRenderer();
const stats = initializeStats();
const controls = setupControls();

// Scene setup
addGround();
addLighting();

// Functions
function createCamera() {
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(4, 5, 11);
  return camera;
}

function createRenderer() {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: modelContainer
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}

function initializeStats() {
  const stats = new Stats();
  document.body.appendChild(stats.domElement);
  return stats;
}

function setupControls() {
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
  return controls;
}

function addGround() {
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
}

function addLighting() {
  const spotLight = new THREE.SpotLight(0xffffff, 3000, 100, 0.4, 1);
  spotLight.position.set(0, 25, 0);
  spotLight.castShadow = true;
  spotLight.shadow.bias = -0.0001;
  scene.add(spotLight);
}

function createGUI(models) {
  const modelMap = {};
  models.forEach(model => {
    modelMap[model.name] = model.url;
  });

  gui.add(params, 'model', ['Select a model', ...Object.keys(modelMap)])
    .name("Model")
    .onChange(value => handleModelSelection(value, modelMap));

  gui.addColor(params, "color")
    .name("Color")
    .onChange(value => updateModelColor(value));
}

function handleModelSelection(value, modelMap) {
  if (value === 'Select a model') {
    progressContainer.textContent = 'Select a model to load';
    return;
  }

  progressContainer.textContent = `Loading ${value}...`;
  const url = `http://localhost:3000${modelMap[value]}`;
  loadModel(url);
}

function updateModelColor(value) {
  if (selectedObject) {
    selectedObject.traverse(child => {
      if (child.isMesh) {
        child.material.color.set(value);
      }
    });
  }
}

async function fetchModels() {
  try {
    const response = await fetch(API_URL);
    const models = await response.json();
    createGUI(models);
  } catch (error) {
    console.error('Error fetching models:', error);
  }
}

function loadModel(url) {
  resetScene();

  const loader = getModelLoader(url);
  loader.load(
    url,
    object => handleModelLoadSuccess(object),
    xhr => handleModelLoadingProgress(xhr),
    error => console.error('Error loading model:', error)
  );
}

function getModelLoader(url) {
  return url.endsWith('.gltf') || url.endsWith('.glb') ? new GLTFLoader() : new OBJLoader();
}

function handleModelLoadSuccess(object) {
  const model = object.scene || object;
  selectedObject = model;

  model.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.material.color.set(params.color);
    }
  });

  model.position.set(0, 1.05, -1);
  scene.add(model);
  progressContainer.style.display = 'none';
}

function handleModelLoadingProgress(xhr) {
  console.log(`Loading ${((xhr.loaded / xhr.total) * 100).toFixed(2)}%`);
}

function resetScene() {
  const lastObject = scene.children[scene.children.length - 1];
  if (lastObject.isMesh || lastObject.isGroup) {
    scene.remove(lastObject);
  }
}

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  stats.update();
}

// Event listeners
window.addEventListener('resize', handleWindowResize);

// Main
fetchModels();
animate();
