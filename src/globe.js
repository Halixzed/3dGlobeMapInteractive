let scene, camera, renderer, globe, controls;

function addLongitudeLines(radius, segments, color) {
    const group = new THREE.Group();
    for (let i = 0; i < segments; i++) {
        const longitude = (i / segments) * Math.PI * 2;
        const curve = new THREE.EllipseCurve(
            0, 0, radius, radius, 0, Math.PI * 2, false, 0
        );
        const points = curve.getPoints(128);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: color });
        const line = new THREE.Line(geometry, material);
        line.rotation.y = longitude;
        group.add(line);
    }
    globe.add(group);
}

function init() {
    // Create the scene
    scene = new THREE.Scene();
    // Set scene background to offwhite
    scene.background = new THREE.Color(0xf8f8f8);

    // Set up the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 0.3; // Zoomed in (closer to globe)
    camera.position.y = 0.3; // Elevated angle
    camera.lookAt(0, 0, 0);

    // Create the renderer
    const container = document.getElementById('globe-container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Remove ambient and directional lights

    // Create the globe
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);

    // Use MeshBasicMaterial for flat, unlit appearance with slight transparency
    let material = new THREE.MeshBasicMaterial({ 
        color: 0x2194ce,
        transparent: true,
        opacity: 1.0,
        side: THREE.FrontSide // Ensure correct side is rendered
    });

    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Load texture and apply when ready
    new THREE.TextureLoader().load(
        'globe_map.jpg',
        function(texture) {
            console.log('Texture loaded successfully');
            globe.material.map = texture;
            globe.material.transparent = true;
            globe.material.opacity = 1.0;
            globe.material.needsUpdate = true;
            // Add longitude lines after texture is loaded
            addLongitudeLines(0.5, 24, 0xffffff);
        },
        undefined,
        function(err) {
            console.error('Texture failed to load:', err);
            // Add longitude lines even if texture fails
            addLongitudeLines(0.5, 24, 0xffffff);
        }
    );

    // Add OrbitControls for zoom only (pan locked)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false; // Pan locked
    controls.enableZoom = true;
    controls.minDistance = 1.2; // Prevent zooming too close
    controls.maxDistance = 3;   // Prevent zooming too far
    controls.enableDamping = true;
    controls.dampingFactor = 0.15; // Increased for smoother transitions
    controls.zoomSpeed = 0.5;      // Lower for smoother zoom

    // Add event listener for window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start the animation loop
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    globe.rotation.y += 0.001; // Rotate the globe
    controls.update(); // Update controls
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();