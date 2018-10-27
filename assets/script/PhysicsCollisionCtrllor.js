/*
 * @Author: AK-12 
 * @Date: 2018-10-27 17:00:17 
 * @Last Modified by: AK-12
 * @Last Modified time: 2018-10-27 20:09:06
 */
const collisionType = cc.Enum({
  NO: 0,
  YES: 1
})
cc.Class({
  extends: cc.Component,

  properties: {
    gravity: {
      default: 0,
      type: cc.Integer,
      displayName: '重力值',
      tooltip: '注意：此项会影响全局,重力为0时,则物体不会自由落体'
    },
    lockA: {
      default: collisionType.YES,
      type: cc.Enum(collisionType),
      displayName: '是否销毁自身',
      tooltip: 'YES: 碰撞销毁自身, NO: 碰撞不销毁自身'
    },
    lockB: {
      default: collisionType.YES,
      type: cc.Enum(collisionType),
      displayName: '是否销毁对方',
      tooltip: 'YES: 碰撞销毁对方, NO: 碰撞不销毁对方'
    }
  },

  onLoad() {
    cc.director.getPhysicsManager().enabled = true
    cc.director.getPhysicsManager().gravity = cc.v2(0, -this.gravity)
  },

  onBeginContact(contact, selfCollider, otherCollider) {
    if (this.lockA === collisionType.YES) {
      selfCollider.node.destroy()
    }
    if (this.lockB === collisionType.YES) {
      otherCollider.node.destroy()
    }
  }

});