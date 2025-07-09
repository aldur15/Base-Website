import * as THREE from 'three';
        import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        class OptimizedViewer {
            constructor() {
                this.scene = null;
                this.camera = null;
                this.renderer = null;
                this.controls = null;
                this.model = null;
                this.raycaster = new THREE.Raycaster();
                this.mouse = new THREE.Vector2();
                
                // Performance tracking
                this.performance = {
                    frameCount: 0,
                    lastFpsTime: 0,
                    fps: 0,
                    triangles: 0,
                    renderCalls: 0
                };
                
                // Render optimization
                this.needsRender = true;
                this.isLoading = false;
                this.animationId = null;
                this.lastInteraction = Date.now();
                
                // Configuration - more balanced settings
                this.config = {
                    maxPixelRatio: Math.min(window.devicePixelRatio, 2),
                    shadowMapSize: 2048,
                    enablePerformanceMonitoring: false,
                    interactionTimeout: 10000 // 10 seconds
                };

                this.cameraTargets = {
    'nav-about': {
        position: new THREE.Vector3(5, 3, 10),
        lookAt: new THREE.Vector3(0, 1.5, 0) // Center of model
    },
    'nav-projects': {
        position: new THREE.Vector3(12, 16, 15), //position: new THREE.Vector3(12, 12, 15),
        lookAt: new THREE.Vector3(0, 1.5, 0) // Center of model
    },
    'nav-research': {
        position: new THREE.Vector3(20, -2, -19.01),
        lookAt: new THREE.Vector3(0, 1.5, 0) // Center of model - NOT the target position
    },
    'nav-contact': {
        position: new THREE.Vector3(-16.5, 0.18, 9.01),
        lookAt: new THREE.Vector3(0, 1.5, 0) // Center of model
    },
    blackboard: {
        position: new THREE.Vector3(14.85, -1.14, 6.68),
        lookAt: new THREE.Vector3(0, 1.5, 0) // Center of model
    }
};

this.paperData = {
    'paper_1': {
        title: 'Research Paper 1',
        content: `
            <h2>Abstract</h2>
            <p>This is the abstract of the first research paper...</p>
            <h2>Introduction</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
            <h2>Methodology</h2>
            <p>Our research methodology involved...</p>
        `
    },
    'paper_2': {
        title: 'Research Paper 2',
        content: `
            <h2>Abstract</h2>
            <p>This is the abstract of the second research paper...</p>
            <h2>Introduction</h2>
            <p>Different research topic with various findings...</p>
        `
    }
    // Add more papers as needed
};
                
                this.init();
            }

            init() {
                const container = document.getElementById('threejs-container');
                if (!container) {
                    console.error('Three.js container not found');
                    return;
                }

                try {
                    this.setupScene();
                    this.setupCamera(container);
                    this.setupRenderer(container);
                    this.setupControls();
                    this.setupLighting();
                    this.setupEventListeners();
                    this.hideControlsInfo();
                    
                    // Start render loop and load model
                    this.animate();
                    this.loadModel();
                    
                    
                } catch (error) {
                    console.error('Error initializing Three.js:', error);
                    this.showErrorMessage('Failed to initialize 3D viewer');
                }

                document.getElementById('back-to-blackboard')?.addEventListener('click', () => {
    if (viewer) {
        viewer.focusOnBlackboardCamera();
        //viewer.hideBackButton(); // ✅ Optional: hide the button after returning
    }
});



            }

            showBackButton() {
    const btn = document.getElementById('back-to-blackboard');
    if (btn) {
        btn.style.display = 'block';
    }
}

createPaperOverlay(paperName) {
    const paperInfo = this.paperData[paperName];
    if (!paperInfo) return;

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.className = 'paper-overlay';
    overlay.innerHTML = `
        <div class="paper-modal">
            <div class="paper-header">
                <h1>${paperInfo.title}</h1>
                <button class="close-paper" aria-label="Close paper">×</button>
            </div>
            <div class="paper-content">
                ${paperInfo.content}
            </div>
        </div>
    `;

    // Add to document
    document.body.appendChild(overlay);

    // Add event listeners
    const closeBtn = overlay.querySelector('.close-paper');
    closeBtn.addEventListener('click', () => {
        this.closePaperOverlay(overlay);
    });

    // Close on overlay click (not modal)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            this.closePaperOverlay(overlay);
        }
    });

    // Close on escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            this.closePaperOverlay(overlay);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);

    // Animate in
    requestAnimationFrame(() => {
        overlay.classList.add('show');
    });
}

