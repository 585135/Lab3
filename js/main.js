
import MouseLookController from './MouseLookController.js';
import { Light, Renderer, Scene, Node, Mesh, Primitive, BasicMaterial, CubeMapMaterial, PerspectiveCamera, vec3, vec4 } from '../lib/engine/index.js';
import PhongMaterial from "../materials/PhongMaterial.js";







// Create a Renderer and append the canvas element to the DOM.
let renderer = new Renderer(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let time = 0.001;

// A scenegraph consists of a top-level Node, called Scene and an arbitrary number of nodes forming a DAG.
const scene = new Scene();

// We load some textures and instantiate materials from them:
const sunMaterial = new BasicMaterial({
    map: renderer.loadTexture('resources/sun.jpg')
});

const earthMaterial = new PhongMaterial({
    shininess: 30,
    map: renderer.loadTexture('resources/earth_daymap.jpg')
});
const marsMaterial = new PhongMaterial({
    shininess: 30,
    map: renderer.loadTexture('resources/mars_daymap.jpg')
});
const mercuryMaterial = new PhongMaterial({
    shininess: 30,
    map: renderer.loadTexture('resources/mercury_daymap.jpg')
});
const saturnMaterial = new PhongMaterial({
    shininess: 30,
    map: renderer.loadTexture('resources/saturn_daymap.jpg')
});
const moonMaterial = new PhongMaterial({
    shininess: 30,
    map: renderer.loadTexture('resources/moon.jpg')
});
// Get more textures here:
// https://www.solarsystemscope.com/textures/

// Get relative sizes here:
// http://www.exploratorium.edu/ronh/solar_system/
// You dont have to use these, as the planets may be too tiny to be visible.

// A Primitive consists of geometry and a material.
// We create a sphere Primitive using the static method 'createSphere'.
// The generated geometry is called a UV-sphere and it has 32 vertical and horizontal subdivisions (latitude and longitude).
// Additionally, we specify that we want the Primitive to be drawn with sunMaterial.
const sunPrimitive = Primitive.createSphere(sunMaterial, 32, 32);

// A Primitive is only drawn as part of a Mesh,
// so we instantiate a new Mesh with the sunPrimitive.
// (A Mesh can consist of multiple Primitives. )
const sun = new Mesh([sunPrimitive]);

// Finally, we add the sun to our scene.
// Only meshes that have been added to our scene, either as a child or as a descendant, will be drawn.
scene.add(sun);

// We also want to draw the earth, so we use the static method 'from' to create a new Primitive based on the previous one.
// Using this function ensures that we're reusing the same buffers for geometry, while allowing us to specify a different material.
const earthPrimitive = Primitive.from(sunPrimitive, earthMaterial);
const marsPrimitive = Primitive.from(sunPrimitive, marsMaterial);
const mercuryPrimitive = Primitive.from(sunPrimitive, mercuryMaterial);
const saturnPrimitive = Primitive.from(sunPrimitive, saturnMaterial);

const light = new Light({
    diffuse: vec4.fromValues(255/255, 255/255, 255/255, 1.0),
    specular: vec4.fromValues(0.2, 0.2, 0.2, 1.0)
});

sun.add(light);
const moonPrimitive = Primitive.from(sunPrimitive, moonMaterial);

// Next we create a Node that represents the Earths orbit.
// This node is not translated at all, because we want it to be centered inside the sun.
// It is however rotated in the update-loop at starting at line 215.
const earthOrbitNode = new Node(scene);
const marsOrbitNode = new Node(scene);
const mercuryOrbitNode = new Node(scene);
const saturnOrbitNode = new Node(scene);



// This node represents the center of the earth.
const earthCenterNode = new Node(earthOrbitNode);
const marsCenterNode = new Node(marsOrbitNode);
const mercuryCenterNode = new Node(mercuryOrbitNode);
const saturnCenterNode = new Node(saturnOrbitNode);

// Make the moon orbit the earth.
const moonOrbitNode = new Node(earthCenterNode);
const moonCenterNode = new Node(moonOrbitNode);

// We translate it along the x-axis to a suitable position.
// When the earthOrbitNode is rotated, this node will orbit about the center of the sun.
earthCenterNode.setTranslation(11.45, 0, 0);
marsCenterNode.setTranslation(15.45,0,0);
mercuryCenterNode.setTranslation(7.45, 0, 0);
saturnCenterNode.setTranslation(20.45,0,0);

moonCenterNode.setTranslation(0.2, 0 , 0);

// Create a new Mesh for the Earth.
const earth = new Mesh([earthPrimitive]);
const mars = new Mesh([marsPrimitive]);
const mercury = new Mesh([mercuryPrimitive]);
const saturn = new Mesh([saturnPrimitive]);

const moon = new Mesh([moonPrimitive]);

// We add it to the earthCenterNode, so that it orbits around the sun.
earthCenterNode.add(earth);
marsCenterNode.add(mars);
mercuryCenterNode.add(mercury);
saturnCenterNode.add(saturn);

moonCenterNode.add(moon);

// True scale: earth.setScale(0.0091, 0.0091, 0.0091);
earth.setScale(0.091, 0.091, 0.091); // 10 times larger than irl
mars.setScale(0.051, 0.051, 0.051);
mercury.setScale(0.031,0.031,0.031);
saturn.setScale(0.35,0.35,0.35);

moon.setScale(0.025, 0.025, 0.025);


// We create a Node representing movement, in order to decouple camera rotation.
// We do this so that the skybox follows the movement, but not the rotation of the camera.
const player = new Node();

let skyBoxMaterial = new CubeMapMaterial({
    map: renderer.loadCubeMap([
        'resources/skybox/right.png',
        'resources/skybox/left.png',
        'resources/skybox/top.png',
        'resources/skybox/bottom.png',
        'resources/skybox/front.png',
        'resources/skybox/back.png'
    ])
});

let skyBoxPrimitive = Primitive.createCube(skyBoxMaterial, true); // Second argument tells the createBox function to invert the faces and normals of the box.

let skyBox = new Mesh([skyBoxPrimitive]);
skyBox.setScale(1500, 1500, 1500);

// Attaching the skybox to the player gives the illusion that it is infinitely far away.
player.add(skyBox);

// We create a PerspectiveCamera with a fovy of 70, aspectRatio, and near and far clipping plane.
const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.setTranslation(0, 0, 5);

player.add(camera);

scene.add(player);

// We need to update some properties in the camera and renderer if the window is resized.
window.addEventListener('resize', () => {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}, false);


// We create a MouseLookController to enable controlling camera pitch and yaw with mouse input.
const mouseLookController = new MouseLookController(camera);

// We attach a click lister to the canvas-element so that we can request a pointer lock.
// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
const canvas = renderer.domElement;
canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
});

