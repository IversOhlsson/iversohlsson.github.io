import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { SectionItem } from '../content/sections'

type WorldSceneProps = {
  sections: SectionItem[]
  onActiveSectionChange: (sectionId: string) => void
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

export default function WorldScene({ sections, onActiveSectionChange }: WorldSceneProps) {
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
    scene.add(avatarGroup)

    const avatarBody = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.35, 1.1, 6, 12),
      new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.2, roughness: 0.45 }),
    )
    avatarBody.position.y = 1.0
    avatarBody.castShadow = true
    avatarGroup.add(avatarBody)

    const avatarHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 24, 24),
      new THREE.MeshStandardMaterial({ color: '#b6c4da', metalness: 0.2, roughness: 0.35 }),
    )
    avatarHead.position.set(0, 1.9, 0)
    avatarHead.castShadow = true
    avatarGroup.add(avatarHead)

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
    const cameraTarget = new THREE.Vector3()
    let activeSection = ''
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
    }

    const animate = () => {
      const dt = clock.getDelta()
      moveDirection.set(0, 0, 0)

      if (pressedKeys.has('w') || pressedKeys.has('arrowup')) {
        moveDirection.z -= 1
      }
      if (pressedKeys.has('s') || pressedKeys.has('arrowdown')) {
        moveDirection.z += 1
      }
      if (pressedKeys.has('a') || pressedKeys.has('arrowleft')) {
        moveDirection.x -= 1
      }
      if (pressedKeys.has('d') || pressedKeys.has('arrowright')) {
        moveDirection.x += 1
      }

      if (moveDirection.lengthSq() > 0) {
        moveDirection.normalize().multiplyScalar(5 * dt)
        avatarGroup.position.add(moveDirection)
        avatarGroup.position.x = THREE.MathUtils.clamp(avatarGroup.position.x, -12, 12)
        avatarGroup.position.z = THREE.MathUtils.clamp(avatarGroup.position.z, -12, 6)

        const facing = Math.atan2(moveDirection.x, moveDirection.z)
        avatarGroup.rotation.y = facing
      }

      avatarBody.position.y = 1 + Math.sin(clock.elapsedTime * 8) * 0.04

      cameraTarget.set(avatarGroup.position.x, avatarGroup.position.y + 1.7, avatarGroup.position.z + 8)
      camera.position.lerp(cameraTarget, 0.06)
      camera.lookAt(avatarGroup.position.x, avatarGroup.position.y + 1, avatarGroup.position.z - 2)

      setActiveByDistance()
      renderer.render(scene, camera)
      rafId = window.requestAnimationFrame(animate)
    }

    onActiveSectionChange(sections[0]?.id ?? '')
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
  }, [onActiveSectionChange, sections])

  return <div ref={containerRef} className="worldCanvas" aria-label="3D world" />
}
