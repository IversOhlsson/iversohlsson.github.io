import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.js'
import WebGPURenderer from 'https://cdn.jsdelivr.net/npm/three@0.181.1/examples/jsm/renderers/webgpu/WebGPURenderer.js'
import WebGPU from 'https://cdn.jsdelivr.net/npm/three@0.181.1/examples/jsm/capabilities/WebGPU.js'

async function createRenderer(container, statusElement) {
  const width = container.clientWidth || window.innerWidth
  const height = container.clientHeight || 600

  if (WebGPU.isAvailable()) {
    try {
      const renderer = new WebGPURenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(width, height)
      await renderer.init()
      statusElement.textContent = 'Renderer: WebGPU'
      return renderer
    } catch (error) {
      statusElement.textContent = 'Renderer: WebGL fallback'
    }
  } else {
    statusElement.textContent = 'Renderer: WebGL fallback'
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  return renderer
}

async function initHeroScene() {
  const container = document.getElementById('hero-scene')
  const statusElement = document.getElementById('hero-renderer-status')

  if (!container || !statusElement) {
    return
  }

  const renderer = await createRenderer(container, statusElement)
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(0, 0, 8)

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.3)
  keyLight.position.set(4, 3, 5)
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(0x999999, 1)
  rimLight.position.set(-4, 1, -2)
  scene.add(rimLight)

  const ambientLight = new THREE.AmbientLight(0x444444, 1)
  scene.add(ambientLight)

  const coreGeometry = new THREE.IcosahedronGeometry(1.3, 1)
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.35,
    roughness: 0.4,
    emissive: 0x111111,
  })
  const core = new THREE.Mesh(coreGeometry, coreMaterial)
  scene.add(core)

  const ringGeometry = new THREE.TorusGeometry(2.7, 0.04, 12, 128)
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x525252 })
  const ring = new THREE.Mesh(ringGeometry, ringMaterial)
  ring.rotation.x = Math.PI * 0.35
  scene.add(ring)

  const pointsGeometry = new THREE.BufferGeometry()
  const pointsCount = 420
  const pointPositions = new Float32Array(pointsCount * 3)

  for (let index = 0; index < pointsCount; index += 1) {
    const i3 = index * 3
    const radius = 3.2 + Math.random() * 2.6
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos((Math.random() * 2) - 1)
    pointPositions[i3] = radius * Math.sin(phi) * Math.cos(theta)
    pointPositions[i3 + 1] = radius * Math.cos(phi)
    pointPositions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
  }

  pointsGeometry.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3))
  const pointsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.025,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.65,
  })
  const points = new THREE.Points(pointsGeometry, pointsMaterial)
  scene.add(points)

  const pointer = { x: 0, y: 0 }
  const onPointerMove = (event) => {
    const bounds = container.getBoundingClientRect()
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
    pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1)
  }

  container.addEventListener('pointermove', onPointerMove)

  const clock = new THREE.Clock()
  let frameId = 0

  const render = () => {
    const elapsed = clock.getElapsedTime()

    core.rotation.x = elapsed * 0.2 + pointer.y * 0.18
    core.rotation.y = elapsed * 0.42 + pointer.x * 0.26

    ring.rotation.z = elapsed * 0.3
    ring.rotation.y = elapsed * 0.15 + pointer.x * 0.22

    points.rotation.y = -elapsed * 0.03
    points.rotation.x = pointer.y * 0.1

    camera.position.x += ((pointer.x * 0.65) - camera.position.x) * 0.04
    camera.position.y += ((pointer.y * 0.5) - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)

    renderer.render(scene, camera)
    frameId = window.requestAnimationFrame(render)
  }

  render()

  const onResize = () => {
    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || 600
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
  }

  window.addEventListener('resize', onResize)

  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(frameId)
    window.removeEventListener('resize', onResize)
    container.removeEventListener('pointermove', onPointerMove)
    pointsGeometry.dispose()
    pointsMaterial.dispose()
    coreGeometry.dispose()
    coreMaterial.dispose()
    ringGeometry.dispose()
    ringMaterial.dispose()
    renderer.dispose()
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initHeroScene()
  })
} else {
  initHeroScene()
}
