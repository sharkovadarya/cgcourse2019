const int MAX_SPLITS = 10;

uniform sampler2D terrainTexture;

uniform sampler2D vectorsTextures[MAX_SPLITS];
uniform int splitCount;

uniform float cascadesBlendingFactor;

uniform int displayBorders;
uniform int enableCSM;
uniform int enableLiSPSM;
uniform int displayPixels;

uniform int displayPixelAreas;
uniform float resolution;

uniform mat4 textureMatrices[MAX_SPLITS];

varying vec2 vUV;
varying vec4 posWS;

varying vec4 projected_texcoords[MAX_SPLITS];

bool inRange(vec2 v) {
  return v.x >= -1.0 && v.x <= 1.0 && v.y >= -1.0 && v.y <= 1.0;
}

bool get_projected_texture_color(vec4 coord, int idx, out vec4 color) {
  vec3 projected_c = coord.xyz / coord.w;
  vec2 c;
  if (enableLiSPSM == 1) {
    c = projected_c.xz;
  } else {
    c = projected_c.xy;
  }
  bool in_range = inRange(c);
  if (in_range) {
    vec2 tex_coord = vec2(0.5, 0.5) + 0.5 * c;
    // a switch statement stops getting parsed after the first colon
    // directly indexing an array (vectorsTextures[i]) proved to be impossible
    // DataTexture2DArray is somehow not bundled in the three.js npm version
    // thus we have to resort to a horrible lengthy if statement
    if (idx == 0) {
      color = texture2D(vectorsTextures[0], tex_coord);
    } else if (idx == 1) {
      color = texture2D(vectorsTextures[1], tex_coord);
    } else if (idx == 2) {
      color = texture2D(vectorsTextures[2], tex_coord);
    } else if (idx == 3) {
      color = texture2D(vectorsTextures[3], tex_coord);
    } else if (idx == 4) {
      color = texture2D(vectorsTextures[4], tex_coord);
    } else if (idx == 5) {
      color = texture2D(vectorsTextures[5], tex_coord);
    } else if (idx == 6) {
      color = texture2D(vectorsTextures[6], tex_coord);
    } else if (idx == 7) {
      color = texture2D(vectorsTextures[7], tex_coord);
    } else if (idx == 8) {
      color = texture2D(vectorsTextures[8], tex_coord);
    } else if (idx == 9) {
      color = texture2D(vectorsTextures[9], tex_coord);
    }

    if (displayPixels == 1) {
      tex_coord.x *= resolution;
      tex_coord.y *= resolution;
      if (fract(tex_coord.x) <= 0.05 || fract(tex_coord.y) <= 0.05 || fract(tex_coord.x) >= 0.95 || fract(tex_coord.y) >= 0.95) {
        color = mix(texture2D(terrainTexture, vUV), vec4(1, 0, 0, 0.1), 0.4);
      } else {
        color.w = 0.0;
      }
      /*if (color.w != 0.0) {

      }*/
    }

    if (displayBorders == 1) {
      if (c.x <= -0.95 || c.y <= -0.95 || c.x >= 0.95 || c.y >= 0.95) {
        color = vec4(1.0, 0.0, 0.0, 1.0);
      }
    }
    return true;

  }

  color = vec4(-1.0, 0.0, 0.0, 0.0);
  return false;
}

float calculateTriangleArea(vec2 a, vec2 b, vec2 c) {
  return abs(a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2.0;
}

void main() {
  vec4 color = vec4(-1.0, 0.0, 0.0, 0.0);

  if (enableCSM == 1) {
    for (int i = 0; i < MAX_SPLITS; ++i) {
      if (i >= splitCount) {
        break;
      }
      vec3 projected_c = projected_texcoords[i].xyz / projected_texcoords[i].w;

      if (displayPixelAreas == 1) {
        vec2 c = enableLiSPSM == 1 ? projected_c.xz : projected_c.xy;
        if (inRange(c)) {
          vec4 dx = dFdx(posWS);
          vec4 dy = dFdy(posWS);
          vec4 p1 = textureMatrices[i] * vec4(posWS + dx / 2.0 + dy / 2.0);
          vec4 p2 = textureMatrices[i] * vec4(posWS - dx / 2.0 + dy / 2.0);
          vec4 p3 = textureMatrices[i] * vec4(posWS + dx / 2.0 - dy / 2.0);
          vec4 p4 = textureMatrices[i] * vec4(posWS - dx / 2.0 - dy / 2.0);
          float area1;
          float area2;

          p1 /= p1.w;
          p2 /= p2.w;
          p3 /= p3.w;
          p4 /= p4.w;

          if (enableLiSPSM == 1) {
          area1 = calculateTriangleArea(p1.xz, p2.xz, p4.xz);
          area2 = calculateTriangleArea(p1.xz, p3.xz, p4.xz);

          } else {
          area1 = calculateTriangleArea(p1.xy, p2.xy, p4.xy);
          area2 = calculateTriangleArea(p1.xy, p3.xy, p4.xy);

          }

          float r = (area1 + area2) * resolution * resolution;
          color = vec4(r, r, r, 1);
        }
      } else {
        if (get_projected_texture_color(projected_texcoords[i], i, color)) {

          // blending turned off until we figure out lispsm
          /*if (projected_c.x <= 1.0 && projected_c.x >= 1.0 - cascadesBlendingFactor ||
          projected_c.y <= 1.0 && projected_c.y >= 1.0 - cascadesBlendingFactor ||
          projected_c.x >= -1.0 && projected_c.x <= -1.0 + cascadesBlendingFactor ||
          projected_c.y >= -1.0 && projected_c.y <= -1.0 + cascadesBlendingFactor) {
            vec4 next_split_color = vec4(-1.0, 0.0, 0.0, 0.0);
            // this adds image artifacts
            if (i + 1 < splitCount && get_projected_texture_color(projected_texcoords[i + 1], i + 1, next_split_color)) {
              color = mix(color, next_split_color, 0.5);
            }
          }*/
          break;
        }
      }
    }
  }

  if (color.x == -1.0 || color.w == 0.0) {
    gl_FragColor = texture2D(terrainTexture, vUV);
  } else {
    gl_FragColor = color;
  }
}
