import * as THREE from 'three'
import Gui from './utils/gui.js'

const G = 6.67430e-11
const c = 3.0e8
const h = 0.674
const Ms = 1.9885e30 //solar mass
const kpc = 3.0857e19 //meters in one kpc

export default class BlackHole{
  constructor(scene, renderer)
  {
    this.scene = scene
    //this.renderer = renderer

    // this.setGeometry()
    // this.setUniforms()
    // this.setMaterial()
    // this.setPoints()
    this.setParameters()
    this.setBlackHole()


    this.gui = new Gui()
    // this.guiFolder = this.gui.instance.addFolder('BlackHole').close()
    this.setGui()

    // this.debugTexture()
  }

  setParameters()
  {
    this.blackHoleParameters = {
      mass: 0.07646979e10, //M_solar/h
      radius: (2 * G * 0.07646979e10 * Ms / (c*c)) / kpc //in kpc/h  (Rs = 2GM/(c^2))
    }
    // console.log('mass', this.blackHoleParameters.mass)
    // console.log('mass in kg', this.blackHoleParameters.mass * Ms)
    // console.log('radius in kpc/h', this.blackHoleParameters.radius)
    // console.log('radius in pc/h',this.blackHoleParameters.radius*1000)
    // console.log('radius in pc',this.blackHoleParameters.radius*1000/h)
  }

  setBlackHole()
  {
    this.blackHole = new THREE.Mesh(
      new THREE.SphereGeometry(1,32,16),
      new THREE.MeshBasicMaterial({
        color:'red',
        //transparent: false,
        //side: THREE.DoubleSide
      })
    )
    this.blackHole.scale.set(this.blackHoleParameters.radius,this.blackHoleParameters.radius,this.blackHoleParameters.radius) // radius in kpc/h - size of Sgr A*
    this.blackHole.visible = true
    //this.blackHole.position.x = 3
    this.scene.add(this.blackHole) 
  }

  setGui()
  {
    this.gui.instance.add(this.blackHole, 'visible').name('black hole')
    // this.guiFolder.add(this.blackHole, 'visible')
    // this.guiFolder.add(this.blackHoleParameters, 'radius').min(0.00000001).max(140)
    // .onChange(() =>
    // {
    //   this.blackHole.scale.set(this.blackHoleParameters.radius)
    // })
   // this.guiFolder.add(this.size, '). min(0.001).max(0.2).name('BH size')
  }
}