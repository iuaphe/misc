#version 300 es

precision highp float;

uniform sampler2D u_image;

in float v_time;
in vec2 v_position;

out vec4 outColor;

void main() {
    vec2 coords = (v_position + 1.0) / 2.0;
    coords.y = 1.0 - coords.y;

    // WAVY
    // coords.x += sin(coords.y * 10.0 + v_time / 10.0) / 30.0;
    // coords.y += sin(coords.x * 10.0 + v_time / 10.0) / 30.0;
    
    // DICE
    coords.y += sin(v_time / 100.0) * 120.0 / 100.0 * (mod(floor(coords.x * 20.0) * 10.0, 7.0) / 20.0 * 5.0 + 1.0);
    coords.y = mod(coords.y, 1.0);

    //PIXELIZE
    // float res = v_time;
    // coords = floor(coords * res) / res;

    // vec2 centerVec = coords - vec2(0.5);
    // float angle = atan(centerVec.y, centerVec.x);
    // float len = length(centerVec);
    
    // SQUASH
    // len = pow(len, 1.0 + sin(v_time / 60.0 * 6.28318));

    // TWIST
    // angle += len * (((pow(v_time, 1.5) / 10.0) / 50.0)) * 3.0;
    // angle += len * sin(v_time / 60.0 * 2.0 * 3.1415926) * 10.0;

    // coords = len * vec2(cos(angle), sin(angle)) + vec2(0.5);

    outColor = vec4(texture(u_image, coords));

    // outColor = vec4(
    //       pow(
    //         length(texture(u_image, coords)
    //         - texture(u_image, coords + vec2(0.005, 0.00))), 
    //         2.0),
    //       pow(
    //         length(texture(u_image, coords)
    //         - texture(u_image, coords + vec2(0.00, 0.005))), 
    //         2.0),
    //       0.0
    // , 1.0);
}
