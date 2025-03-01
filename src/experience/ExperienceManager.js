import * as THREE from 'three'
import Stats from 'stats.js'

import Gui from './utils/gui.js'
import Sizes from './utils/sizes.js'
import Time from './utils/time.js'
import Camera from './camera.js'
import Renderer from './renderer.js'
import Stars from './stars.js'
import Gas from './gas.js'
import BlackHole from './blackHole.js'
import UI from './ui.js'

// let instance = null

export default class ExperienceManager
{
  constructor(canvas)
  {
    // //singleton to access from any other class
    // if (instance)
    // {
    //   return instance
    // }
    // instance = this
    //global access and access from console
    window.experienceManager = this

    this.loader = document.querySelector('.loader')
    this.loadingBar = document.querySelector('.loading-bar')


    this.canvas = canvas
    this.gui = new Gui()
    this.sizes = new Sizes()
    this.time = new Time()
    //this.resources
    // this.stats = new Stats()
    // this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    // document.body.appendChild( this.stats.dom );
    // console.log(this.stats.style)

    this.scene = new THREE.Scene()
    this.camera = new Camera(this.canvas, this.sizes)
    this.renderer = new Renderer(this.canvas, this.sizes, this.scene, this.camera.instance)

    this.stars = new Stars(this.scene, this.renderer.instance)
    this.gas = new Gas(this.scene, this.renderer.instance)
    this.blackHole = new BlackHole(this.scene, this.renderer.instance)
    
    // console.log('loaded')
    
    this.loader.style.opacity = '0.0'

    this.ui = new UI(this.camera.instance)

    window.addEventListener('resize', () => {
      this.resize()
    })

    window.requestAnimationFrame(() => {this.update()})
  }

  resize()
  {
    this.sizes.resize() 
    this.camera.resize()
    this.renderer.resize()
  }

  update()
  {
    // this.stats.begin()
    this.camera.update()
    
    this.stars.update()
    this.gas.update()

    this.ui.update()
    this.time.update()
    
    this.renderer.update()
    // this.stats.end()
    window.requestAnimationFrame(() => {this.update()}) //arrow function binds to ExperienceManager scope
  }
}