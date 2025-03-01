import * as THREE from 'three'
import Gui from './utils/gui.js'
import Time from './utils/time.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera
{
  constructor(canvas, sizes)
  {
    this.canvas = canvas
    this.sizes = sizes

    this.speedDown = 90 //speed in kpc/h / s
    this.speedPerp = 60
    this.playing = false
    this.initialPosition = new THREE.Vector3(0,0,3000)

    this.setInstance()
    this.setControls()
    
    this.gui = new Gui()
    // this.guiFolder = this.gui.instance.addFolder('Camera').close()
    this.setGui()

    this.time = new Time()
  }

  setInstance()
  {
    this.instance = new THREE.PerspectiveCamera(35, this.sizes.width/this.sizes.height, 1 / Math.pow(2, 53),1000)
    this.instance.position.x = this.initialPosition.x
    this.instance.position.y = this.initialPosition.y
    this.instance.position.z = this.initialPosition.z
    // const camera = new THREE.OrthographicCamera(-1,1,1,-1, // left, right, top, bottom boundaries of view frustrum
    // 1 / Math.pow(2, 53), 1); // near and far clipping planes (1 / Math.pow(2, 53) is the smallest positive normal number,  used when extremely small distances are needed)
  }

  setControls()
  {
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enableDamping = true
  }

  resize()
  {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }

  update()
  {
    this.controls.update()
    if(this.playing){
      this.updateFall()
    }
  }

  startFall()
  {
    
    this.bhDistance =  Math.sqrt(this.instance.position.x ** 2 + this.instance.position.y ** 2 + this.instance.position.z ** 2)
    this.prevbhDistance = 1 + this.bhDistance
    if(this.guiObject.fallMode === 'straight'){
      this.fallVector = this.instance.position.clone().normalize()
     console.log('start fall', this.fallVector)
    }
    else if (this.guiObject.fallMode === 'spiral'){
      // this.a = 60 
      // this.r = Math.sqrt(this.instance.position.x ** 2 + this.instance.position.y ** 2 + this.instance.position.z ** 2) // initial distance
      // this.theta = Math.acos(this.instance.position.x/this.r)
      this.fallVector = this.instance.position.clone().normalize()
    }
    this.playing = true
  }

  pauseFall()
  {
    this.playing = false
    console.log('paused')
  }

  restartFall()
  {
    
    this.instance.position.x = this.initialPosition.x
    this.instance.position.y = this.initialPosition.y
    this.instance.position.z = this.initialPosition.z

    this.startFall()

  }

  updateFall()
  {
    //console.log('fall vector', this.fallVector)
    this.bhDistance = Math.sqrt(this.instance.position.x ** 2 + this.instance.position.y ** 2 + this.instance.position.z ** 2)
    if(this.bhDistance > 0.0005 && this.prevbhDistance > this.bhDistance){
      this.prevbhDistance = this.bhDistance
      if (this.guiObject.fallMode === 'straight'){
        this.updateStraightFall()
      } 
      else if (this.guiObject.fallMode === 'spiral'){
        //if(this.instance.position.z > 0){
           this.updateSpiralFall()
        //}
       
      }
    }

  }

  updateStraightFall()
  {
    this.instance.position.x = this.instance.position.x - this.fallVector.x * this.speedDown * this.time.deltaTime
    this.instance.position.y = this.instance.position.y - this.fallVector.y * this.speedDown * this.time.deltaTime
    this.instance.position.z = this.instance.position.z - this.fallVector.z * this.speedDown * this.time.deltaTime
  }
  
  updateSpiralFall()
  {
    //spiral formula implementation
    // this.theta -= this.speed * this.time.deltaTime
    // this.r = this.a*this.theta
    // this.instance.position.z = this.r * Math.cos(this.theta)
    // this.instance.position.y = this.r * Math.sin(this.theta)

    //implementation using cross product
    //dr, dperp -> towards center and tangent
    this.fallVector = this.instance.position.clone() // (0,0,1) initially 
    this.arbVector = new THREE.Vector3(1,0,0)
    this.perpVector = new THREE.Vector3() // ()
    this.perpVector.crossVectors(this.fallVector,this.arbVector)
    this.fallVector.normalize()
    this.perpVector.normalize()

    this.dfall = new THREE.Vector3(this.fallVector.x * this.speedDown * this.time.deltaTime, 
                                   this.fallVector.y * this.speedDown * this.time.deltaTime, 
                                   this.fallVector.z * this.speedDown * this.time.deltaTime)

    this.dperp = new THREE.Vector3(this.perpVector.x * this.speedPerp * this.time.deltaTime, 
                                   this.perpVector.y * this.speedPerp * this.time.deltaTime, 
                                   this.perpVector.z * this.speedPerp * this.time.deltaTime)

    this.instance.position.x = this.instance.position.x - this.dfall.x + this.dperp.x
    this.instance.position.y = this.instance.position.y - this.dfall.y + this.dperp.y
    this.instance.position.z = this.instance.position.z - this.dfall.z + this.dperp.z

    let lerpFactor = 0.1; // Smoother transition
    this.instance.position.lerp(
    new THREE.Vector3(
      this.instance.position.x - this.dfall.x + this.dperp.x,
      this.instance.position.y - this.dfall.y + this.dperp.y,
      this.instance.position.z - this.dfall.z + this.dperp.z
      ),
      lerpFactor
    )
    
    this.instance.rotation.y = 0
    this.instance.rotation.z = 0

  }

  setGui()
  {
    this.guiObject = {
      start: () => {this.startFall()},
      pause: () => {this.pauseFall()},
      restart: () => {this.restartFall()},
      fallMode: 'straight',
      speedDown: this.speedDown,
      speedPerp: this.speedPerp
    }

    this.gui.instance.add(this.guiObject, 'fallMode', { Straight: 'straight', Spiral: 'spiral', LogSpiral: 'logSpiral'})
    this.gui.instance.add(this.guiObject, 'speedDown').min(0.01).max(200).onChange(()=>{this.speedDown = this.guiObject.speedDown})
    this.gui.instance.add(this.guiObject, 'speedPerp').min(0.01).max(200).onChange(()=>{this.speedPerp = this.guiObject.speedPerp}).name('speedRotation')
    this.gui.instance.add(this.guiObject, 'start')
    this.gui.instance.add(this.guiObject, 'pause')
    this.gui.instance.add(this.guiObject, 'restart')

    // this.guiFolder.add(this.guiObject, 'fallMode', { Straight: 'straight', Spiral: 'spiral', LogSpiral: 'logSpiral'})
    // this.guiFolder.add(this.guiObject, 'speedDown').min(0.01).max(200).onChange(()=>{this.speedDown = this.guiObject.speedDown})
    // this.guiFolder.add(this.guiObject, 'speedPerp').min(0.01).max(200).onChange(()=>{this.speedPerp = this.guiObject.speedPerp}).name('speedRotation')
    // this.guiFolder.add(this.guiObject, 'start')
    // this.guiFolder.add(this.guiObject, 'pause')
    // this.guiFolder.add(this.guiObject, 'restart')
  }
  
}