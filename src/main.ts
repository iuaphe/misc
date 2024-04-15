import standardVertexShaderSource from "./shaders/standard/vert.glsl?raw";
import circleFragmentShaderSource from "./shaders/circle/frag.glsl?raw";
import squareFragmentShaderSource from "./shaders/square/frag.glsl?raw";
import "./style.css";

import * as Tone from 'tone'

// const synth = new Tone.PolySynth().toDestination();
const synth = new Tone.Synth().toDestination();

type SearchType = 'DFS' | 'BFS' | 'DJI' | 'MST';

const SEARCH_TYPE: string = 'BFS' satisfies SearchType;

const DO_RAINBOW_EDGES = false;
const DO_PHYSICS = false;

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
  if (edges.get(j)!.find((edge) => edge.endNodeLabel === i) !== undefined 
   || edges.get(i)!.find((edge) => edge.endNodeLabel === j) !== undefined) {
    return;
  }
  edges.get(j)!.push({
    endNodeLabel: i,
    color: [0.34901960784, 0.34901960784, 0.34901960784],
  });
  edges.get(i)!.push({
    endNodeLabel: j,
    color: [0.34901960784, 0.34901960784, 0.34901960784],
  });
};

const getEdge = (i: number, j: number) => {
  return edges.get(i)!.find((edge) => edge.endNodeLabel === j)!;
}

const removeEdge = (i: number, j: number) => {
  edges.set(
    j,
    edges.get(j)!.filter((edge) => edge.endNodeLabel !== i)
  );
  edges.set(
    i,
    edges.get(i)!.filter((edge) => edge.endNodeLabel !== j)
  );
}

const changeEdgeColor = (i: number, j: number, color: [number, number, number]) => {
  edges.get(j)!.find((edge) => edge.endNodeLabel === i)!.color = color;
  edges.get(i)!.find((edge) => edge.endNodeLabel === j)!.color = color;
}

const addNode = (position: Vector): number => {
  let newLabel = nextFreeLabel;
  nodes.push({
    label: newLabel,
    position,
    velocity: { x: 0, y: 0 },
    // color: [201 / 255, 218 / 255, 248 / 255],
    color: [0.5, 0.5, 0.5]
    // color: randomColor(),
  });
  edges.set(nextFreeLabel, []);
  nextFreeLabel++;
  return newLabel;
};

const getNode = (label: number) => nodes.find((node) => node.label === label)!;

const newBinaryTree = (level: number, index: number): number => {
  const rootLabel = addNode({
    x: (30 / (level * level)) * (index - (1 / 2) * (Math.pow(2, level) - 1)),
    y: -level * 10,
  });
  if (Math.random() < Math.pow(0.92, level)) {
    const leftLabel = newBinaryTree(level + 1, 2 * index);
    addEdge(rootLabel, leftLabel);
  }
  if (Math.random() < Math.pow(0.93, level)) {
    const rightLabel = newBinaryTree(level + 1, 2 * index + 1);
    addEdge(rootLabel, rightLabel);
  }
  return rootLabel;
};

// const root = newBinaryTree(0, 0);

const NUM_NODES = 300;

for (let i = 0; i < NUM_NODES; i++) {
  addNode({
    // x: Math.random() + i * 80,
    // y: Math.random() * 500,
    // x: 10 * (i * 0.1 + Math.random() * 20 - 1.5) * Math.sin(i * 2 * Math.PI / NUM_NODES),
    // y: 10 * (i * 0.1 + Math.random() * 20 - 1.5) * Math.cos(i * 2 * Math.PI / NUM_NODES)
    x: Math.random() * 1000,
    y: Math.random() * 1000,
  });
}

// for (let i = 0; i < nodes.length; i++) {
//   if (i < nodes.length - 1) {
//     addEdge(i, i + 1);
//   }
//   // addEdge(i, (2 * i) % nodes.length);
//   const j = Math.max(Math.min(i + Math.floor(Math.random() * 30) - 15, nodes.length - 1), 0);
//   if (i !== j && Math.random() < 0.8) {
//     addEdge(i, j);
//   }
// }

for (let i = 0; i < nodes.length; i++) {
  for (let j = 0; j < i; j++) {
    const n1 = getNode(i)
    const n2 = getNode(j)
    const dist = Math.hypot(n1.position.y - n2.position.y, n1.position.x - n2.position.x)
    const p = Math.pow(0.02, dist / 200)
    if (Math.random() < p) 
      addEdge(i, j)
  }
}


let dfsStack: [number | undefined, number, number, number][] = [[undefined, 0, 0, 0]];
let dfsVisited: boolean[] = new Array(nodes.length).fill(false);
let lastSeen = -1;
let lastColor: [number, number, number] = [1, 0, 0];
let markedEdges: [number, number][] = [];

