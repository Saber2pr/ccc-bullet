/*
 * @Author: AK-12 
 * @Date: 2018-10-26 09:26:44 
 * @Last Modified by: AK-12
 * @Last Modified time: 2018-10-30 22:45:53
 */
let AnimationMediator = {
  TransitionMoveInL(duration, scene1, scene2) {
    let action = cc.moveBy(duration, cc.winSize.width, 0)
    scene1.runAction(action.easing(cc.easeSineInOut(duration)))
    setTimeout(() => {
      cc.director.loadScene(scene2)
    }, duration * 1000)
  }
}
const transformType = cc.Enum({
  NONE: 0,
  TransitionMoveInL: 1
})
cc.Class({
  extends: cc.Component,

  properties: {
    button: {
      default: null,
      type: cc.Button,
      displayName: '场景切换按钮'
    },
    target: {
      default: null,
      type: cc.SceneAsset,
      displayName: '目标场景',
      tooltip: '要切换到的场景'
    },
    transform: {
      type: cc.Enum(transformType),
      default: transformType.NONE,
      displayName: "场景切换效果"
    }
  },

  onLoad() {
    this.button.node.on('click', () => {
      // 压缩混淆是否影响_name的值?
      // cc.director.loadScene(this.target._name)
      switch (this.transform) {
        case transformType.NONE:
          cc.director.loadScene(this.target._name)
          break
        case transformType.TransitionMoveInL:
          AnimationMediator.TransitionMoveInL(1, this.node, this.target._name)
          break
        default:
          throw (new Error('scene transform type error'))
      }
    })
  }

})