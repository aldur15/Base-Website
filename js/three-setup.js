// 1. Add DRACOLoader import at the top
import * as THREE from 'three';
import {
	GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';
import {
	DRACOLoader
} from 'three/addons/loaders/DRACOLoader.js'; // ADD THIS LINE
import {
	OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import {
	RGBELoader
} from 'three/addons/loaders/RGBELoader.js';

class SimpleViewer {
	constructor() {
		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.controls = null;
		this.model = null;
		this.lightmapTexture = null;
		this.graffitiLightmapTexture = null;
		this.graffitiWall = null;
		this.animationId = null;
		this.isDarkMode = false;
		this.lightModeColor = new THREE.Color(0x0b859d);
		this.darkModeColor = new THREE.Color(0x000000);

		// 2. Add DRACO loader properties
		this.dracoLoader = null;
		this.gltfLoader = null;

		this.init();
	}

	async init() {
		const container = document.getElementById('threejs-container');
		if (!container) {
			console.error('Three.js container not found');
			return;
		}

		console.log('Initializing SimpleViewer...');
		this.showLoadingMessage();

		try {
			this.setupScene();
			this.setupCamera(container);
			this.setupRenderer(container);
			this.setupControls();
			this.setupEventListeners();
			this.setupDarkModeDetection();
			this.setupDracoLoader(); // 3. ADD THIS LINE
			this.createViewButton();

			this.animate();

			console.log('Loading lightmaps...');
			await this.loadLightmap();

			console.log('Loading models...');
			this.loadMainModel();
			this.loadGraffitiWall();

		} catch (error) {
			console.error('Error during initialization:', error);
			this.showErrorMessage('Failed to initialize 3D viewer');
		}
	}



	// 4. Add setupDracoLoader method
	setupDracoLoader() {
		// Initialize DRACO loader
		this.dracoLoader = new DRACOLoader();

		// Set the path to the DRACO decoder files
		// You can host these yourself or use the CDN version
		this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

		// Alternative: if you want to host the decoder files locally
		// this.dracoLoader.setDecoderPath('./draco/');

		// Configure DRACO loader
		this.dracoLoader.setDecoderConfig({
			type: 'js'
		}); // Use JS decoder (slower but more compatible)
		// this.dracoLoader.setDecoderConfig({ type: 'wasm' }); // Use WASM decoder (faster)

		// Initialize GLTF loader with DRACO support
		this.gltfLoader = new GLTFLoader();
		this.gltfLoader.setDRACOLoader(this.dracoLoader);

		console.log('DRACO loader initialized for SimpleViewer');
	}

	setupScene() {
		this.scene = new THREE.Scene();
		this.scene.background = this.lightModeColor.clone();
	}

	setupCamera(container) {
		this.camera = new THREE.PerspectiveCamera(
			45,
			container.clientWidth / container.clientHeight,
			0.1,
			1000
		);
		this.camera.position.set(8, 0, 8);
	}

	setupRenderer(container) {
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			powerPreference: "high-performance"
		});

		this.renderer.setSize(container.clientWidth, container.clientHeight);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.shadowMap.enabled = false;
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.0;

		// Remove placeholder and add renderer
		const placeholder = container.querySelector('.placeholder-3d');
		if (placeholder) placeholder.style.display = 'none';
		container.appendChild(this.renderer.domElement);
	}

	setupControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.08;
		this.controls.enableZoom = true;
		this.controls.zoomSpeed = 0.8;
		this.controls.enablePan = true;
		this.controls.panSpeed = 0.8;
		this.controls.maxDistance = 50;
		this.controls.minDistance = 1;
		this.controls.maxPolarAngle = Math.PI * 0.8;
	}

	setupEventListeners() {
		let resizeTimeout;
		window.addEventListener('resize', () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				this.handleResize();
			}, 100);
		});
	}

	setupDarkModeDetection() {
		this.updateDarkModeState();

		document.addEventListener('darkModeToggle', () => {
			this.updateDarkModeState();
		});

		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
					this.updateDarkModeState();
				}
			});
		});

		observer.observe(document.body, {
			attributes: true,
			attributeFilter: ['data-theme']
		});
	}

	updateDarkModeState() {
		const wasDarkMode = this.isDarkMode;
		this.isDarkMode = document.body.getAttribute('data-theme') === 'dark';

		if (wasDarkMode !== this.isDarkMode) {
			this.updateSceneBackground();
		}
	}

	updateSceneBackground() {
		if (!this.scene) return;

		const targetColor = this.isDarkMode ? this.darkModeColor : this.lightModeColor;
		this.scene.background = targetColor.clone();
	}

	createViewButton() {
		const container = document.getElementById('threejs-container');
		const button = document.createElement('button');
		button.className = 'view-button';
		button.innerHTML = 'View';
		button.setAttribute('aria-label', 'Open full 3D viewer');

		// Add styles for the button
		const styles = `
            .view-button {
                position: absolute;
                bottom: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.9);
                border: 2px solid #0b859d;
                border-radius: 8px;
                padding: 12px 20px;
                font-family: inherit;
                font-size: 14px;
                font-weight: 600;
                color: #0b859d;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                z-index: 100;
            }
            
            .view-button:hover {
                background: #0b859d;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(11, 133, 157, 0.3);
            }
            
            .view-button:active {
                transform: translateY(0);
            }
            
            [data-theme="dark"] .view-button {
                background: rgba(30, 30, 30, 0.9);
                border-color: #ffffff;
                color: #ffffff;
            }
            
            [data-theme="dark"] .view-button:hover {
                background: #ffffff;
                color: #000000;
            }
        `;

		// Add styles to document if not already present
		if (!document.querySelector('#view-button-styles')) {
			const styleSheet = document.createElement('style');
			styleSheet.id = 'view-button-styles';
			styleSheet.textContent = styles;
			document.head.appendChild(styleSheet);
		}

		button.addEventListener('click', () => {
			window.location.href = 'viewer.html';
		});

		container.style.position = 'relative';
		container.appendChild(button);
	}

	async loadLightmap() {
		const loader = new RGBELoader();

		try {
			// Load main lightmap
			const mainTexture = await new Promise((resolve, reject) => {
				loader.load('assets/lightmap.hdr', resolve, undefined, reject);
			});

			mainTexture.mapping = THREE.EquirectangularReflectionMapping;
			mainTexture.wrapS = THREE.ClampToEdgeWrapping;
			mainTexture.wrapT = THREE.ClampToEdgeWrapping;
			mainTexture.flipY = false;
			mainTexture.generateMipmaps = false;
			mainTexture.minFilter = THREE.LinearFilter;
			mainTexture.magFilter = THREE.LinearFilter;

			this.lightmapTexture = mainTexture;
			console.log('Main lightmap loaded successfully');

			// Load graffiti lightmap
			const graffitiTexture = await new Promise((resolve, reject) => {
				loader.load('assets/graffiti_lightmap.hdr', resolve, undefined, reject);
			});

			graffitiTexture.mapping = THREE.EquirectangularReflectionMapping;
			graffitiTexture.wrapS = THREE.ClampToEdgeWrapping;
			graffitiTexture.wrapT = THREE.ClampToEdgeWrapping;
			graffitiTexture.flipY = false;
			graffitiTexture.generateMipmaps = false;
			graffitiTexture.minFilter = THREE.LinearFilter;
			graffitiTexture.magFilter = THREE.LinearFilter;

			this.graffitiLightmapTexture = graffitiTexture;
			console.log('Graffiti lightmap loaded successfully');

		} catch (error) {
			console.warn('Failed to load lightmaps, using fallback lighting:', error);
			this.setupFallbackLighting();
		}
	}

	setupFallbackLighting() {
		const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
		this.scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
		directionalLight.position.set(5, 10, 7.5);
		this.scene.add(directionalLight);
	}

	// 5. Update loadMainModel to use the DRACO-enabled loader
	loadMainModel() {
		console.log('Starting to load main model: assets/coffeeshop.glb');

		// Use the DRACO-enabled GLTF loader instead of creating a new one
		this.gltfLoader.load(
			'assets/coffeeshop.glb',
			(gltf) => {
				console.log('Main model loaded successfully!', gltf);
				this.model = gltf.scene;

				// Log model info
				console.log('Model has', this.model.children.length, 'children');
				this.model.traverse((child) => {
					if (child.isMesh) {
						console.log('Found mesh:', child.name);
					}
				});

				// Remove graffiti wall from main model if it exists
				const graffitiWallInMain = this.model.getObjectByName('graffiti-wall') ||
					this.model.getObjectByName('graffitiwall') ||
					this.findObjectByPartialName(this.model, 'graffiti');

				if (graffitiWallInMain) {
					console.log('Removing graffiti wall from main model:', graffitiWallInMain.name);
					graffitiWallInMain.parent.remove(graffitiWallInMain);
				} else {
					console.log('No graffiti wall found in main model to remove');
				}

				// Center the model
				const box = new THREE.Box3().setFromObject(this.model);
				const center = box.getCenter(new THREE.Vector3());
				const size = box.getSize(new THREE.Vector3());
				console.log('Model bounds - Center:', center, 'Size:', size);

				this.model.position.sub(center);

				// Optimize the model
				this.optimizeModel(this.model);

				// Apply main lightmap if available
				this.applyMainLightmapToModel();

				this.scene.add(this.model);
				console.log('Main model added to scene');

				// Set camera position for nice view
				this.fitCameraToModel();

				// Hide loading message once main model is loaded
				this.hideLoadingMessage();

				console.log('Main model setup complete');
			},
			(progress) => {
				const percentage = (progress.loaded / progress.total * 100).toFixed(1);
				console.log(`Main model loading progress: ${percentage}% (${progress.loaded}/${progress.total} bytes)`);
			},
			(error) => {
				console.error('Failed to load main model:', error);
				console.error('Error details:', {
					message: error.message,
					stack: error.stack,
					url: 'assets/coffeeshop.glb'
				});
				this.hideLoadingMessage();
				this.showErrorMessage('Failed to load main 3D model. Please check that assets/coffeeshop.glb exists.');
			}
		);
	}



	// 6. Update loadGraffitiWall to use the DRACO-enabled loader
	loadGraffitiWall() {
		console.log('Starting to load graffiti wall: assets/graffiti-wall.glb');

		// Use the DRACO-enabled GLTF loader instead of creating a new one
		this.gltfLoader.load(
			'assets/graffiti-wall.glb',
			(gltf) => {
				console.log('Graffiti wall loaded successfully!', gltf);
				this.graffitiWall = gltf.scene;

				// Log graffiti wall info
				console.log('Graffiti wall has', this.graffitiWall.children.length, 'children');
				this.graffitiWall.traverse((child) => {
					if (child.isMesh) {
						console.log('Found graffiti mesh:', child.name);
					}
				});

				// Position the graffiti wall
				this.graffitiWall.position.set(0, 0, 0);
				this.graffitiWall.rotation.set(0, 0, 0);
				this.graffitiWall.scale.set(1, 1, 1);
				console.log('Graffiti wall positioned at origin');

				// Optimize the graffiti wall
				this.optimizeModel(this.graffitiWall);

				// Apply graffiti lightmap if available
				this.applyGraffitiLightmapToWall();

				this.scene.add(this.graffitiWall);
				console.log('Graffiti wall added to scene');

				console.log('Graffiti wall setup complete');
			},
			(progress) => {
				const percentage = (progress.loaded / progress.total * 100).toFixed(1);
				console.log(`Graffiti wall loading progress: ${percentage}% (${progress.loaded}/${progress.total} bytes)`);
			},
			(error) => {
				console.warn('Failed to load graffiti wall (this is optional):', error);
				console.warn('Error details:', {
					message: error.message,
					stack: error.stack,
					url: 'assets/graffiti-wall.glb'
				});
				console.log('Continuing without graffiti wall...');
			}
		);
	}

	findObjectByPartialName(parent, partialName) {
		let foundObject = null;
		parent.traverse((child) => {
			if (child.name && child.name.toLowerCase().includes(partialName.toLowerCase()) && !foundObject) {
				foundObject = child;
			}
		});
		return foundObject;
	}

	optimizeModel(model) {
		model.traverse((child) => {
			if (child.isMesh) {
				child.castShadow = false;
				child.receiveShadow = false;
				child.frustumCulled = true;

				if (child.material.map) {
					child.material.map.generateMipmaps = false;
					child.material.map.minFilter = THREE.LinearFilter;
					child.material.map.magFilter = THREE.LinearFilter;
				}

				child.material.needsUpdate = true;
			}
		});
	}

	applyMainLightmapToModel() {
		if (!this.model || !this.lightmapTexture) return;

		console.log('Applying main lightmap to main model...');
		let materialCount = 0;

		this.model.traverse((child) => {
			if (child.isMesh && child.material && child.geometry) {
				const materials = Array.isArray(child.material) ? child.material : [child.material];

				materials.forEach((material) => {
					if (material.isMeshStandardMaterial ||
						material.isMeshLambertMaterial ||
						material.isMeshPhongMaterial ||
						material.isMeshBasicMaterial) {

						if (!child.geometry.attributes.uv2 && child.geometry.attributes.uv) {
							child.geometry.setAttribute('uv2', child.geometry.attributes.uv);
						}

						material.lightMap = this.lightmapTexture;
						material.lightMapIntensity = 1.0;
						material.needsUpdate = true;
						materialCount++;
					}
				});
			}
		});

		console.log(`Main lightmap applied to ${materialCount} materials`);
	}

	applyGraffitiLightmapToWall() {
		if (!this.graffitiWall || !this.graffitiLightmapTexture) return;

		console.log('Applying graffiti lightmap to graffiti wall...');
		let materialCount = 0;

		this.graffitiWall.traverse((child) => {
			if (child.isMesh && child.material && child.geometry) {
				const materials = Array.isArray(child.material) ? child.material : [child.material];

				materials.forEach((material) => {
					if (material.isMeshStandardMaterial ||
						material.isMeshLambertMaterial ||
						material.isMeshPhongMaterial ||
						material.isMeshBasicMaterial) {

						if (!child.geometry.attributes.uv2 && child.geometry.attributes.uv) {
							child.geometry.setAttribute('uv2', child.geometry.attributes.uv);
						}

						material.lightMap = this.graffitiLightmapTexture;
						material.lightMapIntensity = 1.0;
						material.needsUpdate = true;
						materialCount++;
					}
				});
			}
		});

		console.log(`Graffiti lightmap applied to ${materialCount} materials`);
	}

	fitCameraToModel() {
		if (!this.model) return;

		const box = new THREE.Box3().setFromObject(this.model);
		const center = box.getCenter(new THREE.Vector3());
		const size = box.getSize(new THREE.Vector3());

		// Set controls target to model center
		this.controls.target.copy(center);

		// Position camera for a nice view
		const maxDim = Math.max(size.x, size.y, size.z);
		this.camera.position.set(
			center.x + maxDim * 0.8,
			center.y + maxDim * 0.3,
			center.z + maxDim * 0.8
		);

		this.controls.update();
	}

	handleResize() {
		const container = document.getElementById('threejs-container');
		if (!container) return;

		const width = container.clientWidth;
		const height = container.clientHeight;

		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
	}

	animate() {
		this.animationId = requestAnimationFrame(() => this.animate());

		this.controls.update();
		this.renderer.render(this.scene, this.camera);
	}

	// 7. Update dispose method to clean up DRACO loader
	dispose() {
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
		}

		// Clean up DRACO loader
		if (this.dracoLoader) {
			this.dracoLoader.dispose();
			this.dracoLoader = null;
		}

		this.gltfLoader = null;

		if (this.lightmapTexture) {
			this.lightmapTexture.dispose();
		}

		if (this.graffitiLightmapTexture) {
			this.graffitiLightmapTexture.dispose();
		}

		if (this.graffitiWall) {
			this.graffitiWall.traverse((child) => {
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

	showLoadingMessage() {
		const container = document.getElementById('threejs-container');
		const existing = document.getElementById('loading-message-simple');
		if (existing) return;

		const loadingDiv = document.createElement('div');
		loadingDiv.className = 'loading-message';
		loadingDiv.id = 'loading-message-simple';
		loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading 3D Model...</p>
        `;

		// Add styles if not present
		if (!document.querySelector('#loading-styles-simple')) {
			const styles = document.createElement('style');
			styles.id = 'loading-styles-simple';
			styles.textContent = `
                .loading-message {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    color: var(--text-color);
                    z-index: 100;
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(11, 133, 157, 0.2);
                    border-top: 4px solid #0b859d;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .error-message {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    color: var(--text-color);
                    background: var(--bg-color);
                    padding: 2rem;
                    border-radius: 8px;
                    border: 1px solid #e0e0e0;
                    max-width: 400px;
                    z-index: 100;
                }
                [data-theme="dark"] .error-message {
                    border-color: #333;
                }
            `;
			document.head.appendChild(styles);
		}

		container.appendChild(loadingDiv);
		console.log('Loading message displayed');
	}

	hideLoadingMessage() {
		const loadingMessage = document.getElementById('loading-message-simple');
		if (loadingMessage) {
			loadingMessage.remove();
			console.log('Loading message hidden');
		}
	}

	showErrorMessage(message) {
		this.hideLoadingMessage();

		const container = document.getElementById('threejs-container');
		const existing = document.getElementById('error-message-simple');
		if (existing) return;

		const errorDiv = document.createElement('div');
		errorDiv.className = 'error-message';
		errorDiv.id = 'error-message-simple';
		errorDiv.innerHTML = `
            <h3>Unable to Load 3D Model</h3>
            <p>${message}</p>
            <p style="margin-top: 1rem; font-size: 0.9rem;">Check the browser console for detailed error information.</p>
        `;
		container.appendChild(errorDiv);
		console.error('Error message displayed:', message);
	}
}

// Initialize simple viewer
let simpleViewer;

function initSimpleViewer() {
	if (simpleViewer) {
		simpleViewer.dispose();
	}
	simpleViewer = new SimpleViewer();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initSimpleViewer);
} else {
	initSimpleViewer();
}

window.addEventListener('beforeunload', () => {
	if (simpleViewer) {
		simpleViewer.dispose();
	}
});



// Export for global access if needed
window.simpleViewer = simpleViewer;