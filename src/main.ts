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

const image = new Image();
image.src = "/mochi.png";

image.onload = () => {
  render(image);
};

const render = (image: TexImageSource) => {
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
  const ratioUniformLocation = gl.getUniformLocation(program, "u_ratio")!;
  const imageUniformLocation = gl.getUniformLocation(program, "u_image")!;

  const vao = createVao(
    gl,
    positionLocation,
    [-1, -1, 1, -1, 1, 1, -1, -1, -1, 1, 1, 1]
  );

  gl.useProgram(program);

  const texture = gl.createTexture()!;

  gl.activeTexture(gl.TEXTURE0);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload the image into the texture.
  var mipLevel = 0; // the largest mip
  var internalFormat = gl.RGBA; // format we want in the texture
  var srcFormat = gl.RGBA; // format of data we are supplying
  var srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
  gl.texImage2D(
    gl.TEXTURE_2D,
    mipLevel,
    internalFormat,
    srcFormat,
    srcType,
    image
  );

  const primitiveType = gl.TRIANGLES;
  const count = 6;

  let u = 0;

  const draw = () => {
    requestAnimationFrame(draw);

    canvas.width = window.innerWidth * 1.5;
    canvas.height = window.innerHeight * 1.5;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    u += 1;

    gl.uniform1f(ratioUniformLocation, canvas.width / canvas.height);
    gl.uniform1f(timeUniformLocation, u);
    gl.uniform1i(imageUniformLocation, gl.TEXTURE0);

    gl.bindVertexArray(vao);
    gl.drawArrays(primitiveType, 0, count);
  };

  draw();
};
