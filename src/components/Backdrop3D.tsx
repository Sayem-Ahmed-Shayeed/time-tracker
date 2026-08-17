import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const POINT_COUNT = 500
const SPREAD = 1600

export function Backdrop3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    } catch {
      return
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 4000)
    camera.position.z = 800

    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(POINT_COUNT * 3)
    const colors = new Float32Array(POINT_COUNT * 3)
    const teal = new THREE.Color('#68e0cf')
    const white = new THREE.Color('#ffffff')

    for (let i = 0; i < POINT_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * SPREAD
      positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD
      positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD * 0.6
      const isTeal = Math.random() < 0.7
      const dim = isTeal ? 0.4 + Math.random() * 0.6 : 0.3 + Math.random() * 0.4
      const base = isTeal ? teal : white
      colors[i * 3] = base.r * dim
      colors[i * 3 + 1] = base.g * dim
      colors[i * 3 + 2] = base.b * dim
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 2.4,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))

    let animating = false

    const resize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      if (!animating) renderer.render(scene, camera)
    }
    resize()
    window.addEventListener('resize', resize)

    let hidden = document.hidden
    const onVisibility = () => {
      hidden = document.hidden
    }
    document.addEventListener('visibilitychange', onVisibility)

    let frameId = 0
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      renderer.render(scene, camera)
    } else {
      animating = true
      const tick = () => {
        frameId = requestAnimationFrame(tick)
        if (hidden) return
        const t = performance.now() * 0.001
        points.rotation.y = t * 0.02
        points.rotation.x = Math.sin(t * 0.05) * 0.04
        points.position.y = Math.sin(t * 0.12) * 14
        renderer.render(scene, camera)
      }
      frameId = requestAnimationFrame(tick)
    }

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[-10] h-full w-full"
      aria-hidden="true"
    />
  )
}
