import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

const vertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;
uniform float uTime;
uniform float uDistortion;
uniform float uFrequency;
uniform float uOffset;

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
           i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
         + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
         + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  float n = snoise(vec3(position * uFrequency + uTime * 0.4 + uOffset));
  float detail = snoise(vec3(position * 5.0 + uTime * 0.2)) * 0.15;
  vec3 newPos = position + normal * (n + detail) * uDistortion;
  vNormal = normal;
  vPosition = newPos;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
`;

const fragmentShader = `
varying vec3 vNormal;
varying vec3 vPosition;
uniform vec3 uColor;
uniform vec3 uColor2;
uniform float uAlpha;

void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(-vPosition);
  vec3 lightDir = normalize(vec3(5.0, 5.0, 5.0));
  
  float mixFactor = clamp(vNormal.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 blendedColor = mix(uColor2, uColor, mixFactor);
  
  float diff = max(dot(n, lightDir), 0.0);
  diff = mix(diff, 1.0, 0.3); 
  
  float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  vec3 reflectDir = reflect(-lightDir, n);
  float spec = pow(max(dot(v, reflectDir), 0.0), 40.0);
  
  vec3 finalColor = blendedColor * diff;
  finalColor += vec3(1.0) * spec * 0.4;
  finalColor += vec3(1.0) * rim * 0.3;

  gl_FragColor = vec4(finalColor, uAlpha);
}
`;

const palettes = [
  { c1: "#ff2da2", c2: "#ffd400" },
  { c1: "#1dff78", c2: "#006bff" },
  { c1: "#ff8a00", c2: "#ff2638" },
  { c1: "#00c2ff", c2: "#ff4dd8" },
  { c1: "#fff000", c2: "#00d084" },
  { c1: "#ff1744", c2: "#2557ff" },
  { c1: "#ff6b00", c2: "#7c3cff" },
];

interface Blob3DProps {
  settings?: {
    blobScale: number;
    blobOffsetX?: number;
    blobOffsetY?: number;
  };
}

const BlobObj = ({ settings }: Blob3DProps) => {
  const blobGroupRef = useRef<THREE.Group>(null);

  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const handleResize = () => setCompact(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const materials = useMemo(() => {
    return [0, 1, 2].map((i) => {
      return new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uDistortion: { value: 0.15 },
          uFrequency: { value: 1.0 },
          uColor: { value: new THREE.Color("#22ff88") },
          uColor2: { value: new THREE.Color("#0055ff") },
          uOffset: { value: i * 15.0 },
          uAlpha: { value: 1.0 - i * 0.2 },
        },
      });
    });
  }, []);

  const morphTargets = useRef({
    dist: 0.15,
    freq: 1.0,
    c1: new THREE.Color("#22ff88"),
    c2: new THREE.Color("#0055ff"),
  });

  const currentValues = useRef({
    dist: 0.15,
    freq: 1.0,
    c1: new THREE.Color("#22ff88"),
    c2: new THREE.Color("#0055ff"),
  });

  const lastMorphTime = useRef(0);

  useFrame(({ clock, camera }) => {
    const time = clock.getElapsedTime();

    camera.position.z = compact ? 14.5 : 10;

    if (time - lastMorphTime.current > 3.2) {
      morphTargets.current.dist = 0.1 + Math.random() * 0.34;
      morphTargets.current.freq = 0.65 + Math.random() * 1.05;
      const selected = palettes[Math.floor(Math.random() * palettes.length)];
      morphTargets.current.c1.set(selected.c1);
      morphTargets.current.c2.set(selected.c2);
      lastMorphTime.current = time;
    }

    const lerpSpeed = 0.03;
    currentValues.current.dist +=
      (morphTargets.current.dist - currentValues.current.dist) * lerpSpeed;
    currentValues.current.freq +=
      (morphTargets.current.freq - currentValues.current.freq) * lerpSpeed;
    currentValues.current.c1.lerp(morphTargets.current.c1, lerpSpeed);
    currentValues.current.c2.lerp(morphTargets.current.c2, lerpSpeed);

    materials.forEach((mat) => {
      mat.uniforms.uDistortion.value = currentValues.current.dist;
      mat.uniforms.uFrequency.value = currentValues.current.freq;
      mat.uniforms.uColor.value.copy(currentValues.current.c1);
      mat.uniforms.uColor2.value.copy(currentValues.current.c2);
      mat.uniforms.uTime.value = time;
    });
    
    if (blobGroupRef.current) {
      const offsetX = settings?.blobOffsetX ?? 0;
      const offsetY = settings?.blobOffsetY ?? 0;
      const effectiveOffsetX = compact ? offsetX * 0.6 : offsetX;
      const effectiveOffsetY = compact ? offsetY * 0.6 : offsetY;
      
      blobGroupRef.current.position.set(effectiveOffsetX, effectiveOffsetY, 0);
      blobGroupRef.current.rotation.set(0.59, -1.11, 0);
    }
  });

  return (
    <>
      <group ref={blobGroupRef} scale={compact ? (settings?.blobScale ?? 1) * 0.85 : (settings?.blobScale ?? 1)}>
        {materials.map((mat, i) => (
          <mesh key={i} material={mat} scale={1.0 - i * 0.15}>
            <sphereGeometry args={[1.5, 160, 160]} />
          </mesh>
        ))}
      </group>
    </>
  );
};

export default function Blob3D({ settings }: Blob3DProps) {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={[1, 2]}>
      <BlobObj settings={settings} />
    </Canvas>
  );
}
