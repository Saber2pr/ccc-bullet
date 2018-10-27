/*
 * @Author: AK-12 
 * @Date: 2018-10-27 17:00:17 
 * @Last Modified by: AK-12
 * @Last Modified time: 2018-10-27 17:22:11
 */
cc.Class({
  extends: cc.Component,

  properties: {
    gravity: {
      default: 0,
      type: cc.Integer,
      displayName: '重力值',
      tooltip: '注意：此项会影响全局,重力为0时,则物体不会自由落体'
    }
  },

  onLoad() {
    cc.director.getPhysicsManager().enabled = true
    cc.director.getPhysicsManager().gravity = cc.v2(0, -this.gravity)
  },

  onBeginContact(contact, selfCollider, otherCollider) {
    selfCollider.node.destroy()
    otherCollider.node.destroy()
  }

});