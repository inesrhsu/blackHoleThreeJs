uniform float uPowerFunction;
uniform float uBrightness;

uniform float uBHRadius;

varying vec4 vColor;

varying vec3 vPosition;

void main()
{

  float alpha = pow((0.5 - distance(gl_PointCoord, vec2(0.5))) * 2.0,uPowerFunction);
  //float alpha = pow(1.0 - distance(gl_PointCoord, vec2(0.5)),uPowerFunction);
  if((alpha < 0.1) ) discard;
  gl_FragColor = vec4( vColor.rgb,vColor.a * alpha * uBrightness );
  //gl_FragColor = vec4(vColor.rgb, vColor.a/100.0);
 
 
  //if(length(vPosition) < uBHRadius) discard;
  // {
  //    gl_FragColor = vec4(1.0,0.0,0.0,vColor.a * alpha * uBrightness );
  // }
 
  
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
} 