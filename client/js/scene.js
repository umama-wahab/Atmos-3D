/**
 * scene.js – Atmos 3D
 * You are INSIDE the weather environment.
 * No planet from space — you're standing in it.
 */

const AtmosScene = (() => {

  /* ─── core ─────────────────────────────────── */
  let renderer, scene, camera, clock;
  let animId;

  /* ─── environment meshes ────────────────────── */
  let skyDome, groundPlane, cityGroup;
  let cloudLayer1, cloudLayer2;

  /* ─── lights ────────────────────────────────── */
  let sunLight, ambLight, fillLight, rimLight;

  /* ─── particles ─────────────────────────────── */
  let rainSystem, snowSystem, dustSystem;

  /* ─── state ─────────────────────────────────── */
  let currentTheme = null;
  let targetTheme  = null;
  let lerpAlpha    = 1.0;          // 0→1 transition progress

  /* ─── mouse parallax ────────────────────────── */
  let mouseX = 0, mouseY = 0;
  let camOffX = 0, camOffY = 0;

  /* ─── lightning ─────────────────────────────── */
  let lightningTimer = 0;
  let lightningLight;

  /* ─── fog volume ────────────────────────────── */
  let fogMeshes = [];

  /* ══════════════════════════════════════════════
     THEME DEFINITIONS
     Every number that changes the scene is here.
  ══════════════════════════════════════════════ */
  const THEMES = {

    sunny: {
      skyTop:      new THREE.Color('#0a2a6e'),
      skyMid:      new THREE.Color('#1a6fc4'),
      skyBot:      new THREE.Color('#f9c86a'),
      fogColor:    new THREE.Color('#c8dff7'),
      fogDensity:  0.006,
      sunColor:    0xfff4d0,
      sunIntensity:2.8,
      sunPos:      new THREE.Vector3(8, 10, -6),
      ambColor:    0x5588cc,
      ambIntensity:0.55,
      fillColor:   0xffd97a,
      fillIntensity:0.4,
      rimColor:    0x99ccff,
      rimIntensity:0.3,
      groundColor: new THREE.Color('#1c3a5e'),
      cloudOpacity:0.35,
      cloudSpeed:  0.0006,
      rain: false, snow: false, dust: false, lightning: false,
      bodyClass:   'wx-sunny',
    },

    cloudy: {
      skyTop:      new THREE.Color('#1a1e28'),
      skyMid:      new THREE.Color('#2e3848'),
      skyBot:      new THREE.Color('#505a6a'),
      fogColor:    new THREE.Color('#4a5060'),
      fogDensity:  0.018,
      sunColor:    0xaabbcc,
      sunIntensity:0.7,
      sunPos:      new THREE.Vector3(4, 8, -5),
      ambColor:    0x445566,
      ambIntensity:0.6,
      fillColor:   0x334455,
      fillIntensity:0.3,
      rimColor:    0x667788,
      rimIntensity:0.2,
      groundColor: new THREE.Color('#1a1e28'),
      cloudOpacity:0.92,
      cloudSpeed:  0.0009,
      rain: false, snow: false, dust: false, lightning: false,
      bodyClass:   'wx-cloudy',
    },

    rain: {
      skyTop:      new THREE.Color('#080c14'),
      skyMid:      new THREE.Color('#0e1520'),
      skyBot:      new THREE.Color('#1a2535'),
      fogColor:    new THREE.Color('#0a1020'),
      fogDensity:  0.03,
      sunColor:    0x4466aa,
      sunIntensity:0.4,
      sunPos:      new THREE.Vector3(2, 6, -4),
      ambColor:    0x112233,
      ambIntensity:0.5,
      fillColor:   0x1a3355,
      fillIntensity:0.25,
      rimColor:    0x2255aa,
      rimIntensity:0.35,
      groundColor: new THREE.Color('#060a12'),
      cloudOpacity:0.98,
      cloudSpeed:  0.0014,
      rain: true, snow: false, dust: false, lightning: false,
      bodyClass:   'wx-rainy',
    },

    storm: {
      skyTop:      new THREE.Color('#04060a'),
      skyMid:      new THREE.Color('#08090e'),
      skyBot:      new THREE.Color('#0e1018'),
      fogColor:    new THREE.Color('#060810'),
      fogDensity:  0.04,
      sunColor:    0x223344,
      sunIntensity:0.2,
      sunPos:      new THREE.Vector3(1, 5, -3),
      ambColor:    0x0a0e18,
      ambIntensity:0.4,
      fillColor:   0x112244,
      fillIntensity:0.2,
      rimColor:    0x3355bb,
      rimIntensity:0.5,
      groundColor: new THREE.Color('#040608'),
      cloudOpacity:1.0,
      cloudSpeed:  0.002,
      rain: true, snow: false, dust: false, lightning: true,
      bodyClass:   'wx-rainy',
    },

    snow: {
      skyTop:      new THREE.Color('#0e1828'),
      skyMid:      new THREE.Color('#1e2e44'),
      skyBot:      new THREE.Color('#3a4e64'),
      fogColor:    new THREE.Color('#c8d8e8'),
      fogDensity:  0.022,
      sunColor:    0xddeeff,
      sunIntensity:1.1,
      sunPos:      new THREE.Vector3(5, 9, -5),
      ambColor:    0x6688aa,
      ambIntensity:0.65,
      fillColor:   0x88aabb,
      fillIntensity:0.35,
      rimColor:    0xaaccee,
      rimIntensity:0.4,
      groundColor: new THREE.Color('#d8e8f0'),
      cloudOpacity:0.7,
      cloudSpeed:  0.0004,
      rain: false, snow: true, dust: false, lightning: false,
      bodyClass:   'wx-snowy',
    },

    mist: {
      skyTop:      new THREE.Color('#1a2030'),
      skyMid:      new THREE.Color('#2a3040'),
      skyBot:      new THREE.Color('#606878'),
      fogColor:    new THREE.Color('#8898a8'),
      fogDensity:  0.05,
      sunColor:    0x99aabb,
      sunIntensity:0.6,
      sunPos:      new THREE.Vector3(3, 7, -4),
      ambColor:    0x445566,
      ambIntensity:0.7,
      fillColor:   0x667788,
      fillIntensity:0.3,
      rimColor:    0x889aaa,
      rimIntensity:0.2,
      groundColor: new THREE.Color('#3a4050'),
      cloudOpacity:0.85,
      cloudSpeed:  0.0003,
      rain: false, snow: false, dust: true, lightning: false,
      bodyClass:   'wx-cloudy',
    },

    night: {
      skyTop:      new THREE.Color('#00020a'),
      skyMid:      new THREE.Color('#010510'),
      skyBot:      new THREE.Color('#080c20'),
      fogColor:    new THREE.Color('#010408'),
      fogDensity:  0.012,
      sunColor:    0x1122aa,
      sunIntensity:0.15,
      sunPos:      new THREE.Vector3(-6, 4, -8),
      ambColor:    0x050818,
      ambIntensity:0.3,
      fillColor:   0x0a1040,
      fillIntensity:0.2,
      rimColor:    0x4433aa,
      rimIntensity:0.55,
      groundColor: new THREE.Color('#010308'),
      cloudOpacity:0.4,
      cloudSpeed:  0.0004,
      rain: false, snow: false, dust: false, lightning: false,
      bodyClass:   'wx-night',
    },
  };

  /* ══════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════ */
  function init() {
    clock = new THREE.Clock();
    const canvas = document.getElementById('atmos-canvas');

    /* renderer */
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    /* scene + camera */
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1020, 0.018);

    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 400);
    camera.position.set(0, 3.5, 0);          // eye height above ground
    camera.rotation.order = 'YXZ';

    /* build world */
    _buildLights();
    _buildSkyDome();
    _buildGround();
    _buildCity();
    _buildClouds();
    _buildRain();
    _buildSnow();
    _buildDust();
    _buildLightningLight();
    _buildStars();

    /* events */
    window.addEventListener('resize', _onResize);
    window.addEventListener('mousemove', _onMouse);

    /* start with sunny default */
    _applyThemeInstant(THEMES.sunny);

    _animate();
  }

  /* ─── Lights ──────────────────────────────── */
  function _buildLights() {
    sunLight = new THREE.DirectionalLight(0xfff4d0, 2.8);
    sunLight.position.set(8, 10, -6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far  = 80;
    sunLight.shadow.camera.left = sunLight.shadow.camera.bottom = -40;
    sunLight.shadow.camera.right= sunLight.shadow.camera.top   =  40;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    ambLight  = new THREE.AmbientLight(0x5588cc, 0.55);
    scene.add(ambLight);

    fillLight = new THREE.DirectionalLight(0xffd97a, 0.4);
    fillLight.position.set(-5, 3, 5);
    scene.add(fillLight);

    rimLight  = new THREE.DirectionalLight(0x99ccff, 0.3);
    rimLight.position.set(0, -2, 6);
    scene.add(rimLight);
  }

  /* ─── Sky Dome ────────────────────────────── */
  function _buildSkyDome() {
    // Large sphere — we're inside it, flip normals
    const geo = new THREE.SphereGeometry(200, 32, 16);
    geo.scale(-1, 1, 1);                    // invert so we see inside

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTop: { value: new THREE.Color('#0a2a6e') },
        uMid: { value: new THREE.Color('#1a6fc4') },
        uBot: { value: new THREE.Color('#f9c86a') },
        uHorizon: { value: 0.38 },
      },
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uTop, uMid, uBot;
        uniform float uHorizon;
        varying vec3 vPos;
        void main() {
          float t = normalize(vPos).y * .5 + .5;     // 0=bottom 1=top
          vec3 col;
          if(t > uHorizon) {
            float f = (t - uHorizon) / (1.0 - uHorizon);
            col = mix(uMid, uTop, f);
          } else {
            float f = t / uHorizon;
            col = mix(uBot, uMid, f);
          }
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });

    skyDome = new THREE.Mesh(geo, mat);
    skyDome.renderOrder = -1;
    scene.add(skyDome);
  }

  /* ─── Ground ──────────────────────────────── */
  function _buildGround() {
    const geo = new THREE.PlaneGeometry(300, 300, 1, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1c3a5e'),
      roughness: 0.95,
      metalness: 0.05,
    });
    groundPlane = new THREE.Mesh(geo, mat);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -2;
    groundPlane.receiveShadow = true;
    scene.add(groundPlane);

    /* wet/reflective puddle overlay for rain */
    const pudGeo = new THREE.PlaneGeometry(300, 300);
    const pudMat = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.0,
    });
    const puddle = new THREE.Mesh(pudGeo, pudMat);
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.y = -1.99;
    puddle.name = 'puddle';
    scene.add(puddle);
  }

  /* ─── City Silhouette ─────────────────────── */
  function _buildCity() {
    cityGroup = new THREE.Group();
    cityGroup.position.y = -2;

    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x0a1020,
      roughness: 0.9,
      metalness: 0.1,
    });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xffeeaa });

    const BUILDINGS = [
      // [x, z, w, d, h]
      [-60,-80, 9,9,28], [-44,-85, 7,7,22], [-30,-78, 11,11,35],
      [-14,-82, 8,8,18], [ 0, -80,10,10,42], [14,-83, 8,8,25],
      [ 30,-78,12,12,38], [44,-85, 7,7,20], [60,-80, 9,9,30],
      [-70,-90, 6,6,15], [-55,-92, 5,5,12], [55,-92, 5,5,14],
      [70,-90, 6,6,18],
      // closer layer
      [-50,-60, 8,8,20], [-35,-58,10,10,30], [-18,-62, 7,7,16],
      [  0,-60,12,12,45], [18,-62, 7,7,17], [35,-58,10,10,32],
      [50,-60, 8,8,22],
    ];

    BUILDINGS.forEach(([x, z, w, d, h]) => {
      // main box
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, buildingMat);
      mesh.position.set(x, h / 2, z);
      mesh.castShadow = true;
      cityGroup.add(mesh);

      // tiny window dots
      const rows = Math.floor(h / 4);
      const cols = Math.floor(w / 3);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.45) {
            const wGeo = new THREE.PlaneGeometry(0.6, 0.6);
            const wMesh = new THREE.Mesh(wGeo, windowMat);
            wMesh.position.set(
              x - w / 2 + 1.5 + c * 3 + Math.random(),
              r * 4 + 2,
              z + d / 2 + 0.05
            );
            cityGroup.add(wMesh);
          }
        }
      }
    });

    scene.add(cityGroup);
  }

  /* ─── Clouds ──────────────────────────────── */
  function _buildClouds() {
    cloudLayer1 = _makeCloudLayer(40, 18, 0.5);
    cloudLayer2 = _makeCloudLayer(30, 25, 0.35);
    scene.add(cloudLayer1, cloudLayer2);
  }

  function _makeCloudLayer(count, height, opacity) {
    const group = new THREE.Group();
    group.position.y = height;

    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: opacity,
      depthWrite: false,
      roughness: 1,
      metalness: 0,
    });

    for (let i = 0; i < count; i++) {
      const puffs = Math.floor(Math.random() * 4) + 3;
      const cloud = new THREE.Group();
      cloud.position.set(
        (Math.random() - .5) * 200,
        (Math.random() - .5) * 6,
        (Math.random() - .5) * 200
      );

      for (let p = 0; p < puffs; p++) {
        const r = Math.random() * 5 + 3;
        const geo = new THREE.SphereGeometry(r, 7, 5);
        const mesh = new THREE.Mesh(geo, mat.clone());
        mesh.position.set(
          (Math.random() - .5) * 12,
          (Math.random() - .5) * 2,
          (Math.random() - .5) * 8
        );
        mesh.scale.y = 0.45 + Math.random() * 0.2;
        cloud.add(mesh);
      }
      group.add(cloud);
    }
    return group;
  }

  /* ─── Rain ────────────────────────────────── */
  function _buildRain() {
    const isMobile = window.innerWidth < 768;
    const COUNT = isMobile ? 6000 : 15000;

    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT);        // fall speed per drop

    for (let i = 0; i < COUNT; i++) {
      pos[i*3]   = (Math.random() - .5) * 80;  // x spread
      pos[i*3+1] = Math.random() * 50;          // y start (above camera)
      pos[i*3+2] = (Math.random() - .5) * 80;  // z spread
      vel[i]     = 0.3 + Math.random() * 0.4;  // fall speed
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    /* custom shader: elongated streaks */
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uColor:   { value: new THREE.Color(0x88b8e8) },
        uOpacity: { value: 0.55 },
        uStreak:  { value: 0.18 },           // streak length in UV
      },
      vertexShader: `
        void main() {
          gl_Position  = projectionMatrix * modelViewMatrix * vec4(position,1.0);
          gl_PointSize = 2.0;
        }
      `,
      fragmentShader: `
        uniform vec3  uColor;
        uniform float uOpacity;
        void main() {
          float d = distance(gl_PointCoord, vec2(.5,.5));
          if(d > .5) discard;
          gl_FragColor = vec4(uColor, uOpacity * (1.0 - d * 1.8));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    rainSystem = new THREE.Points(geo, mat);
    rainSystem._vel = vel;
    rainSystem._count = COUNT;
    rainSystem.visible = false;
    scene.add(rainSystem);
  }

  /* ─── Snow ────────────────────────────────── */
  function _buildSnow() {
    const isMobile = window.innerWidth < 768;
    const COUNT = isMobile ? 2000 : 5000;

    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    const phase = new Float32Array(COUNT);     // drift phase offset

    for (let i = 0; i < COUNT; i++) {
      pos[i*3]   = (Math.random() - .5) * 80;
      pos[i*3+1] = Math.random() * 50;
      pos[i*3+2] = (Math.random() - .5) * 80;
      phase[i]   = Math.random() * Math.PI * 2;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xddeeff,
      size: 0.18,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
      depthWrite: false,
    });

    snowSystem = new THREE.Points(geo, mat);
    snowSystem._phase = phase;
    snowSystem._count = COUNT;
    snowSystem.visible = false;
    scene.add(snowSystem);
  }

  /* ─── Dust / Mist particles ──────────────── */
  function _buildDust() {
    const COUNT = 800;
    const geo   = new THREE.BufferGeometry();
    const pos   = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      pos[i*3]   = (Math.random() - .5) * 100;
      pos[i*3+1] = Math.random() * 15;
      pos[i*3+2] = (Math.random() - .5) * 100;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xaabbcc,
      size: 0.6,
      transparent: true,
      opacity: 0.18,
      sizeAttenuation: true,
      depthWrite: false,
    });

    dustSystem = new THREE.Points(geo, mat);
    dustSystem.visible = false;
    scene.add(dustSystem);
  }

  /* ─── Lightning flash light ───────────────── */
  function _buildLightningLight() {
    lightningLight = new THREE.PointLight(0x8899ff, 0, 200);
    lightningLight.position.set(0, 30, -20);
    scene.add(lightningLight);
  }

  /* ─── Stars (for night / clear) ───────────── */
  function _buildStars() {
    const COUNT = 2000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(Math.random());           // upper hemisphere only
      const r     = 180 + Math.random() * 15;
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = Math.abs(r * Math.cos(phi)) + 5;    // keep above horizon
      pos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffffff, size: 0.4,
      transparent: true, opacity: 0.0,
      sizeAttenuation: true, depthWrite: false,
    });

    const stars = new THREE.Points(geo, mat);
    stars.name = 'stars';
    scene.add(stars);
  }

  /* ══════════════════════════════════════════════
     ANIMATION LOOP
  ══════════════════════════════════════════════ */
  function _animate() {
    animId = requestAnimationFrame(_animate);
    const dt = clock.getDelta();
    const t  = clock.getElapsedTime();

    /* camera micro-parallax from mouse */
    camOffX += (mouseX * 1.2 - camOffX) * 0.04;
    camOffY += (mouseY * 0.6 - camOffY) * 0.04;
    camera.rotation.y = -camOffX * 0.012;
    camera.rotation.x = -camOffY * 0.008;

    /* slow cloud drift */
    if (cloudLayer1) cloudLayer1.rotation.y += 0.0005;
    if (cloudLayer2) cloudLayer2.rotation.y -= 0.0003;

    /* rain fall */
    if (rainSystem?.visible) _animateRain(dt);

    /* snow drift */
    if (snowSystem?.visible) _animateSnow(dt, t);

    /* dust drift */
    if (dustSystem?.visible) {
      dustSystem.rotation.y += 0.00008;
    }

    /* lightning */
    if (currentTheme?.lightning) _animateLightning(dt, t);

    /* lerp theme if transitioning */
    if (lerpAlpha < 1.0 && targetTheme) {
      lerpAlpha = Math.min(lerpAlpha + dt * 0.4, 1.0);
      _lerpTheme(currentTheme, targetTheme, lerpAlpha);
    }

    renderer.render(scene, camera);
  }

  function _animateRain(dt) {
    const pos = rainSystem.geometry.attributes.position.array;
    const vel = rainSystem._vel;
    const N   = rainSystem._count;

    for (let i = 0; i < N; i++) {
      pos[i*3+1] -= vel[i];               // fall downward

      if (pos[i*3+1] < -2) {              // reset to top
        pos[i*3]   = (Math.random() - .5) * 80;
        pos[i*3+1] = 45 + Math.random() * 5;
        pos[i*3+2] = (Math.random() - .5) * 80;
      }
    }
    rainSystem.geometry.attributes.position.needsUpdate = true;
  }

  function _animateSnow(dt, t) {
    const pos   = snowSystem.geometry.attributes.position.array;
    const phase = snowSystem._phase;
    const N     = snowSystem._count;

    for (let i = 0; i < N; i++) {
      pos[i*3+1] -= 0.04;                            // slow fall
      pos[i*3]   += Math.sin(t * 0.3 + phase[i]) * 0.012;  // horizontal sway

      if (pos[i*3+1] < -2) {
        pos[i*3]   = (Math.random() - .5) * 80;
        pos[i*3+1] = 45;
        pos[i*3+2] = (Math.random() - .5) * 80;
      }
    }
    snowSystem.geometry.attributes.position.needsUpdate = true;
  }

  function _animateLightning(dt, t) {
    lightningTimer -= dt;
    if (lightningTimer <= 0) {
      /* flash! */
      lightningLight.intensity = 8 + Math.random() * 12;
      lightningLight.position.set(
        (Math.random() - .5) * 60, 25 + Math.random() * 20,
        -20 + (Math.random() - .5) * 40
      );
      /* schedule next flash */
      lightningTimer = 2.5 + Math.random() * 6;

      /* quick fade out */
      setTimeout(() => {
        lightningLight.intensity *= 0.6;
        setTimeout(() => { lightningLight.intensity = 0; }, 80);
      }, 60);
    }
  }

  /* ══════════════════════════════════════════════
     THEME MANAGEMENT
  ══════════════════════════════════════════════ */
  function _applyThemeInstant(theme) {
    currentTheme = { ...theme };
    targetTheme  = null;
    lerpAlpha    = 1.0;
    _applyTheme(theme);
  }

  function _applyTheme(theme) {
    /* sky */
    if (skyDome) {
      skyDome.material.uniforms.uTop.value.copy(theme.skyTop);
      skyDome.material.uniforms.uMid.value.copy(theme.skyMid);
      skyDome.material.uniforms.uBot.value.copy(theme.skyBot);
    }

    /* fog */
    if (scene.fog) {
      scene.fog.color.copy(theme.fogColor);
      scene.fog.density = theme.fogDensity;
    }

    /* lights */
    if (sunLight) {
      sunLight.color.setHex(theme.sunColor);
      sunLight.intensity = theme.sunIntensity;
      sunLight.position.copy(theme.sunPos);
    }
    if (ambLight) {
      ambLight.color.setHex(theme.ambColor);
      ambLight.intensity = theme.ambIntensity;
    }
    if (fillLight) {
      fillLight.color.setHex(theme.fillColor);
      fillLight.intensity = theme.fillIntensity;
    }
    if (rimLight) {
      rimLight.color.setHex(theme.rimColor);
      rimLight.intensity = theme.rimIntensity;
    }

    /* ground */
    if (groundPlane) groundPlane.material.color.copy(theme.groundColor);

    /* clouds */
    [cloudLayer1, cloudLayer2].forEach((cl, idx) => {
      if (!cl) return;
      cl.children.forEach(cloud => {
        cloud.children.forEach(mesh => {
          mesh.material.opacity = theme.cloudOpacity * (idx === 0 ? 1 : 0.7);
        });
      });
    });

    /* particles */
    if (rainSystem)  rainSystem.visible  = theme.rain;
    if (snowSystem)  snowSystem.visible  = theme.snow;
    if (dustSystem)  dustSystem.visible  = theme.dust;
    if (!theme.lightning && lightningLight) lightningLight.intensity = 0;

    /* wet ground */
    const puddle = scene.getObjectByName('puddle');
    if (puddle) puddle.material.opacity = theme.rain ? 0.45 : 0.0;

    /* stars */
    const stars = scene.getObjectByName('stars');
    if (stars) {
      stars.material.opacity = (theme === THEMES.night || theme.bodyClass === 'wx-night') ? 0.9 : 0.0;
    }

    /* body class */
    const wxClasses = ['wx-sunny','wx-cloudy','wx-rainy','wx-snowy','wx-night'];
    document.body.classList.remove(...wxClasses);
    if (theme.bodyClass) document.body.classList.add(theme.bodyClass);
  }

  /* smooth lerp between two themes */
  function _lerpTheme(from, to, a) {
    /* sky uniforms */
    if (skyDome) {
      skyDome.material.uniforms.uTop.value.lerpColors(from.skyTop, to.skyTop, a);
      skyDome.material.uniforms.uMid.value.lerpColors(from.skyMid, to.skyMid, a);
      skyDome.material.uniforms.uBot.value.lerpColors(from.skyBot, to.skyBot, a);
    }

    /* fog */
    if (scene.fog) {
      scene.fog.color.lerpColors(from.fogColor, to.fogColor, a);
      scene.fog.density = from.fogDensity + (to.fogDensity - from.fogDensity) * a;
    }

    /* sun light */
    const sunA = new THREE.Color(from.sunColor), sunB = new THREE.Color(to.sunColor);
    sunLight.color.lerpColors(sunA, sunB, a);
    sunLight.intensity = from.sunIntensity + (to.sunIntensity - from.sunIntensity) * a;
    sunLight.position.lerpVectors(from.sunPos, to.sunPos, a);

    const ambA = new THREE.Color(from.ambColor), ambB = new THREE.Color(to.ambColor);
    ambLight.color.lerpColors(ambA, ambB, a);
    ambLight.intensity = from.ambIntensity + (to.ambIntensity - from.ambIntensity) * a;

    const filA = new THREE.Color(from.fillColor), filB = new THREE.Color(to.fillColor);
    fillLight.color.lerpColors(filA, filB, a);
    fillLight.intensity = from.fillIntensity + (to.fillIntensity - from.fillIntensity) * a;

    const rimA = new THREE.Color(from.rimColor), rimB = new THREE.Color(to.rimColor);
    rimLight.color.lerpColors(rimA, rimB, a);
    rimLight.intensity = from.rimIntensity + (to.rimIntensity - from.rimIntensity) * a;

    /* ground */
    if (groundPlane) groundPlane.material.color.lerpColors(from.groundColor, to.groundColor, a);

    /* particles – switch at midpoint */
    if (a > 0.5) {
      if (rainSystem) rainSystem.visible = to.rain;
      if (snowSystem) snowSystem.visible = to.snow;
      if (dustSystem) dustSystem.visible = to.dust;

      const puddle = scene.getObjectByName('puddle');
      if (puddle) puddle.material.opacity = to.rain ? 0.45 : 0.0;

      const stars = scene.getObjectByName('stars');
      if (stars) stars.material.opacity = (to.bodyClass === 'wx-night') ? 0.9 : 0.0;

      const wxClasses = ['wx-sunny','wx-cloudy','wx-rainy','wx-snowy','wx-night'];
      document.body.classList.remove(...wxClasses);
      if (to.bodyClass) document.body.classList.add(to.bodyClass);
    }

    /* on completion, store current */
    if (a >= 1.0) {
      currentTheme = { ...to };
      targetTheme  = null;
    }
  }

  /* ══════════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════════ */

  /**
   * setWeather(conditionMain, conditionDesc, isNight)
   * conditionMain: 'Clear','Clouds','Rain','Drizzle','Thunderstorm','Snow','Mist','Fog','Haze' …
   */
  function setWeather(conditionMain, conditionDesc, isNight) {
    let key = 'sunny';

    if (isNight) {
      key = 'night';
    } else {
      const m = (conditionMain || '').toLowerCase();
      const d = (conditionDesc  || '').toLowerCase();

      if (m === 'thunderstorm')       key = 'storm';
      else if (m === 'rain' || m === 'drizzle' || m === 'squall') key = 'rain';
      else if (m === 'snow' || d.includes('sleet')) key = 'snow';
      else if (m === 'mist' || m === 'fog' || m === 'haze' || m === 'smoke' || m === 'dust' || m === 'ash') key = 'mist';
      else if (m === 'clouds')        key = 'cloudy';
      else                            key = 'sunny';
    }

    const to = THEMES[key];
    if (!to) return;

    /* kick off smooth transition */
    targetTheme = to;
    /* capture current state as 'from' snapshot */
    currentTheme = _snapshotCurrentTheme();
    lerpAlpha = 0.0;
  }

  /* snapshot live values so lerp starts from actual current */
  function _snapshotCurrentTheme() {
    return {
      skyTop:       skyDome.material.uniforms.uTop.value.clone(),
      skyMid:       skyDome.material.uniforms.uMid.value.clone(),
      skyBot:       skyDome.material.uniforms.uBot.value.clone(),
      fogColor:     scene.fog.color.clone(),
      fogDensity:   scene.fog.density,
      sunColor:     sunLight.color.getHex(),
      sunIntensity: sunLight.intensity,
      sunPos:       sunLight.position.clone(),
      ambColor:     ambLight.color.getHex(),
      ambIntensity: ambLight.intensity,
      fillColor:    fillLight.color.getHex(),
      fillIntensity:fillLight.intensity,
      rimColor:     rimLight.color.getHex(),
      rimIntensity: rimLight.intensity,
      groundColor:  groundPlane.material.color.clone(),
      rain: rainSystem?.visible ?? false,
      snow: snowSystem?.visible ?? false,
      dust: dustSystem?.visible ?? false,
      lightning: lightningLight?.intensity > 0,
      bodyClass: '',
    };
  }

  function captureScreenshot() {
    renderer.render(scene, camera);
    const a = document.createElement('a');
    a.download = `atmos3d-${Date.now()}.png`;
    a.href = renderer.domElement.toDataURL('image/png');
    a.click();
  }

  /* ─── Events ──────────────────────────────── */
  function _onMouse(e) {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  function _onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  return { init, setWeather, captureScreenshot };

})();
