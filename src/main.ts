import vert from "./vert.glsl?raw";
import frag from "./frag.glsl?raw";
import "./style.css";

const createVao = (
  gl: WebGL2RenderingContext,
  location: number,
  verticies: number[]
): WebGLVertexArrayObject => {
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticies), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);

  return vao;
};

const canvas = document.querySelector("canvas")!;

const gl = canvas.getContext("webgl2")!;

const vertShader = gl.createShader(gl.VERTEX_SHADER)!;
gl.shaderSource(vertShader, vert);
gl.compileShader(vertShader);
if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
  throw new Error(gl.getShaderInfoLog(vertShader)!);
}

const fragShader = gl.createShader(gl.FRAGMENT_SHADER)!;
gl.shaderSource(fragShader, frag);
gl.compileShader(fragShader);
if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
  throw new Error(gl.getShaderInfoLog(fragShader)!);
}

const program = gl.createProgram()!;
gl.attachShader(program, vertShader);
gl.attachShader(program, fragShader);
gl.linkProgram(program);

gl.useProgram(program);

const positionLocation = gl.getAttribLocation(program, "a_position")!;

const timeUniformLocation = gl.getUniformLocation(program, "u_time")!;
const centerUniformLocation = gl.getUniformLocation(program, "u_center")!;
const colorUniformLocation = gl.getUniformLocation(program, "u_color")!;
const ratioUniformLocation = gl.getUniformLocation(program, "u_ratio")!;

type Square = {
  vao: WebGLVertexArrayObject;
  speed: number;
  color: [number, number, number];
  center: [number, number];
};

const squares: Square[] = [];

const squareCount = 20;

for (let intY = 0; intY < squareCount; intY++) {
  let x = 0;
  let y = intY / (squareCount / 2) - 1;
  const squareSize = 2 / squareCount;
  squares.push({
    vao: createVao(gl, positionLocation, [
      x,
      y,
      x + squareSize,
      y,
      x + squareSize,
      y + squareSize,
      x,
      y,
      x,
      y + squareSize,
      x + squareSize,
      y + squareSize,
    ]),
    speed: Math.random() + 0.5,
    center: [x + squareSize / 2, y + squareSize / 2],
    color: [Math.random(), Math.random(), Math.random()],
  });
}

gl.useProgram(program);

const primitiveType = gl.TRIANGLES;
const count = 6;

let u = 0;

const draw = () => {
  requestAnimationFrame(draw);

  canvas.width = window.innerWidth * 1.5;
  canvas.height = window.innerHeight * 1.5;

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  u += 0.01;

  gl.uniform1f(ratioUniformLocation, canvas.width / canvas.height);

  for (const square of squares) {
    gl.bindVertexArray(square.vao);
    gl.uniform1f(timeUniformLocation, u * square.speed);
    gl.uniform2f(centerUniformLocation, ...square.center);
    gl.uniform3f(colorUniformLocation, ...square.color);
    gl.drawArrays(primitiveType, 0, count);
  }
};

draw();
