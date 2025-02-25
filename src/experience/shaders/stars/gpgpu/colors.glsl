void main()
{
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 newColor = texture(uColors, uv);

  gl_FragColor = newColor;
}