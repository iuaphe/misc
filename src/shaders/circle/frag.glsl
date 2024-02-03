#version 300 es

precision highp float;

uniform vec3 u_color;

in vec4 v_position;
in vec2 v_clip;
 
out vec4 outColor;
 
void main() {
  float dist = sqrt(v_position.x * v_position.x + v_position.y * v_position.y);
  outColor = vec4(1.0 - step(1.0, dist)) * vec4(u_color, 1.0);
}
