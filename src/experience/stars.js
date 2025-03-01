import * as THREE from 'three'
import Gui from './utils/gui.js'

//Stars data
import starPositions from './data/starPositions.js'
import starColors from './data/starColors.js'
import starPsf from './data/starPsf.js'
import hubblePsf from './data/hubblePsf.js'
import hubblePsfRgb from './data/hubblePsfRgb.js'
import hubblePsfNormRgb from './data/hubblePsfNormRgb.js'
import hubblePsfNormRgbSmall from './data/hubblePsfNormRgbSmall.js'
import jwstPsfRgb from './data/jwstPsfRgb.js'
import jwstPsfNormRgbSmall from './data/jwstPsfNormRgbSmall.js'
import simJwstPsfRgb from './data/simJwstPsfRgb.js'

//Stars shaders
import starVertexShader from './shaders/stars/vertex.glsl'
import starFragmentShader from './shaders/stars/fragment.glsl'

import gpgpuStarPositionsShader from './shaders/gas/gpgpu/positions.glsl'
import gpgpuStarColorsShader from './shaders/gas/gpgpu/colors.glsl'

import Gpgpu from './gpgpu.js'


export default class Stars{
  constructor(scene, renderer)
  {
    this.scene = scene
    this.renderer = renderer

    this.count = starPositions.length/4 //210020
    this.gpgpu = new Gpgpu(this.count, this.renderer, starPositions, starColors, gpgpuStarPositionsShader, gpgpuStarColorsShader)

    this.psf = {psf:'hubble'}
    this.psfTextureSize = Math.sqrt(hubblePsfNormRgbSmall.length/4)
    this.psfTexture = new THREE.DataTexture(hubblePsfNormRgbSmall, this.psfTextureSize,this.psfTextureSize)
    this.psfTexture.needsUpdate = true

    this.setGeometry()
    this.setUniforms()
    this.setMaterial()
    this.setPoints()

    this.gui = new Gui()
    // this.guiFolder = this.gui.instance.addFolder('Stars').close()
    this.setGui()

    // this.debugTexture()
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
      uStarPositionsTexture: new THREE.Uniform(null), //update with texture in animate()
      uStarColorsTexture: new THREE.Uniform(null),

      //psf texture
      uPsf: new THREE.Uniform(0),
      uPsfTexture: new THREE.Uniform(this.psfTexture),
      uPsfSize: new THREE.Uniform(this.psfTextureSize),
      
      //gui testing uniforms
      uSize: new THREE.Uniform(1),
      uFarSizeDist: new THREE.Uniform(40),
      uSizeAttenuation: new THREE.Uniform(true),
      uSizeAttenuationCoeff: new THREE.Uniform(3),
      uBrightness: new THREE.Uniform(1),
      uPowerFunction: new THREE.Uniform(2),

      uBHRadius: new THREE.Uniform(0.14)
    }
  }

  setMaterial()
  {
    // this.material = new THREE.MeshBasicMaterial()
    this.material = new THREE.ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    })
    
  }

  setPoints()
  {
    //stars points mesh
    this.points = new THREE.Points(this.geometry, this.material)
    this.scene.add(this.points)
  }

  update()
  {
    this.gpgpu.update()
    this.material.uniforms.uStarPositionsTexture.value  = this.gpgpu.gpuCompute.getCurrentRenderTarget(this.gpgpu.positionsVariable).texture
    this.material.uniforms.uStarColorsTexture.value     = this.gpgpu.gpuCompute.getCurrentRenderTarget(this.gpgpu.colorsVariable).texture
    
    //this.debugTextureUpdate()
  }

  debugTexture()
  {
    this.debug = new THREE.Mesh(
      new THREE.PlaneGeometry(3,3),
      new THREE.MeshBasicMaterial({
        map:this.psfTexture,
        transparent: false,
        side: THREE.DoubleSide
      })
    )
    this.debug.visible = true
    this.debug.position.x = 3
    this.scene.add(this.debug)
  }
  debugTextureUpdate()
  {
    // this.debug.material.map = this.material.uniforms.uPsfTexture.value
    // this.debug.material.map = this.gpgpu.gpuCompute.getCurrentRenderTarget(this.gpgpu.colorsVariable).texture
  }

  setGui()
  {
    this.gui.instance.add(this.points, 'visible').name('stars')
    // this.guiFolder.add(this.points, 'visible')
    // this.guiFolder.add(this.psf, 'psf', {Power: 'power', Hubble: 'hubble', JWST: 'jwst', SimJWST: 'simJwst'}).onChange(() => this.setPsf())
    // this.guiFolder.add(this.material, 'blending', { NormalBlending: 1, AdditiveBlending: 2})
    // this.guiFolder.add(this.material.uniforms.uSize, 'value').min(1).max(10).name('uSize').listen()
    // this.guiFolder.add(this.material.uniforms.uSizeAttenuation, 'value').name('uSizeAttenuation').listen()
    // this.guiFolder.add(this.material.uniforms.uFarSizeDist, 'value').min(1).max(200).name('uFarSizeDist').listen()
    // this.guiFolder.add(this.material.uniforms.uSizeAttenuationCoeff, 'value').min(-20).max(20).name('uSizeAttenuationCoeff').listen()
    // this.guiFolder.add(this.material.uniforms.uBrightness, 'value').min(0.01).max(20).name('uBrightness').listen()
    // this.guiFolder.add(this.material.uniforms.uPowerFunction, 'value').min(1).max(10).name('uPowerFunction').listen()
  }

  setPsf()
  {
    if(this.psf.psf === 'power')
    {
      this.setPower()
    }
    else if (this.psf.psf === 'hubble')
    {
      this.setHubble()
    }
    else if (this.psf.psf === 'jwst')
    {
      this.setJwst()
    }
    else if (this.psf.psf === 'simJwst')
    {
      this.setSimJwst()
    }
  }

  setPower()
  {
    this.power = {
      uSize: 36,
      uFarSizeDist: 165,
      uBrightness: 1
    }
    this.material.uniforms.uPsf.value = 0
    this.material.uniforms.uSize.value = this.power.uSize
    this.material.uniforms.uFarSizeDist.value = this.power.uFarSizeDist
    this.material.uniforms.uBrightness.value = this.power.uBrightness
  }

  setHubble()
  {
    this.hubble = {
      uSize: 75,
      uFarSizeDist: 165,
      uBrightness: 1.4
    }
    this.material.uniforms.uPsf.value = 1
    this.material.uniforms.uPsfSize.value = Math.sqrt(hubblePsfNormRgbSmall.length/4)
    this.psfTexture = new THREE.DataTexture(hubblePsfNormRgbSmall, this.material.uniforms.uPsfSize.value,this.material.uniforms.uPsfSize.value)
    this.psfTexture.needsUpdate = true
    this.material.uniforms.uPsfTexture.value = this.psfTexture
    
    this.material.uniforms.uSize.value = this.hubble.uSize
    this.material.uniforms.uFarSizeDist.value = this.hubble.uFarSizeDist
    this.material.uniforms.uBrightness.value = this.hubble.uBrightness
  }

  setJwst()
  {
    this.power = {
      uSize: 75,
      uFarSizeDist: 165,
      uBrightness: 1.4
    }
    this.material.uniforms.uPsf.value = 2
    this.material.uniforms.uPsfSize.value = Math.sqrt(jwstPsfNormRgbSmall.length/4)
    this.psfTexture = new THREE.DataTexture(jwstPsfNormRgbSmall, this.material.uniforms.uPsfSize.value,this.material.uniforms.uPsfSize.value)
    this.psfTexture.needsUpdate = true
    this.material.uniforms.uPsfTexture.value = this.psfTexture

    this.material.uniforms.uSize.value = this.power.uSize
    this.material.uniforms.uFarSizeDist.value = this.power.uFarSizeDist
    this.material.uniforms.uBrightness.value = this.power.uBrightness  
  }

  setSimJwst()
  {
    this.power = {
      uSize: 75,
      uFarSizeDist: 16,
      uBrightness: 1.4
    }
    this.material.uniforms.uPsf.value = 3
    this.material.uniforms.uPsfSize.value = Math.sqrt(simJwstPsfRgb.length/4)
    this.psfTexture = new THREE.DataTexture(simJwstPsfRgb, this.material.uniforms.uPsfSize.value,this.material.uniforms.uPsfSize.value)
    this.psfTexture.needsUpdate = true
    this.material.uniforms.uPsfTexture.value = this.psfTexture

    this.material.uniforms.uSize.value = this.power.uSize
    this.material.uniforms.uFarSizeDist.value = this.power.uFarSizeDist
    this.material.uniforms.uBrightness.value = this.power.uBrightness  
  }
  

}


// this.textureLoader = new THREE.TextureLoader()
// this.particleTexture = particleTexture
// const textureLoader = new THREE.TextureLoader()
// const particleTexture = textureLoader.load(
//   './2.png',
//   (texture) => {
//     console.log('Texture loaded successfully:', texture);
//   },
//   undefined, // This argument is for progress, can be left as `undefined`
//   (error) => {
//     console.error('Error loading texture:', error)
//   }
// )