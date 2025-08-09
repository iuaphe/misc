precision mediump float;

varying vec3 vNormal;
varying vec3 vPosition;

varying float vRandom;
varying float vRatio;

void main() {
    gl_FragColor = vec4(
        sin(length(vPosition)) * 2.0 + 1.0, 
        0.0,
        cos(length(vPosition) * 1.618) * 2.0 + 1.0, 
        1.0
    );
}