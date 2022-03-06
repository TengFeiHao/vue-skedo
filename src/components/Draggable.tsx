import type { VNode, PropType } from 'vue'
import { defineComponent, ref } from 'vue'
import { DragValue } from '../object/DragValue'
import { deepMerge } from '../util/deepMerge'

// hooks
function useDrag({ onDragstart, onDragend }: {
  onDragstart?: () => void
  onDragend?: (vec: [number, number]) => void
}) {
  const value = new DragValue()
  const diffX = ref(0)
  const diffY = ref(0)
  const handlers = {
    ondragstart(e: DragEvent) {
      value.start(e)
      onDragstart && onDragstart()
    },
    ondrag(e: DragEvent) {
      value.update(e)
      diffX.value = value.getDiffX()
      diffY.value = value.getDiffY()
    },
    ondragend(e: DragEvent) {
      onDragend && onDragend([value.getDiffX(), value.getDiffY()])
      value.start(e)
    }
  }
  return {
    handlers,
    diffX,
    diffY
  }
}
// 封装一层，vNode 的深度拷贝，重新赋值了 vNode 的所有属性
function addPropsToVNode(vNode: VNode, props: Record<string, any>) {
  vNode.props = deepMerge(vNode.props, props)
  return vNode
}
export const Draggable = defineComponent({
  props: {
    initialPosition: {
      type: Array as any as PropType<[number, number]>
    },
    onDragstart: {
      type: Function as PropType<() => void>
    },
    onDragend: {
      type: Function as PropType<(vec: [number, number]) => void>
    }
  },
  setup(props, ctx) {
    const { handlers, diffX, diffY } = useDrag({
      onDragstart: props.onDragstart,
      onDragend: props.onDragend
    })
    return () => {
      let vNode: VNode = ctx.slots.default!()[0]
      vNode = addPropsToVNode(vNode, {
        draggable: true,
        ...handlers,
        style: {
          position: 'absolute',
          top: `${props.initialPosition? props.initialPosition[1] : 0}px`,
          left: `${(props.initialPosition ? props.initialPosition[0] : 0)}px`,
          transform: `translate(${diffX.value}px, ${diffY.value}px)`
        }
      })
      return vNode
    }
  }
})