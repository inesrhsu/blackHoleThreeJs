import * as THREE from 'three'
import Gui from './utils/gui.js'

//Gas data
import gasPositions from './data/gasPositions.js'
import gasColors from './data/gasColors.js'

//Gas shaders
import gasVertexShader from './shaders/gas/vertex.glsl'
import gasFragmentShader from './shaders/gas/fragment.glsl'
//test
import testVertexShader from './shaders/gas/testVertex.glsl'
import testFragmentShader from './shaders/gas/testFragment.glsl'

//Gas gpgpu shaders
import gpgpuGasPositionsShader from './shaders/gas/gpgpu/positions.glsl'
import gpgpuGasColorsShader from './shaders/gas/gpgpu/colors.glsl'

import Gpgpu from './gpgpu.js'

export default class Gas
{
  constructor(scene, renderer)
  {
    this.scene = scene
    this.renderer = renderer

    this.count = gasPositions.length/4 //210020
    this.gpgpu = new Gpgpu(this.count, this.renderer, gasPositions, gasColors, gpgpuGasPositionsShader, gpgpuGasColorsShader)

    this.setGeometry()
    this.setUniforms()
    this.setMaterial()
    this.setPoints()

    this.gui = new Gui()
    this.guiFolder = this.gui.instance.addFolder('Gas').close()
    this.setGui()
    
    //this.debug()
  }

  setGeometry()
  {
    this.geometry = new THREE.BufferGeometry()
    this.geometry.setDrawRange(0,this.count)
    this.geometry.setAttribute('aTextureUv', new THREE.BufferAttribute(this.gpgpu.textureUVs, 2))
  }

  setUniforms()
  {
    this.uniforms = {
      uGasPositionsTexture: new THREE.Uniform(null), //update with texture in animate()
      uGasColorsTexture: new THREE.Uniform(null),

      //gui testing uniforms
      uSize: new THREE.Uniform(40), 
      uBrightness: new THREE.Uniform(0.013),
      uPowerFunction: new THREE.Uniform(1.5),

      uBHRadius: new THREE.Uniform(0.14)
    }
  }

  setMaterial()
  {
    // this.material = new THREE.MeshBasicMaterial()
    this.material = new THREE.ShaderMaterial({
      vertexShader: gasVertexShader,
      fragmentShader: gasFragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NormalBlending
    })
  }

  setPoints()
  {
    //gas points mesh
    this.points = new THREE.Points(this.geometry, this.material)
    this.scene.add(this.points)
  }

  update()
  {
    this.gpgpu.update()
    this.material.uniforms.uGasPositionsTexture.value  = this.gpgpu.gpuCompute.getCurrentRenderTarget(this.gpgpu.positionsVariable).texture
    this.material.uniforms.uGasColorsTexture.value     = this.gpgpu.gpuCompute.getCurrentRenderTarget(this.gpgpu.colorsVariable).texture
    
    //this.debugUpdate()
  }

  setGui()
  {
    this.guiFolder.add(this.points, 'visible')
    this.guiFolder.add(this.material, 'blending', { NormalBlending: 1, AdditiveBlending: 2}).onChange(() => this.setBlendParams())
    this.guiFolder.add(this.material.uniforms.uSize, 'value').min(1).max(200).name('uSize').listen()
    this.guiFolder.add(this.material.uniforms.uBrightness, 'value').min(0.01).max(20).name('uBrightness').listen()
    this.guiFolder.add(this.material.uniforms.uPowerFunction, 'value').min(1).max(10).name('uPowerFunction').listen()
    this.guiFolder.add(this.material.uniforms.uBHRadius, 'value').min(0.0001).max(1).name('uBHRadius')
  }

  setBlendParams()
  {
    if(this.material.blending === 1){
      this.setNormalBlendParams()
    }
    else if (this.material.blending === 2){
      this.setAddBlendParams()
    }
  }

  setNormalBlendParams()
  {
    this.addBlendParams = {
      uSize: 40, //33 //at 10 you can see the BH ring
      uBrightness: 0.013, //0.013
      uPowerFunction: 2  //1
    }
    this.material.uniforms.uSize.value = this.addBlendParams.uSize
    this.material.uniforms.uBrightness.value = this.addBlendParams.uBrightness
    this.material.uniforms.uPowerFunction.value = this.addBlendParams.uPowerFunction
  }

  setAddBlendParams()
  {
    this.addBlendParams = {
      uSize: 20, //10
      uBrightness: 0.04, //1,
      uPowerFunction: 2
    }
    this.material.uniforms.uSize.value = this.addBlendParams.uSize
    this.material.uniforms.uBrightness.value = this.addBlendParams.uBrightness
    this.material.uniforms.uPowerFunction.value = this.addBlendParams.uPowerFunction

  }

  debug()
  {
    this.debug = new THREE.Mesh(
      new THREE.PlaneGeometry(3,3),
      // new THREE.MeshBasicMaterial({
      //   map: this.gpgpu.gpuCompute.getCurrentRenderTarget(this.gpgpu.colorsVariable).texture
      // })
      new THREE.ShaderMaterial({
        vertexShader: testVertexShader,
        fragmentShader: testFragmentShader,
        uniforms: this.uniforms,
        transparent: false
      })
    )
    this.debug.visible = true
    this.debug.position.x = 3
    this.scene.add(this.debug)
  }
  // debugUpdate()
  // {
  //   this.debug.material.map = this.gpgpu.gpuCompute.getCurrentRenderTarget(this.gpgpu.colorsVariable).texture
  // }


}









