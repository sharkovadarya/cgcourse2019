varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform vec2 textureSize;
void main() {
    vec2 pixel = vec2(1.0, 1.0) / textureSize;
    vec4 prev00 = texture2D(tDiffuse, vec2(vUv.x * 2.0, vUv.y * 2.0));
    vec4 prev01 = texture2D(tDiffuse, vec2(vUv.x * 2.0, vUv.y * 2.0) + pixel * vec2(0.0, 1.0));
    vec4 prev10 = texture2D(tDiffuse, vec2(vUv.x * 2.0, vUv.y * 2.0) + pixel * vec2(1.0, 0.0));
    vec4 prev11 = texture2D(tDiffuse, vec2(vUv.x * 2.0, vUv.y * 2.0) + pixel * vec2(1.0, 1.0));
    float min_value = min(prev00.x, min(prev01.x, min(prev10.x, prev11.x)));
    gl_FragColor = vec4(min_value);
}
