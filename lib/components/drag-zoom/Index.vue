<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isSpacePressed = ref(false) // 是否按下空格键
const isDragging = ref(false) // 是否正在拖动
const position = ref({ x: 0, y: 0 }) // 元素的位置
const startDragPosition = ref({ x: 0, y: 0 }) // 鼠标开始拖动时的位置
const startElementPosition = ref({ x: 0, y: 0 }) // 元素开始拖动时的位置

const cursor = ref('unset')
const scale = ref(1) // 缩放比例，初始为 1
const minScale = 0.5 // 最小缩放比例
const maxScale = 3 // 最大缩放比例

// 键盘事件监听
const onKeyDown = (e: KeyboardEvent) => {
  if (e.code === 'Space') {
    cursor.value = 'grab'
    e.preventDefault() // 阻止页面滚动
    isSpacePressed.value = true
  }
}

const onKeyUp = (e: KeyboardEvent) => {
  if (e.code === 'Space') {
    cursor.value = 'unset'
    isSpacePressed.value = false
  }
}

// 鼠标按下事件
const onMouseDown = (e: MouseEvent) => {
  // 判断是否按下鼠标中键或空格键
  if (isSpacePressed.value || e.button === 1) {
    isDragging.value = true
    startDragPosition.value = { x: e.clientX, y: e.clientY }
    startElementPosition.value = { ...position.value }
    cursor.value = 'grabbing' // 改变鼠标样式为拖动状态
    e.preventDefault() // 阻止默认行为（如滚动页面）
  }
}

// 鼠标移动事件
const onMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    const deltaX = e.clientX - startDragPosition.value.x
    const deltaY = e.clientY - startDragPosition.value.y
    position.value = {
      x: startElementPosition.value.x + deltaX,
      y: startElementPosition.value.y + deltaY,
    }
  }
}

// 鼠标松开事件
const onMouseUp = (_: MouseEvent) => {
  if (isDragging.value) {
    isDragging.value = false
    cursor.value = isSpacePressed.value ? 'grab' : 'unset' // 根据空格键状态恢复鼠标样式
  }
}

// 鼠标滚轮事件（缩放功能）
const onWheel = (e: WheelEvent) => {
  e.preventDefault() // 阻止页面默认滚动行为
  const zoomSpeed = 0.1 // 缩放速度
  if (e.deltaY < 0) {
    // 滚轮向上，放大
    scale.value = Math.min(maxScale, scale.value + zoomSpeed)
  } else {
    // 滚轮向下，缩小
    scale.value = Math.max(minScale, scale.value - zoomSpeed)
  }
}

// 添加和移除事件监听
onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('wheel', onWheel, { passive: false }) // 添加滚轮事件监听
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('wheel', onWheel)
})
</script>

<template>
  <div
    class="container"
    :style="{ cursor: cursor }"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
    <div
      class="draggable"
      :style="{
        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
      }"
    >
      <!-- 插槽内容 -->
      <slot>拖动并缩放我</slot>
    </div>
  </div>
</template>

<style>
.container {
  width: 100vw;
  height: 100vh;
  background-color: #f0f0f0;
  overflow: hidden;
  position: relative;
}

.draggable {
  position: absolute;
  top: 0;
  left: 0;
  user-select: none;
  transform-origin: center; /* 缩放以中心为基准 */
}
</style>
