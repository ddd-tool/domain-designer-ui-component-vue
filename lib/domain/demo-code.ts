export default `
// 定义用户
[<actor id=闸机> 闸机]
[<actor id=车主> 车主]
[<actor id=支付系统> 支付系统]

// 定义命令
[<command id=车辆出场命令 title=asdasd> 车辆出场命令|车牌号]
[<facadeCommand id=车辆入场外观命令> 车辆入场外观命令]
[<command id=车辆入场命令> 车辆入场命令]
[<command id=付费命令> 付费命令]
[<command id=计算当前费用命令> 计算当前费用命令]
[<command id=添加车辆到黑名单命令> 添加车辆到黑名单命令]
[<command id=从黑名单移除车辆命令> 从黑名单移除车辆命令]

// 定义服务
[<service id=车辆入场服务> 车辆入场服务]
[<service id=报警服务> 报警服务]

// 定义聚合
[<aggregation id=停车聚合> 停车聚合
  |- id:车牌号
  |- 入场时间
  |- 累计消费金额
  |- 最后付款时间
]
[<aggregation id=黑名单聚合> 黑名单聚合
  |id:车牌号
  |是否存在于黑名单
]

// 定义事件
[<event id=停车已付费事件> 停车已付费事件]
[<event id=车辆已入场事件> 车辆已入场事件]
[<event id=车辆已出场事件> 车辆已出场事件]
[<event id=出场已失败事件> 出场已失败事件]
[<event id=入场已失败事件> 入场已失败事件]
[<event id=车辆已加入黑名单事件> 车辆已加入黑名单事件]
[<event id=车辆已从黑名单移除事件> 车辆已从黑名单移除事件]

// 定义策略
[<policy id=报警策略> 报警策略]

[车主] -> [计算当前费用命令] -> [停车聚合]
[支付系统] -> [付费命令] -> [停车聚合] -> [停车已付费事件]
[闸机] -> [车辆出场命令] -> [停车聚合] -> [车辆已出场事件]
  [停车聚合] -> [出场已失败事件]
[闸机] -> [车辆入场外观命令] -> [车辆入场服务] -> [车辆入场命令] -> [停车聚合] -> [车辆已入场事件]
  [停车聚合] -> [入场已失败事件]
[出场已失败事件] -> [报警策略] -> [报警服务]
[入场已失败事件] -> [报警策略]

[车辆入场服务] -> [黑名单聚合] -> [车辆已加入黑名单事件]
  [黑名单聚合] -> [车辆已从黑名单移除事件]
  [添加车辆到黑名单命令] -> [黑名单聚合]
  [从黑名单移除车辆命令] -> [黑名单聚合]

// [<frame>Decorator pattern|
//   [<abstract>Component||+ operation()]
//   [Client] depends --> [Component]
//   [Decorator|- next: Component]
//   [Decorator] decorates -- [ConcreteComponent]
//   [Component] <:- [Decorator]
//   [Component] <:- [ConcreteComponent]
// ]
`
