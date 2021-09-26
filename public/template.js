// import * as THREE from "https://cdn.skypack.dev/three";
import * as THREE from "/build/three.module.js";
// import { OrbitControls } from "https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls";
import { OrbitControls } from "/jsm/controls/OrbitControls";
// import macromanDatGui from 'https://cdn.skypack.dev/@macroman/dat.gui';

/**
 * Math
 */

const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();

/**
 * Helpers
 */
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
const gridHelper = new THREE.GridHelper(50);
scene.add(gridHelper);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.x = 1;
camera.position.y = 10;
camera.position.z = 13;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener("dblclick", function (event) {
  console.log("In Click");
  var mouse = { x: 1, y: 1 };
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  //Raycast
  var raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 0.003;
  var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
  raycaster.ray.set(camera.position, vector.sub(camera.position).normalize());
  var intersects = raycaster.intersectObjects(scene.children);
  console.log(intersects);
});

let createLight = function () {
  let pointLight = new THREE.PointLight(0xffffff, 0.8);
  let ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  pointLight.position.set(-5, 5, -5);
  let ambientLight2 = new THREE.AmbientLight(0xffffff, 0.4);
  ambientLight2.position.set(-30, 20, -30);
  const pointHelper = new THREE.PointLightHelper(pointLight, 1);
  scene.add(pointLight, pointHelper, ambientLight), ambientLight2;
};
createLight();

/**
 * Animate
 */

//Const
const clock = new THREE.Clock();

var animate = function () {
  controls.update();
  const elapsedTime = clock.getElapsedTime();
  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
};

animate();
