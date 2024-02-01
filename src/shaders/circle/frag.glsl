#version 300 es

precision highp float;

in vec4 v_position;
 
out vec4 outColor;
 
void main() {
  float dist = sqrt(v_position.x * v_position.x + v_position.y * v_position.y);
  outColor = vec4(1.0 - step(1.0, dist)) * vec4(1.0, v_position.xy / 2.0 + 0.5, 1.0);
}