closePaperOverlay(overlay) {
    overlay.classList.remove('show');
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }, 300);
}


            setupScene() {
                this.scene = new THREE.Scene();
                this.scene.background = new THREE.Color(0x1a1a1a);
                
                // Keep automatic matrix updates for animations
                this.scene.matrixAutoUpdate = true;
            }

            setupCamera(container) {
                this.camera = new THREE.PerspectiveCamera(
                    45,
                    container.clientWidth / container.clientHeight,
                    0.1,
                    1000
                );
                this.camera.position.set(8, 5, 8);
                // Keep automatic matrix updates for smooth camera movements
                this.camera.matrixAutoUpdate = true;
            }

            setupRenderer(container) {
                this.renderer = new THREE.WebGLRenderer({
                    antialias: true, // Enable antialiasing for better quality
                    powerPreference: "high-performance",
                    stencil: false,
                    depth: true,
                    alpha: false
                });
                
                this.renderer.setSize(container.clientWidth, container.clientHeight);
                this.renderer.setPixelRatio(this.config.maxPixelRatio);
                
                // Better renderer settings
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better shadow quality
                this.renderer.shadowMap.autoUpdate = true; // Keep shadows updating
                this.renderer.outputColorSpace = THREE.SRGBColorSpace;
                this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
                this.renderer.toneMappingExposure = 1.0;
                
                // Add to container
                const placeholder = container.querySelector('.placeholder-3d');
                if (placeholder) placeholder.style.display = 'none';
                container.appendChild(this.renderer.domElement);
            }

            focusOnBlackboard() {
    const blackboard = this.model?.getObjectByName('Blackboard');
    if (!blackboard) return;

    const box = new THREE.Box3().setFromObject(blackboard);
    const center = box.getCenter(new THREE.Vector3());

    // Position camera near blackboard but still rotate around center
    this.camera.position.set(center.x + 5, center.y, center.z + 4);
    console.log('Camera position:', this.camera.position);


    this.camera.lookAt(center); // look at blackboard
    this.controls.target.set(0, 0, 0); // keep rotation centered on whole model
    this.controls.update();
}

