import { useEffect, useRef } from 'react'
import styles from './AuroraBackground.module.css'

type Props = {
  /** Shared mouse ref from App, normalised 0..1 in viewport space. */
  mouseRef: React.MutableRefObject<{ x: number; y: number; lastMove: number }>
}

const COMPUTE_WGSL = /* wgsl */ `
struct P { pos: vec2f, vel: vec2f };
struct U {
  time: f32, aspect: f32, dt: f32, m_x: f32,
  m_y: f32, _p0: f32, _p1: f32, _p2: f32,
};
@group(0) @binding(0) var<storage, read_write> ps: array<P>;
@group(0) @binding(1) var<uniform> u: U;

fn hash21(p: vec2f) -> f32 {
  var p3 = fract(vec3f(p.x, p.y, p.x) * 0.1031);
  p3 = p3 + dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
fn vnoise(p: vec2f) -> f32 {
  let i = floor(p); let f = fract(p);
  let s = f * f * (3.0 - 2.0 * f);
  let a = hash21(i);
  let b = hash21(i + vec2f(1.0, 0.0));
  let c = hash21(i + vec2f(0.0, 1.0));
  let d = hash21(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, s.x), mix(c, d, s.x), s.y);
}
fn fbm(p: vec2f) -> f32 {
  var v = 0.0; var a = 0.5; var q = p;
  v = v + a * vnoise(q); q = q * 2.03 + vec2f(11.7, 5.3); a = a * 0.5;
  v = v + a * vnoise(q); q = q * 2.03 + vec2f(11.7, 5.3); a = a * 0.5;
  v = v + a * vnoise(q);
  return v;
}
fn curl(p: vec2f) -> vec2f {
  let e = 0.06;
  let n1 = fbm(p + vec2f(0.0, e));
  let n2 = fbm(p - vec2f(0.0, e));
  let n3 = fbm(p + vec2f(e, 0.0));
  let n4 = fbm(p - vec2f(e, 0.0));
  return vec2f((n1 - n2), -(n3 - n4)) / (2.0 * e);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (i >= arrayLength(&ps)) { return; }
  var p = ps[i];

  let m = vec2f(u.m_x * 2.0 - 1.0, 1.0 - u.m_y * 2.0);

  // Mouse barely nudges the flow field — a hint, not a takeover.
  // When the mouse decays back to centre, m -> (0,0) and the field returns to baseline.
  let q = p.pos * vec2f(1.1, 1.6) + vec2f(u.time * 0.035 + m.x * 0.06, u.time * 0.018 - m.y * 0.04);
  let v = curl(q);
  // moderate damping keeps particles atmospheric rather than streak-y
  p.vel = p.vel * 0.91 + v * 0.00120;

  p.pos = p.pos + p.vel;
  if (p.pos.x >  1.35) { p.pos.x = -1.35; p.vel = vec2f(0.0); }
  if (p.pos.x < -1.35) { p.pos.x =  1.35; p.vel = vec2f(0.0); }
  if (p.pos.y >  1.35) { p.pos.y = -1.35; p.vel = vec2f(0.0); }
  if (p.pos.y < -1.35) { p.pos.y =  1.35; p.vel = vec2f(0.0); }
  ps[i] = p;
}
`

const RENDER_WGSL = /* wgsl */ `
struct VO { @builtin(position) position: vec4f, @location(0) speed: f32 };
@vertex
fn vs(@location(0) pos: vec2f, @location(1) vel: vec2f) -> VO {
  var o: VO;
  o.position = vec4f(pos, 0.0, 1.0);
  o.speed = length(vel);
  return o;
}
@fragment
fn fs(in: VO) -> @location(0) vec4f {
  let s = clamp(in.speed * 70.0, 0.0, 1.0);
  let cool = vec3f(0.36, 0.54, 0.84);
  let warm = vec3f(0.92, 0.94, 0.97);
  let col  = mix(cool * 0.55, warm, s);
  let a = 0.13 + s * 0.32;
  return vec4f(col * a, a);
}
`

const PARTICLE_COUNT = 44_000

