precision mediump float;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec4 vModelPosition;

varying float vRandom;
varying float vRatio;

void main() {
    gl_FragColor = vec4(
        1.0, sin(vModelPosition.z / 2.0) * 2.0 + 1.0, 1.0, 0.0
    );
}