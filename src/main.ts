import "./style.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";
import groundVertexShader from "./shaders/ground-vertex.glsl?raw";
import groundFragmentShader from "./shaders/ground-fragment.glsl?raw";
import carVertexShader from "./shaders/car-vertex.glsl?raw";
import carFragmentShader from "./shaders/car-fragment.glsl?raw";

const canvas = document.querySelector("canvas")!;

const scene = new THREE.Scene();

const car = new THREE.Group();
car.rotation.order = "YZX";

car.position.y = 1;

car.add(
  new THREE.Mesh(
    new THREE.BoxGeometry(5, 1, 3),
    new THREE.RawShaderMaterial({
      vertexShader: carVertexShader,
      fragmentShader: carFragmentShader,
    })
  )
);

const createWheelAt = (x: number, y: number, z: number): THREE.Mesh => {
  const wheel = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({
      color: "#222",
    })
  );
  wheel.position.x = x;
  wheel.position.y = y;
  wheel.position.z = z;
  wheel.rotateX(Math.PI / 2);
  return wheel;
};

car.add(createWheelAt(-2, 0, 2));
car.add(createWheelAt(2, 0, 2));
car.add(createWheelAt(-2, 0, -2));
car.add(createWheelAt(2, 0, -2));

// const carVelocity = { x: 0, y: 0 };

let carAngle = 0;
let carSpeed = 0;

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 1000, 1000, 1000),
  new THREE.RawShaderMaterial({
    vertexShader: groundVertexShader,
    fragmentShader: groundFragmentShader,
    uniforms: {
      u_time: { value: 0 },
    },
    side: THREE.DoubleSide,
  })
);

ground.rotateX(Math.PI / 2);

scene.add(car);
scene.add(ground);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(-5, 0, 0);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.rotateSpeed = 3;

const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const keyPressed: Record<string, boolean> = {};

let cameraAngle = carAngle;

enum Side {
  BLUE,
  RED,
}

let bottomSide: Side = Side.BLUE;

const tick = () => {
  if (keyPressed["w"]) {
    carSpeed += 0.01;
  }
  if (keyPressed["s"]) {
    carSpeed -= 0.01;
  }
  if (keyPressed["a"]) {
    carAngle += 0.1;
    car.rotation.y = carAngle;
  }
  if (keyPressed["d"]) {
    carAngle -= 0.1;
    car.rotation.y = carAngle;
  }

  carSpeed *= 0.99;

  cameraAngle += (carAngle - cameraAngle) * 0.1;

  car.position.x += carSpeed * Math.cos(carAngle);
  car.position.z += -carSpeed * Math.sin(carAngle);

  const targetRotation = bottomSide === Side.RED ? Math.PI : 0;

  car.rotation.x += (targetRotation - car.rotation.x) * 0.1;

  console.log(bottomSide);

  camera.position.set(
    car.position.x + -Math.cos(cameraAngle) * 10,
    5,
    car.position.z + Math.sin(cameraAngle) * 10
  );

  camera.lookAt(car.position);

  renderer.render(scene, camera);
  controls.update();
  window.requestAnimationFrame(tick);
};

tick();

document.addEventListener("keydown", (e) => {
  keyPressed[e.key] = true;
  if (e.key === " ") {
    bottomSide = bottomSide === Side.BLUE ? Side.RED : Side.BLUE;
  }
});

document.addEventListener("keyup", (e) => {
  keyPressed[e.key] = false;
});
