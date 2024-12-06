export default `[<aggregation id=vD8LgdK8xU1fgWZZhg002> 订单聚合 
|+ 订单号:ID
|+ 下单时间:Time
|+ 用户账号 |这是订单聚合]
[<command id=YojetgFkSRoG9Rly7esPy> 创建订单 
|+ 订单号:ID
|+ 用户账号 ]
[<command id=OW70sAJ_Ox1yAAi7VmIm0> 自动扣款 
|+ 订单号:ID ]
[<event id=LnoO3YAA00IogylvxAb9W> 下单成功 
|+ 订单号:ID
|+ 下单时间:Time ]
[<event id=_vpWs89GbXFN9AwqLYXEI> 下单失败 
|+ 订单号:ID
|+ 下单时间:Time ]
[<event id=RHtLI5rnCn9xXUi5gu08M> 扣款成功 
|+ 订单号:ID
|+ 下单时间:Time ]
[<event id=jUazBdO3apDj2UdR5kmMv> 扣款失败 
|+ 订单号:ID
|+ 下单时间:Time ]
[<service id=iI7kZQi0WXUhY0HABcTqa> 自动扣款服务 |根据付款规则发起自动扣款]
[<actor id=GaZk3fiVeIC2BRSJ0Zyv1> 用户 |前端用户]
[<system id=EW1D_ldjKRKsNlcb9azcu> 物流系统 ]
[<system id=UrmAA3Iw8tf9Z0hrqRhiw> 邮件系统 ]
[<policy id=llaPFQ2dBRDnXjsS1v1an> 付款规则 |
如果<用户账号>开通了自动扣费服务，则发起自动扣款
规则1：
规则2：
规则3：
... ...
  ]
[GaZk3fiVeIC2BRSJ0Zyv1] a-> [YojetgFkSRoG9Rly7esPy]
[YojetgFkSRoG9Rly7esPy] a-> [vD8LgdK8xU1fgWZZhg002]
[vD8LgdK8xU1fgWZZhg002] a-> [LnoO3YAA00IogylvxAb9W]
[LnoO3YAA00IogylvxAb9W] a-> [llaPFQ2dBRDnXjsS1v1an]
[llaPFQ2dBRDnXjsS1v1an] a-> [iI7kZQi0WXUhY0HABcTqa]
[iI7kZQi0WXUhY0HABcTqa] a-> [OW70sAJ_Ox1yAAi7VmIm0]
[OW70sAJ_Ox1yAAi7VmIm0] a-> [vD8LgdK8xU1fgWZZhg002]
[vD8LgdK8xU1fgWZZhg002] a-> [RHtLI5rnCn9xXUi5gu08M]
[RHtLI5rnCn9xXUi5gu08M] a-> [EW1D_ldjKRKsNlcb9azcu]
[vD8LgdK8xU1fgWZZhg002] a-> [jUazBdO3apDj2UdR5kmMv]
[jUazBdO3apDj2UdR5kmMv] a-> [UrmAA3Iw8tf9Z0hrqRhiw]
[vD8LgdK8xU1fgWZZhg002] a-> [_vpWs89GbXFN9AwqLYXEI]
[_vpWs89GbXFN9AwqLYXEI] a-> [UrmAA3Iw8tf9Z0hrqRhiw]
`
