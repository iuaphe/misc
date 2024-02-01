import circleVertexShaderSource from "./shaders/circle/vert.glsl?raw";
import circleFragmentShaderSource from "./shaders/circle/frag.glsl?raw";
import "./style.css";

const canvas = document.querySelector("canvas")!;

const gl = canvas.getContext("webgl2")!;
const vertShader = gl.createShader(gl.VERTEX_SHADER)!;
const fragShader = gl.createShader(gl.FRAGMENT_SHADER)!;

gl.shaderSource(vertShader, circleVertexShaderSource);
gl.shaderSource(fragShader, circleFragmentShaderSource);

gl.compileShader(vertShader);
gl.compileShader(fragShader);

const program = gl.createProgram()!;

gl.attachShader(program, vertShader);
gl.attachShader(program, fragShader);

gl.linkProgram(program);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

const aspectRatioUniformLocation = gl.getUniformLocation(program, "u_ratio");

const scaleUniformLocation = gl.getUniformLocation(program, "u_scale");
const rotationUniformLocation = gl.getUniformLocation(program, "u_rotation");
const offsetUniformLocation = gl.getUniformLocation(program, "u_offset");

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

// prettier-ignore
const positions = [
  -1, -1,
  -1, 1,
  1, 1,

  -1, -1,
  1, -1,
  1, 1,
];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

const vao = gl.createVertexArray();

gl.bindVertexArray(vao);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

gl.useProgram(program);
gl.bindVertexArray(vao);

let lastTime = 0;

const drawCircle = (
  offsetX: number,
  offsetY: number,
  scale: number,
  rotation: number
) => {
  gl.uniform2f(offsetUniformLocation, offsetX, offsetY);
  gl.uniform1f(scaleUniformLocation, scale);
  gl.uniform1f(rotationUniformLocation, rotation);

  gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
};

type Vector = {
  x: number;
  y: number;
};

type Node = {
  position: Vector;
};

const nodes: Node[] = [];

for (let i = 0; i < 10; i++) {
  nodes.push({
    position: {
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
    },
  });
}

const draw = (time: number) => {
  requestAnimationFrame(draw);

  // const delta = time - lastTime;
  lastTime = time;

  canvas.width = window.innerWidth * 1.5;
  canvas.height = window.innerHeight * 1.5;

  let aspectRatio = canvas.width / canvas.height;

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.uniform1f(aspectRatioUniformLocation, aspectRatio);

  for (const node of nodes) {
    drawCircle(node.position.x, node.position.y, 0.1, 0);
  }

  if (selectedNode !== undefined) {
    selectedNode.position.x = mousePos.x;
    selectedNode.position.y = mousePos.y;
  }
};

let mousePos: Vector = { x: 0, y: 0 };

document.addEventListener("mousemove", (e) => {
  let x = e.offsetX / window.innerWidth;
  let y = e.offsetY / window.innerHeight;

  y = -(y * 2 - 1);
  x = x * 2 - 1;

  mousePos = { x, y };
});

let selectedNode: Node | undefined = undefined;

document.addEventListener("mousedown", (_e) => {
  const clickedNode = nodes.find(
    (node) =>
      Math.hypot(node.position.x - mousePos.x, node.position.y - mousePos.y) <
      0.1
  );
  if (clickedNode !== undefined) {
    selectedNode = clickedNode;
  }
});

document.addEventListener("mouseup", (_e) => {
  if (selectedNode !== undefined) {
    selectedNode = undefined;
  }
});

draw(0);
