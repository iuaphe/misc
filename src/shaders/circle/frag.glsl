#version 300 es

precision highp float;

uniform vec3 u_color;

in vec4 v_position;
in vec2 v_clip;
 
out vec4 outColor;
 
void main() {
  float dist = sqrt(v_position.x * v_position.x + v_position.y * v_position.y);
  // float dist = abs(v_position.x) + abs(v_position.y);
  // float dist = abs(sin(v_position.x * 2.0)) + abs(sin(v_position.y * 2.0));

  // outColor = vec4(1.0 - step(0.9, dist)) * vec4(u_color, 1.0);
  outColor = 
                      (1.0 - step(0.8, dist)) * vec4(u_color, 1.0) +
    step(0.8, dist) * (1.0 - step(1.0, dist)) * vec4(u_color * 0.8, 1.0);
}
