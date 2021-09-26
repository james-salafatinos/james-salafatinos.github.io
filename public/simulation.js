import * as THREE from "https://cdn.skypack.dev/three";
// import * as THREE from "/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls";
// import { OrbitControls } from "/jsm/controls/OrbitControls";
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

var agents = [];
var goals = [];

let createCube = function (_x, _y, _z) {
  let mat = new THREE.MeshBasicMaterial({
    wireframe: false,
    transparent: false,
  });
  let geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  let mesh = new THREE.Mesh(geo, mat);
  mesh.position.x = _x;
  mesh.position.y = _y;
  mesh.position.z = _z;

  mesh.userData.attack = Math.random();
  mesh.userData.hp = Math.random();
  mesh.userData.def = Math.random();
  mesh.userData.fitness = 0;
  mesh.userData.alive = true;
  mesh.userData.cooldown = false;

  return mesh;
};

var setGoal = (_x, _y, _z) => {
  let mat = new THREE.MeshBasicMaterial({
    wireframe: false,
    transparent: false,
    color: "blue",
  });
  let geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  let mesh = new THREE.Mesh(geo, mat);
  mesh.position.x = _x;
  mesh.position.y = _y;
  mesh.position.z = _z;

  return mesh;
};

var mutate = (n_agents) => {
  agents.forEach((agent) => {
    if (agent.userData.fitness == 1) {
      //nothing
    } else {
      agent.position.x += THREE.MathUtils.randFloatSpread(2);
      agent.position.y += 0;
      agent.position.z += THREE.MathUtils.randFloatSpread(2);
    }
  });
};

var initialized = false;
var initialize = (n_agents, spread) => {
  for (let n = 0; n < n_agents; n++) {
    let coords = [
      THREE.MathUtils.randFloatSpread(spread),
      0,
      THREE.MathUtils.randFloatSpread(spread),
    ];
    let cube = createCube(...coords);
    cube.userData.generation = generation;
    agents.push(cube);
    scene.add(cube);
  }
  initialized = true;
  generation++;

  let goal = setGoal(
    THREE.MathUtils.randFloatSpread(spread),
    0,
    THREE.MathUtils.randFloatSpread(spread)
  );
  goals.push(goal);
  scene.add(goal);
};

var eps = 1;
var N_AGENTS = 100;
var collisionCheck = () => {};

var roll = (i, j) => {};

var timestep = () => {};

var evaluate = () => {
  agents.forEach((agent) => {
    let v1 = new THREE.Vector3(
      agent.position.x,
      agent.position.y,
      agent.position.z
    );
    let v2 = new THREE.Vector3(
      goals[0].position.x,
      goals[0].position.y,
      goals[0].position.z
    );

    if (v1.distanceTo(v2) < eps) {
      console.log("THIS AGENT", agent);
      agent.userData.fitness = 1;
    }
  });
};

//Const
const clock = new THREE.Clock();

var frameIndex = 0;
var generation = 0;

var animate = function () {
  frameIndex++;
  controls.update();
  const elapsedTime = clock.getElapsedTime();

  if (frameIndex % 3 == 0) {
    if (initialized == false) {
      initialize(N_AGENTS, 20);
    }
    evaluate();
    mutate(N_AGENTS);
    // agents.forEach((agent) => {
    //   scene.remove(agent);
    // });
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
};

animate();
