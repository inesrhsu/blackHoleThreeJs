import * as THREE from 'three'
import GUI from 'lil-gui'

let gui = null

export default class Gui
{
  constructor()
  {
    //make a simpleton - so can access from any file with new Gui()
    if(gui)
    {
      return gui
    } 
    gui = this

    this.setInstance()
  }

  setInstance()
  {
    this.instance = new GUI()
    // this.instance.close()
  }
}