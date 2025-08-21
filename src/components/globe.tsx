"use client"

import * as React from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import type { Satellite } from "@/lib/satellite-data"

const EARTH_RADIUS = 5
const SAT_GEO_RADIUS = EARTH_RADIUS * (42164 / 6378)

interface GlobeProps {
  observer: { lat: number; lon: number };
  satellites: Satellite[];
  onSatelliteClick: (satellite: Satellite) => void;
}

export function Globe({ observer, satellites, onSatelliteClick }: GlobeProps) {
  const mountRef = React.useRef<HTMLDivElement>(null)
  const raycaster = React.useRef(new THREE.Raycaster());
  const mouse = React.useRef(new THREE.Vector2());
  const satelliteMeshes = React.useRef<THREE.Mesh[]>([]);
  const sceneRef = React.useRef<THREE.Scene | null>(null);
  const cameraRef = React.useRef<THREE.PerspectiveCamera | null>(null);

  React.useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    const textureLoader = new THREE.TextureLoader();

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000)
    camera.position.z = 15
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 7
    controls.maxDistance = 50
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.1;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
    directionalLight.position.set(10, 10, 5)
    scene.add(directionalLight)

    // Starfield
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 20000; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(2000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);


    // Earth
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 128, 128)
    const earthMaterial = new THREE.MeshStandardMaterial({
        color: '#1E90FF', // DodgerBlue
        metalness: 0.2,
        roughness: 0.8,
    })
    const earth = new THREE.Mesh(earthGeometry, earthMaterial)
    earth.name = "earth";
    earth.rotation.y = Math.PI;
    scene.add(earth)
    
    // Atmospheric Glow
    const glowGeometry = new THREE.SphereGeometry(EARTH_RADIUS + 0.8, 128, 128);
    const glowMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize( normalMatrix * normal );
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            void main() {
                float intensity = pow( 0.6 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 4.0 );
                gl_FragColor = vec4( 0.3, 0.6, 1.0, 1.0 ) * intensity;
            }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);

    // Observer marker
    const observerGeometry = new THREE.SphereGeometry(0.08, 16, 16)
    const observerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }) // Green
    const observerMarker = new THREE.Mesh(observerGeometry, observerMaterial)
    const observerPos = get3DfromLatLon(observer.lat, observer.lon, EARTH_RADIUS)
    observerMarker.position.copy(observerPos)
    scene.add(observerMarker)

    // GEO Ring
    const ringGeometry = new THREE.TorusGeometry(SAT_GEO_RADIUS, 0.05, 16, 128)
    const ringMaterial = new THREE.MeshBasicMaterial({ color: "#00BFFF", side: THREE.DoubleSide, transparent: true, opacity: 0.3 })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.rotation.x = Math.PI / 2
    scene.add(ring)

    // Handle resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight)
    }
    window.addEventListener("resize", handleResize)

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", handleResize)
      currentMount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [observer.lat, observer.lon])

  React.useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old satellites
    satelliteMeshes.current.forEach(mesh => scene.remove(mesh));
    satelliteMeshes.current = [];

    // Add new satellites
    const satGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    satellites.forEach(sat => {
      const satMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00BFFF, // DeepSkyBlue
        emissive: 0x00BFFF,
        emissiveIntensity: 1
       });
      const satelliteMesh = new THREE.Mesh(satGeometry, satMaterial);
      const lonRad = THREE.MathUtils.degToRad(sat.slotLongitude);
      const position = new THREE.Vector3(
        SAT_GEO_RADIUS * Math.cos(lonRad),
        0,
        -SAT_GEO_RADIUS * Math.sin(lonRad)
      ).applyAxisAngle(new THREE.Vector3(0,1,0), THREE.MathUtils.degToRad(90));
      
      satelliteMesh.position.copy(position);
      satelliteMesh.userData = { satellite: sat };
      satelliteMesh.name = `satellite-${sat.noradId}`;

      scene.add(satelliteMesh);
      satelliteMeshes.current.push(satelliteMesh);
    });
  }, [satellites])

  const get3DfromLatLon = (lat: number, lon: number, radius: number) => {
    const latRad = THREE.MathUtils.degToRad(lat);
    const lonRad = THREE.MathUtils.degToRad(-lon); // Negate for correct mapping
    return new THREE.Vector3(
      radius * Math.cos(latRad) * Math.cos(lonRad),
      radius * Math.sin(latRad),
      radius * Math.cos(latRad) * Math.sin(lonRad)
    );
  };
  
  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mountRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };
  
  const onClick = () => {
      const camera = cameraRef.current;
      const scene = sceneRef.current;
      if (!camera || !scene) return;

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(satelliteMeshes.current);

      if (intersects.length > 0) {
        const satData = intersects[0].object.userData.satellite;
        if(satData) {
            onSatelliteClick(satData);
        }
      }
  };

  return <div ref={mountRef} className="h-full w-full" onMouseMove={onMouseMove} onClick={onClick} />;
}
