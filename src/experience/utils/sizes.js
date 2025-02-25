import * as THREE from 'three'
//Sizes
export default class Sizes{
  constructor()
  {
    this.width = window.innerWidth
    this.height = window.innerHeight
  }
  
  resize()
  {
    this.width = window.innerWidth
    this.height = window.innerHeight
  }
  
}


