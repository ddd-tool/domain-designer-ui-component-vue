<script setup lang="ts">
import { Ui } from '#lib/index'
import { computed } from 'vue'
import { createDomainDesigner } from 'vue-fn/domain-design'

const design = computed(() => {
  const d = createDomainDesigner()
  // 用户
  const 用户 = d.person('用户')
  // 命令
  const 命令1 = d.command('命令1', {})
  const 命令2 = d.facadeCmd('命令2', {})
  // 聚合
  const 主键 = d.field.id('主键')
  const 时间 = d.field.time('时间')
  const 聚合 = d.agg('聚合', { 主键, 时间 })
  // 事件
  const 事件 = d.event('事件', {})
  // 规则
  const 规则 = d.policy('规则')
  // 服务
  const 服务 = d.service('服务')
  // 外部系统
  const 外部系统 = d.system('外部系统')

  用户.command(命令1).agg(聚合).event(事件).policy(规则).service(服务)
  事件.system(外部系统, '我是外部系统')
  用户.facadeCmd(命令2).service(服务)
  return d
})
</script>

<template>
  <Ui :design="design" />
</template>
