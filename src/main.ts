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

let locations = [];

for (let i = 0; i < 1000; i++) locations.push(Math.random(), Math.random());

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

  for (let i = 0; i < 5000; i++) {
    let d = i * i * 0.31313;
    d = d - Math.floor(d);
    d *= 3;
    let x = (locations[2 * i] - 1 / 2) * 10;
    let y = (locations[2 * i + 1] - 1 / 2) * 10;
    let dist = Math.hypot(x, y);
    let angle = Math.atan2(y, x);
    let newAngle = time / 1000;
    angle += newAngle;
    let newDist = Math.pow(0.8, time / 10000);
    dist *= newDist;
    x = dist * Math.cos(angle);
    y = dist * Math.sin(angle);
    drawObject(
      squareLocs,
      x,
      y,
      0.1 * newDist,
      0.1 * newDist,
      (time / 60.0 / (2 * Math.PI)) * d + newAngle,
      [
        (Math.sin(time / 60.0 / (2 * Math.PI) + d * 24) + 1) / 2,
        (Math.sin((time / 60.0 / (2 * Math.PI)) * (1.6 + d)) + 1) / 2,
        (Math.sin((time / 60.0 / (2 * Math.PI)) * (2.7 + d * 0.3114)) + 1) / 2,
      ]
    );
  }

  gl.useProgram(circleProgram);
  gl.uniform1f(circleLocs.aspectRatioUniformLocation, aspectRatio);
};

draw(0);
