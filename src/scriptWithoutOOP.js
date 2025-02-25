import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import Stats from 'stats.js'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'

//Data
//Stars data
import starPositions from './data/starPositions.js'
import starColors from './data/starColors.js'
//Gas data
import gasPositions from './data/gasPositions.js'
import gasColors from './data/gasColors.js'

//Shaders
//Stars shaders
import starVertexShader from './shaders/stars/vertex.glsl'
import starFragmentShader from './shaders/stars/fragment.glsl'
import gpgpuStarPositionsShader from './shaders/stars/gpgpu/positions.glsl'
import gpgpuStarColorsShader from './shaders/stars/gpgpu/colors.glsl'

//GUI
const gui = new GUI()
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

//Canvas
const canvas = document.querySelector('canvas.webgl')

//Scene
const scene = new THREE.Scene()

//Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () =>
{
  //update sizes
  sizes.width =  window.innerWidth,
  sizes.height = window.innerHeight

  //update camera - update aspect
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  //Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

//Camera
const camera = new THREE.PerspectiveCamera(35, sizes.width/sizes.height, 1 / Math.pow(2, 53),1000)
camera.position.z = 10
// const camera = new THREE.OrthographicCamera(-1,1,1,-1, // left, right, top, bottom boundaries of view frustrum
//   1 / Math.pow(2, 53), 1); // near and far clipping planes (1 / Math.pow(2, 53) is the smallest positive normal number,  used when extremely small distances are needed)


//Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

//Renderer
const renderer = new THREE.WebGLRenderer({canvas})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) //avoid aliasing and rendering of too many pixels (>2 pixel ratios)


//Stars
const starParticles = {}
starParticles.count = starPositions.length/4 //210020

//GPU Compute
const starGpgpu = {}
starGpgpu.texSize = Math.ceil(Math.sqrt(starParticles.count)) //459
starGpgpu.gpuCompute = new GPUComputationRenderer(starGpgpu.texSize, starGpgpu.texSize, renderer);

starGpgpu.positionsTexture = starGpgpu.gpuCompute.createTexture() //r,g,b,a texture
starGpgpu.colorsTexture    = starGpgpu.gpuCompute.createTexture()

for (let i = 0; i < starParticles.count; i++){
  const i4 = i * 4
  starGpgpu.positionsTexture.image.data[i4    ] = starPositions[i4];
  starGpgpu.positionsTexture.image.data[i4 + 1] = starPositions[i4 + 1];
  starGpgpu.positionsTexture.image.data[i4 + 2] = starPositions[i4 + 2];
  starGpgpu.positionsTexture.image.data[i4 + 3] = starPositions[i4 + 3];
}
for (let i = 0; i < starParticles.count; i++){
  const i4 = i * 4
  starGpgpu.colorsTexture.image.data[i4    ] = starColors[i4];
  starGpgpu.colorsTexture.image.data[i4 + 1] = starColors[i4 + 1];
  starGpgpu.colorsTexture.image.data[i4 + 2] = starColors[i4 + 2];
  starGpgpu.colorsTexture.image.data[i4 + 3] = starColors[i4 + 3];
}

//add variables to gpgpu shader
starGpgpu.positionsVariable = starGpgpu.gpuCompute.addVariable('uPositions', gpgpuStarPositionsShader, starGpgpu.positionsTexture)
starGpgpu.colorsVariable    = starGpgpu.gpuCompute.addVariable('uColors',    gpgpuStarColorsShader,    starGpgpu.colorsTexture)
//keep updating texture using dependency
starGpgpu.gpuCompute.setVariableDependencies(starGpgpu.positionsVariable, [starGpgpu.positionsVariable])
starGpgpu.gpuCompute.setVariableDependencies(starGpgpu.colorsVariable,    [starGpgpu.colorsVariable])

//Can add uniforms to star particles

//Initialize gpu computation
starGpgpu.gpuCompute.init()

//stars geometry
starParticles.geometry = new THREE.BufferGeometry()
starParticles.geometry.setDrawRange(0,starParticles.count)

//access positions and colors through uv coord of texture
starGpgpu.textureUv = new Float32Array(starParticles.count * 2)
for (let y = 0; y < starGpgpu.texSize; y++)
{
  for (let x = 0; x < starGpgpu.texSize; x++)
  {
    const i = (y * starGpgpu.texSize) + x;
    starGpgpu.textureUv[i * 2    ] = (x + 0.5) / starGpgpu.texSize
    starGpgpu.textureUv[i * 2 + 1] = (y + 0.5) / starGpgpu.texSize
  }
}
starParticles.geometry.setAttribute('aTextureUv', new THREE.BufferAttribute(starGpgpu.textureUv, 2))

//stars material
starParticles.uniforms = {
  uStarPositionsTexture: new THREE.Uniform(), //update with texture in animate()
  uStarColorsTexture: new THREE.Uniform()
}

starParticles.material = new THREE.ShaderMaterial({
  vertexShader: starVertexShader,
  fragmentShader: starFragmentShader,
  uniforms: starParticles.uniforms
  //depthWrite: false,
  //blending: THREE.AdditiveBlending
})

//stars points mesh
starParticles.points = new THREE.Points(starParticles.geometry, starParticles.material)
scene.add(starParticles.points)


//Debug - view gpgpu texture on a plane
starGpgpu.debug = new THREE.Mesh(
  new THREE.PlaneGeometry(3,3),
  new THREE.MeshBasicMaterial({
    map: starGpgpu.gpuCompute.getCurrentRenderTarget(starGpgpu.colorsVariable).texture
  })
)
starGpgpu.debug.visible = false
starGpgpu.debug.position.x = 3
scene.add(starGpgpu.debug)

//Time
const clock = new THREE.Clock()

//Animation
const animate = () =>
{
  stats.begin()
  const elapsedTime = clock.getElapsedTime()

  //Update objects


  //Update controls
  controls.update()

  //update gpgpu
  starGpgpu.gpuCompute.compute()
  starParticles.material.uniforms.uStarPositionsTexture.value  = starGpgpu.gpuCompute.getCurrentRenderTarget(starGpgpu.positionsVariable).texture
  starParticles.material.uniforms.uStarColorsTexture.value     = starGpgpu.gpuCompute.getCurrentRenderTarget(starGpgpu.colorsVariable).texture
  
  starGpgpu.debug.material.map = starGpgpu.gpuCompute.getCurrentRenderTarget(starGpgpu.colorsVariable).texture

  //Render
  renderer.render(scene, camera)

  //stats
  stats.end()

  //call animation on next frame
  window.requestAnimationFrame(animate)
  //console.log(starParticles.uniforms.uStarColorsTexture)
  
}
animate()