const doDfsStep = () => {
  if (dfsStack.length === 0) {
    for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < i; j++) {
          if (markedEdges.find((edge) => edge[0] === i && edge[1] === j) === undefined 
        && markedEdges.find((edge) => edge[0] === j && edge[1] === i) === undefined) {
            removeEdge(i, j);
          }
        }
      }
      synth.triggerRelease()
      return;
  }
  let current;
  if (SEARCH_TYPE === 'DFS') {
    current = dfsStack.pop()!
  } else if (SEARCH_TYPE === 'BFS') {
    current = dfsStack.splice(0, 1)[0]!;
  } else if (SEARCH_TYPE === 'MST') {
    let bestNode = -1;
    let bestDist = 1000000;
    for (let i = 0; i < dfsStack.length; i++) {
      if (dfsStack[i][2] < bestDist) {
        bestNode = i;
        bestDist = dfsStack[i][2];
      }
    }
    current = dfsStack.splice(bestNode, 1)[0];
  } else if (SEARCH_TYPE === 'DJI') {
    let bestNode = -1;
    let bestDist = 1000000;
    for (let i = 0; i < dfsStack.length; i++) {
      if (dfsStack[i][3] < bestDist) {
        bestNode = i;
        bestDist = dfsStack[i][3];
      }
    }
    current = dfsStack.splice(bestNode, 1)[0];
 
  } else { throw new Error() }
  if (dfsVisited[current[1]]) {
    doDfsStep();
    return
  }
  dfsVisited[current[1]] = true;
  if (lastSeen !== -1) {
    nodes[lastSeen].color = lastColor;
  }
  nodes[current[1]].color = [0, 0, 1];
  lastSeen = current[1];
  if (current[0] !== undefined) {
    let color = [1, 0, 0];
    lastColor = color as [number, number, number];
    changeEdgeColor(current[0], current[1], color as [number, number, number]);
    markedEdges.push([current[0], current[1]]);
  } else {
    synth.triggerAttack(0)
  }
  // synth.releaseAll()
  // synth.triggerAttack([getNode(current[1]).position.x, getNode(current[1]).position.y]);
  // synth.setNote(getNode(current[1]).position.x + getNode(current[1]).position.y);

  const rootPosition = getNode(0).position
  const thisPosition = getNode(current[1]).position
  // synth.setNote(
  //   Math.hypot(rootPosition.x - thisPosition.x, rootPosition.y - thisPosition.y) + 150
  // );

  synth.setNote(current[3] + 150);

  for (const edge of edges.get(current[1])!) {
    if (!dfsVisited[edge.endNodeLabel]) {
      dfsStack.push([
        current[1], 
        edge.endNodeLabel, 
        Math.hypot(getNode(edge.endNodeLabel).position.x - thisPosition.x, getNode(edge.endNodeLabel).position.y - thisPosition.y),
        current[3] + Math.hypot(getNode(edge.endNodeLabel).position.x - thisPosition.x, getNode(edge.endNodeLabel).position.y - thisPosition.y)
      ]);
      getNode(edge.endNodeLabel).color = [0, 1, 0];
      changeEdgeColor(current[1], edge.endNodeLabel, [0, 1, 0]);
    }
  }
}

const doPhysics = (delta: number) => {
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
        const springMagnitude = (1 * (dist - 0.3) * delta) / 10000 * 3 * 0;

        node.velocity.x += springMagnitude * Math.cos(angle);
        node.velocity.y += springMagnitude * Math.sin(angle);
        otherNode.velocity.x += -1 * springMagnitude * Math.cos(angle);
        otherNode.velocity.y += -1 * springMagnitude * Math.sin(angle);
      }

      const repulsionMagnitude = ((10.0 / Math.pow(dist, 2)) * delta) / 10000 * 3400;

      node.velocity.x += -1 * repulsionMagnitude * Math.cos(angle);
      node.velocity.y += -1 * repulsionMagnitude * Math.sin(angle);
      otherNode.velocity.x += repulsionMagnitude * Math.cos(angle);
      otherNode.velocity.y += repulsionMagnitude * Math.sin(angle);
    }
    node.velocity.y *= Math.pow(0.5, delta / 1000);
    node.velocity.x *= Math.pow(0.5, delta / 1000);
    node.position.x += (node.velocity.x * delta) / 1000;
    node.position.y += (node.velocity.y * delta) / 1000;
  }

  let total: Vector = { x: 0, y: 0 };

  for (const node of nodes) {
    total.x += node.position.x;
    total.y += node.position.y;
  }

  total.x /= nodes.length;
  total.y /= nodes.length;

  for (const node of nodes) {
    node.position.x -= total.x;
    node.position.y -= total.y;
  }

  /* gravity (?) */
  for (const node of nodes) {
    const dist = Math.hypot(node.position.y, node.position.x);
    const angle = Math.atan2(node.position.y, node.position.x);
    node.velocity.x +=
      -1 *
      0.01 *
      Math.sign(dist - 50) *
      Math.pow(Math.abs(dist - 50), 0.5) *
      Math.cos(angle);
    node.velocity.y +=
      -1 *
      0.01 *
      Math.sign(dist - 50) *
      Math.pow(Math.abs(dist - 50), 0.5) *
      Math.sin(angle);
  }
};

const moveWithClick = () => {
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
};

let viewScale = 0.01;
let viewOffset: Vector = { x: 0, y: 0 };

const draw = (time: number) => {
  requestAnimationFrame(draw);

  const delta = time - lastTime;
  lastTime = time;

  if (DO_PHYSICS) {
    doPhysics(delta);
  }

  // moveWithClick();

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
            2 + viewOffset.x * viewScale,
          (node.position.y * viewScale + connectedNode.position.y * viewScale) /
            2 + viewOffset.y * viewScale,
          dist * viewScale,
          0.08 * Math.sqrt(viewScale),
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
      node.position.x * viewScale + viewOffset.x * viewScale,
      node.position.y * viewScale + viewOffset.y * viewScale,
      0.4 * Math.sqrt(viewScale),
      0.4 * Math.sqrt(viewScale),
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

  // console.log(x - mousePos.x, y - mousePos.y);
  if (pressing) {
    viewOffset.x += x - mousePos.x;
    viewOffset.y += y - mousePos.y;
  }

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

document.addEventListener("keydown", (e) => {
  if (e.key === "d") {
    doDfsStep();
  } 
});

draw(0);
