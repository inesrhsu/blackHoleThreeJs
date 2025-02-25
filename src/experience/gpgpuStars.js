import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'

import gpgpuStarPositionsShader from './shaders/stars/gpgpu/positions.glsl'
import gpgpuStarColorsShader from './shaders/stars/gpgpu/colors.glsl'

export default class GpgpuStars{
  constructor(particleCount, renderer, starPositions, starColors)
  {
    this.particleCount = particleCount
    this.texSize = Math.ceil(Math.sqrt(this.particleCount))
    this.renderer = renderer
    this.starPositions = starPositions
    this.starColors = starColors

    this.initializeGpgpu()
    this.setTextureUVs()
  }

  initializeGpgpu()
  {
    this.gpuCompute = new GPUComputationRenderer(this.texSize, this.texSize, this.renderer)
    
    //positions and colors textures
    this.positionsTexture = this.gpuCompute.createTexture() //r,g,b,a texture
    this.colorsTexture = this.gpuCompute.createTexture() 

    this.setTexture(this.positionsTexture, this.starPositions)
    this.setTexture(this.colorsTexture, this.starColors)

    //pass positions and colors textures as variables into gpgpu shader
    this.positionsVariable = this.gpuCompute.addVariable('uPositions', gpgpuStarPositionsShader, this.positionsTexture)
    this.colorsVariable    = this.gpuCompute.addVariable('uColors',    gpgpuStarColorsShader,    this.colorsTexture)

    //keep updating textures on dependencies
    this.gpuCompute.setVariableDependencies(this.positionsVariable, [this.positionsVariable])
    this.gpuCompute.setVariableDependencies(this.colorsVariable,    [this.colorsVariable])

    //Initialize gpu computation
    this.gpuCompute.init()
  }

  setTexture(texture, data)
  {
    for (let i = 0; i < this.particleCount; i++){
      const i4 = i * 4
      texture.image.data[i4    ] = data[i4];
      texture.image.data[i4 + 1] = data[i4 + 1];
      texture.image.data[i4 + 2] = data[i4 + 2];
      texture.image.data[i4 + 3] = data[i4 + 3];
    }
  }

  setTextureUVs()
  {
    this.textureUVs = new Float32Array(this.particleCount * 2)
    for (let y = 0; y < this.texSize; y++)
    {
      for (let x = 0; x < this.texSize; x++)
      {
        const i = (y * this.texSize) + x;
        this.textureUVs[i * 2    ] = (x + 0.5) / this.texSize
        this.textureUVs[i * 2 + 1] = (y + 0.5) / this.texSize
      }
    }
  }

  update()
  {
    this.gpuCompute.compute()
  }
}