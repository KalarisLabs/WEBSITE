'use client';
import * as THREE from 'three';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  Canvas,
  extend,
  useFrame,
  useThree,
  type ThreeElement,
  type ThreeEvent,
} from '@react-three/fiber';
import { Environment, Lightformer, useGLTF } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import {
  BADGE_ATLAS_SIZE,
  type BadgeAssets,
  drawBadgeAtlas,
  drawLanyard,
  loadBadgeAssets,
} from '@/components/fellowship/badge-art';
import { cn } from '@/lib/utils/cn';

extend({ MeshLineGeometry, MeshLineMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

// Self-hosted card/clip/clamp model; the card texture is replaced at runtime.
const BADGE_MODEL = '/models/fellowship-badge.glb';

type GLTFResult = {
  nodes: {
    card: THREE.Mesh;
    clip: THREE.Mesh;
    clamp: THREE.Mesh;
  };
  materials: {
    base: THREE.MeshStandardMaterial;
    metal: THREE.MeshStandardMaterial;
  };
};

/** Half-extents of the card in world units, with a little breathing room. */
const CARD_HALF = { x: 0.9, y: 1.25 } as const;

const NO_HATS: readonly string[] = [];

type JointBody = RapierRigidBody & { lerped?: THREE.Vector3 };

/**
 * Lanyard from React Bits (reactbits.dev/components/lanyard), adapted for the
 * fellowship: the card faces are painted at runtime from `name` instead of
 * static front/back images, and the band uses the Kalaris strip.
 */
export interface LanyardProps {
  /** Name printed on the badge front and back. */
  name: string;
  /** Hat labels printed under the name. */
  hats?: readonly string[];
  /** Camera position. */
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  /** Band width in world units. */
  lanyardWidth?: number;
  /** Changing this value gives the card a swing, e.g. when a name is saved. */
  swing?: number;
  className?: string;
}

export default function Lanyard({
  name,
  hats = NO_HATS,
  position = [0, 0, 10],
  gravity = [0, -40, 0],
  fov = 25,
  lanyardWidth = 1,
  swing = 0,
  className,
}: LanyardProps) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // Pause rendering and physics while the badge is scrolled out of view.
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry?.isIntersecting ?? true),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={container} className={cn('h-[500px] w-full', className)}>
      <Canvas
        camera={{ position, fov }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        frameloop={visible ? 'always' : 'never'}
      >
        <ambientLight intensity={Math.PI} />
        <Suspense fallback={null}>
          <Physics
            interpolate
            gravity={gravity}
            timeStep={1 / 60}
            paused={!visible}
          >
            <Band
              name={name}
              hats={hats}
              lanyardWidth={lanyardWidth}
              swing={swing}
            />
          </Physics>
        </Suspense>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

/** Canvas-backed textures for the personalised card and the lanyard. */
function useBadgeTextures(name: string, hats: readonly string[]) {
  const gl = useThree((state) => state.gl);

  const card = useMemo(() => {
    // Allocate at full size so repaints never change the texture dimensions.
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = BADGE_ATLAS_SIZE;
    const texture = new THREE.CanvasTexture(canvas);
    texture.flipY = false; // Match the GLTF card UVs.
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    return texture;
  }, [gl]);

  const band = useMemo(() => {
    const canvas = document.createElement('canvas');
    drawLanyard(canvas);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  // Brand images and fonts load once; the lanyard repaints when they arrive.
  const [assets, setAssets] = useState<BadgeAssets>({});
  useEffect(() => {
    let cancelled = false;
    loadBadgeAssets().then((loaded) => {
      if (cancelled) return;
      setAssets(loaded);
      drawLanyard(band.image as HTMLCanvasElement);
      band.needsUpdate = true;
    });
    return () => {
      cancelled = true;
    };
  }, [band]);

  // Repainting a 1024² canvas is cheap, so the name updates as it is typed.
  useEffect(() => {
    drawBadgeAtlas(card.image as HTMLCanvasElement, name, assets, hats);
    card.needsUpdate = true;
  }, [card, name, hats, assets]);

  useEffect(
    () => () => {
      card.dispose();
      band.dispose();
    },
    [card, band],
  );

  return { card, band };
}

function Band({
  name,
  hats,
  lanyardWidth,
  swing,
  maxSpeed = 50,
  minSpeed = 10,
}: {
  name: string;
  hats: readonly string[];
  lanyardWidth: number;
  swing: number;
  maxSpeed?: number;
  minSpeed?: number;
}) {
  const band = useRef<THREE.Mesh<MeshLineGeometry, MeshLineMaterial>>(null);
  // Rapier's joint hooks expect non-null ref objects; bodies mount before use.
  const fixed = useRef<JointBody>(null!);
  const j1 = useRef<JointBody>(null!);
  const j2 = useRef<JointBody>(null!);
  const j3 = useRef<JointBody>(null!);
  const card = useRef<RapierRigidBody>(null!);

  const [vec, ang, rot, dir] = useMemo(
    () => [
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ],
    [],
  );

  const segmentProps: RigidBodyProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 2,
    linearDamping: 2,
  };

  const { nodes, materials } = useGLTF(BADGE_MODEL) as unknown as GLTFResult;
  const textures = useBadgeTextures(name, hats);
  const { width, height } = useThree((state) => state.size);
  const [points] = useState(
    () =>
      [
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ] as const,
  );
  const [curve] = useState(() => new THREE.CatmullRomCurve3([...points]));
  const [resolution] = useState(() => new THREE.Vector2());
  resolution.set(width, height);
  const bandMaterialArgs = useMemo(
    () => [{ resolution }] as const,
    [resolution],
  );
  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0],
  ]);

  useEffect(() => {
    if (!swing || !card.current) return;
    // Nudge velocities rather than applying impulses: the card is light, so
    // any impulse big enough to see overstretches the rope joints.
    // Wake the whole chain; a sleeping rope segment ignores the moving card.
    [fixed, j1, j2, j3, card].forEach((ref) => ref.current?.wakeUp());
    const body = card.current;
    const linvel = body.linvel();
    const angvel = body.angvel();
    body.setLinvel({ x: linvel.x + 2.5, y: linvel.y + 1, z: linvel.z }, true);
    body.setAngvel({ x: angvel.x, y: angvel.y + 1.5, z: angvel.z }, true);
  }, [swing]);

  // Releasing outside the canvas never reaches the card, so end drags here.
  useEffect(() => {
    if (!dragged) return;
    const release = () => drag(false);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    return () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    };
  }, [dragged]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
    return undefined;
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && card.current) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      // Keep the card inside the canvas so it is never cut off at the edges.
      const { width: viewW, height: viewH } = state.viewport;
      const maxX = Math.max(0, viewW / 2 - CARD_HALF.x);
      const maxY = Math.max(0, viewH / 2 - CARD_HALF.y);
      card.current.setNextKinematicTranslation({
        x: THREE.MathUtils.clamp(vec.x - dragged.x, -maxX, maxX),
        y: THREE.MathUtils.clamp(vec.y - dragged.y, -maxY, maxY),
        z: vec.z - dragged.z,
      });
    }

    if (
      !fixed.current ||
      !j1.current ||
      !j2.current ||
      !j3.current ||
      !card.current ||
      !band.current
    ) {
      return;
    }

    // Smooth the rope joints to remove jitter when over-pulling the card.
    for (const joint of [j1.current, j2.current]) {
      joint.lerped ??= new THREE.Vector3().copy(joint.translation());
      const clampedDistance = Math.max(
        0.1,
        Math.min(1, joint.lerped.distanceTo(joint.translation())),
      );
      // Cap at 1: after the canvas resumes from off-screen, delta is large and
      // an uncapped factor overshoots every frame until the band turns NaN.
      joint.lerped.lerp(
        joint.translation(),
        Math.min(
          1,
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)),
        ),
      );
    }

    points[0].copy(j3.current.translation());
    points[1].copy(j2.current.lerped!);
    points[2].copy(j1.current.lerped!);
    points[3].copy(fixed.current.translation());
    band.current.geometry.setPoints(curve.getPoints(32));

    // Tilt the card back towards the camera.
    ang.copy(card.current.angvel());
    rot.copy(card.current.rotation());
    card.current.setAngvel(
      { x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z },
      true,
    );
  });

  curve.curveType = 'chordal';

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    if (card.current) {
      drag(
        new THREE.Vector3()
          .copy(e.point)
          .sub(vec.copy(card.current.translation())),
      );
    }
  };

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    drag(false);
  };

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={onPointerUp}
            onPointerDown={onPointerDown}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={textures.card}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.3}
                metalness={0.5}
              />
            </mesh>
            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
            />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          args={bandMaterialArgs}
          color="white"
          depthTest={false}
          useMap={1}
          map={textures.band}
          repeat={new THREE.Vector2(-3, 1)}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}

useGLTF.preload(BADGE_MODEL);
