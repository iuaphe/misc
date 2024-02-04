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

type Edge = {
  endNodeLabel: number;
  color: [number, number, number];
};

const nodes: Node[] = [];
const edges: Map<number, Edge[]> = new Map();

let nextFreeLabel = 0;

const randomColor = () =>
  [Math.random(), Math.random(), Math.random()] as [number, number, number];

const addEdge = (i: number, j: number) => {
  edges.get(j)!.push({
    endNodeLabel: i,
    color: [0.34901960784, 0.34901960784, 0.34901960784],
  });
  edges.get(i)!.push({
    endNodeLabel: j,
    color: [0.34901960784, 0.34901960784, 0.34901960784],
  });
};

const addNode = (position: Vector) => {
  nodes.push({
    label: nextFreeLabel,
    position,
    velocity: { x: 0, y: 0 },
    // color: [201 / 255, 218 / 255, 248 / 255],
    color: randomColor(),
  });
  edges.set(nextFreeLabel, []);
  nextFreeLabel++;
};

const NUM_NODES = 200;

for (let i = 0; i < NUM_NODES; i++) {
  addNode({
    x: Math.random() * 300 - 300 / 2,
    y: Math.random() * 300 - 300 / 2,
  });
}

for (let i = 0; i < NUM_NODES; i++) {
  for (let j = 0; j < NUM_NODES; j++) {
    if (i < j && Math.random() < 1 / Math.pow(i - j, 2)) {
      addEdge(i, j);
    }
  }
}

// for (const node of nodes) {
//   if (edges.get(node.label)!.length === 0) {
//     edges.get(node.label)!.push({ endNodeLabel: 0, color: randomColor() });
//     edges.get(0)!.push({ endNodeLabel: node.label, color: randomColor() });
//   }
// }

let viewScale = 0.03;

// let lastUpdate = 0;
// let processing = [0];
// let processed = new Set();

const draw = (time: number) => {
  requestAnimationFrame(draw);

  const delta = time - lastTime;
  lastTime = time;

  // if (time - lastUpdate > 3000 && processing.length > 0) {
  //   const nextLabel = processing.pop()!;
  //   processed.add(nextLabel);
  //   const node = nodes.find((node) => node.label === nextLabel)!;
  //   node.color = [1, 0, 0];
  //   for (const edge of edges.get(nextLabel)!) {
  //     console.log(edge);
  //     if (!processed.has(edge.endNodeLabel)) {
  //       edge.color = [1, 0, 0];
  //       processing.push(edge.endNodeLabel);
  //     }
  //   }
  //   lastUpdate = time;
  // }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    for (let j = 0; j < i; j++) {
      const otherNode = nodes[j];
      const dist = Math.hypot(
        otherNode.position.y - node.position.y,
        otherNode.position.x - node.position.x
      );
      const angle = Math.atan2(
        otherNode.position.y - node.position.y,
        otherNode.position.x - node.position.x
      );

      if (
        edges.get(i)!.find((edge) => edge.endNodeLabel === otherNode.label) !==
        undefined
      ) {
        const springMagnitude = (1 * (dist - 0.3) * delta) / 1000;

        node.velocity.x += springMagnitude * Math.cos(angle);
        node.velocity.y += springMagnitude * Math.sin(angle);
        otherNode.velocity.x += -1 * springMagnitude * Math.cos(angle);
        otherNode.velocity.y += -1 * springMagnitude * Math.sin(angle);
      }

      const repulsionMagnitude = ((10.0 / Math.pow(dist, 2)) * delta) / 1000;

      node.velocity.x += -1 * repulsionMagnitude * Math.cos(angle);
      node.velocity.y += -1 * repulsionMagnitude * Math.sin(angle);
      otherNode.velocity.x += repulsionMagnitude * Math.cos(angle);
      otherNode.velocity.y += repulsionMagnitude * Math.sin(angle);
    }
    node.velocity.y *= Math.pow(0.3, delta / 1000);
    node.velocity.x *= Math.pow(0.3, delta / 1000);
    node.position.x += (node.velocity.x * delta) / 1000;
    node.position.y += (node.velocity.y * delta) / 1000;
  }

  // let total: Vector = { x: 0, y: 0 };

  // for (const node of nodes) {
  //   total.x += node.position.x;
  //   total.y += node.position.y;
  // }

  // total.x /= nodes.length;
  // total.y /= nodes.length;

  // for (const node of nodes) {
  //   node.position.x -= total.x;
  //   node.position.y -= total.y;
  // }

  /* gravity (?) */

  // for (const node of nodes) {
  //   const dist = Math.hypot(node.position.y, node.position.x);
  //   const angle = Math.atan2(node.position.y, node.position.x);
  //   node.velocity.x +=
  //     -1 *
  //     0.01 *
  //     Math.sign(dist - 50) *
  //     Math.pow(Math.abs(dist - 50), 0.5) *
  //     Math.cos(angle);
  //   node.velocity.y +=
  //     -1 *
  //     0.01 *
  //     Math.sign(dist - 50) *
  //     Math.pow(Math.abs(dist - 50), 0.5) *
  //     Math.sin(angle);
  // }

  if (pressing) {
    for (const node of nodes) {
      const dist = Math.hypot(
        node.position.y - mousePos.y,
        node.position.x - mousePos.x
      );
      const angle = Math.atan2(
        node.position.y - mousePos.y,
        node.position.x - mousePos.x
      );
      node.velocity.x +=
        -1 *
        0.01 *
        Math.sign(dist - 50) *
        Math.pow(Math.abs(dist - 50), 2.0) *
        Math.cos(angle);
      node.velocity.y +=
        -1 *
        0.01 *
        Math.sign(dist - 50) *
        Math.pow(Math.abs(dist - 50), 2.0) *
        Math.sin(angle);
    }
  }

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
    for (const edge of adj) {
      if (node.label < edge.endNodeLabel) {
        const connectedNode = nodes.find((n) => n.label === edge.endNodeLabel)!;
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
          (node.position.x * viewScale + connectedNode.position.x * viewScale) /
            2,
          (node.position.y * viewScale + connectedNode.position.y * viewScale) /
            2,
          dist * viewScale,
          0.01 * Math.sqrt(viewScale),
          angle,
          edge.color
        );
      }
    }
  }

  gl.useProgram(circleProgram);
  gl.uniform1f(circleLocs.aspectRatioUniformLocation, aspectRatio);

  for (const node of nodes) {
    drawObject(
      circleLocs,
      node.position.x * viewScale,
      node.position.y * viewScale,
      0.1 * Math.sqrt(viewScale),
      0.1 * Math.sqrt(viewScale),
      0,
      node.color
    );
  }
};

let mousePos: Vector = { x: 0, y: 0 };

document.addEventListener("mousemove", (e) => {
  let x = e.offsetX / window.innerWidth;
  let y = e.offsetY / window.innerHeight;

  y = -(y * 2 - 1);
  x = x * 2 - 1;
  x *= window.innerWidth / window.innerHeight;

  x /= viewScale;
  y /= viewScale;

  mousePos = { x, y };
});

let pressing = false;

document.addEventListener("mousedown", (_e) => {
  pressing = true;
});

document.addEventListener("mouseup", (_e) => {
  pressing = false;
});

document.addEventListener("wheel", (e) => {
  if (e.deltaY > 0) {
    viewScale *= 0.9;
  } else {
    viewScale /= 0.9;
  }
});

draw(0);
