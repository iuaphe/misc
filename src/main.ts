import standardVertexShaderSource from "./shaders/standard/vert.glsl?raw";
import circleFragmentShaderSource from "./shaders/circle/frag.glsl?raw";
import squareFragmentShaderSource from "./shaders/square/frag.glsl?raw";
import "./style.css";

const canvas = document.querySelector("canvas")!;

const gl = canvas.getContext("webgl2")!;

const createProgram = (
  vertSource: string,
  fragSource: string
): WebGLProgram => {
  const vertShader = gl.createShader(gl.VERTEX_SHADER)!;
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER)!;

  gl.shaderSource(vertShader, vertSource);
  gl.shaderSource(fragShader, fragSource);

  gl.compileShader(vertShader);
  gl.compileShader(fragShader);

  const program = gl.createProgram()!;

  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);

  gl.linkProgram(program);

  return program;
};

const standardLocs = (program: WebGLProgram) => ({
  positionAttributeLocation: gl.getAttribLocation(program, "a_position")!,
  aspectRatioUniformLocation: gl.getUniformLocation(program, "u_ratio")!,
  scaleXUniformLocation: gl.getUniformLocation(program, "u_scale_x")!,
  scaleYUniformLocation: gl.getUniformLocation(program, "u_scale_y")!,
  rotationUniformLocation: gl.getUniformLocation(program, "u_rotation")!,
  offsetUniformLocation: gl.getUniformLocation(program, "u_offset")!,
  colorUniformLocation: gl.getUniformLocation(program, "u_color")!,
});

const bufferFrom = (nums: number[]): WebGLBuffer => {
  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nums), gl.STATIC_DRAW);

  return buffer;
};

const circleProgram = createProgram(
  standardVertexShaderSource,
  circleFragmentShaderSource
);

const circleLocs = standardLocs(circleProgram);

const squareProgram = createProgram(
  standardVertexShaderSource,
  squareFragmentShaderSource
);

const squareLocs = standardLocs(squareProgram);

// prettier-ignore
const positions = [
  -1, -1,
  -1, 1,
  1, 1,

  -1, -1,
  1, -1,
  1, 1,
];

const squareBuffer = bufferFrom(positions);

const vao = gl.createVertexArray();

gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(circleLocs.positionAttributeLocation);
gl.vertexAttribPointer(
  circleLocs.positionAttributeLocation,
  2,
  gl.FLOAT,
  false,
  0,
  0
);

let lastTime = 0;

const drawObject = (
  objectLocs: {
    offsetUniformLocation: WebGLUniformLocation;
    scaleXUniformLocation: WebGLUniformLocation;
    scaleYUniformLocation: WebGLUniformLocation;
    rotationUniformLocation: WebGLUniformLocation;
    colorUniformLocation: WebGLUniformLocation;
  },
  offsetX: number,
  offsetY: number,
  scaleX: number,
  scaleY: number,
  rotation: number,
  color: [number, number, number]
) => {
  gl.uniform2f(objectLocs.offsetUniformLocation, offsetX, offsetY);
  gl.uniform1f(objectLocs.scaleXUniformLocation, scaleX);
  gl.uniform1f(objectLocs.scaleYUniformLocation, scaleY);
  gl.uniform1f(objectLocs.rotationUniformLocation, rotation);
  gl.uniform3f(objectLocs.colorUniformLocation, ...color);

  gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
};

type Vector = {
  x: number;
  y: number;
};

type Node = {
  label: number;
  position: Vector;
  velocity: Vector;
  color: [number, number, number];
};

const nodes: Node[] = [];
const edges: Map<number, number[]> = new Map();

let nextFreeLabel = 0;

const addEdge = (i: number, j: number) => {
  edges.get(j)!.push(i);
  edges.get(i)!.push(j);
};

const addNode = (position: Vector) => {
  nodes.push({
    label: nextFreeLabel,
    position,
    velocity: { x: Math.random(), y: Math.random() },
    color: [Math.random(), Math.random(), Math.random()],
  });
  edges.set(nextFreeLabel, []);
  nextFreeLabel++;
};

const NUM_NODES = 30;

for (let i = 0; i < NUM_NODES; i++) {
  addNode({
    x: Math.random() * 1.75 - 1.75 / 2,
    y: Math.random() * 1.75 - 1.75 / 2,
  });
}

for (let i = 0; i < NUM_NODES; i++) {
  for (let j = 0; j < NUM_NODES; j++) {
    if (Math.random() < 0.1) {
      addEdge(i, j);
    }
  }
}

const draw = (time: number) => {
  requestAnimationFrame(draw);

  const delta = time - lastTime;
  lastTime = time;

  canvas.width = window.innerWidth * 1.5;
  canvas.height = window.innerHeight * 1.5;

  let aspectRatio = canvas.width / canvas.height;

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.useProgram(squareProgram);
  gl.uniform1f(squareLocs.aspectRatioUniformLocation, aspectRatio);

  for (const node of nodes) {
    const adj = edges.get(node.label)!;
    for (const connectedLabel of adj) {
      const connectedNode = nodes.find((n) => n.label === connectedLabel)!;
      const dist = Math.hypot(
        (connectedNode.position.y - node.position.y) / 2,
        (connectedNode.position.x - node.position.x) / 2
      );
      const angle = Math.atan2(
        connectedNode.position.y - node.position.y,
        connectedNode.position.x - node.position.x
      );
      drawObject(
        squareLocs,
        (node.position.x + connectedNode.position.x) / 2,
        (node.position.y + connectedNode.position.y) / 2,
        dist,
        0.01,
        angle,
        [0, 0, 0]
      );
    }
  }

  gl.useProgram(circleProgram);
  gl.uniform1f(circleLocs.aspectRatioUniformLocation, aspectRatio);

  for (const node of nodes) {
    drawObject(
      circleLocs,
      node.position.x,
      node.position.y,
      0.1,
      0.1,
      0,
      node.color
    );
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
  x *= window.innerWidth / window.innerHeight;

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
