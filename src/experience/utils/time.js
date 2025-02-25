import * as THREE from 'three'

let time = null

export default class Time
{
  constructor()
  {
    //simpleton to access from any file
    if(time){
      return time
    }
    time = this

    this.clock = new THREE.Clock()
    this.elapsedTime = this.clock.getElapsedTime()
    this.deltaTime = 16
    this.prevTime = 0
  }

  update()
  {
    this.elapsedTime = this.clock.getElapsedTime()
    this.deltaTime = this.elapsedTime - this.prevTime
    this.prevTime = this.elapsedTime
  }
}