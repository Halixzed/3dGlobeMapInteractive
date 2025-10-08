let scene, camera, renderer, globe, controls;

function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

function addGeoJsonRegions(geojson, radius = 0.5, color = 0xd94d14) {

    geojson.features.forEach(feature => {
        if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
            // Get all polygons
            const polygons = feature.geometry.type === "Polygon"
                ? [feature.geometry.coordinates]
                : feature.geometry.coordinates;

            polygons.forEach(polygon => {
                polygon.forEach(ring => {
                    // Removed: if (ring.length < MIN_RING_POINTS) return;
                    const points = ring.map(([lon, lat]) => {
                        let v = latLonToVector3(lat, lon, 1); // unit vector
                        v.setLength(radius); // set to globe radius (0.5)
                        return v;
                    });
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const material = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.7, linewidth: 0.5 });
                    const line = new THREE.Line(geometry, material);
                    globe.add(line);
                });
            });
        }
    });
}

function loadGeoJsonAndAddRegions(url) {
    fetch(url)
        .then(res => res.json())
        .then(data => {
            addGeoJsonRegions(data, 0.5); // pass globe radius
        })
        .catch(err => console.error('Failed to load GeoJSON:', err));
}

function init() {
    // Create the scene
    scene = new THREE.Scene();
    // Set scene background to rgb(51,51,51)
    scene.background = new THREE.Color(51 / 255, 51 / 255, 51 / 255);

    // Set up the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 0.18; // Zoomed in more
    camera.position.y = 0.3; // Elevated angle
    camera.lookAt(0, 0, 0);

    // Create the renderer
    const container = document.getElementById('globe-container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Create the globe
    // Increase widthSegments and heightSegments for smoother sphere
    const geometry = new THREE.SphereGeometry(0.5, 48, 48);

    // Use MeshBasicMaterial for flat, unlit appearance, RGB(91, 103, 113) with transparency
    let material = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color(91 / 255, 103 / 255, 113 / 255),
        transparent: true,
        opacity: 0.3
    });

    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Show country/region borders using geo data
    loadGeoJsonAndAddRegions('countries.geojson'); // Place countries.geojson in your src folder

    // Add OrbitControls for zoom only (pan locked)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false; // Pan locked
    controls.enableZoom = true;
    controls.minDistance = 0.9; // Prevent zooming too close
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