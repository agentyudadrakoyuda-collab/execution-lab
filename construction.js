import * as THREE from './assets/vendor/three/three.module.min.js';

const host = document.querySelector('#scene');
const toggle = document.querySelector('#motion-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// The HTML remains fully usable if WebGL is unavailable.
try {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x10110f, 0);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.z = 9;
  const sculpture = new THREE.Group();
  scene.add(sculpture);

  const shell = new THREE.IcosahedronGeometry(1.42, 1);
  sculpture.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(shell),
    new THREE.LineBasicMaterial({ color: 0xeeb966, transparent: true, opacity: 0.6 })
  ));
  sculpture.add(new THREE.Mesh(shell, new THREE.MeshBasicMaterial({
    color: 0x24251b, transparent: true, opacity: 0.62, polygonOffset: true,
    polygonOffsetFactor: 1, polygonOffsetUnits: 1,
  })));

  const joints = new THREE.Group();
  const positions = shell.getAttribute('position');
  const seen = new Set();
  const jointGeometry = new THREE.SphereGeometry(0.025, 6, 6);
  const jointMaterial = new THREE.MeshBasicMaterial({ color: 0xffd99a });
  for (let i = 0; i < positions.count; i++) {
    const point = new THREE.Vector3().fromBufferAttribute(positions, i);
    const key = point.toArray().map(value => value.toFixed(4)).join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    const joint = new THREE.Mesh(jointGeometry, jointMaterial);
    joint.position.copy(point);
    joints.add(joint);
  }
  sculpture.add(joints);

  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.93 + i * 0.12, 0.005, 4, 120),
      new THREE.MeshBasicMaterial({ color: 0xc5b994, transparent: true, opacity: 0.24 })
    );
    ring.rotation.set(Math.PI * (0.25 + i * 0.28), i * 0.6, i * 0.3);
    sculpture.add(ring);
  }

  let paused = reducedMotion.matches;
  let frame = null;
  let lastTime = null;
  let elapsed = 0;
  let pointerX = 0;
  let pointerY = 0;
  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const visibleHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const visibleWidth = visibleHeight * camera.aspect;
    const mobile = width <= 700;
    sculpture.position.set(mobile ? 0 : visibleWidth * 0.255, mobile ? visibleHeight * (0.5 - 210 / height) : 0, 0);
    sculpture.scale.setScalar(mobile ? Math.min(0.62, visibleWidth / 5.4) : Math.min(1, visibleWidth / 12));
    render();
  }
  function render() {
    sculpture.rotation.set(0.22 + Math.sin(elapsed * 0.2) * 0.13 + pointerY * 0.06, elapsed * 0.09 + pointerX * 0.08, 0.13);
    renderer.render(scene, camera);
  }
  function tick(time) {
    frame = null;
    if (paused || document.hidden) { lastTime = null; return; }
    if (lastTime !== null) elapsed += Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    render();
    frame = requestAnimationFrame(tick);
  }
  function syncAnimation() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastTime = null;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.innerHTML = paused ? 'Resume animation <span aria-hidden="true">&gt;</span>' : 'Pause animation <span aria-hidden="true">||</span>';
    if (!paused && !document.hidden) frame = requestAnimationFrame(tick);
  }
  toggle.addEventListener('click', () => { paused = !paused; syncAnimation(); });
  reducedMotion.addEventListener('change', event => { paused = event.matches; syncAnimation(); });
  document.addEventListener('visibilitychange', syncAnimation);
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', event => {
    if (paused || event.pointerType !== 'mouse') return;
    pointerX = event.clientX / window.innerWidth - 0.5;
    pointerY = event.clientY / window.innerHeight - 0.5;
  }, { passive: true });
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    paused = true;
    syncAnimation();
    toggle.hidden = true;
    host.hidden = true;
  });
  resize();
  toggle.hidden = false;
  syncAnimation();
} catch {
  // A CSS background and all page content remain visible without 3D support.
  host.hidden = true;
  toggle.hidden = true;
}
