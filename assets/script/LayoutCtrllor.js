/*
 * @Author: AK-12 
 * @Date: 2018-10-29 20:46:36 
 * @Last Modified by: AK-12
 * @Last Modified time: 2018-10-30 17:13:30
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
  WorldPoint: (node) => node.parent.convertToWorldSpace(node.getPosition()),
  bindToEdgeOut(node, speed, callback) {
    let size = node.getContentSize()
    let worldPoint = AnimationMediator.WorldPoint(node)
    let desPos;
    !!callback ? setTimeout(() => callback(worldPoint), speed * 1000 / 10) : null
    return {
      left() {
        desPos = cc.p(-cc.winSize.width / 2 + size.width, node.y)
        worldPoint.x > size.width / 2 ?
          node.runAction(AnimationMediator.easeMoveTo(speed / 10, desPos)) : null
      },
      right() {
        desPos = cc.p(cc.winSize.width / 2 - size.width, node.y)
        worldPoint.x < cc.winSize.width - size.width / 2 ?
          node.runAction(AnimationMediator.easeMoveTo(speed / 10, desPos)) : null
      }
    }
  },
  bindToEdgeIn(node, vsize, speed, callback) {
    let size = node.getContentSize()
    let worldPoint = AnimationMediator.WorldPoint(node)
    let desPos;
    !!callback ? setTimeout(() => callback(worldPoint), speed * 1000 / 10) : null
    return {
      left() {
        desPos = cc.p(-cc.winSize.width / 2 + vsize, node.y)
        worldPoint.x < size.width / 2 ?
          node.runAction(AnimationMediator.easeMoveTo(speed / 10, desPos)) : null
      },
      right() {
        desPos = cc.p(cc.winSize.width / 2 - vsize, node.y)
        worldPoint.x > cc.winSize.width - size.width / 2 ?
          node.runAction(AnimationMediator.easeMoveTo(speed / 10, desPos)) : null
      }
    }
  },
}
let pauseLockType = cc.Enum({
  NO: 0,
  YES: 1
})
let measureType = cc.Enum({
  NO: 0,
  YES: 1
})
let StatusManager = {
  use(bool) {
    return (delayTime) => Boolean(bool) ?
      cc.director.isPaused() ?
      cc.director.resume() :
      setTimeout(() => cc.director.pause(), delayTime * 1000) :
      null
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
      displayName: '弹出后是否暂停',
      visible() {
        return (this.measure === measureType.NO)
      }
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
      displayName: '恢复动画',
      visible() {
        return (this.measure === measureType.NO)
      }
    },
    length: {
      type: cc.Integer,
      default: window.screen.height / 2,
      displayName: '弹出距离',
      visible() {
        if (this.measure === measureType.YES) {
          return false
        }
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
  layoutAction(select) {
    let vsize = Number(10)
    let ClickType = {
      NONE: () => this.layout.node.active = !Boolean(this.layout.node.active),
      DROP: () => this.layout.node.runAction(AnimationMediator.enterFromTop(this.speed / 10, this.length)),
      UP: () => this.layout.node.runAction(AnimationMediator.enterFromBottom(this.speed / 10, this.length)),
      TOLEFT: () => this.layout.node.runAction(AnimationMediator.enterFromRight(this.speed / 10, this.length)),
      TORIGHT: () => this.layout.node.runAction(AnimationMediator.enterFromLeft(this.speed / 10, this.length))
    }
    let TouchType = {
      NONE: () => this.layout.node.active = !Boolean(this.layout.node.active),
      DROP: () => this.layout.node.runAction(AnimationMediator.enterFromTop(this.speed / 10, this.length)),
      UP: () => this.layout.node.runAction(AnimationMediator.enterFromBottom(this.speed / 10, this.length)),
      TOLEFT: () => {
        AnimationMediator.bindToEdgeOut(this.layout.node, this.speed).right()
        AnimationMediator.bindToEdgeIn(this.layout.node, vsize, this.speed).right()
      },
      TORIGHT: () => {
        AnimationMediator.bindToEdgeOut(this.layout.node, this.speed).left()
        AnimationMediator.bindToEdgeIn(this.layout.node, vsize, this.speed).left()
      }
    }
    if (this.measure === measureType.NO) {
      this.switchFunc(select, ClickType.NONE, ClickType.DROP, ClickType.UP, ClickType.TOLEFT, ClickType.TORIGHT)
      this.button.node.active = !this.button.node.active
      StatusManager.use(this.pauseLock)(this.speed / 10)
    } else {
      this.switchFunc(select, TouchType.NONE, TouchType.DROP, TouchType.UP, TouchType.TOLEFT, TouchType.TORIGHT)
    }
  },
  switchFunc(select, NONE, DROP, UP, TOLEFT, TORIGHT) {
    switch (select) {
      case transformType.NONE:
        NONE()
        break
      case transformType.DROP:
        DROP()
        break
      case transformType.UP:
        UP()
        break
      case transformType.TOLEFT:
        TOLEFT()
        break
      case transformType.TORIGHT:
        TORIGHT()
        break
      default:
        throw (new Error('layout transform type error'))
    }
  },
  touchEvent() {
    // let size = this.layout.node.getContentSize()
    this.layout.node.on('touchmove', (touch) => {
      let worldPoint = touch.getLocation()
      let localPoint = this.layout.node.parent.convertToNodeSpace(worldPoint)
      // worldPoint.x < size.width ? this.layout.node.position = cc.p(localPoint.x, this.layout.node.y) : null
      this.layout.node.position = cc.p(localPoint.x, this.layout.node.y)
    })
    this.layout.node.on('touchend', () => {
      this.layoutAction(this.transformIn)
    })
    this.layout.node.on('touchcancel', () => {
      this.layoutAction(this.transformIn)
    })
  },
  onDestroy() {
    cc.director.resume()
  }
});