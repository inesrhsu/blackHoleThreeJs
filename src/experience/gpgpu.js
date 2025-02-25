import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'

export default class Gpgpu{
  constructor(particleCount, renderer, positions, colors, gpgpuPositionsShader, gpgpuColorsShader)
  {
    this.particleCount = particleCount
    this.texSize = Math.ceil(Math.sqrt(this.particleCount))
    this.renderer = renderer
    this.positions = positions
    this.colors = colors
    this.gpgpuPositionsShader = gpgpuPositionsShader
    this.gpgpuColorsShader = gpgpuColorsShader

    this.initializeGpgpu()
    this.setTextureUVs()
  }

  initializeGpgpu()
  {
    this.gpuCompute = new GPUComputationRenderer(this.texSize, this.texSize, this.renderer)
    
    //positions and colors textures
    this.positionsTexture = this.gpuCompute.createTexture() //r,g,b,a texture
    this.colorsTexture = this.gpuCompute.createTexture() 

    this.setTexture(this.positionsTexture, this.positions)
    this.setTexture(this.colorsTexture, this.colors)

    //pass positions and colors textures as variables into gpgpu shader
    this.positionsVariable = this.gpuCompute.addVariable('uPositions', this.gpgpuPositionsShader, this.positionsTexture)
    this.colorsVariable    = this.gpuCompute.addVariable('uColors',    this.gpgpuColorsShader,    this.colorsTexture)

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