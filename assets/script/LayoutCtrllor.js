/*
 * @Author: AK-12 
 * @Date: 2018-10-29 20:46:36 
 * @Last Modified by: AK-12
 * @Last Modified time: 2018-10-29 23:42:17
 */
let onPlayType = cc.Enum({
  HIDDEN: 0,
  VISIBLE: 1
})
let transformType = cc.Enum({
  NONE: 0,
  DROP: 1,
  UP: 2,
  TOLEFT: 3,
  TORIGHT: 4
})
let AnimationMediator = {
  easeMoveBy: (duration, deltaPos) => cc.moveBy(duration, deltaPos).easing(cc.easeSineInOut(duration)),
  easeMoveTo: (duration, Pos) => cc.moveTo(duration, Pos).easing(cc.easeSineInOut(duration)),
  enterFromTop: (duration, length) => AnimationMediator.easeMoveBy(duration, cc.p(0, -length)),
  enterFromBottom: (duration, length) => AnimationMediator.easeMoveBy(duration, cc.p(0, length)),
  enterFromLeft: (duration, length) => AnimationMediator.easeMoveBy(duration, cc.p(length, 0)),
  enterFromRight: (duration, length) => AnimationMediator.easeMoveBy(duration, cc.p(-length, 0)),
}
let pauseLockType = cc.Enum({
  NO: 0,
  YES: 1
})
let measureType = cc.Enum({
  NO: 0,
  YES: 1
})
let TouchManager = {
  touchTest(node, front, size, callback) {
    node.on('touchstart', (touch) => {
      let worldPoint = touch.getLocation()
      switch (front) {
        case 'LEFT':
          Math.abs(worldPoint.x - 0) < size ? callback(worldPoint) : null
          break
        case 'RIGHT':
          Math.abs(worldPoint.x - cc.winSize.width) < size ? callback(worldPoint) : null
          break
        case 'TOP':
          Math.abs(worldPoint.y - cc.winSize.height) < size ? callback(worldPoint) : null
          break
        case 'BOTTOM':
          Math.abs(worldPoint.y - 0) < size ? callback(worldPoint) : null
          break
        default:
          throw (new Error('front error'))
      }
    })
  }
}
cc.Class({
  extends: cc.Component,

  properties: {
    measure: {
      type: cc.Enum(measureType),
      default: measureType.NO,
      displayName: '是否启用触摸划出'
    },
    button: {
      type: cc.Button,
      default: null,
      displayName: '触发按钮',
      tooltip: '点击按钮触发弹框',
      visible() {
        return (this.measure === measureType.NO)
      }
    },
    buttonOnLayout: {
      type: cc.Button,
      default: null,
      displayName: '恢复按钮',
      tooltip: '点击按钮恢复弹框',
      visible() {
        return (this.measure === measureType.NO)
      }
    },
    pauseLock: {
      type: cc.Enum(pauseLockType),
      default: pauseLockType.NO,
      displayName: '弹出后是否暂停'
    },
    layout: {
      type: cc.Layout,
      default: null,
      displayName: '弹出框'
    },
    onPlay: {
      type: cc.Enum(onPlayType),
      default: onPlayType.VISIBLE,
      displayName: '初始状态',
      tooltip: 'HIDDEN: 隐藏, VISIBLE: 可见',
      visible() {
        return (this.transformIn === transformType.NONE && this.transformOut === transformType.NONE)
      }
    },
    transformIn: {
      type: cc.Enum(transformType),
      default: transformType.NONE,
      displayName: '弹出动画'
    },
    transformOut: {
      type: cc.Enum(transformType),
      default: transformType.NONE,
      displayName: '恢复动画'
    },
    length: {
      type: cc.Integer,
      default: window.screen.height / 2,
      displayName: '弹出距离',
      visible() {
        return (this.transformIn !== transformType.NONE || this.transformOut !== transformType.NONE)
      }
    },
    speed: {
      type: cc.Integer,
      default: 10,
      displayName: '动画速度',
      slide: true,
      min: 0,
      max: 10,
      step: 1,
      visible() {
        return (this.transformIn !== transformType.NONE || this.transformOut !== transformType.NONE)
      }
    }
  },

  onLoad() {
    this.layout.node.active = Boolean(this.onPlay)
  },

  start() {
    if (this.measure === measureType.YES) {
      this.touchEvent()
    } else {
      this.button.node.on('click', () => this.layoutAction(this.transformIn))
      this.buttonOnLayout.node.on('click', () => this.layoutAction(this.transformOut))
    }
  },
  layoutAction(type) {
    switch (type) {
      case transformType.NONE:
        this.layout.node.active = !Boolean(this.layout.node.active)
        break
      case transformType.DROP:
        this.layout.node.runAction(AnimationMediator.enterFromTop(this.speed / 10, this.length))
        break
      case transformType.UP:
        this.layout.node.runAction(AnimationMediator.enterFromBottom(this.speed / 10, this.length))
        break
      case transformType.TOLEFT:
        this.layout.node.runAction(AnimationMediator.enterFromRight(this.speed / 10, this.length))
        break
      case transformType.TORIGHT:
        this.layout.node.runAction(AnimationMediator.enterFromLeft(this.speed / 10, this.length))
        break
      default:
        throw (new Error('layout transform type error'))
    }
    this.button.node.active = !this.button.node.active
    Boolean(this.pauseLock) ?
      cc.director.isPaused() ?
      cc.director.resume() :
      this.scheduleOnce(() => cc.director.pause(), this.speed / 10) :
      null
  },
  touchEvent() {
    let size = this.layout.node.getContentSize()
    this.layout.node.on('touchmove', (touch) => {
      let worldPoint = touch.getLocation()
      let localPoint = this.layout.node.parent.convertToNodeSpace(worldPoint)
      this.layout.node.position = cc.p(localPoint.x - size.width / 2, this.layout.node.y)
    })
    this.layout.node.on('touchend', () => {
      this.bindToEdgeOut()
      this.bindToEdgeIn()
    })
    this.layout.node.on('touchcancel', (touch) => {
      this.bindToEdgeOut()
      this.bindToEdgeIn()
    })
  },
  bindToEdgeOut() {
    let size = this.layout.node.getContentSize()
    let localPoint = this.layout.node.getPosition()
    let worldPoint = this.layout.node.parent.convertToWorldSpace(localPoint)
    let desPos = cc.p(-cc.winSize.width / 2 + size.width / 2, this.layout.node.y)
    worldPoint.x > size.width / 2 ?
      this.layout.node.runAction(AnimationMediator.easeMoveTo(this.speed / 10, desPos)) : null
  },
  bindToEdgeIn() {
    let size = this.layout.node.getContentSize()
    let localPoint = this.layout.node.getPosition()
    let worldPoint = this.layout.node.parent.convertToWorldSpace(localPoint)
    let desPos = cc.p(-cc.winSize.width / 2 - size.width / 2 + 5, this.layout.node.y)
    worldPoint.x < size.width / 2 ?
      this.layout.node.runAction(AnimationMediator.easeMoveTo(this.speed / 10, desPos)) : null
  },
  onDestroy() {
    cc.director.resume()
  }
});