let yaw = 0;
let pitch = 0;
function updateCamRotation(event) {
    // Add mouse movement to the pitch and yaw variables so that we can update the camera rotation in the loop below.
    yaw -= event.movementX * 0.001;
    pitch -= event.movementY * 0.001;
}

document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
        canvas.addEventListener('mousemove', updateCamRotation, false);
    } else {
        canvas.removeEventListener('mousemove', updateCamRotation, false);
    }
});


let move = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    speed: 0.05
};

window.addEventListener('keydown', (e) => {
    e.preventDefault();
    if (e.code === 'KeyW') {
        move.forward = true;
    } else if (e.code === 'KeyS') {
        move.backward = true;
    } else if (e.code === 'KeyA') {
        move.left = true;
    } else if (e.code === 'KeyD') {
        move.right = true;
    } else if (e.code === 'ArrowUp') {
        time = Math.min(time * 1.05, 10);
    } else if (e.code === 'ArrowDown') {
        time = Math.max(0.000001, time * 0.95);
    }
});

window.addEventListener('keyup', (e) => {
    e.preventDefault();
    if (e.code === 'KeyW') {
        move.forward = false;
    } else if (e.code === 'KeyS') {
        move.backward = false;
    } else if (e.code === 'KeyA') {
        move.left = false;
    } else if (e.code === 'KeyD') {
        move.right = false;
    }
});

// We create a vec3 to hold the players velocity (this way we avoid allocating a new one every frame).
const velocity = vec3.fromValues(0.0, 0.0, 0.0);

const TICK_RATE = 1000 / 60; // 60 fps is the reference Hz.

let then = 0;
function loop(now) {

    let delta = now - then;
    then = now;

    const deltaCorrection = (delta / TICK_RATE); // The deviation factor from the targeted TICK_RATE of 60 Hz

    const moveSpeed = move.speed * deltaCorrection;

    // Reduce accumulated velocity by 25% each frame.
    vec3.scale(velocity, velocity, 0.75);
    //vec3.set(velocity, 0.0, 0.0, 0.0); // (Alternatively remove it completely, feels more responsive?)

    if (move.left) {
        velocity[0] -= moveSpeed;
    }

    if (move.right) {
        velocity[0] += moveSpeed;
    }

    if (move.forward) {
        velocity[2] -= moveSpeed;
    }

    if (move.backward) {
        velocity[2] += moveSpeed;
    }

    // Given the accumulated mouse movement this frame, use the mouse look controller to calculate the new rotation of the camera.
    mouseLookController.update(pitch, yaw);

    // Camera rotation is represented as a quaternion.
    // We rotate the velocity vector based the cameras rotation in order to translate along the direction we're looking.
    const translation = vec3.transformQuat(vec3.create(), velocity, camera.rotation);
    player.applyTranslation(...translation);

    // Animate bodies:
    const orbitalRotationFactor = time * deltaCorrection; // The amount the earth rotates about the sun every tick.
    earthOrbitNode.rotateY(orbitalRotationFactor*3);
    marsOrbitNode.rotateY(orbitalRotationFactor*2);
    mercuryOrbitNode.rotateY(orbitalRotationFactor*4);
    saturnOrbitNode.rotateY(orbitalRotationFactor);
    moonOrbitNode.rotateY(orbitalRotationFactor*20);
    
    earth.rotateY(orbitalRotationFactor * 365); // The Earth rotates approx. 365 times per year.
    sun.rotateY(orbitalRotationFactor * 25); // The Sun rotates approx. 25 times per year.
    mars.rotateY(orbitalRotationFactor * 380);
    mercury.rotateY(orbitalRotationFactor * 200);
    saturn.rotateY(orbitalRotationFactor * 500);
    moon.rotateY(orbitalRotationFactor * 200);

    // Reset mouse movement accumulator every frame.
    yaw = 0;
    pitch = 0;

    // Update the world matrices of the entire scene graph.
    scene.update();

    // Render the scene.
    renderer.render(scene, camera);

    // Ask the the browser to draw when it's convenient
    window.requestAnimationFrame(loop);

}

window.requestAnimationFrame(loop);