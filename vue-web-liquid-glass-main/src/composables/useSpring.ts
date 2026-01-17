import { ref, watch, type Ref } from 'vue'

interface SpringConfig {
    stiffness?: number
    damping?: number
    mass?: number
}

/**
 * A composable that creates a spring-animated value
 * Similar to Framer Motion's useSpring
 */
export function useSpring(
    target: Ref<number> | (() => number),
    config: SpringConfig = {}
): Ref<number> {
    const { stiffness = 100, damping = 10, mass = 1 } = config

    const getTarget = typeof target === 'function' ? target : () => target.value

    const current = ref(getTarget())
    let velocity = 0
    let animationFrame: number | null = null

    const animate = () => {
        const targetValue = getTarget()
        const displacement = targetValue - current.value

        // Spring physics
        const springForce = displacement * stiffness
        const dampingForce = velocity * damping
        const acceleration = (springForce - dampingForce) / mass

        velocity += acceleration * (1 / 60) // Assume 60fps
        current.value += velocity * (1 / 60)

        // Stop when close enough and velocity is low
        if (Math.abs(displacement) < 0.001 && Math.abs(velocity) < 0.001) {
            current.value = targetValue
            velocity = 0
            animationFrame = null
            return
        }

        animationFrame = requestAnimationFrame(animate)
    }

    // Start animation when target changes
    if (typeof target !== 'function') {
        watch(target, () => {
            if (!animationFrame) {
                animationFrame = requestAnimationFrame(animate)
            }
        })
    } else {
        // For computed-like targets, we need to poll
        const checkAndAnimate = () => {
            const targetValue = getTarget()
            if (Math.abs(targetValue - current.value) > 0.001 || Math.abs(velocity) > 0.001) {
                if (!animationFrame) {
                    animationFrame = requestAnimationFrame(animate)
                }
            }
            requestAnimationFrame(checkAndAnimate)
        }
        checkAndAnimate()
    }

    return current
}

/**
 * Simple linear interpolation between two values
 */
export function useLerp(
    value: Ref<number>,
    outputRange: [number, number],
    inputRange: [number, number] = [0, 1]
): Ref<number> {
    const result = ref(0)

    watch(value, (v) => {
        const t = (v - inputRange[0]) / (inputRange[1] - inputRange[0])
        result.value = outputRange[0] + t * (outputRange[1] - outputRange[0])
    }, { immediate: true })

    return result
}
