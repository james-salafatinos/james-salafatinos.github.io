import * as THREE from "https://cdn.skypack.dev/three";
// import * as THREE from "/build/three.module.js"
import { OrbitControls } from "https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls";
// import { OrbitControls } from '/jsm/controls/OrbitControls'
// import macromanDatGui from 'https://cdn.skypack.dev/@macroman/dat.gui';



// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();


const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
const gridHelper = new THREE.GridHelper(5);
scene.add(gridHelper);

/**
 * Math
 */




let spacing = 500;
let createPlaneFace = function (x, y, z, rotateX, rotateY, rotateZ, n_x, n_y, n_z) {

    let color = new THREE.Color(0xfff3f3)
    let mat = new THREE.MeshPhongMaterial({
        depthTest: true,
        transparent: true,
        alpha: .2,
        side: THREE.DoubleSide,
        color: color
    })

    let geo = new THREE.PlaneBufferGeometry(spacing * 2, spacing * 2)
    let mesh = new THREE.Mesh(geo, mat)

    mesh.rotateX(Math.PI * rotateX)
    mesh.rotateY(Math.PI * rotateY)
    mesh.position.x = x
    mesh.position.y = y
    mesh.position.z = z
    mesh.userData.dirVector = new THREE.Vector3(0, 0, 0)
    mesh.userData.isWall = true
    mesh.userData.normal = new THREE.Vector3(n_x, n_y, n_z)
    return mesh

}

var top = createPlaneFace(0, spacing, 0, .5, 1, 1, 0, 1, 0)
scene.add(top)//constructRacquetballRoom()

var bottom = createPlaneFace(0, -spacing, 0, .5, 1, 1, 0, -1, 0)
scene.add(bottom)//constructRacquetballRoom()

var left = createPlaneFace(0, 0, -spacing, 1, 1, 1, 0, 0, -1)
scene.add(left)//constructRacquetballRoom()

var right = createPlaneFace(0, 0, spacing, 1, 1, 1, 0, 0, 1)
scene.add(right)

var left2 = createPlaneFace(spacing, 0, 0, 1, .5, 1, -1, 0, 0)
scene.add(left2)
var right2 = createPlaneFace(-spacing, 0, 0, 1, .5, 1, 1, 0, 0)
scene.add(right2)

let createCornerLight = function () {
    let pointLight = new THREE.PointLight(0xffffff, .8)
    let ambientLight = new THREE.AmbientLight(0xffffff, .2)
    pointLight.position.set(0, 0, 0);
    let ambientLight2 = new THREE.AmbientLight(0xffffff, 1)
    ambientLight2.position.set(-30, 20, -30);
    const pointHelper = new THREE.PointLightHelper(pointLight, 0);
    scene.add(pointLight, pointHelper, ambientLight), ambientLight2
}
createCornerLight()


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
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
camera.position.y = 1;
camera.position.z = 2;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));



/**
 * DOM Callbacks
 */
window.addEventListener('click', function (event) {
    console.log("In Double Click")
    var mouse = { x: 1, y: 1 };
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //Raycast
    var raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = .05;
    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
    raycaster.ray.set(camera.position, vector.sub(camera.position).normalize());
    var intersects = raycaster.intersectObjects(scene.children);
    console.log(intersects)

})


let active_bodies = []
let active_objects = {}
let add_body = function () {
    let geo = new THREE.SphereBufferGeometry(.2)
    let mat = new THREE.MeshPhongMaterial()
    let mesh = new THREE.Mesh(geo, mat)

    mesh.position.x = camera.position.x
    mesh.position.y = camera.position.y
    mesh.position.z = camera.position.z
    // mesh.userData.dirVector = dirVector.multiplyScalar(1)
    // mesh.material.color = new THREE.Color(`hsl(${2000 - 100}, 100%, 50%)`);

    mesh.material.color = new THREE.Color(`hsl(${300}, 100%, 50%)`);
    mesh.userData.isPlayer = true;
    active_bodies.push(mesh)
    active_objects[name] = mesh
    scene.add(mesh)

}

add_body()

document.body.onkeyup = function (event) {
    var mouse = { x: 1, y: 1 };
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    let cameraLookDir = function (camera) {
        var vector = new THREE.Vector3(0, 0, -1);
        vector.applyEuler(camera.rotation, camera.rotation.order);
        return vector;
    }
    if (event.keyCode == 32) {
        console.log("Pressed Space, added player")


    }
}



/**
 * Animate
 */



//Const
const clock = new THREE.Clock();


var animate = function () {


    //Controls
    controls.update();
    //Time
    const elapsedTime = clock.getElapsedTime();
    // Render
    renderer.render(scene, camera);
    // Call tick again on the next frame
    window.requestAnimationFrame(animate);
};

animate();
