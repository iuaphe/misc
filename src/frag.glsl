#version 300 es

precision highp float;

uniform vec2 u_center;
uniform vec3 u_color;

in float v_time;
in vec2 v_position;
in vec3 v_color;

out vec4 outColor;

void main() {
   outColor = vec4(
        u_color,
    1.0) * (1.0 - step(0.05, distance(u_center, v_position)));
}