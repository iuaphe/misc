uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

attribute vec3 position;
attribute vec3 normal;

varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vec4 modelPositon = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPositon;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    vPosition = position;
    vNormal = normal;
}