export default function AuroraBackground({ mouseRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false
    let raf = 0
    let device: GPUDevice | null = null

    const smoothed = { x: 0.5, y: 0.5 }

    ;(async () => {
      if (!('gpu' in navigator) || !navigator.gpu) {
        console.info('[Aurora] WebGPU not available — using CSS fallback only.')
        return
      }
      let adapter: GPUAdapter | null = null
      try {
        adapter = await navigator.gpu.requestAdapter()
      } catch (err) {
        console.warn('[Aurora] requestAdapter threw', err)
      }
      if (!adapter) {
        console.info('[Aurora] No WebGPU adapter — using CSS fallback only.')
        return
      }
      device = await adapter.requestDevice()
      if (cancelled || !device) return

      const ctx = canvas.getContext('webgpu')
      if (!ctx) {
        console.warn('[Aurora] canvas.getContext("webgpu") returned null.')
        return
      }
      const format = navigator.gpu.getPreferredCanvasFormat()
      ctx.configure({ device, format, alphaMode: 'premultiplied' })
      console.info('[Aurora] WebGPU device created — adapter:', adapter.info?.vendor ?? 'unknown')

      const dpr = 1.0
      const resize = () => {
        canvas.width  = Math.floor(window.innerWidth  * dpr)
        canvas.height = Math.floor(window.innerHeight * dpr)
        canvas.style.width  = window.innerWidth  + 'px'
        canvas.style.height = window.innerHeight + 'px'
      }
      resize()
      window.addEventListener('resize', resize)

      // Init particles with small random velocities so the field looks alive on frame 1.
      const data = new Float32Array(PARTICLE_COUNT * 4)
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        data[i * 4 + 0] = (Math.random() * 2 - 1) * 1.3
        data[i * 4 + 1] = (Math.random() * 2 - 1) * 1.3
        data[i * 4 + 2] = (Math.random() * 2 - 1) * 0.02
        data[i * 4 + 3] = (Math.random() * 2 - 1) * 0.02
      }
      const particles = device.createBuffer({
        size: data.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      })
      device.queue.writeBuffer(particles, 0, data)

      const uBuf = device.createBuffer({
        size: 32,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })

      const computeModule = device.createShaderModule({ code: COMPUTE_WGSL })
      const renderModule  = device.createShaderModule({ code: RENDER_WGSL })

      const computePipe = device.createComputePipeline({
        layout: 'auto',
        compute: { module: computeModule, entryPoint: 'main' },
      })
      const renderPipe = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
          module: renderModule,
          entryPoint: 'vs',
          buffers: [{
            arrayStride: 16,
            attributes: [
              { shaderLocation: 0, offset: 0, format: 'float32x2' },
              { shaderLocation: 1, offset: 8, format: 'float32x2' },
            ],
          }],
        },
        fragment: {
          module: renderModule,
          entryPoint: 'fs',
          targets: [{
            format,
            blend: {
              color: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
              alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
            },
          }],
        },
        primitive: { topology: 'point-list' },
      })

      const computeBind = device.createBindGroup({
        layout: computePipe.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: particles } },
          { binding: 1, resource: { buffer: uBuf } },
        ],
      })

      const t0 = performance.now()
      let last = t0
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const uData = new Float32Array(8)

      const frame = () => {
        if (cancelled || !device) return
        const now = performance.now()
        const dt = Math.min((now - last) / 1000, 0.05); last = now
        const time = (now - t0) / 1000

        // Idle decay — when the cursor has been still for >300ms,
        // gradually lerp the target back toward (0.5, 0.5) over ~1500ms.
        // Result: aurora always returns to its baseline flow when nothing's happening.
        const idleMs = now - mouseRef.current.lastMove
        const idle   = Math.min(1, Math.max(0, (idleMs - 300) / 1500))
        const tx = mouseRef.current.x * (1 - idle) + 0.5 * idle
        const ty = mouseRef.current.y * (1 - idle) + 0.5 * idle
        smoothed.x += (tx - smoothed.x) * 0.04
        smoothed.y += (ty - smoothed.y) * 0.04

        uData[0] = time
        uData[1] = canvas.width / canvas.height
        uData[2] = dt
        uData[3] = smoothed.x
        uData[4] = smoothed.y
        device.queue.writeBuffer(uBuf, 0, uData)

        const enc = device.createCommandEncoder()
        if (!reduced) {
          const pass = enc.beginComputePass()
          pass.setPipeline(computePipe)
          pass.setBindGroup(0, computeBind)
          pass.dispatchWorkgroups(Math.ceil(PARTICLE_COUNT / 64))
          pass.end()
        }
        {
          const view = ctx.getCurrentTexture().createView()
          const pass = enc.beginRenderPass({
            colorAttachments: [{
              view,
              loadOp: 'clear',
              storeOp: 'store',
              clearValue: { r: 0, g: 0, b: 0, a: 0 }, // transparent — CSS aurora shows through
            }],
          })
          pass.setPipeline(renderPipe)
          pass.setVertexBuffer(0, particles)
          pass.draw(PARTICLE_COUNT)
          pass.end()
        }
        device.queue.submit([enc.finish()])
        raf = requestAnimationFrame(frame)
      }
      raf = requestAnimationFrame(frame)
    })().catch(err => {
      console.error('[Aurora] init failed', err)
    })

    return () => {
      cancelled = true
      if (raf) cancelAnimationFrame(raf)
      try { device?.destroy() } catch { /* ignore */ }
    }
  }, [mouseRef])

  return (
    <>
      <div className={`${styles.layer} ${styles.backdrop}`} aria-hidden="true" />
      <div className={`${styles.layer} ${styles.fallback}`} aria-hidden="true" />
      <canvas
        ref={canvasRef}
        className={`${styles.layer} ${styles.canvas}`}
        aria-hidden="true"
      />
      <div className={`${styles.layer} ${styles.grain}`} aria-hidden="true" />
      <div className={`${styles.layer} ${styles.readability}`} aria-hidden="true" />
    </>
  )
}
