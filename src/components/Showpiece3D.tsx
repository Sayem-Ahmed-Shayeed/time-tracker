import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'

export function Showpiece3D() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    } catch {
      return
    }
    const canvas = renderer.domElement
    canvas.style.position = 'absolute'
    canvas.style.inset = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.pointerEvents = 'none'
    host.appendChild(canvas)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.z = 4.8

    const knotGeo = new THREE.TorusKnotGeometry(1.1, 0.32, 220, 28)
    const wire = new THREE.Mesh(
      knotGeo,
      new THREE.MeshBasicMaterial({ color: 0x68e0cf, wireframe: true, transparent: true, opacity: 0.55 })
    )
    const shell = new THREE.Mesh(
      knotGeo,
      new THREE.MeshBasicMaterial({ color: 0x7de8d9, transparent: true, opacity: 0.07, depthWrite: false })
    )
    const spinMesh = new THREE.Group()
    spinMesh.add(wire, shell)

    const count = 700
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const teal = new THREE.Color('#68e0cf')
    const white = new THREE.Color('#ffffff')
    const knotPos = knotGeo.getAttribute('position')
    const tmp = new THREE.Vector3()
    for (let i = 0; i < count; i++) {
      tmp.fromBufferAttribute(knotPos, Math.floor(Math.random() * knotPos.count))
      positions[i * 3] = tmp.x
      positions[i * 3 + 1] = tmp.y
      positions[i * 3 + 2] = tmp.z
      const isTeal = Math.random() < 0.65
      const dim = 0.55 + Math.random() * 0.45
      const base = isTeal ? teal : white
      colors[i * 3] = base.r * dim
      colors[i * 3 + 1] = base.g * dim
      colors[i * 3 + 2] = base.b * dim
    }
    const sparksGeo = new THREE.BufferGeometry()
    sparksGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    sparksGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const sparks = new THREE.Points(
      sparksGeo,
      new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    )
    spinMesh.add(sparks)

    const group = new THREE.Group()
    group.add(spinMesh)
    group.rotation.x = 0.45
    scene.add(group)

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.05, 2.14, 64),
      new THREE.MeshBasicMaterial({
        color: 0x68e0cf,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    )
    ring.rotation.x = Math.PI / 2
    ring.position.z = -0.6
    scene.add(ring)

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      const nx = (e.clientX - rect.left) / rect.width - 0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5
      tiltX(0.45 + ny * -0.55)
      tiltY(nx * 0.9)
    }
    let tiltX: (v: number) => void = () => {}
    let tiltY: (v: number) => void = () => {}

    const ctx = gsap.context(() => {
      if (reduced) return
      gsap.to(spinMesh.rotation, { y: Math.PI * 2, duration: 16, repeat: -1, ease: 'none' })
      gsap.to(group.position, { y: 0.22, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      tiltX = gsap.quickTo(group.rotation, 'x', { duration: 0.9, ease: 'power2.out' })
      tiltY = gsap.quickTo(group.rotation, 'y', { duration: 0.9, ease: 'power2.out' })
      host.addEventListener('pointermove', onMove)
    }, host)

    let animating = false

    const render = () => renderer.render(scene, camera)

    const resize = () => {
      const w = host.clientWidth || 1
      const h = host.clientHeight || 1
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
      if (!animating) render()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(host)

    let hidden = document.hidden
    const onVisibility = () => {
      hidden = document.hidden
    }
    document.addEventListener('visibilitychange', onVisibility)

    let frameId = 0
    if (reduced) {
      render()
    } else {
      animating = true
      const tick = () => {
        frameId = requestAnimationFrame(tick)
        if (hidden) return
        render()
      }
      frameId = requestAnimationFrame(tick)
    }

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      host.removeEventListener('pointermove', onMove)
      ctx.revert()
      knotGeo.dispose()
      sparksGeo.dispose()
      wire.material.dispose()
      shell.material.dispose()
      sparks.material.dispose()
      ring.geometry.dispose()
      ring.material.dispose()
      renderer.dispose()
      host.removeChild(canvas)
    }
  }, [])

  return (
    <section className="surface-elevated relative flex flex-col overflow-hidden" aria-label="3D showpiece">
      <div ref={hostRef} className="relative min-h-44 w-full flex-1 sm:min-h-56" />
      <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: '#68e0cf' }} aria-hidden />
        <p className="font-mono text-[10px] tracking-[0.22em] text-muted-2 uppercase">Live render — three.js + gsap</p>
      </div>
    </section>
  )
}