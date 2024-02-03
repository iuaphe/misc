#version 300 es

precision highp float;

uniform vec3 u_color;

in vec4 v_position;
in vec2 v_clip;
 
out vec4 outColor;
 
void main() {
  outColor = vec4(u_color, 1.0);
}
