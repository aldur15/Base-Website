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
                    shadowMapSize: 512,
                    enablePerformanceMonitoring: false,
                    interactionTimeout: 10000 // 10 seconds
                };

                this.cameraTargets = {
    'nav-about': {
        //PROJECTS
        position: new THREE.Vector3(-1, -4, 20),
        lookAt: new THREE.Vector3(0, 1.5, 0) // Center of model
    },
    'nav-projects': {
        //CREDITS
        position: new THREE.Vector3(5, 32, 10), //position: new THREE.Vector3(12, 12, 15),
        lookAt: new THREE.Vector3(0, 1.5, 0) // Center of model
    },
    'nav-research': {
        //RESEARCH
        position: new THREE.Vector3(20, -5, -19.01),
        lookAt: new THREE.Vector3(0, 1.5, 0) // Center of model - NOT the target position
    },
    'nav-contact': {
        //ABOUT
        position: new THREE.Vector3(-16.5, -2.18, 9.01),
        lookAt: new THREE.Vector3(0, 1.5, 0) // Center of model
    },
    blackboard: {
        position: new THREE.Vector3(14.85, -4.14, 6.68),
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

this.fanObjects = new Map(); // Store fan objects and their settings
    this.animatedObjects = new Map(); // Store all animated objects
                
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

            setupFanAnimation() {
    if (!this.model) return;
    
    // Find fan objects in the model
    this.model.traverse((child) => {
        if (child.name && child.name.toLowerCase().includes('fan')) {
            console.log('Found fan object:', child.name);
            this.addFanAnimation(child);
        }
    });
}

// Add a fan to the animation system
addFanAnimation(fanObject, settings = {}) {
    const defaultSettings = {
        axis: 'x',           // Rotation axis
        speed: 2,            // Rotation speed
        direction: 1,        // 1 for clockwise, -1 for counterclockwise
        enabled: true
    };
    
    const fanSettings = { ...defaultSettings, ...settings };
    
    // Create a pivot group if the fan doesn't already have one
    if (!fanObject.userData.pivotGroup) {
        // Store the original parent
        const originalParent = fanObject.parent;
        
        // Create pivot group at the fan's current position
        const pivotGroup = new THREE.Group();
        pivotGroup.name = fanObject.name + '_pivot';
        
        // Position the pivot group at the fan's world position
        const worldPosition = new THREE.Vector3();
        fanObject.getWorldPosition(worldPosition);
        
        // Convert world position to local position relative to the original parent
        const localPosition = new THREE.Vector3();
        originalParent.worldToLocal(worldPosition.clone());
        pivotGroup.position.copy(fanObject.position);
        
        // Add pivot group to the original parent
        originalParent.add(pivotGroup);
        
        // Remove fan from original parent and add to pivot group
        originalParent.remove(fanObject);
        
        // Reset fan's position to be relative to pivot
        // If you want the fan to rotate around its base, you might need to adjust this
        fanObject.position.set(0, 0, 0);
        
        // Add fan to pivot group
        pivotGroup.add(fanObject);
        
        // Store reference to pivot group
        fanObject.userData.pivotGroup = pivotGroup;
        
        console.log(`Created pivot group for fan ${fanObject.name}`);
    }
    
    // Store the fan and its settings
    this.fanObjects.set(fanObject.name, {
        object: fanObject,
        pivotGroup: fanObject.userData.pivotGroup,
        settings: fanSettings,
        lastTime: performance.now()
    });
    
    console.log(`Fan ${fanObject.name} added to animation system with pivot`);
}



            showBackButton() {
    const btn = document.getElementById('back-to-blackboard');
    if (btn) {
        btn.style.display = 'block';
    }
}


setupAutoCollisionObjects() {
    if (!this.model) return;
    
    console.log('Setting up auto-collision objects...');
    
    // Define naming patterns for collision objects
    const collisionPatterns = [
        'collision-',     // collision-letterA, collision-sign1, etc.
        'click-',         // click-menu, click-board, etc.
        'button-',        // button-letter, button-sign, etc.
        'nav-',           // Your existing nav objects
        'interact-',      // interact-welcome, interact-menu, etc.
        'trigger-'        // trigger-door, trigger-light, etc.
    ];
    
    this.model.traverse((child) => {
        if (child.isMesh && child.name) {
            const name = child.name.toLowerCase();
            
            // Check if this object should be a collision object
            const isCollisionObject = collisionPatterns.some(pattern => 
                name.startsWith(pattern.toLowerCase())
            );
            
            if (isCollisionObject) {
                console.log('Found collision object:', child.name);
                
                // Make it invisible but keep it clickable
                this.makeInvisibleCollision(child);
                
                // Store reference for easy access
                if (!this.collisionObjects) {
                    this.collisionObjects = new Map();
                }
                this.collisionObjects.set(child.name, child);
            }
        }
    });
    
    console.log(`Set up ${this.collisionObjects?.size || 0} collision objects`);
}

makeInvisibleCollision(object) {
    // Store original material for debugging purposes
    object.userData.originalMaterial = object.material;
    
    // Create invisible material
    const invisibleMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        alphaTest: 0.01, // Helps with raycasting
        side: THREE.DoubleSide // Detect clicks from both sides
    });
    
    // Apply invisible material
    object.material = invisibleMaterial;
    
    // Mark as collision object
    object.userData.isCollision = true;
    object.userData.clickable = true;
    
    // Ensure it's still raycastable
    object.raycast = THREE.Mesh.prototype.raycast;
    
    // Optional: Add wireframe for debugging (hidden by default)
    if (object.userData.showWireframe) {
        const wireframeGeometry = object.geometry.clone();
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        wireframe.position.copy(object.position);
        wireframe.rotation.copy(object.rotation);
        wireframe.scale.copy(object.scale);
        wireframe.visible = false; // Hidden by default
        object.add(wireframe);
        object.userData.debugWireframe = wireframe;
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
                this.camera.position.set(8, 0, 8);
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
                this.renderer.shadowMap.enabled = false;
                //this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better shadow quality
                this.renderer.shadowMap.autoUpdate = false; // Keep shadows updating
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
    this.camera.position.set(center.x + 5, center.y -1, center.z + 4);
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
    // 1. Single ambient light (reduced intensity)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // 2. Main directional light with optimized shadows
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 10, 5);
    dirLight.castShadow = false;
    
    
    
    // Critical: Don't update shadows every frame
    dirLight.shadow.autoUpdate = false;
    
    this.scene.add(dirLight);

    // 3. Single hemisphere light for ambient fill
    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x362d1a, 0.8);
    this.scene.add(hemiLight);

    // Store reference for manual shadow updates
    this.mainLight = dirLight;
    
    // Update shadows only when camera stops moving
   
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

                document.addEventListener('keydown', (event) => {
        if (event.key === 'b' && event.ctrlKey) {
            this.toggleCollisionVisibility();
        }
        if (event.key === 'p' && event.ctrlKey) {
            this.togglePerformanceMonitoring();
        }
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

            // Replace your handleModelLoad method with this updated version:
handleModelLoad(gltf) {
    this.hideLoadingMessage();
    this.isLoading = false;
    
    this.model = gltf.scene;

    const box = new THREE.Box3().setFromObject(this.model);
    const center = box.getCenter(new THREE.Vector3());
    this.model.position.sub(center);

    const buildingCenter = new THREE.Vector3(0, 0, 0);
    this.controls.target.copy(buildingCenter);
    this.controls.update();

    this.optimizeModel(this.model);
    this.scene.add(this.model);
    
    // Setup auto-collision objects
    this.setupAutoCollisionObjects();
    this.setupFanAnimation();

    // Set initial camera position (can be anywhere, will animate to blackboard)
    this.fitCameraToModel();
    
    // Animate to blackboard position after a short delay
    setTimeout(() => {
        this.focusOnBlackboardCamera();
    }, 100); // Small delay to ensure everything is set up
    
    this.updatePerformanceCounters();
    this.needsRender = true;
    
    console.log('Model loaded successfully - zooming to blackboard');
}

            optimizeModel(model) {
                let meshCount = 0;
                
                model.traverse((child) => {
                    // Keep automatic matrix updates for animations
                    child.matrixAutoUpdate = true;
                    
                    if (child.isMesh) {
                        meshCount++;
                        
                        // Enable shadows for most objects
                        child.castShadow = false;
                        child.receiveShadow = false;
                        
                        // Only basic material optimization
                        if (child.material) {
                            if (child.material.map) {
                                child.material.map.generateMipmaps = false;
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
    
    // Get all objects for raycasting (including collision objects)
    const allObjects = [];
    this.model.traverse((child) => {
        if (child.isMesh) {
            allObjects.push(child);
        }
    });
    
    const intersects = this.raycaster.intersectObjects(allObjects, false);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const name = clickedObject.name;
        
        console.log('Clicked object:', name, clickedObject.userData);

        // Handle different types of clicks based on name patterns
        if (this.handleClickByName(name, clickedObject)) {
            return;
        }
        
        // Fallback for unnamed objects
        console.log('Unhandled click on:', name);
    }
}

handleClickByName(name, clickedObject) {
    if (!name) return false;
    
    const lowerName = name.toLowerCase();
    
    // Handle collision objects
    if (lowerName.startsWith('collision-')) {
        return this.handleCollisionClick(name, clickedObject);
    }
    
    // Handle click objects
    if (lowerName.startsWith('click-')) {
        return this.handleClickObjectClick(name, clickedObject);
    }
    
    // Handle button objects
    if (lowerName.startsWith('button-')) {
        return this.handleButtonClick(name, clickedObject);
    }
    
    // Handle interact objects
    if (lowerName.startsWith('interact-')) {
        return this.handleInteractClick(name, clickedObject);
    }
    
    // Handle trigger objects
    if (lowerName.startsWith('trigger-')) {
        return this.handleTriggerClick(name, clickedObject);
    }
    
    // Handle existing nav objects
    if (lowerName.startsWith('nav-')) {
        if (lowerName.startsWith('nav-blackboard')) {
            this.focusOnBlackboardCamera();
        } else {
            this.handleNavigation(name);
        }
        return true;
    }
    
    // Handle existing paper objects
    if (lowerName.startsWith('paper_')) {
        console.log('Paper clicked:', name);
        this.createPaperOverlay(name);
        return true;
    }
    
    return false;
}


handleCollisionClick(name, clickedObject) {
    console.log('Collision object clicked:', name);
    
    // Extract the actual object name (remove 'collision-' prefix)
    const objectName = name.substring(10); // Remove 'collision-'
    
    // Handle based on object type
    if (objectName.includes('letter')) {
        this.handleLetterCollision(objectName, clickedObject);
    } else if (objectName.includes('sign')) {
        this.handleSignCollision(objectName, clickedObject);
    } else if (objectName.includes('menu')) {
        this.handleMenuCollision(objectName, clickedObject);
    } else if (objectName.includes('door')) {
        this.handleDoorCollision(objectName, clickedObject);
    } else {
        this.handleGenericCollision(objectName, clickedObject);
    }
    
    return true;
}

handleClickObjectClick(name, clickedObject) {
    console.log('Click object clicked:', name);
    const objectName = name.substring(6); // Remove 'click-'
    
    // Add click animation
    this.animateClick(clickedObject);
    
    // Handle specific click actions
    if (objectName.includes('menu')) {
        this.showMenuOverlay();
    } else if (objectName.includes('info')) {
        this.showInfoOverlay(objectName);
    }
    
    return true;
}

handleButtonClick(name, clickedObject) {
    console.log('Button clicked:', name);
    const buttonName = name.substring(7); // Remove 'button-'
    
    // Add button press animation
    this.animateButtonPress(clickedObject);
    
    // Handle button actions
    this.executeButtonAction(buttonName);
    
    return true;
}

handleInteractClick(name, clickedObject) {
    console.log('Interact object clicked:', name);
    const interactName = name.substring(9); // Remove 'interact-'
    
    // Add interaction feedback
    this.showInteractionFeedback(clickedObject);
    
    return true;
}

handleTriggerClick(name, clickedObject) {
    console.log('Trigger activated:', name);
    const triggerName = name.substring(8); // Remove 'trigger-'
    
    // Handle trigger actions
    this.executeTriggerAction(triggerName, clickedObject);
    
    return true;
}

// Animation methods
animateClick(object) {
    gsap.to(object.scale, {
        duration: 0.15,
        x: 0.9,
        y: 0.9,
        z: 0.9,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
        onUpdate: () => {
            this.needsRender = true;
        }
    });
}

animateButtonPress(object) {
    gsap.to(object.position, {
        duration: 0.1,
        y: object.position.y - 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
        onUpdate: () => {
            this.needsRender = true;
        }
    });
}

showInteractionFeedback(object) {
    // Create temporary glow effect
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.5
    });
    
    const originalMaterial = object.material;
    object.material = glowMaterial;
    
    setTimeout(() => {
        object.material = originalMaterial;
        this.needsRender = true;
    }, 300);
}

// Specific collision handlers
handleLetterCollision(letterName, clickedObject) {
    console.log('Letter collision:', letterName);
    this.showMessage(`You clicked on: ${letterName}`);
    this.animateClick(clickedObject);
}

handleSignCollision(signName, clickedObject) {
    console.log('Sign collision:', signName);
    this.showMessage(`Sign: ${signName}`);
    this.animateClick(clickedObject);
}

handleMenuCollision(menuName, clickedObject) {
    console.log('Menu collision:', menuName);
    this.showMenuOverlay();
}

handleDoorCollision(doorName, clickedObject) {
    console.log('Door collision:', doorName);
    this.handleDoorInteraction(doorName);
}

handleGenericCollision(objectName, clickedObject) {
    console.log('Generic collision:', objectName);
    this.showMessage(`Clicked: ${objectName}`);
    this.animateClick(clickedObject);
}

// Action executors
executeButtonAction(buttonName) {
    switch (buttonName) {
        case 'lights':
            this.toggleLights();
            break;
        case 'music':
            this.toggleMusic();
            break;
        case 'info':
            this.showInfoOverlay();
            break;
        default:
            this.showMessage(`Button activated: ${buttonName}`);
    }
}

executeTriggerAction(triggerName, triggerObject) {
    switch (triggerName) {
        case 'door':
            this.openDoor(triggerObject);
            break;
        case 'light':
            this.toggleAreaLight(triggerObject);
            break;
        default:
            this.showMessage(`Trigger activated: ${triggerName}`);
    }
}

// Debug methods
toggleCollisionVisibility() {
    if (!this.collisionObjects) return;
    
    this.collisionObjects.forEach((object, name) => {
        if (object.userData.isCollision) {
            const isVisible = object.material.opacity > 0;
            object.material.opacity = isVisible ? 0 : 0.3;
            object.material.wireframe = !isVisible;
            
            // Toggle debug wireframe if it exists
            if (object.userData.debugWireframe) {
                object.userData.debugWireframe.visible = !isVisible;
            }
        }
    });
    
    this.needsRender = true;
}

// Message helper
showMessage(text) {
    const message = document.createElement('div');
    message.className = 'collision-message';
    message.textContent = text;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 1rem;
        border-radius: 5px;
        z-index: 1000;
        animation: fadeInOut 2s ease-in-out;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 2000);
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
    
    const currentTime = performance.now();
    const deltaTime = currentTime - (this.lastFrameTime || currentTime);
    this.lastFrameTime = currentTime;
    
    // Only render if something changed or during interaction
    const isInteracting = (currentTime - this.lastInteraction) < 100; // 100ms window
    const needsUpdate = this.needsRender || isInteracting || this.controls.autoRotate;
    
    if (needsUpdate) {
        // Update controls first
        this.controls.update();
        
        // Update animations with delta time
        this.updateFanAnimations(deltaTime);
        
        // Only render if camera moved or scene changed
        if (this.needsRender || this.controls.hasChanged) {
            this.renderer.render(this.scene, this.camera);
            this.needsRender = false;
            this.controls.hasChanged = false;
        }
    }
}

updateFanAnimations() {
    if (this.fanObjects.size === 0) return;
    
    const currentTime = performance.now();
    
    this.fanObjects.forEach((fanData, fanName) => {
        const { object, pivotGroup, settings, lastTime } = fanData;
        
        if (!settings.enabled) return;
        
        // Calculate time delta
        const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
        
        // Calculate rotation amount
        const rotationAmount = settings.speed * settings.direction * deltaTime;
        
        // Apply rotation to the pivot group instead of the fan object directly
        const targetObject = pivotGroup || object;
        
        // Apply rotation based on axis
        switch (settings.axis.toLowerCase()) {
            case 'x':
                targetObject.rotation.x += rotationAmount;
                break;
            case 'y':
                targetObject.rotation.y += rotationAmount;
                break;
            case 'z':
                targetObject.rotation.z += rotationAmount;
                break;
        }
        
        // Update the stored time
        fanData.lastTime = currentTime;
        
        // Mark that we need to render
        this.needsRender = true;
    });
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


// Control functions for fans
toggleFan(fanName) {
    const fanData = this.fanObjects.get(fanName);
    if (fanData) {
        fanData.settings.enabled = !fanData.settings.enabled;
        console.log(`Fan ${fanName} ${fanData.settings.enabled ? 'started' : 'stopped'}`);
    }
}

setFanSpeed(fanName, speed) {
    const fanData = this.fanObjects.get(fanName);
    if (fanData) {
        fanData.settings.speed = speed;
        console.log(`Fan ${fanName} speed set to ${speed}`);
    }
}

setFanDirection(fanName, direction) {
    const fanData = this.fanObjects.get(fanName);
    if (fanData) {
        fanData.settings.direction = direction;
        console.log(`Fan ${fanName} direction set to ${direction > 0 ? 'clockwise' : 'counterclockwise'}`);
    }
}

// Stop all fans
stopAllFans() {
    this.fanObjects.forEach((fanData, fanName) => {
        fanData.settings.enabled = false;
    });
}

// Start all fans
startAllFans() {
    this.fanObjects.forEach((fanData, fanName) => {
        fanData.settings.enabled = true;
    });
}

// Add specific fan by name (if you know the exact name)
addFanByName(fanName, settings = {}) {
    const fanObject = this.model?.getObjectByName(fanName);
    if (fanObject) {
        this.addFanAnimation(fanObject, settings);
    } else {
        console.warn(`Fan object '${fanName}' not found in model`);
    }
}

addFanAnimationWithGeometryPivot(fanObject, settings = {}) {
    // Calculate the fan's bounding box to determine a good pivot point
    const box = new THREE.Box3().setFromObject(fanObject);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // For a typical fan, the pivot should be at the center of the base
    // Adjust this based on your fan's geometry
    const pivotOffset = new THREE.Vector3(0, -size.y * 0.4, 0); // Pivot at lower part of fan
    
    this.addFanAnimationWithCustomPivot(fanObject, pivotOffset, settings);
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



        


        