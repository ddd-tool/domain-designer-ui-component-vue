<script setup lang="ts">
import { Ui } from '#lib/index'
import { computed } from 'vue'
import { createDomainDesigner } from 'vue-fn/domain-design'

const design = computed(() => {
  const d = createDomainDesigner()
  // 用户
  const 用户 = d.person('用户', '前端用户')

  // 聚合
  const 用户账号 = d.field('用户账号')
  const 订单号 = d.field.id('订单号')
  const 下单时间 = d.field.time('下单时间')
  const 订单聚合 = d.agg(
    '订单聚合',
    { 订单号, 下单时间, 用户账号 },
    '这是订单聚合'
  )

  // 命令
  const 创建订单 = d.command('创建订单', {
    订单号: 订单聚合.inner['订单号'],
    用户账号,
  })
  const 自动扣款 = d.command('自动扣款', { 订单号 })

  // 事件
  const 下单成功 = d.event('下单成功', { 订单号, 下单时间 })
  const 下单失败 = d.event('下单失败', { 订单号, 下单时间 })
  const 扣款成功 = d.event('扣款成功', { 订单号, 下单时间 })
  const 扣款失败 = d.event('扣款失败', { 订单号, 下单时间 })
  // 规则
  const 付款规则 = d.policy(
    '付款规则',
    d.desc`
  如果${用户账号}开通了自动扣费服务，则发起自动扣款
  规则1：
  规则2：
  规则3：
  ... ...
    `
  )
  // 服务
  const 自动扣款服务 = d.service('自动扣款服务', '根据付款规则发起自动扣款')
  // 外部系统
  const 物流系统 = d.system('物流系统')
  const 邮件系统 = d.system('邮件系统')

  // 下单成功自动扣款流程
  用户.command(创建订单)
    .agg(订单聚合)
    .event(下单成功)
    .policy(付款规则)
    .service(自动扣款服务)
    .command(自动扣款)
    .agg(订单聚合)
    .event(扣款成功)
    .system(物流系统)
  // 下单成功自动扣款流程
  自动扣款.agg(订单聚合).event(扣款失败).system(邮件系统)
  // 下单失败流程
  用户.command(创建订单).agg(订单聚合).event(下单失败)
  // 手动扣款流程
  用户.command(创建订单).agg(订单聚合).event(下单成功).policy(付款规则)
  return d
})
</script>

<template>
  <Ui :design="design" />
</template>
