#version 300 es

in vec2 a_position;

uniform float u_time;
uniform float u_ratio;

out vec2 v_position;
out float v_time;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  
  gl_Position.x /= u_ratio;

  v_position = a_position;
  v_time = u_time;
}