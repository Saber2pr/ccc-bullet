/*
 * @Author: AK-12 
 * @Date: 2018-10-26 09:26:44 
 * @Last Modified by: AK-12
 * @Last Modified time: 2018-10-26 21:04:12
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
      cc.director.loadScene(this.target._name)
    })
  }

})