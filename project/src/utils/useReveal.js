import { onMounted, onBeforeUnmount, ref } from 'vue'

/**
 * 滚动进视口动画组合函数
 * 元素进入视口后：visible 置为 true，并添加 .reveal-in 类（配合 style.css 中的 .reveal 基础类）。
 * 骨架阶段仅挂载类名，动画细节在第 3 步补充。
 * @param {import('vue').Ref} elRef 目标元素 ref
 * @param {IntersectionObserverInit} options 观察选项
 */
export function useReveal(elRef, options = {}) {
  const visible = ref(false)
  let observer = null

  onMounted(() => {
    const el = elRef.value
    if (!el) return
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible.value = true
            el.classList.add('reveal-in')
            observer.disconnect() // 只触发一次
          }
        })
      },
      { threshold: 0.15, ...options },
    )
    observer.observe(el)
  })

  onBeforeUnmount(() => {
    if (observer) observer.disconnect()
  })

  return { visible }
}
