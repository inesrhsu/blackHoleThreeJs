void main()
{
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 position = texture(uPositions, uv);

  gl_FragColor = vec4(position.xyz,1.0);
}