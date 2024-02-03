#version 300 es

uniform float u_ratio;
uniform float u_scale_x;
uniform float u_scale_y;
uniform float u_rotation;
uniform vec2 u_offset;
	 
in vec4 a_position;

out vec4 v_position;
out vec2 v_clip;

void main() {
  vec2 position = a_position.xy;

  position.xy *= vec2(u_scale_x, u_scale_y);
  
  float angle = atan(position.y, position.x);
  float dist = sqrt(pow(position.x, 2.0) + pow(position.y, 2.0));
  angle += u_rotation;
  position = vec2(dist * cos(angle), dist * sin(angle));

  position += u_offset;
  position.x /= u_ratio;

  gl_Position = vec4(position, a_position.zw);

  v_position = a_position;
  v_clip = position;
}