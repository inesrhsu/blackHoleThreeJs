uniform float uBrightness;
uniform float uPowerFunction;

uniform int uPsf;
uniform sampler2D uPsfTexture;
uniform float uPsfSize;

uniform float uBHRadius;

varying vec4 vColor;
varying vec2 vUv;
varying float vPointSize;

varying vec3 vPosition;

void main()
{

  //if(length(vPosition) <= (uBHRadius)) discard;
  //gl_FragColor = vColor;

  // //using power function
  float alpha = 0.0;
  if(uPsf == 0){
    alpha = pow((0.5 - distance(gl_PointCoord, vec2(0.5))) * 2.1,uPowerFunction);
    // vec3 color = mix(vec3(0.0), vColor.rgb, strength); 
  }
  else if (uPsf == 1 || uPsf == 2){
    //using jwst psf texture`
    //get psf texture uv - break into 640 by 640
    vec2 uPsfUv = floor(gl_PointCoord*uPsfSize)/uPsfSize;
    alpha = texture(uPsfTexture, uPsfUv).r;
  }
  else {
    float strength = pow((0.5 - distance(gl_PointCoord, vec2(0.5))) * 2.1,uPowerFunction);
    float size = uPsfSize /10.0;
    vec2 uPsfUv = floor(gl_PointCoord*size)/size;
    alpha = texture(uPsfTexture, uPsfUv).r;
    alpha *= strength;
  }
  if((alpha < 0.1) ) discard;
  gl_FragColor = vec4( vColor.rgb,alpha * uBrightness );
  
  

 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}