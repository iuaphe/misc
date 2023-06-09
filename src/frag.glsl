#version 300 es

precision highp float;

in float v_time;
in vec2 v_position;
in vec3 v_color;

out vec4 outColor;

vec2 grad( ivec2 z ) {
    int n = z.x+z.y*11111;
    n = (n<<13)^n;
    n = (n*(n*n*15731+789221)+1376312589)>>16;
    // simple random vectors
    return vec2(cos(float(n)),sin(float(n)));
}

float noise(in vec2 p) {
    ivec2 i = ivec2(floor(p));
     vec2 f = fract(p);
	
	vec2 u = f*f*(3.0-2.0*f); // feel free to replace by a quintic smoothstep instead

    return mix( mix( dot( grad( i+ivec2(0,0) ), f-vec2(0.0,0.0) ), 
                     dot( grad( i+ivec2(1,0) ), f-vec2(1.0,0.0) ), u.x),
                mix( dot( grad( i+ivec2(0,1) ), f-vec2(0.0,1.0) ), 
                     dot( grad( i+ivec2(1,1) ), f-vec2(1.0,1.0) ), u.x), u.y);
}

void main() {
   vec3 color = vec3(0.0, 0.0, 0.0);

   vec2 uv = (v_position + 1.0) / 2.0;

   uv *= 20.0;

   color = floor(vec3(noise(uv + v_time * 5.0) * 2.0) * 5.0) / 5.0;

   outColor = vec4(
        color,
    1.0);
}