focusOnBlackboardCamera() {
    if (!this.cameraTargets?.blackboard) return;

    this.focusCameraTo({
        ...this.cameraTargets.blackboard,
        duration: 2.5
    });

    // Optionally close the backdoor
    this.closeBackdoor?.();
}


            setupControls() {
                this.controls = new OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
                this.controls.enableZoom = true;
                this.controls.enablePan = true;
                this.controls.maxDistance = 50;
                this.controls.minDistance = 1;
                this.controls.maxPolarAngle = Math.PI * 0.8;
                
                // Add event listeners
                this.controls.addEventListener('change', () => {
                    this.needsRender = true;
                    this.lastInteraction = Date.now();
                });
                
                this.controls.addEventListener('start', () => {
                    this.lastInteraction = Date.now();
                });
                
                this.controls.addEventListener('end', () => {
                    this.lastInteraction = Date.now();
                });
            }

            setupLighting() {
    // Increase ambient light for better overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8); // Increased from 0.4
    this.scene.add(ambientLight);

    // Main directional light - increase intensity
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2); // Increased from 0.8
    dirLight.position.set(10, 10, 5);
    dirLight.castShadow = true;
    
    // Shadow settings remain the same
    dirLight.shadow.mapSize.width = this.config.shadowMapSize;
    dirLight.shadow.mapSize.height = this.config.shadowMapSize;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.bias = -0.0001;
    
    this.scene.add(dirLight);

    // Increase fill light intensity
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.6); // Increased from 0.3
    fillLight.position.set(-5, 3, -5);
    this.scene.add(fillLight);

    // Add additional fill light from opposite direction
    const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight2.position.set(5, 3, -5);
    this.scene.add(fillLight2);

    // Increase accent light
    const accentLight = new THREE.PointLight(0xffd700, 0.8, 15); // Increased intensity and range
    accentLight.position.set(-2, 4, 2);
    this.scene.add(accentLight);

    // Add hemisphere light for more natural lighting
    const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.3);
    this.scene.add(hemiLight);
}

            setupEventListeners() {
                // Click interaction
                this.renderer.domElement.addEventListener('click', (event) => {
                    this.handleClick(event);
                });

                // Resize handler
                let resizeTimeout;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        this.handleResize();
                    }, 100);
                });

                // Visibility change handler
                document.addEventListener('visibilitychange', () => {
                    if (document.hidden) {
                        this.pauseRendering();
                    } else {
                        this.resumeRendering();
                    }
                });

                // Performance monitoring toggle
                document.addEventListener('keydown', (event) => {
                    if (event.key === 'p' && event.ctrlKey) {
                        this.togglePerformanceMonitoring();
                    }
                });
            }

            async loadModel() {
                if (this.isLoading) return;
                this.isLoading = true;
                
                this.showLoadingMessage();
                
                const loader = new GLTFLoader();
                const modelPaths = ['assets/coffeeshop.glb', 'assets/coffeeshop.glb'];
                
                for (const path of modelPaths) {
                    try {
                        const gltf = await this.loadGLTF(loader, path);
                        this.handleModelLoad(gltf);
                        return;
                    } catch (error) {
                        console.warn(`Failed to load ${path}:`, error);
                    }
                }
                
                // If both models failed
                this.hideLoadingMessage();
                this.isLoading = false;
                this.showErrorMessage('Model files not found. Please check that cafeteria.glb or coffeeshop.glb exists in the assets folder.');
            }

            loadGLTF(loader, url) {
                return new Promise((resolve, reject) => {
                    loader.load(
                        url,
                        resolve,
                        (progress) => {
                            const percentComplete = (progress.loaded / progress.total * 100);
                            this.updateLoadingProgress(percentComplete);
                        },
                        reject
                    );
                });
            }

            handleModelLoad(gltf) {
                this.hideLoadingMessage();
                this.isLoading = false;
                
                this.model = gltf.scene;

                const box = new THREE.Box3().setFromObject(this.model);
const center = box.getCenter(new THREE.Vector3());
this.model.position.sub(center);

// Reset orbit target to match new center
// Keep rotating around model center (0, 0, 0) or building center
const buildingCenter = new THREE.Vector3(0, 0, 0);
this.controls.target.copy(buildingCenter);

this.controls.update();


                this.optimizeModel(this.model);
                this.scene.add(this.model);
                
                // Auto-fit camera
                this.fitCameraToModel();
                
                // Focus on blackboard if available
                this.focusOnBlackboard();
                
                // Update performance counters
                this.updatePerformanceCounters();
                
                // Force initial render
                this.needsRender = true;
                
                console.log('Model loaded successfully');
            }

            optimizeModel(model) {
                let meshCount = 0;
                
                model.traverse((child) => {
                    // Keep automatic matrix updates for animations
                    child.matrixAutoUpdate = true;
                    
                    if (child.isMesh) {
                        meshCount++;
                        
                        // Enable shadows for most objects
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        // Only basic material optimization
                        if (child.material) {
                            if (child.material.map) {
                                child.material.map.generateMipmaps = true;
                            }
                        }
                        
                        // Compute bounding sphere for frustum culling
                        if (child.geometry && !child.geometry.boundingSphere) {
                            child.geometry.computeBoundingSphere();
                        }
                        
                        child.frustumCulled = true;
                    }
                });
                
                this.performance.triangles = this.countTriangles(model);
                console.log(`Model optimized: ${meshCount} meshes, ${this.performance.triangles} triangles`);
            }

            countTriangles(object) {
                let count = 0;
                object.traverse((child) => {
                    if (child.isMesh && child.geometry) {
                        const positions = child.geometry.attributes.position;
                        if (positions) {
                            count += positions.count / 3;
                        }
                    }
                });
                return Math.floor(count);
            }

            fitCameraToModel() {
const box = new THREE.Box3().setFromObject(this.model);
                const size = box.getSize(new THREE.Vector3());
const center = box.getCenter(new THREE.Vector3());
this.model.position.sub(center);

                const maxDim = Math.max(size.x, size.y, size.z);
                const fov = this.camera.fov * (Math.PI / 180);
                const distance = maxDim / (2 * Math.tan(fov / 2)) * 1.2;
                
                //this.camera.position.set(
                //    center.x + distance * 0.5,
                //    center.y + distance * 0.3,
                //    center.z + distance * 0.5
                //);
                
                // Keep rotating around model center (0, 0, 0) or building center
const buildingCenter = new THREE.Vector3(0, 0, 0);
this.controls.target.copy(buildingCenter);

                this.controls.update();
            }

            focusOnBlackboard() {
                const blackboard = this.model?.getObjectByName('Blackboard');
                if (blackboard) {
                    const box = new THREE.Box3().setFromObject(blackboard);
                    const center = box.getCenter(new THREE.Vector3());
                    
                    this.camera.position.set(center.x + 5, center.y, center.z + 4);
                    // Keep rotating around model center (0, 0, 0) or building center
const buildingCenter = new THREE.Vector3(0, 0, 0);
this.controls.target.copy(buildingCenter);

                    this.controls.update();
                }
            }

           handleClick(event) {
    if (!this.model) return;

    const bounds = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    this.mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.model.children, true);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const name = clickedObject.name;

        if (name.startsWith('nav-')) {
            if (name.startsWith('nav-blackboard')) {
                this.focusOnBlackboardCamera();
            } else {
                this.handleNavigation(name);
            }
        }

        if (name.startsWith('paper_')) {
            console.log('Paper clicked:', name); // Debug log
            this.createPaperOverlay(name);
            return;
        }
    }
}


