uniform sampler2D uStarPositionsTexture;
uniform sampler2D uStarColorsTexture; 

//gui test uniforms
uniform float uSize;
uniform float uFarSizeDist;
uniform bool uSizeAttenuation;
uniform float uSizeAttenuationCoeff;

attribute vec2 aTextureUv;

varying vec4 vColor;
varying vec2 vUv;
varying float vPointSize;

varying vec3 vPosition;

void main()
{
  vec4 starParticle = texture(uStarPositionsTexture, aTextureUv);
  vec3 starPosition = starParticle.xyz;
  //float starSize = starParticle.w;

  vec4 modelPosition = modelMatrix * vec4(starPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;

  gl_PointSize = uSize;
  if(uSizeAttenuation){
    //gl_PointSize *= smoothstep( uSize, 1.0, gl_Position.z + uSizeAttenuationCoeff) ;
    //gl_PointSize *=  mix(uSize, 1.0, gl_Position.z + uSizeAttenuationCoeff);
                                    //uSize * (1.0 - uSizeAttenuationCoeff) + 1.0*uSizeAttenuationCoeff
    // gl_PointSize *= 1.0/(gl_Position.z/uSizeAttenuationCoeff - 1.0);
    //linear interpolation 
    gl_PointSize = 1.0 + (1.0 - gl_Position.z/uFarSizeDist)*(uSize - 1.0);
    gl_PointSize = clamp(1.0,uSize, gl_PointSize);
    // gl_PointSize = min(uSize, gl_PointSize);
  
  }                                 
  

  //varyings
  vColor = texture(uStarColorsTexture, aTextureUv);
  vUv = uv;
  vPointSize = gl_PointSize;

  vPosition = starPosition;

}
