// import Editor from '../object/Editor'
import { Actions } from '../types/editor.types'
import classes from './drag-drop.module.scss'

import metas from '../object/Metas'
import { Editor } from '../object/Editor'

export default ({editor} : {editor : Editor}) => {
  return <div class={classes['item-list']}>
		{metas.map(item => {
			return (
        <div
          draggable={true}
          onDragstart={() => {
            editor.dispatch(Actions.StartAddComponent, item)
          }}
          class={classes["item"]}
          key={item.type}
        >
          {item.title}
        </div>
      )
		})}
	</div>
}