#version 300 es

precision highp float;

in vec4 v_position;
in vec2 v_clip;
 
out vec4 outColor;
 
void main() {
  float dist = sqrt(v_position.x * v_position.x + v_position.y * v_position.y);
  vec3 c1 = vec3(0.0, 136.0, 255.0) / 256.0;
  vec3 c2 = vec3(255.0, 200.0, 0.0) / 256.0;
  outColor = vec4(mix(c1, c2, v_position.x), 1.0);
}