handleNavigation(name) {
    const target = this.cameraTargets[name];
    if (target) {
        this.focusCameraTo(target);
        this.showBackButton();

        if (name === 'nav-contact') {
            setTimeout(() => {
                this.openBackdoor();
            }, 1500);
        }
    }
}




focusCameraTo({ position, lookAt, duration = 2.0 }) {
    const startPos = this.camera.position.clone();
    const startLookAt = this.controls.target.clone();
    
    // Use provided lookAt or default to model center
    const targetLookAt = lookAt || new THREE.Vector3(0, 1.5, 0);
    
    const startTime = performance.now();
    const totalTime = duration * 1000;

    const animate = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / totalTime, 1);
        const easedT = gsap.parseEase("power2.inOut")(t);

        // Interpolate camera position
        const newPos = startPos.clone().lerp(position, easedT);
        this.camera.position.copy(newPos);
        
        // Interpolate lookAt target
        const newLookAt = startLookAt.clone().lerp(targetLookAt, easedT);
        this.camera.lookAt(newLookAt);
        
        // Update controls target
        this.controls.target.copy(newLookAt);
        this.controls.update();

        this.needsRender = true;

        if (t < 1) {
            requestAnimationFrame(animate);
        }
    };

    requestAnimationFrame(animate);
}









            openBackdoor() {
                const door = this.model?.getObjectByName('Backdoor');
                if (!door) return;
                
                // Reset door position
                door.rotation.y = 0;
                door.updateMatrixWorld();
                
                gsap.to(door.rotation, {
                    duration: 1.2,
                    y: -Math.PI / 2,
                    ease: "power2.out",
                    onUpdate: () => {
                        door.updateMatrixWorld();
                        this.needsRender = true;
                    }
                });
            }

            closeBackdoor() {
    const door = this.model?.getObjectByName('Backdoor');
    if (!door) return;
    
    gsap.to(door.rotation, {
        duration: 4.2,
        y: 0, // Close the door back to original position
        ease: "power2.out",
        onUpdate: () => {
            door.updateMatrixWorld();
            this.needsRender = true;
        }
    });
}

            handleResize() {
                const container = document.getElementById('threejs-container');
                if (!container) return;
                
                this.camera.aspect = container.clientWidth / container.clientHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(container.clientWidth, container.clientHeight);
                this.needsRender = true;
            }

            animate() {
                this.animationId = requestAnimationFrame(() => this.animate());
                
                const currentTime = Date.now();
                const shouldRender = this.needsRender || 
                                   (currentTime - this.lastInteraction < this.config.interactionTimeout);
                
                if (shouldRender) {
                    this.controls.update();
                    this.renderer.render(this.scene, this.camera);
                    this.needsRender = false;
                    
                    // Update performance counters
                    if (this.config.enablePerformanceMonitoring) {
                        this.updatePerformanceStats();
                    }
                }
            }

            updatePerformanceStats() {
                this.performance.frameCount++;
                const now = performance.now();
                
                if (now - this.performance.lastFpsTime >= 1000) {
                    this.performance.fps = this.performance.frameCount;
                    this.performance.frameCount = 0;
                    this.performance.lastFpsTime = now;
                    this.performance.renderCalls = this.renderer.info.render.calls;
                    
                    this.updatePerformanceDisplay();
                    this.renderer.info.reset();
                }
            }

            updatePerformanceDisplay() {
                const fpsElement = document.getElementById('fps-counter');
                const triangleElement = document.getElementById('triangle-count');
                const renderCallsElement = document.getElementById('render-calls');
                
                if (fpsElement) fpsElement.textContent = this.performance.fps;
                if (triangleElement) triangleElement.textContent = this.performance.triangles;
                if (renderCallsElement) renderCallsElement.textContent = this.performance.renderCalls;
            }

            updatePerformanceCounters() {
                this.performance.triangles = this.countTriangles(this.model);
                this.updatePerformanceDisplay();
            }

            togglePerformanceMonitoring() {
                this.config.enablePerformanceMonitoring = !this.config.enablePerformanceMonitoring;
                const perfInfo = document.getElementById('performance-info');
                if (perfInfo) {
                    perfInfo.style.display = this.config.enablePerformanceMonitoring ? 'block' : 'none';
                }
            }

            pauseRendering() {
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
            }

            resumeRendering() {
                if (!this.animationId) {
                    this.needsRender = true;
                    this.animate();
                }
            }

            hideControlsInfo() {
                setTimeout(() => {
                    const controlsInfo = document.getElementById('controls-info');
                    if (controlsInfo) {
                        controlsInfo.classList.add('fade-out');
                    }
                }, 5000);
            }

            showLoadingMessage() {
                const container = document.getElementById('threejs-container');
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'loading-message';
                loadingDiv.id = 'loading-message';
                loadingDiv.innerHTML = `
                    <div class="loading-spinner"></div>
                    <p>Loading 3D Model...</p>
                    <p id="loading-progress">0%</p>
                `;
                container.appendChild(loadingDiv);
            }

            updateLoadingProgress(percent) {
                const progressElement = document.getElementById('loading-progress');
                if (progressElement) {
                    progressElement.textContent = `${Math.round(percent)}%`;
                }
            }

            hideLoadingMessage() {
                const loadingMessage = document.getElementById('loading-message');
                if (loadingMessage) {
                    loadingMessage.remove();
                }
            }

            showErrorMessage(message) {
                const container = document.getElementById('threejs-container');
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.innerHTML = `
                    <h3>Unable to Load 3D Model</h3>
                    <p>${message}</p>
                    <p style="margin-top: 1rem; font-size: 0.9rem;">Please check that the model file exists in the assets folder.</p>
                `;
                container.appendChild(errorDiv);
            }

            dispose() {
                // Cleanup resources
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                }
                
                if (this.model) {
                    this.model.traverse((child) => {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => mat.dispose());
                            } else {
                                child.material.dispose();
                            }
                        }
                    });
                }
                
                if (this.renderer) {
                    this.renderer.dispose();
                }
            }
        }

        // Initialize viewer
        let viewer;
        
        function initViewer() {
            if (viewer) {
                viewer.dispose();
            }
            viewer = new OptimizedViewer();
        }

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initViewer);
        } else {
            initViewer();
        }

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (viewer) {
                viewer.dispose();
            }
        });