uniform float uPowerFunction;
uniform float uBrightness;

varying vec2 vUv;

void main()
{

  //float alpha = pow((0.5 - distance(vUv, vec2(0.5))) * 2.0,uPowerFunction);
  float alpha = pow(1.0 - distance(vUv, vec2(0.5)),uPowerFunction);
  gl_FragColor = vec4( 1.0,0.0,0.0,1.0 * alpha * uBrightness );
  //gl_FragColor = vec4(vColor.rgb, vColor.a/100.0);
  
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
} 