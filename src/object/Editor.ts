import { Actions, Meta, States } from '../types/editor.types'
import { Node } from './Node'
import { StateMachine } from './StateMachine'
import { Topics } from './Topics'

export class Editor extends StateMachine<States, Actions, Topics> {
  private root: Node

  constructor() {
    super(States.Start)
    this.root = new Node('root', 0, 0, 0, 0)
    this.desribeAddComponent()
    this.desribeDrag()
  }

  private desribeAddComponent() {

    let componentToPlace: Meta | null = null
    let addVector: [number, number] = [0, 0]

    // 注册组件开始拖拽
    this.register(States.Start, States.PlacingComponent, Actions.StartAddComponent, (meta) => {
      console.log("onDragstart", meta)
      componentToPlace = meta
    })
    // 注册组件拖拽的过程
    this.register(States.PlacingComponent, States.PlacingComponent, Actions.EvtDrag, (vec: [number, number]) => {
      // console.log('handle, ', vec)
      addVector = vec
    }) 
    // 注册组件node添加
    this.register(States.PlacingComponent, States.AddingComponent, Actions.EvtDrop, () => {
      if(!componentToPlace) {
        throw new Error("no component to create")
      }
      console.log("component drop")
      const node = new Node(
        componentToPlace.type,
        addVector[0] - componentToPlace.w / 2 - 100,
        addVector[1] - componentToPlace.h / 2,
        componentToPlace.w,
        componentToPlace.h,
      )
      this.root.add(node)
      this.root.emit(Topics.NodeChildrenUpdated)
    })
    // 操作完成之后状态复原
    // States.AddingComponent -> States.Start
    this.register(States.AddingComponent, States.Start, Actions.AUTO, () => {
      console.log("auto reset state")
    })
  }

  private desribeDrag() {
    let dargNode: Node
    this.register(States.Start, States.DragStart, Actions.EvtDragStart, (node: Node) => {
      dargNode = node
    })
    this.register(States.DragStart, States.Stoped, Actions.EvtDragEnd, (vec: [number, number]) => {
      dargNode!.setXY(vec)
      dargNode!.emit(Topics.NodePositionMoved)
    })
    this.register(States.Stoped, States.Start, Actions.AUTO, () => {})
  }

  public getRoot() {
    return this.root
  }
}