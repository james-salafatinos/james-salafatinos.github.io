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
var lines = [];

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

var initialize = (n_agents, spread) => {
  for (let n = 0; n < n_agents; n++) {
    let coords = [
      THREE.MathUtils.randFloatSpread(spread),
      0,
      THREE.MathUtils.randFloatSpread(spread),
    ];
    let cube = createCube(...coords);
    agents.push(cube);
    scene.add(cube);
  }

  let goal = setGoal(
    THREE.MathUtils.randFloatSpread(spread),
    0,
    THREE.MathUtils.randFloatSpread(spread)
  );
  goals.push(goal);
  scene.add(goal);
};

var eps = 0.5;
var collisionCheck = () => {
  for (let i = 0; i < agents.length; i++) {
    let x = agents[i].position.x;
    let z = agents[i].position.z;
    for (let j = i + 1; j < agents.length; j++) {
      let _x = agents[j].position.x;
      let _z = agents[j].position.z;

      if (((_x - x) ** 2 + (_z - z) ** 2) ** 0.5 < eps) {
        // console.log("Collision!");
        return [i, j];
      }
    }
  }
};

var roll = (i, j) => {
  let roll_i = Math.random();
  let roll_j = Math.random();
  let hit = Math.random();

  if (roll_i > roll_j) {
    if (hit > 0.5) {
      agents[j].userData.hp -= agents[i].userData.attack;

      agents[i].scale.set(
        agents[i].scale.x + 0.1,
        agents[i].scale.y + 0.1,
        agents[i].scale.z + 0.1
      );
      agents[i].userData.attack += 1;
      agents[i].userData.cooldown = true;
      agents[i].userData.fitness += 1;
    }
  } else {
    if (hit > 0.5) {
      agents[i].userData.hp -= agents[j].userData.attack;

      agents[j].scale.set(
        agents[j].scale.x + 0.1,
        agents[j].scale.y + 0.1,
        agents[j].scale.z + 0.1
      );
      agents[j].userData.attack += 1;
      agents[j].userData.cooldown = true;
    }
  }
  //   console.log("Outcome", agents[i].userData.hp, agents[j].userData.hp);
};

var timestep = () => {
  for (let i = 0; i < agents.length; i++) {
    var material = new THREE.LineBasicMaterial({
      color: 0x0000ff,
    });
    let points = [agents[i].position, goals[0].position];
    var geometry = new THREE.BufferGeometry().setFromPoints(points);
    var line = new THREE.Line(geometry, material);

    agents[i].position.x += THREE.MathUtils.randFloatSpread(100) / 500;
    agents[i].position.z += THREE.MathUtils.randFloatSpread(100) / 500;
  }
  if (collisionCheck() == undefined) {
  } else {
    let ij = collisionCheck();
    roll(ij[0], ij[1]);
  }
};

var evaluate = () => {
  let cutoff = 0.0;
  for (let i = 0; i < agents.length; i++) {
    if (agents[i].userData.hp < cutoff) {
      agents[i].userData.alive = false;
      agents[i].visible = false;
      agents.splice(i, 1);
    }
  }
};

//Const
const clock = new THREE.Clock();

var animate = function () {
  controls.update();
  const elapsedTime = clock.getElapsedTime();

  timestep(agents);
  if (Math.floor(elapsedTime) % 2 == 0) {
    evaluate();
  }

  timestep(agents);
  if (Math.floor(elapsedTime) % 2 == 0) {
    // cooldownReset();
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
};
initialize(100, 20);
animate();
