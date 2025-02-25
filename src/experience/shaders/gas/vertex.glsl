uniform sampler2D uGasPositionsTexture;
uniform sampler2D uGasColorsTexture; 

uniform float uSize;

attribute vec2 aTextureUv;

varying vec4 vColor;

varying vec3 vPosition;

 
void main()
{
  vec4 gasParticle = texture(uGasPositionsTexture, aTextureUv);
  vec3 gasPosition = gasParticle.xyz;
  //float gasSize = gasParticle.w;

  vec4 modelPosition = modelMatrix * vec4(gasPosition, 1.0);
  gl_Position = projectionMatrix * viewMatrix * modelPosition;

  gl_PointSize = uSize*gasParticle.w;

  //varyings
  vColor = texture(uGasColorsTexture, aTextureUv);
  vPosition = gasPosition;

}
