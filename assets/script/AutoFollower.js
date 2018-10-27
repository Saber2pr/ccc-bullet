/*
 * @Author: AK-12 
 * @Date: 2018-10-27 17:24:50 
 * @Last Modified by: AK-12
 * @Last Modified time: 2018-10-27 19:02:42
 */
let MathVec = {
  getFront(origin, target) {
    let front = cc.v2(target.x - origin.x, target.y - origin.y)
    return cc.v2(front.x / front.mag(), front.y / front.mag())
  },
}

let AnimationMediator = {
  moveFollowTarget(node, target, speed) {
    let _speed = typeof (speed) === 'undefined' ? 1 : speed
    let front = MathVec.getFront(node, target)
    node.setPosition(node.x + front.x * _speed, node.y + front.y * _speed)
  }
}

cc.Class({
  extends: cc.Component,

  properties: {
    target: {
      type: cc.Node,
      default: null,
      displayName: '目标靶节点',
      tooltip: '追踪的目标'
    },
    speed: {
      type: cc.Integer,
      default: 2,
      displayName: '移动速度',
      slide: true,
      min: 0,
      max: 10,
      step: 1,
    }
  },

  update() {
    AnimationMediator.moveFollowTarget(this.node, this.target, this.speed / 2)
  }
});