import * as THREE from 'three'
import Gui from './utils/gui.js'


export default class UI
{
  constructor(camera)
  {
    this.camera = camera
    this.uiText = document.querySelector('.ui-text')
    this.bhDistText = document.querySelector('.bhdist')
    this.cameraPositionText = document.querySelector('.cameraPosition')

    this.uiText.style.opacity = '1.0'

    this.gui = new Gui()
    this.guiFolder = this.gui.instance.addFolder('UI').close()
    this.setGui()
  }

  update()
  {
    // console.log(this.camera)
    // console.log(this.bhDistText)
    this.bhDistText.innerText = 
    `Distance to Black Hole Center: 
    ${Math.sqrt(this.camera.position.x ** 2 + this.camera.position.y ** 2 + this.camera.position.z ** 2).toFixed(3)} kpc/h`
   
    this.cameraPositionText.innerText = 
    `Camera position:
    x: ${this.camera.position.x.toFixed(3)}, y: ${this.camera.position.y.toFixed(3)}, z: ${this.camera.position.z.toFixed(3)}`
  }

  setGui()
  {
    this.guiObject = {
      guiVisible: true,
      toggleVisibility: ()=>{
        if(this.guiObject.guiVisible){
          this.uiText.style.opacity = '1.0'
        }
        else{
          this.uiText.style.opacity = '0.0'
        } 
      },
      cameraPositionVisible: true,
      toggleCamerPositionVisibility: ()=>{
        if(this.guiObject.cameraPositionVisible){
          this.cameraPositionText.style.opacity = '1.0'
        }
        else{
          this.cameraPositionText.style.opacity = '0.0'
        }
      }
    }
    this.guiFolder.add(this.guiObject, 'guiVisible').name('ui').onChange(() => this.guiObject.toggleVisibility())
    this.guiFolder.add(this.guiObject, 'cameraPositionVisible').name('cameraPosition').onChange(()=> this.guiObject.toggleCamerPositionVisibility())
  }


}