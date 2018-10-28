/*
 * @Author: AK-12 
 * @Date: 2018-10-27 08:53:49 
 * @Last Modified by: AK-12
 * @Last Modified time: 2018-10-28 21:54:57
 */
const frontType = cc.Enum({
  portraitUp: 0,
  portraitDown: 1,
  landscapeRight: 2,
  landscapeLeft: 3
})
cc.Class({
  extends: cc.Component,

  properties: {
    hero: {
      default: null,
      type: cc.Node,
      displayName: '发射器',
      tooltip: '要发射子弹的精灵'
    },
    bullet: {
      default: null,
      type: cc.Prefab,
      displayName: '子弹预制资源'
    },
    speed: {
      type: cc.Integer,
      default: 3,
      slide: true,
      min: 0,
      max: 10,
      step: 1,
      displayName: '子弹迟缓度',
      tooltip: '值越大, 子弹速度越慢'
    },
    interval: {
      type: cc.Integer,
      default: 3,
      slide: true,
      min: 0,
      max: 30,
      step: 1,
      displayName: '发射时间间隔'
    },
    front: {
      type: cc.Enum(frontType),
      default: frontType.portraitUp,
      displayName: '子弹发射方向',
      tooltip: 'portrait: 竖直, landscape: 水平'
    }
  },


  start() {
    this.schedule(this.addBullet, this.interval / 10)
  },

  addBullet() {
    let bullet = cc.instantiate(this.bullet)
    bullet.parent = this.hero.parent
    let worldPoint = this.hero.parent.convertToWorldSpace(this.hero)
    let localPoint = this.hero.parent.convertToNodeSpace(worldPoint)
    bullet.position = localPoint
    let pos
    switch (this.front) {
      case frontType.portraitUp:
        pos = cc.p(localPoint.x, cc.winSize.height)
        break
      case frontType.portraitDown:
        pos = cc.p(localPoint.x, -cc.winSize.height)
        break
      case frontType.landscapeRight:
        pos = cc.p(cc.winSize.width, localPoint.y)
        break
      case frontType.landscapeLeft:
        pos = cc.p(-cc.winSize.width, localPoint.y)
        break
      default:
        throw (new Error('front error'))
    }
    let fire = cc.moveTo(this.speed, pos)
    bullet.runAction(fire)
  }
});