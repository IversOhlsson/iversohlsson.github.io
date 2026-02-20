import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { SectionItem } from '../content/sections'

type WorldSceneProps = {
  sections: SectionItem[]
  onActiveSectionChange: (sectionId: string) => void
  onInteractionChange: (sectionId: string, isNear: boolean) => void
}

type BoardRef = {
  id: string
  marker: THREE.Object3D
}

function makeBoardTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas 2D context unavailable')
  }

  context.fillStyle = '#0d0f12'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = '#ffffff'
  context.lineWidth = 8
  context.strokeRect(16, 16, canvas.width - 32, canvas.height - 32)

  context.fillStyle = '#ffffff'
  context.font = 'bold 76px Arial'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, canvas.width / 2, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export default function WorldScene({ sections, onActiveSectionChange, onInteractionChange }: WorldSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0b0d10')
    scene.fog = new THREE.Fog('#0b0d10', 18, 40)

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100)
    camera.position.set(0, 7, 12)
    camera.lookAt(0, 0.5, -4)

    const hemiLight = new THREE.HemisphereLight('#b9c3d2', '#0e1116', 0.9)
    scene.add(hemiLight)

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.1)
    dirLight.position.set(5, 12, 8)
    dirLight.castShadow = true
    scene.add(dirLight)

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: '#11161d', roughness: 0.95, metalness: 0.02 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = 0
    floor.receiveShadow = true
    scene.add(floor)

    const grid = new THREE.GridHelper(40, 40, '#2a3240', '#1b2230')
    grid.position.y = 0.01
    scene.add(grid)

    const avatarGroup = new THREE.Group()
    avatarGroup.position.set(0, 0, 2)
    scene.add(avatarGroup)

    const avatarBody = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.35, 1.1, 6, 12),
      new THREE.MeshStandardMaterial({ color: '#121419', metalness: 0.12, roughness: 0.72 }),
    )
    avatarBody.position.y = 1.0
    avatarBody.castShadow = true
    avatarGroup.add(avatarBody)

    const avatarHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 24, 24),
      new THREE.MeshStandardMaterial({ color: '#0b0c10', metalness: 0.08, roughness: 0.88 }),
    )
    avatarHead.position.set(0, 1.85, 0)
    avatarHead.castShadow = true
    avatarGroup.add(avatarHead)

    const avatarFeet = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.2, 0.36, 6, 10),
      new THREE.MeshStandardMaterial({ color: '#090a0d', metalness: 0.05, roughness: 0.95 }),
    )
    avatarFeet.position.set(0, 0.34, 0)
    avatarFeet.castShadow = true
    avatarGroup.add(avatarFeet)

    const shadowBlob = new THREE.Mesh(
      new THREE.CircleGeometry(0.9, 32),
      new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.22 }),
    )
    shadowBlob.rotation.x = -Math.PI / 2
    shadowBlob.position.set(0, 0.03, 0)
    scene.add(shadowBlob)

    const boardRefs: BoardRef[] = []
    const boardTextures: THREE.CanvasTexture[] = []

    sections.forEach((section) => {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 1.8, 0.18),
        new THREE.MeshStandardMaterial({ color: '#3d4553', roughness: 0.8, metalness: 0.2 }),
      )
      post.position.set(section.position[0], 0.9, section.position[2])
      post.castShadow = true
      scene.add(post)

      const texture = makeBoardTexture(section.boardLabel)
      boardTextures.push(texture)

      const board = new THREE.Mesh(
        new THREE.PlaneGeometry(2.5, 1.2),
        new THREE.MeshStandardMaterial({ map: texture, roughness: 0.6, metalness: 0.08 }),
      )
      board.position.set(section.position[0], section.position[1] + 1, section.position[2])
      board.lookAt(0, section.position[1] + 1, 4)
      scene.add(board)

      const marker = new THREE.Object3D()
      marker.position.set(section.position[0], 0, section.position[2] + 1.2)
      scene.add(marker)
      boardRefs.push({ id: section.id, marker })
    })

    const pressedKeys = new Set<string>()

    const onKeyDown = (event: KeyboardEvent) => {
      pressedKeys.add(event.key.toLowerCase())
    }

    const onKeyUp = (event: KeyboardEvent) => {
      pressedKeys.delete(event.key.toLowerCase())
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    const clock = new THREE.Clock()
    const moveDirection = new THREE.Vector3()
    const targetVelocity = new THREE.Vector3()
    const velocity = new THREE.Vector3()
    const cameraForward = new THREE.Vector3()
    const cameraRight = new THREE.Vector3()
    const desiredCameraPosition = new THREE.Vector3()
    const desiredLookAt = new THREE.Vector3()
    const smoothedLookAt = new THREE.Vector3(avatarGroup.position.x, 1.4, avatarGroup.position.z - 1.5)
    let cameraYaw = 0
    let activeSection = ''
    let lastInteractionId = ''
    let lastInteractionNear = false
    let rafId = 0

    const setActiveByDistance = () => {
      let nearestId = sections[0]?.id ?? ''
      let nearestDistance = Number.POSITIVE_INFINITY

      boardRefs.forEach((boardRef) => {
        const distance = boardRef.marker.position.distanceTo(avatarGroup.position)
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestId = boardRef.id
        }
      })

      if (nearestDistance < 4 && nearestId !== activeSection) {
        activeSection = nearestId
        onActiveSectionChange(nearestId)
      }

      const isNear = nearestDistance < 4
      if (nearestId !== lastInteractionId || isNear !== lastInteractionNear) {
        lastInteractionId = nearestId
        lastInteractionNear = isNear
        onInteractionChange(nearestId, isNear)
      }
    }

    const animate = () => {
      const dt = clock.getDelta()
      moveDirection.set(0, 0, 0)

      if (pressedKeys.has('q') || pressedKeys.has('j')) {
        cameraYaw += dt * 1.6
      }
      if (pressedKeys.has('e') || pressedKeys.has('l')) {
        cameraYaw -= dt * 1.6
      }

      cameraForward.set(Math.sin(cameraYaw), 0, -Math.cos(cameraYaw))
      cameraRight.set(Math.cos(cameraYaw), 0, Math.sin(cameraYaw))

      if (pressedKeys.has('w') || pressedKeys.has('arrowup')) {
        moveDirection.add(cameraForward)
      }
      if (pressedKeys.has('s') || pressedKeys.has('arrowdown')) {
        moveDirection.addScaledVector(cameraForward, -1)
      }
      if (pressedKeys.has('a') || pressedKeys.has('arrowleft')) {
        moveDirection.addScaledVector(cameraRight, -1)
      }
      if (pressedKeys.has('d') || pressedKeys.has('arrowright')) {
        moveDirection.add(cameraRight)
      }

      if (moveDirection.lengthSq() > 0) {
        moveDirection.normalize()
      }

      const isSprinting = pressedKeys.has('shift')
      const moveSpeed = isSprinting ? 7.2 : 4.8
      targetVelocity.copy(moveDirection).multiplyScalar(moveSpeed)

      const velocityBlend = 1 - Math.exp(-10 * dt)
      velocity.lerp(targetVelocity, velocityBlend)

      avatarGroup.position.addScaledVector(velocity, dt)
      avatarGroup.position.x = THREE.MathUtils.clamp(avatarGroup.position.x, -12, 12)
      avatarGroup.position.z = THREE.MathUtils.clamp(avatarGroup.position.z, -12, 6)

      if (velocity.lengthSq() > 0.05) {
        const facing = Math.atan2(velocity.x, velocity.z)
        const turnBlend = 1 - Math.exp(-14 * dt)
        avatarGroup.rotation.y = THREE.MathUtils.lerp(avatarGroup.rotation.y, facing, turnBlend)
      }

      const moveAmount = Math.min(velocity.length() / moveSpeed, 1)
      const walkBob = Math.sin(clock.elapsedTime * (7 + moveAmount * 8)) * 0.08 * moveAmount
      avatarBody.position.y = 1 + walkBob
      avatarHead.position.y = 1.85 + walkBob * 0.35
      avatarFeet.position.y = 0.34 + walkBob * 0.25
      shadowBlob.position.set(avatarGroup.position.x, 0.03, avatarGroup.position.z)
      shadowBlob.scale.setScalar(1 - moveAmount * 0.05)

      desiredCameraPosition
        .copy(avatarGroup.position)
        .addScaledVector(cameraForward, -6.8)
        .addScaledVector(cameraRight, 0.65)
      desiredCameraPosition.y += 3.3

      const cameraBlend = 1 - Math.exp(-8 * dt)
      camera.position.lerp(desiredCameraPosition, cameraBlend)

      desiredLookAt.copy(avatarGroup.position).addScaledVector(cameraForward, 2.1)
      desiredLookAt.y += 1.35
      const lookAtBlend = 1 - Math.exp(-10 * dt)
      smoothedLookAt.lerp(desiredLookAt, lookAtBlend)
      camera.lookAt(smoothedLookAt)

      setActiveByDistance()
      renderer.render(scene, camera)
      rafId = window.requestAnimationFrame(animate)
    }

    onActiveSectionChange(sections[0]?.id ?? '')
    onInteractionChange(sections[0]?.id ?? '', false)
    animate()

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)

      boardTextures.forEach((texture) => texture.dispose())
      renderer.dispose()

      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
    }
  }, [onActiveSectionChange, onInteractionChange, sections])

  return <div ref={containerRef} className="worldCanvas" aria-label="3D world" />
}
