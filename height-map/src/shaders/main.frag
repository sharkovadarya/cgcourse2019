const int MAX_SPLITS = 4;

uniform sampler2D oceanTexture;
uniform sampler2D sandyTexture;
uniform sampler2D grassTexture;
uniform sampler2D rockyTexture;
uniform sampler2D snowyTexture;

uniform sampler2D vectorsTextures[MAX_SPLITS];
uniform int splitCount;

uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

varying vec2 vUV;
varying vec3 pos;

varying vec4 projected_texcoord1;
varying vec4 projected_texcoord2;
varying vec4 projected_texcoords[MAX_SPLITS];

varying float vAmount;

bool get_projected_texture_color(vec4 coord, sampler2D texture, out vec4 color) {
  vec3 projected_c = coord.xyz / coord.w;
  bool in_range = projected_c.x >= -1.0 && projected_c.x <= 1.0 &&
  projected_c.y >= -1.0 && projected_c.y <= 1.0;
  if (in_range) {
    /*color = texture2D(texture, vec2(0.5, 0.5) + 0.5 * projected_c.xy);
    return true;*/
    if (projected_c.x <= -0.95 || projected_c.y <= -0.95 ||
    projected_c.x >= 0.95 || projected_c.y >= 0.95) {
      color = vec4(1.0, 0.0, 0.0, 1.0);
      return true;
    } else {
      color = texture2D(texture, vec2(0.5, 0.5) + 0.5 * projected_c.xy);
      return true;
    }
  }

  color =  vec4(-1.0, 0.0, 0.0, 0.0);
  return false;
}

void main() {
  vec4 water = (smoothstep(0.01, 0.25, vAmount) - smoothstep(0.24, 0.26, vAmount)) * texture2D(oceanTexture, vUV * 10.0);
  vec4 sandy = (smoothstep(0.24, 0.27, vAmount) - smoothstep(0.28, 0.31, vAmount)) * texture2D(sandyTexture, vUV * 10.0);
  vec4 grass = (smoothstep(0.28, 0.32, vAmount) - smoothstep(0.35, 0.40, vAmount)) * texture2D(grassTexture, vUV * 10.0);
  vec4 rocky = (smoothstep(0.30, 0.50, vAmount) - smoothstep(0.40, 0.70, vAmount)) * texture2D(rockyTexture, vUV * 20.0);
  vec4 snowy = (smoothstep(0.50, 0.65, vAmount)) * texture2D( snowyTexture, vUV * 10.0 );

  vec4 color = vec4(-1.0, 0.0, 0.0, 0.0);

  for (int i = 0; i < MAX_SPLITS; ++i) {
    if (i >= splitCount) {
      break;
    }
    if (get_projected_texture_color(projected_texcoords[i], vectorsTextures[i], color)) {
      vec4 next_split_color = vec4(-1.0, 0.0, 0.0, 0.0);
      if (i + 1 < splitCount && get_projected_texture_color(projected_texcoords[i], vectorsTextures[i], next_split_color)) {
        color = mix(color, next_split_color, 0.5);
      }
      break;
    }
  }

  if (color.x == -1.0 || color.w == 0.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) + water + sandy + grass + rocky + snowy;
  } else {
    gl_FragColor = color;
  }

    #ifdef USE_FOG
    #ifdef USE_LOGDEPTHBUF_EXT
  float depth = gl_FragDepthEXT / gl_FragCoord.w;
  #else
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  #endif
  float fogFactor = smoothstep( fogNear, fogFar, depth );
  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
  #endif
}
