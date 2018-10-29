/*
 * @Author: AK-12 
 * @Date: 2018-10-29 20:55:40 
 * @Last Modified by:   AK-12 
 * @Last Modified time: 2018-10-29 20:55:40 
 */
/**
 * > 2018年9月1日15:26:22
 * 1. 给定点和最大极径，限制点的圆形活动范围
 * 2. 给定点获取其极角
 * 3. 给定极角，极径获取点
 * 4. 给定点，获取极径
 * #### By AK-12 @[qq:1029985799@qq.com, gmail:saber2pr@gmail.com]
 */
let MathVec = {
  /**
   * 给定点和最大极径，限制点的活动范围
   */
  limitToCircle: function (commitPos, limitRadius) {
    return this.getLength(commitPos) < limitRadius ? commitPos : this.getPos(this.getAngle(commitPos), limitRadius)
  },
  /**
   * 给定点获取其极角(弧度)
   */
  getAngle: function (Pos) {
    if (Pos.y > 0) {
      return Math.acos(Pos.x / Pos.mag())
    } else {
      return -Math.acos(Pos.x / Pos.mag())
    }
  },
  /**
   * 给定极角，极径获取点
   */
  getPos: function (angle, radius) {
    return cc.v2(radius * Math.cos(angle), radius * Math.sin(angle))
  },
  /**
   * 给定点，获取极径
   */
  getLength: function (commitPos) {
    return commitPos.mag()
  }
}
/**
 * #### 2018年9月1日15:26:16
 * * 使用它创建轮盘很简单
 * 1. 先在场景onload中初始化
 * > MoveCtrllor.init(basicSpr, touchSpr, radius, heroSpeed)
 * 2. 然后在update里绑定角色节点
 * > MoveCtrllor.updateCharacter(this.hero)  
 * 3. 传入拖动盘和拖动点，实现拖动手柄
 * 4. 提供返回拖动角度和拖动力度的接口
 * 5. 控制节点运动接口
 * #### By AK-12 @[qq:1029985799@qq.com, gmail:saber2pr@gmail.com]
 */
let MoveCtrllor = {
  angle: null,
  force: null,
  status: null,
  heroSpeed: null,
  radius: null,

  onload(touchSpr) {
    this.angle = 0
    this.force = 0
    this.status = false
    touchSpr.node.setPosition(0, 0)
  },
  /**
   * 传入拖动盘和拖动点，实现拖动手柄
   */
  init: function (basicSpr, touchSpr, radius, heroSpeed) {
    MoveCtrllor.onload(touchSpr)
    this.radius = typeof (radius) === 'undefined' ? 25 : radius
    this.heroSpeed = typeof (heroSpeed) === 'undefined' ? 5 : heroSpeed
    basicSpr.node.on("touchstart", function (touch) {
      this.status = true
    }, this)
    basicSpr.node.on("touchmove", function (touch) {
      //转换到局部坐标
      let touchPosOnBasic = basicSpr.node.convertToNodeSpaceAR(touch.getLocation())
      //限制拖动范围
      let touchPosOnBasicLimited = MathVec.limitToCircle(touchPosOnBasic, this.radius)
      touchSpr.node.setPosition(touchPosOnBasicLimited)
      //保存角度
      this.angle = MathVec.getAngle(touchPosOnBasicLimited)
      //保存拖动力度
      this.force = MathVec.getLength(touchPosOnBasicLimited) / this.radius
    }, this)
    basicSpr.node.on("touchend", function (touch) {
      //重置状态
      this.onload(touchSpr)
    }, this)
    basicSpr.node.on("touchcancel", function (touch) {
      this.onload(touchSpr)
    }, this)
  },
  /**
   * 获取拖动角度(弧度)
   */
  getMoveAngle() {
    return this.angle
  },
  /**
   * 获取拖动力度
   */
  getForce() {
    return this.force
  },
  /**
   * 获取按键状态
   */
  getStatus() {
    return this.status
  },
  /**
   * 角色动作响应
   */
  updateCharacter(node) {
    this.directToDes(node, 'character')
  },
  updateCamera(node) {
    this.directToDes(node, 'camera')
  },
  directToDes(node, method) {
    if (this.getStatus() === true) {
      let angle = this.getMoveAngle()
      let force = this.getForce()
      let desPos =
        method === 'character' ? cc.p(node.x + this.heroSpeed * Math.cos(angle) * force, node.y + this.heroSpeed * Math.sin(angle) * force) :
        method === 'camera' ? cc.p(node.x - this.heroSpeed * Math.cos(angle) * force, node.y - this.heroSpeed * Math.sin(angle) * force) :
        console.log("methodError")
      node.position = cc.v2(desPos)
    }
  }
}

const strageyType = cc.Enum({
  CHARACTER: 1001,
  CAMERA: 1002
})
/**
 * cocos creater 接口
 */
cc.Class({
  extends: cc.Component,
  properties: {
    basicSpr: {
      default: null,
      type: cc.Sprite,
      displayName: "摇杆盘",
    },
    touchSpr: {
      default: null,
      type: cc.Sprite,
      displayName: "摇杆拖动点",
    },
    hero: {
      default: null,
      type: cc.Sprite,
      displayName: "角色精灵",
      visible() {
        return (this.stragey === strageyType.CHARACTER)
      }
    },
    camera: {
      default: null,
      type: cc.Sprite,
      displayName: "背景精灵",
      visible() {
        return (this.stragey === strageyType.CAMERA)
      }
    },
    radius: {
      default: 25,
      type: cc.Integer,
      displayName: "拖动半径",
      tooltip: "默认25"
    },
    heroSpeed: {
      default: 5,
      type: cc.Integer,
      displayName: "角色移动速度",
      tooltip: "默认5",
      slide: true,
      min: 1,
      max: 15,
      step: 1
    },
    stragey: {
      type: cc.Enum(strageyType),
      default: strageyType.CHARACTER,
      displayName: "策略",
      tooltip: "CHARACTER: 屏幕静止, CAMERA: 屏幕移动, 注意: CAMERA策略时, 角色不能是背景子节点"
    }
  },
  onLoad() {
    MoveCtrllor.init(this.basicSpr, this.touchSpr, this.radius, this.heroSpeed)
  },
  update() {
    if (this.stragey === strageyType.CHARACTER) {
      MoveCtrllor.updateCharacter(this.hero.node)
    } else {
      MoveCtrllor.updateCamera(this.camera.node)
    }
  }
})