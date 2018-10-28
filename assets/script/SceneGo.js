/*
 * @Author: AK-12 
 * @Date: 2018-10-26 09:26:44 
 * @Last Modified by: AK-12
 * @Last Modified time: 2018-10-28 10:28:46
 */
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
    }
  },

  onLoad() {
    this.button.node.on('click', () => {
      // 压缩混淆是否影响_name的值?
      cc.director.loadScene(this.target._name)
    })
  }

})