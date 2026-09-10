import * as THREE from "three";

import {
  OrbitControls,
} from "three/examples/jsm/controls/OrbitControls.js";

import {
  GLTFLoader,
} from "three/examples/jsm/loaders/GLTFLoader.js";


const CAMERA_VIEWS = {

  front: {
    angle: 0,
    distance: 4.2,
  },

  right: {
    angle: -Math.PI / 2,
    distance: 4.2,
  },

  back: {
    angle: Math.PI,
    distance: 4.2,
  },

  left: {
    angle: Math.PI / 2,
    distance: 4.2,
  },

};


export function createJersey3DViewer({
  canvas,
  modelUrl,
  onReady,
  onError,
}) {

  if (!canvas) {
    throw new Error(
      "A canvas element is required."
    );
  }


  const renderer =
    new THREE.WebGLRenderer({
      canvas,

      antialias: true,

      alpha: true,

      powerPreference:
        "high-performance",
    });


  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      2
    )
  );


  renderer.outputColorSpace =
    THREE.SRGBColorSpace;


  renderer.toneMapping =
    THREE.ACESFilmicToneMapping;


  renderer.toneMappingExposure =
    1.05;


  renderer.shadowMap.enabled =
    true;


  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;



  const scene =
    new THREE.Scene();



  const camera =
    new THREE.PerspectiveCamera(
      32,
      1,
      0.1,
      100
    );


  camera.position.set(
    0,
    0.15,
    4.2
  );



  const controls =
    new OrbitControls(
      camera,
      renderer.domElement
    );


  controls.enableDamping =
    true;


  controls.dampingFactor =
    0.075;


  controls.enablePan =
    false;


  controls.enableZoom =
    true;


  controls.minDistance =
    2.7;


  controls.maxDistance =
    6.4;


  controls.minPolarAngle =
    Math.PI * 0.30;


  controls.maxPolarAngle =
    Math.PI * 0.70;


  controls.target.set(
    0,
    0.05,
    0
  );



  const ambient =
    new THREE.HemisphereLight(
      0xe6e8ff,
      0x111018,
      2.1
    );


  scene.add(
    ambient
  );



  const key =
    new THREE.DirectionalLight(
      0xffffff,
      3.1
    );


  key.position.set(
    2.7,
    4.4,
    4.0
  );


  key.castShadow =
    true;


  scene.add(
    key
  );



  const purpleLight =
    new THREE.DirectionalLight(
      0x9c4dff,
      2.2
    );


  purpleLight.position.set(
    -3.5,
    1.5,
    1.2
  );


  scene.add(
    purpleLight
  );



  const greenLight =
    new THREE.DirectionalLight(
      0x61ff18,
      1.6
    );


  greenLight.position.set(
    3.6,
    0.6,
    -2.0
  );


  scene.add(
    greenLight
  );



  const frontLight =
    new THREE.PointLight(
      0xffffff,
      13,
      10,
      2
    );


  frontLight.position.set(
    0,
    1.6,
    3.6
  );


  scene.add(
    frontLight
  );



  const jerseyRoot =
    new THREE.Group();


  scene.add(
    jerseyRoot
  );



  let model = null;

  let disposed = false;

  let rafId = 0;

  let tween = null;



  function resize() {

    const parent =
      canvas.parentElement;


    if (!parent) {
      return;
    }


    const rect =
      parent.getBoundingClientRect();


    if (
      !rect.width ||
      !rect.height
    ) {
      return;
    }


    renderer.setSize(
      rect.width,
      rect.height,
      false
    );


    camera.aspect =
      rect.width / rect.height;


    camera.updateProjectionMatrix();

  }



  function prepareMaterials(
    object
  ) {

    object.traverse(
      (child) => {

        if (!child.isMesh) {
          return;
        }


        child.castShadow =
          true;


        child.receiveShadow =
          true;


        const materials =
          Array.isArray(
            child.material
          )
            ? child.material
            : [child.material];


        materials.forEach(
          (material) => {

            if (!material) {
              return;
            }


            if (
              material.map
            ) {

              material.map.colorSpace =
                THREE.SRGBColorSpace;


              material.map.anisotropy =
                renderer.capabilities
                  .getMaxAnisotropy();

            }


            if (
              "roughness" in material
            ) {

              material.roughness =
                Math.max(
                  material.roughness ?? 0.6,
                  0.58
                );

            }


            if (
              "metalness" in material
            ) {

              material.metalness =
                Math.min(
                  material.metalness ?? 0,
                  0.06
                );

            }


            material.needsUpdate =
              true;

          }
        );

      }
    );

  }



  function frameModel(
    object
  ) {

    const box =
      new THREE.Box3()
        .setFromObject(
          object
        );


    const size =
      box.getSize(
        new THREE.Vector3()
      );


    const center =
      box.getCenter(
        new THREE.Vector3()
      );


    object.position.sub(
      center
    );


    const longest =
      Math.max(
        size.x,
        size.y,
        size.z
      );


    const scale =
      longest > 0
        ? 2.65 / longest
        : 1;


    object.scale.setScalar(
      scale
    );


    const framedBox =
      new THREE.Box3()
        .setFromObject(
          object
        );


    const framedCenter =
      framedBox.getCenter(
        new THREE.Vector3()
      );


    object.position.sub(
      framedCenter
    );


    controls.target.set(
      0,
      0.03,
      0
    );


    controls.update();

  }



  function loadModel() {

    const loader =
      new GLTFLoader();


    loader.load(

      modelUrl,

      (gltf) => {

        if (disposed) {
          return;
        }


        model =
          gltf.scene;


        prepareMaterials(
          model
        );


        frameModel(
          model
        );


        jerseyRoot.add(
          model
        );


        onReady?.();

      },

      undefined,

      (error) => {

        console.error(
          "Failed to load jersey model:",
          error
        );


        onError?.(
          error
        );

      }

    );

  }



  function normaliseAngle(
    angle
  ) {

    return Math.atan2(
      Math.sin(angle),
      Math.cos(angle)
    );

  }



  function animateTo(
    viewName
  ) {

    const view =
      CAMERA_VIEWS[
        viewName
      ];


    if (!view) {
      return;
    }


    const currentDistance =
      camera.position
        .distanceTo(
          controls.target
        );


    const currentAngle =
      Math.atan2(

        camera.position.x -
        controls.target.x,

        camera.position.z -
        controls.target.z

      );


    const targetAngle =
      normaliseAngle(
        view.angle
      );


    const angleDifference =
      normaliseAngle(
        targetAngle -
        currentAngle
      );


    tween = {

      start:
        performance.now(),

      duration:
        520,

      startAngle:
        currentAngle,

      endAngle:
        currentAngle +
        angleDifference,

      startDistance:
        currentDistance,

      endDistance:
        view.distance,

      startY:
        camera.position.y,

      endY:
        0.15,

    };

  }



  function zoomBy(
    amount
  ) {

    const direction =
      new THREE.Vector3()
        .subVectors(
          camera.position,
          controls.target
        )
        .normalize();


    const nextDistance =
      THREE.MathUtils.clamp(

        camera.position
          .distanceTo(
            controls.target
          ) + amount,

        controls.minDistance,

        controls.maxDistance

      );


    camera.position
      .copy(
        controls.target
      )
      .add(
        direction.multiplyScalar(
          nextDistance
        )
      );


    controls.update();

  }



  function reset() {

    tween = null;


    camera.position.set(
      0,
      0.15,
      4.2
    );


    controls.target.set(
      0,
      0.03,
      0
    );


    controls.update();

  }



  function updateTween() {

    if (!tween) {
      return;
    }


    const elapsed =
      performance.now() -
      tween.start;


    const t =
      Math.min(
        elapsed /
        tween.duration,
        1
      );


    const eased =
      1 -
      Math.pow(
        1 - t,
        3
      );


    const angle =
      THREE.MathUtils.lerp(

        tween.startAngle,

        tween.endAngle,

        eased

      );


    const distance =
      THREE.MathUtils.lerp(

        tween.startDistance,

        tween.endDistance,

        eased

      );


    const y =
      THREE.MathUtils.lerp(

        tween.startY,

        tween.endY,

        eased

      );


    camera.position.set(

      controls.target.x +
      Math.sin(angle) *
      distance,

      y,

      controls.target.z +
      Math.cos(angle) *
      distance

    );


    controls.update();


    if (t >= 1) {
      tween = null;
    }

  }



  function render() {

    if (disposed) {
      return;
    }


    resize();


    updateTween();


    controls.update();


    renderer.render(
      scene,
      camera
    );


    rafId =
      requestAnimationFrame(
        render
      );

  }



  function disposeObject(
    object
  ) {

    object.traverse?.(
      (child) => {

        if (!child.isMesh) {
          return;
        }


        child.geometry
          ?.dispose?.();


        const materials =
          Array.isArray(
            child.material
          )
            ? child.material
            : [child.material];


        materials.forEach(
          (material) => {

            if (!material) {
              return;
            }


            Object.values(
              material
            ).forEach(
              (value) => {

                if (
                  value?.isTexture
                ) {
                  value.dispose();
                }

              }
            );


            material.dispose?.();

          }
        );

      }
    );

  }



  function destroy() {

    disposed =
      true;


    cancelAnimationFrame(
      rafId
    );


    controls.dispose();


    if (model) {
      disposeObject(
        model
      );
    }


    renderer.dispose();

  }



  loadModel();

  render();



  return {

    front:
      () =>
        animateTo("front"),

    back:
      () =>
        animateTo("back"),

    left:
      () =>
        animateTo("left"),

    right:
      () =>
        animateTo("right"),

    zoomIn:
      () =>
        zoomBy(-0.35),

    zoomOut:
      () =>
        zoomBy(0.35),

    reset,

    destroy,

  };

}