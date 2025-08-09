precision mediump float;

varying vec3 vNormal;
varying vec3 vPosition;

varying float vRandom;
varying float vRatio;

void main() {
    vec3 color1 = vec3(1.0, 0.0, 0.0);
    vec3 color2 = vec3(0.0, 0.0, 1.0);
    float normalized = (vPosition.y + 0.5);
    vec3 color = color1 * normalized + color2 * (1.0 - normalized);
    gl_FragColor = vec4(color, 1.0);
}