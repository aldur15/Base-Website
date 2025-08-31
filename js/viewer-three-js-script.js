import * as THREE from 'three';
import {
	GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';
import {
	OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import {
	RGBELoader
} from 'three/addons/loaders/RGBELoader.js';
import {
	DRACOLoader
} from 'three/addons/loaders/DRACOLoader.js';
import {
	paperData
} from './paperData.js';


class LoadingScreenController {
	constructor() {
		this.loadingScreen = document.getElementById('loadingScreen');
		this.progressFill = document.getElementById('progressFill');
		this.progressText = document.getElementById('progressText');

		this.stages = [
			'stage-init',
			'stage-lightmap',
			'stage-main',
			'stage-graffiti',
			'stage-optimize',
			'stage-complete'
		];

		this.currentStage = 0;
		this.progress = 0;

		// Show loading screen initially
		this.show();
	}

	show() {
		if (this.loadingScreen) {
			this.loadingScreen.classList.remove('hidden');
		}
	}

	hide() {
		if (this.loadingScreen) {
			this.loadingScreen.classList.add('hidden');
		}
	}

	updateProgress(percentage) {
		this.progress = Math.max(0, Math.min(100, percentage));
		if (this.progressFill) {
			this.progressFill.style.width = this.progress + '%';
		}
		if (this.progressText) {
			this.progressText.textContent = Math.round(this.progress) + '%';
		}
	}

	setStage(stageName, status = 'active') {
		const stageIndex = this.stages.findIndex(s => s === stageName);
		if (stageIndex === -1) return;

		this.currentStage = stageIndex;

		this.stages.forEach((stageId, index) => {
			const element = document.getElementById(stageId);
			if (!element) return;

			element.classList.remove('completed', 'active');

			if (index < stageIndex) {
				element.classList.add('completed');
			} else if (index === stageIndex) {
				element.classList.add(status);
			}
		});
	}

	completeStage(stageName) {
		const element = document.getElementById(stageName);
		if (element) {
			element.classList.remove('active');
			element.classList.add('completed');
		}
	}

	setError(message) {
		if (this.loadingScreen) {
			const container = this.loadingScreen.querySelector('.loading-container');
			container.innerHTML = `
                <div class="loading-logo">Alexander May</div>
                <div style="color: #ff6b6b; font-size: 1.2rem; margin: 2rem 0;">
                    <strong>Loading Failed</strong>
                </div>
                <div style="color: rgba(255, 255, 255, 0.9); margin-bottom: 2rem;">
                    ${message}
                </div>
                <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">
                    Please refresh the page to try again.
                </div>
            `;
		}
	}
}
class OptimizedViewer {
	constructor() {
		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.controls = null;
		this.model = null;
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
		this.dracoLoader = null;
		this.gltfLoader = null;
		this.loadingController = new LoadingScreenController();

		// Render optimization
		this.needsRender = true;
		this.isLoading = false;
		this.animationId = null;
		this.lastInteraction = Date.now();
		this.lastFrameTime = 0;
		this.isInteracting = false;

		// Lightmap properties
		this.lightmapTexture = null;
		this.graffitiLightmapTexture = null;
		this.isLoadingLightmap = false;
		this.graffitiWall = null;
		this.isLoadingGraffitiWall = false;

		//dark mode for background
		this.isDarkMode = false;
		this.lightModeColor = new THREE.Color(0x0b859d);
		this.darkModeColor = new THREE.Color(0x000000);

		// Fan animation system
		this.fanObjects = new Map();

		// Background light system
		this.backgroundLight = {
			mesh: null,
			material: null,
			enabled: true,
			intensity: 0.25,
			color: new THREE.Color(0x6ba3f5),
			speed: 0.8,
			scale: 1.2
		};

		// Configuration
		this.config = {
			maxPixelRatio: Math.min(window.devicePixelRatio, 2),
			shadowMapSize: 512,
			interactionTimeout: 10000
		};

		this.cameraTargets = {
			'nav-about': {
				position: new THREE.Vector3(-1, -4, 20),
				lookAt: new THREE.Vector3(0, 1.5, 0)
			},
			'nav-projects': {
				position: new THREE.Vector3(5, 32, 10),
				lookAt: new THREE.Vector3(0, 1.5, 0)
			},
			'nav-research': {
				position: new THREE.Vector3(20, -5, -19.01),
				lookAt: new THREE.Vector3(0, 1.5, 0)
			},
			'nav-contact': {
				position: new THREE.Vector3(-13.5, -4.18, 6.01),
				lookAt: new THREE.Vector3(0, 1.5, 0)
			},
			blackboard: {
				position: new THREE.Vector3(14.85, -4.14, 6.68),
				lookAt: new THREE.Vector3(0, 1.5, 0)
			}
		};

		this.mobileCameraTargets = {
			'nav-about': {
				position: new THREE.Vector3(-2, -3, 18),
				lookAt: new THREE.Vector3(-2.5, -7 ,-11)
			},
			'nav-projects': {
				position: new THREE.Vector3(8, 28, 15),
				lookAt: new THREE.Vector3(0, 1.5, 0)
			},
			'nav-research': {
				position: new THREE.Vector3(15.3, -5, -15),
				lookAt: new THREE.Vector3(5, -4, -2)
			},
			'nav-contact': {
				position: new THREE.Vector3(-14, -3, 5),
				lookAt: new THREE.Vector3(0, 0, 6)
			},
			blackboard: {
				position: new THREE.Vector3(16, -4,11),
				lookAt: new THREE.Vector3(0, 1.5, 2)
			}
		};

		this.collisionObjects = new Map();

		this.init();
	}

	async init() {
		const container = document.getElementById('threejs-container');
		if (!container) {
			console.error('Three.js container not found');
			this.loadingController.setError('Three.js container not found');
			return;
		}

		try {
			// Stage 1: Initialize Scene
			this.loadingController.setStage('stage-init', 'active');
			this.loadingController.updateProgress(5);

			this.setupScene();
			this.setupCamera(container);
			this.setupRenderer(container);
			this.setupControls();
			this.setupEventListeners();
			this.setupDarkModeDetection();
			this.setupDracoLoader();
			this.setupBackgroundLight();

			this.loadingController.completeStage('stage-init');
			this.loadingController.updateProgress(15);

			// Start animation loop
			this.animate();

			// Stage 2: Load Lightmaps
			this.loadingController.setStage('stage-lightmap', 'active');
			await this.loadLightmap();
			this.loadingController.completeStage('stage-lightmap');
			this.loadingController.updateProgress(35);

			// Stage 3: Load Main Model
			this.loadingController.setStage('stage-main', 'active');
			await this.loadModel();
			this.loadingController.completeStage('stage-main');
			this.loadingController.updateProgress(70);

			// Stage 4: Load Graffiti Wall (handled in loadModel)
			this.loadingController.setStage('stage-graffiti', 'active');
			// The graffiti wall loading is handled in loadModel method
			this.loadingController.completeStage('stage-graffiti');
			this.loadingController.updateProgress(85);

			// Stage 5: Optimize
			this.loadingController.setStage('stage-optimize', 'active');
			// Add any final optimizations here
			await this.finalizeLoading();
			this.loadingController.completeStage('stage-optimize');
			this.loadingController.updateProgress(95);

			// Stage 6: Complete
			this.loadingController.setStage('stage-complete', 'active');
			this.loadingController.updateProgress(100);

			// Focus on blackboard after a brief delay
			setTimeout(() => {
				this.focusOnBlackboardCamera();
				this.loadingController.completeStage('stage-complete');

				// Hide loading screen
				setTimeout(() => {
					this.loadingController.hide();
				}, 800);
			}, 500);

		} catch (error) {
			console.error('Error initializing Three.js:', error);
			this.loadingController.setError('Failed to initialize 3D viewer. Please check your connection and refresh the page.');
		}
	}

	async finalizeLoading() {
		return new Promise((resolve) => {
			// Add any final setup here
			setTimeout(() => {
				// Hide placeholder if it exists
				const placeholder = document.querySelector('.placeholder-3d');
				if (placeholder) {
					placeholder.style.display = 'none';
				}
				resolve();
			}, 200);
		});
	}

	isMobileDevice() {
		return window.innerWidth <= 768 ||
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}




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

		console.log('DRACO loader initialized');
	}


	//Dark Mode background listener
	setupDarkModeDetection() {
		// Check initial dark mode state
		this.updateDarkModeState();

		// Listen for your custom dark mode toggle event
		document.addEventListener('darkModeToggle', () => {
			this.updateDarkModeState();
		});

		// Also observe data-theme changes on body
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

		// Check if body has data-theme="dark"
		this.isDarkMode = document.body.getAttribute('data-theme') === 'dark';

		// Update background if dark mode state changed
		if (wasDarkMode !== this.isDarkMode) {
			this.updateSceneBackground();
		}
	}

	updateSceneBackground() {
		if (!this.scene) return;

		const targetColor = this.isDarkMode ? this.darkModeColor : this.lightModeColor;

		console.log(`Switching to ${this.isDarkMode ? 'dark' : 'light'} mode background`);

		// Smooth transition between colors
		const currentColor = this.scene.background;
		if (currentColor && currentColor.isColor) {
			this.animateColorTransition(currentColor, targetColor, 800);
		} else {
			this.scene.background = targetColor.clone();
			this.needsRender = true;
		}
	}

	animateColorTransition(fromColor, toColor, duration = 800) {
		const startTime = performance.now();
		const startColor = fromColor.clone();

		const animate = (currentTime) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const easedProgress = this.easeInOut(progress);

			const currentColor = startColor.clone().lerp(toColor, easedProgress);
			this.scene.background = currentColor;
			this.needsRender = true;

			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		};

		requestAnimationFrame(animate);
	}

	setupBackgroundLight() {
		if (!this.backgroundLight.enabled) return;

		console.log('Setting up background light effect...');

		const geometry = new THREE.SphereGeometry(80, 32, 16);

		const material = new THREE.ShaderMaterial({
			uniforms: {
				time: {
					value: 0
				},
				intensity: {
					value: this.backgroundLight.intensity
				},
				color: {
					value: this.backgroundLight.color
				},
				scale: {
					value: this.backgroundLight.scale
				}
			},
			vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
			fragmentShader: `
                uniform float time;
                uniform float intensity;
                uniform vec3 color;
                uniform float scale;
                
                varying vec2 vUv;
                varying vec3 vPosition;
                
                float noise(vec3 pos) {
                    return fract(sin(dot(pos, vec3(12.9898, 78.233, 54.53))) * 43758.5453);
                }
                
                void main() {
                    vec3 pos = vPosition * scale;
                    float n1 = noise(pos + time * 0.1);
                    float n2 = noise(pos * 2.0 + time * 0.15);
                    float n3 = noise(pos * 0.5 + time * 0.05);
                    
                    float pattern = (n1 + n2 * 0.5 + n3 * 0.3) / 1.8;
                    
                    float dist = length(vUv - 0.5);
                    float radial = 1.0 - smoothstep(0.3, 0.8, dist);
                    
                    float animatedIntensity = intensity * (0.8 + 0.4 * sin(time * 0.3));
                    
                    float alpha = pattern * radial * animatedIntensity;
                    gl_FragColor = vec4(color, alpha);
                }
            `,
			transparent: true,
			side: THREE.BackSide,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
			depthTest: false
		});

		this.backgroundLight.mesh = new THREE.Mesh(geometry, material);
		this.backgroundLight.material = material;

		this.backgroundLight.mesh.position.set(0, 0, 0);
		this.backgroundLight.mesh.renderOrder = -1000;

		this.scene.add(this.backgroundLight.mesh);

		console.log('Background light effect created');
	}

	updateBackgroundLight(time) {
		if (!this.backgroundLight.mesh || !this.backgroundLight.enabled) return;

		this.backgroundLight.material.uniforms.time.value = time * 0.001 * this.backgroundLight.speed;

		this.backgroundLight.mesh.rotation.y = time * 0.00005;
		this.backgroundLight.mesh.rotation.x = Math.sin(time * 0.00003) * 0.1;

		this.needsRender = true;
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

	async loadLightmap() {
		if (this.isLoadingLightmap || (this.lightmapTexture && this.graffitiLightmapTexture)) return;

		this.isLoadingLightmap = true;
		console.log('Loading lightmaps...');

		const loader = new RGBELoader();

		try {
			// Load main lightmap
			const mainTexture = await new Promise((resolve, reject) => {
				loader.load('assets/lightmap.hdr', resolve, (progress) => {
					// Update progress during lightmap loading
					const progressPercent = 20 + (progress.loaded / progress.total) * 10;
					this.loadingController.updateProgress(progressPercent);
				}, reject);
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
				loader.load('assets/graffiti_lightmap.hdr', resolve, (progress) => {
					const progressPercent = 30 + (progress.loaded / progress.total) * 5;
					this.loadingController.updateProgress(progressPercent);
				}, reject);
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

			if (this.model) {
				this.applyLightmapsToModel();
			}

		} catch (error) {
			console.error('Failed to load lightmaps:', error);
			this.setupFallbackLighting();
		} finally {
			this.isLoadingLightmap = false;
		}
	}

	applyLightmapsToModel() {
		if (!this.model) return;

		console.log('Applying lightmaps to model...');
		let mainMaterialCount = 0;
		let graffitiMaterialCount = 0;

		this.model.traverse((child) => {
			if (child.isMesh && child.material && child.geometry) {
				const materials = Array.isArray(child.material) ? child.material : [child.material];

				const isGraffitiWall = child.name && (
					child.name.toLowerCase().includes('graffiti') ||
					child.name.toLowerCase() === 'graffiti-wall' ||
					child.name.toLowerCase() === 'graffitiwall' ||
					child.name.toLowerCase().includes('graffiti_wall')
				);

				console.log(`Processing object: ${child.name}, isGraffitiWall: ${isGraffitiWall}`);

				materials.forEach((material) => {
					if (material.isMeshStandardMaterial ||
						material.isMeshLambertMaterial ||
						material.isMeshPhongMaterial ||
						material.isMeshBasicMaterial) {

						if (!child.geometry.attributes.uv2) {
							if (child.geometry.attributes.uv) {
								child.geometry.setAttribute('uv2', child.geometry.attributes.uv);
							} else {
								console.warn(`No UV coordinates found for object: ${child.name}`);
								return;
							}
						}

						if (isGraffitiWall && this.graffitiLightmapTexture) {
							material.lightMap = this.graffitiLightmapTexture;
							material.lightMapIntensity = 1.0;
							material.needsUpdate = true;
							graffitiMaterialCount++;
							console.log(`✓ Applied graffiti lightmap to: ${child.name}`);
						} else if (!isGraffitiWall && this.lightmapTexture) {
							material.lightMap = this.lightmapTexture;
							material.lightMapIntensity = 1.0;
							material.needsUpdate = true;
							mainMaterialCount++;
							console.log(`✓ Applied main lightmap to: ${child.name}`);
						} else {
							console.warn(`No appropriate lightmap found for: ${child.name}, isGraffitiWall: ${isGraffitiWall}`);
						}
					}
				});
			}
		});

		console.log(`Main lightmap applied to ${mainMaterialCount} materials`);
		console.log(`Graffiti lightmap applied to ${graffitiMaterialCount} materials`);

		if (mainMaterialCount === 0 && graffitiMaterialCount === 0) {
			console.warn('No materials received lightmaps - check object names and material types');
		}

		this.needsRender = true;
	}

	// Apply main lightmap only to main model
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
		this.needsRender = true;
	}

	// Apply graffiti lightmap only to graffiti wall
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
		this.needsRender = true;
	}

	setupFanAnimations() {
		if (!this.model) return;

		console.log('Setting up fan animations...');
		let fanCount = 0;

		this.fanObjects.clear();

		this.model.traverse((child) => {
			const name = child.name ? child.name.toLowerCase() : '';

			const isFan = name.includes('fan') &&
				!name.includes('_pivot') &&
				!name.includes('pivot') &&
				child.isMesh;

			if (isFan) {
				console.log(`Found potential fan object: "${child.name}"`);
				console.log(`  - Type: ${child.type}`);
				console.log(`  - Position:`, child.position);
				console.log(`  - Parent:`, child.parent?.name || 'Scene');

				let settings = {
					axis: 'x',
					speed: 3,
					direction: 1
				};

				if (name.includes('ceiling')) {
					settings = {
						axis: 'y',
						speed: 4,
						direction: 1
					};
				} else if (name.includes('wall') || name.includes('side')) {
					settings = {
						axis: 'z',
						speed: 5,
						direction: -1
					};
				}

				this.addFanAnimation(child, settings);
				fanCount++;
			}
		});

		console.log(`Set up ${fanCount} fans for animation`);

		this.fanObjects.forEach((fanData, fanName) => {
			console.log(`Fan "${fanName}" configured:`, fanData.settings);
		});
	}

	addFanAnimation(fanObject, settings = {}) {
		const defaultSettings = {
			axis: 'y',
			speed: 3,
			direction: 1,
			enabled: true
		};

		const fanSettings = {
			...defaultSettings,
			...settings
		};

		console.log(`Adding fan animation for: ${fanObject.name}`);
		console.log(`  Settings:`, fanSettings);

		if (!fanObject.userData.pivotGroup) {
			const originalParent = fanObject.parent;
			const pivotGroup = new THREE.Group();
			pivotGroup.name = fanObject.name + '_pivot';

			const originalPosition = fanObject.position.clone();
			const originalRotation = fanObject.rotation.clone();

			pivotGroup.position.copy(originalPosition);
			pivotGroup.rotation.copy(originalRotation);

			originalParent.add(pivotGroup);
			originalParent.remove(fanObject);

			fanObject.position.set(0, 0, 0);
			fanObject.rotation.set(0, 0, 0);
			pivotGroup.add(fanObject);

			fanObject.userData.pivotGroup = pivotGroup;

			console.log(`  ✓ Created pivot group for ${fanObject.name}`);
		}

		this.fanObjects.set(fanObject.name, {
			object: fanObject,
			pivotGroup: fanObject.userData.pivotGroup,
			settings: fanSettings,
			lastTime: performance.now()
		});

		console.log(`  ✓ Fan ${fanObject.name} added to animation system`);
	}

	setupFallbackLighting() {
		console.log('Setting up fallback lighting');
		const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
		this.scene.add(ambientLight);
	}

	setupLampionGlow() {
		if (!this.model) return;
		console.log('Setting up lampion glow effects...');

		let setOff = 0;
		this.model.traverse((child) => {
			if (child.name && child.name.toLowerCase().includes('lampion-')) {
				const pointLight = new THREE.PointLight(0xa42d21, 20, 10);
				pointLight.position.set(10.5, -0.5, 7.2 - setOff);
				pointLight.castShadow = false;
				this.scene.add(pointLight);

				child.userData.pointLight = pointLight;
				child.castShadow = false;
				child.receiveShadow = false;

				setOff += 2.75;
			}
		});
	}

	setupBlackBoardLight() {
		let setOff = 0;
		for (let i = 0; i < 3; i++) {
			const spotLight = new THREE.SpotLight(0xffc200, 200, 8, 0.18, 0.1, 0);
			spotLight.position.set(8.2, 0.7, 6.72 - setOff);

			const debugCube = new THREE.Mesh(
				new THREE.BoxGeometry(0.2, 0.2, 0.2),
				new THREE.MeshBasicMaterial({
					color: 0x00ff00
				})
			);
			debugCube.position.set(7.5, -9, 6.72 - setOff);
			debugCube.visible = false;

			spotLight.target = debugCube;
			spotLight.castShadow = false;

			this.scene.add(spotLight);
			this.scene.add(debugCube);

			setOff += 0.9;
		}
	}

	setupAutoCollisionObjects() {
		if (!this.model) return;

		console.log('Setting up auto-collision objects...');

		const collisionPatterns = [
			'collision-', 'click-', 'button-', 'nav-', 'interact-', 'trigger-'
		];

		this.model.traverse((child) => {
			if (child.isMesh && child.name) {
				const name = child.name.toLowerCase();
				const isCollisionObject = collisionPatterns.some(pattern =>
					name.startsWith(pattern.toLowerCase())
				);

				if (isCollisionObject) {
					this.makeInvisibleCollision(child);
					this.collisionObjects.set(child.name, child);
				}
			}
		});

		console.log(`Set up ${this.collisionObjects.size} collision objects`);
	}

	makeInvisibleCollision(object) {
		object.userData.originalMaterial = object.material;

		const invisibleMaterial = new THREE.MeshBasicMaterial({
			transparent: true,
			opacity: 0,
			alphaTest: 0.01,
			side: THREE.DoubleSide
		});

		object.material = invisibleMaterial;
		object.userData.isCollision = true;
		object.userData.clickable = true;
		object.raycast = THREE.Mesh.prototype.raycast;
	}

	createPaperOverlay(paperName) {
		const paperInfo = paperData[paperName]; // Use imported paperData instead of this.paperData
		if (!paperInfo) return;

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

		document.body.appendChild(overlay);

		const closeBtn = overlay.querySelector('.close-paper');
		closeBtn.addEventListener('click', () => {
			this.closePaperOverlay(overlay);
		});

		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) {
				this.closePaperOverlay(overlay);
			}
		});

		const escapeHandler = (e) => {
			if (e.key === 'Escape') {
				this.closePaperOverlay(overlay);
				document.removeEventListener('keydown', escapeHandler);
			}
		};
		document.addEventListener('keydown', escapeHandler);

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
		this.scene.background = this.lightModeColor.clone(); // CHANGE THIS LINE
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
		this.camera.matrixAutoUpdate = true;
	}

	setupRenderer(container) {
		this.renderer = new THREE.WebGLRenderer({
			antialias: window.devicePixelRatio <= 1,
			powerPreference: "high-performance",
			stencil: false,
			depth: true,
			alpha: false,
			preserveDrawingBuffer: false,
			failIfMajorPerformanceCaveat: false
		});

		this.renderer.setSize(container.clientWidth, container.clientHeight);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		this.renderer.shadowMap.enabled = false;
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.0;
		this.renderer.sortObjects = true;
		this.renderer.setViewport(0, 0, container.clientWidth, container.clientHeight);

		const placeholder = container.querySelector('.placeholder-3d');
		if (placeholder) placeholder.style.display = 'none';
		container.appendChild(this.renderer.domElement);
	}

	focusOnBlackboardCamera() {
		const targets = this.isMobileDevice() ? this.mobileCameraTargets : this.cameraTargets;
		const blackboardTarget = targets.blackboard;

		if (!blackboardTarget) return;

		this.focusCameraTo({
			...blackboardTarget,
			duration: 2.5
		});

		this.closeBackdoor?.();
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
		this.controls.autoRotate = false;
		this.controls.autoRotateSpeed = 0.5;
		this.controls.hasChanged = false;

		this.controls.addEventListener('change', () => {
			this.needsRender = true;
			this.lastInteraction = performance.now();
			this.controls.hasChanged = true;
		});

		this.controls.addEventListener('start', () => {
			this.lastInteraction = performance.now();
			this.isInteracting = true;
		});

		this.controls.addEventListener('end', () => {
			this.lastInteraction = performance.now();
			this.isInteracting = false;
			setTimeout(() => {
				this.needsRender = true;
			}, 16);
		});
	}

	setupEventListeners() {
		this.renderer.domElement.addEventListener('click', (event) => {
			this.handleClick(event);
		});

		let resizeTimeout;
		window.addEventListener('resize', () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				this.handleResize();
			}, 100);
		});

		document.addEventListener('visibilitychange', () => {
			if (document.hidden) {
				this.pauseRendering();
			} else {
				this.resumeRendering();
			}
		});
	}

	async loadModel() {
		if (this.isLoading) return;
		this.isLoading = true;

		try {
			// Load main model
			const mainGltf = await this.loadGLTF('assets/coffeeshop.glb');
			await this.handleMainModelLoad(mainGltf);
			this.loadingController.updateProgress(60);

			// Load graffiti wall
			this.loadingController.setStage('stage-graffiti', 'active');
			await this.loadGraffitiWall();
			this.loadingController.updateProgress(75);

		} catch (error) {
			console.error('Failed to load models:', error);
			this.loadingController.setError('Failed to load 3D models. Please check your connection and refresh the page.');
			throw error;
		} finally {
			this.isLoading = false;
		}
	}

	loadGLTF(url) {
		return new Promise((resolve, reject) => {
			this.gltfLoader.load(
				url,
				resolve,
				(progress) => {
					if (progress.lengthComputable) {
						const percentComplete = (progress.loaded / progress.total) * 100;
						console.log(`Loading ${url}: ${percentComplete.toFixed(1)}%`);

						// Update progress based on which model is loading
						let baseProgress = 35;
						let progressRange = 25;

						if (url.includes('graffiti')) {
							baseProgress = 65;
							progressRange = 10;
						}

						const currentProgress = baseProgress + (percentComplete / 100) * progressRange;
						this.loadingController.updateProgress(currentProgress);
					}
				},
				reject
			);
		});
	}


	async handleMainModelLoad(gltf) {
		this.model = gltf.scene;

		const graffitiWallInMain = this.model.getObjectByName('graffiti-wall') ||
			this.model.getObjectByName('graffitiwall') ||
			this.findObjectByPartialName(this.model, 'graffiti');

		if (graffitiWallInMain) {
			console.log('Removing graffiti wall from main model');
			graffitiWallInMain.parent.remove(graffitiWallInMain);
		}

		const box = new THREE.Box3().setFromObject(this.model);
		const center = box.getCenter(new THREE.Vector3());
		this.model.position.sub(center);

		const buildingCenter = new THREE.Vector3(0, 0, 0);
		this.controls.target.copy(buildingCenter);
		this.controls.update();

		this.optimizeModel(this.model);
		this.scene.add(this.model);

		this.setupAutoCollisionObjects();
		this.setupFanAnimations();

		// Apply main lightmap to main model
		this.applyMainLightmapToModel();

		this.setupLampionGlow();
		this.setupBlackBoardLight();
		this.fitCameraToModel();

		console.log('Main model loaded successfully');
	}

	async loadGraffitiWall() {
		if (this.isLoadingGraffitiWall) return;
		this.isLoadingGraffitiWall = true;

		try {
			const graffitiGltf = await this.loadGLTF('assets/graffiti-wall.glb');

			this.graffitiWall = graffitiGltf.scene;

			this.graffitiWall.position.set(0, 0, 0);
			this.graffitiWall.rotation.set(0, 0, 0);
			this.graffitiWall.scale.set(1, 1, 1);

			this.optimizeModel(this.graffitiWall);
			this.scene.add(this.graffitiWall);

			this.applyGraffitiLightmapToWall();

			console.log('Graffiti wall loaded and positioned successfully');

		} catch (error) {
			console.warn('Failed to load separate graffiti wall:', error);
		}

		this.isLoadingGraffitiWall = false;
	}

	optimizeModel(model) {
		let meshCount = 0;

		model.traverse((child) => {
			if (child.isMesh) {
				meshCount++;

				child.castShadow = false;
				child.receiveShadow = false;

				if (child.material.map) {
					child.material.map.generateMipmaps = false;
					child.material.map.minFilter = THREE.LinearFilter;
					child.material.map.magFilter = THREE.LinearFilter;
				}

				child.material.transparent = child.material.transparent || false;
				child.material.alphaTest = child.material.alphaTest || 0;
				child.material.needsUpdate = true;

				if (child.geometry) {
					if (!child.geometry.boundingSphere) {
						child.geometry.computeBoundingSphere();
					}
				}

				child.frustumCulled = true;
			}
		});

		console.log(`Model optimized: ${meshCount} meshes`);
	}

	fitCameraToModel() {
		const box = new THREE.Box3().setFromObject(this.model);
		const center = box.getCenter(new THREE.Vector3());
		this.model.position.sub(center);

		const buildingCenter = new THREE.Vector3(0, 0, 0);
		this.controls.target.copy(buildingCenter);
		this.controls.update();
	}

	handleClick(event) {
		if (!this.model) return;

		const bounds = this.renderer.domElement.getBoundingClientRect();
		this.mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
		this.mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

		this.raycaster.setFromCamera(this.mouse, this.camera);

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

			console.log('Clicked object:', name);
			this.handleClickByName(name, clickedObject);
		}
	}

	handleClickByName(name, clickedObject) {
		if (!name) return false;

		const lowerName = name.toLowerCase();

		if (lowerName.startsWith('nav-')) {
			if (lowerName.startsWith('nav-blackboard')) {
				this.focusOnBlackboardCamera();
			} else {
				this.handleNavigation(name);
			}
			return true;
		}

		if (lowerName.startsWith('paper_')) {
			console.log('Paper clicked:', name);
			this.createPaperOverlay(name);
			return true;
		}

		if (lowerName.startsWith('collision-') ||
			lowerName.startsWith('click-') ||
			lowerName.startsWith('button-') ||
			lowerName.startsWith('interact-') ||
			lowerName.startsWith('trigger-')) {
			console.log('Interactive object clicked:', name);
			return true;
		}

		return false;
	}

	handleNavigation(name) {
		const targets = this.isMobileDevice() ? this.mobileCameraTargets : this.cameraTargets;
		const target = targets[name];

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

	focusCameraTo({
		position,
		lookAt,
		duration = 2.0
	}) {
		const startPos = this.camera.position.clone();
		const startLookAt = this.controls.target.clone();
		const targetLookAt = lookAt || new THREE.Vector3(0, 1.5, 0);

		const startTime = performance.now();
		const totalTime = duration * 1000;

		const animate = (now) => {
			const elapsed = now - startTime;
			const t = Math.min(elapsed / totalTime, 1);
			const easedT = this.easeInOut(t);

			const newPos = startPos.clone().lerp(position, easedT);
			this.camera.position.copy(newPos);

			const newLookAt = startLookAt.clone().lerp(targetLookAt, easedT);
			this.camera.lookAt(newLookAt);
			this.controls.target.copy(newLookAt);
			this.controls.update();

			this.needsRender = true;

			if (t < 1) {
				requestAnimationFrame(animate);
			}
		};

		requestAnimationFrame(animate);
	}

	easeInOut(t) {
		return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
	}

	showBackButton() {
		const btn = document.getElementById('back-to-blackboard');
		if (btn) {
			btn.style.display = 'block';
		}
	}

	openBackdoor() {
		const door = this.model?.getObjectByName('Backdoor');
		if (!door) return;

		door.rotation.y = 0;
		door.updateMatrixWorld();

		const startTime = performance.now();
		const duration = 1200;
		const targetRotation = -Math.PI / 2;

		const animate = (now) => {
			const elapsed = now - startTime;
			const t = Math.min(elapsed / duration, 1);
			const easedT = this.easeInOut(t);

			door.rotation.y = targetRotation * easedT;
			door.updateMatrixWorld();
			this.needsRender = true;

			if (t < 1) {
				requestAnimationFrame(animate);
			}
		};

		requestAnimationFrame(animate);
	}

	closeBackdoor() {
		const door = this.model?.getObjectByName('Backdoor');
		if (!door) return;

		const startTime = performance.now();
		const duration = 4200;
		const startRotation = door.rotation.y;

		const animate = (now) => {
			const elapsed = now - startTime;
			const t = Math.min(elapsed / duration, 1);
			const easedT = this.easeInOut(t);

			door.rotation.y = startRotation * (1 - easedT);
			door.updateMatrixWorld();
			this.needsRender = true;

			if (t < 1) {
				requestAnimationFrame(animate);
			}
		};

		requestAnimationFrame(animate);
	}

	handleResize() {
		const container = document.getElementById('threejs-container');
		if (!container) return;

		const width = container.clientWidth;
		const height = container.clientHeight;

		if (this.renderer.domElement.width !== width || this.renderer.domElement.height !== height) {
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(width, height);
			this.needsRender = true;
		}
	}

	updateFanAnimations(currentTime) {
		if (this.fanObjects.size === 0) return;

		let hasActiveFans = false;

		this.fanObjects.forEach((fanData, fanName) => {
			if (!fanData.settings.enabled) return;

			const deltaTime = (currentTime - fanData.lastTime) / 1000;

			if (deltaTime > 0.1) {
				fanData.lastTime = currentTime;
				return;
			}

			const rotationAmount = fanData.settings.speed * fanData.settings.direction * deltaTime;

			const pivotGroup = fanData.pivotGroup;
			if (pivotGroup) {
				switch (fanData.settings.axis.toLowerCase()) {
					case 'x':
						pivotGroup.rotation.x += rotationAmount;
						break;
					case 'y':
						pivotGroup.rotation.y += rotationAmount;
						break;
					case 'z':
						pivotGroup.rotation.z += rotationAmount;
						break;
				}
				hasActiveFans = true;
			} else {
				console.warn(`No pivot group found for fan: ${fanName}`);
			}

			fanData.lastTime = currentTime;
		});

		if (hasActiveFans) {
			this.needsRender = true;
		}
	}

	animate() {
		this.animationId = requestAnimationFrame(() => this.animate());

		const currentTime = performance.now();
		const isInteracting = (currentTime - this.lastInteraction) < 100;
		const needsUpdate = this.needsRender || isInteracting || this.controls.autoRotate;

		this.updateFanAnimations(currentTime);
		this.updateBackgroundLight(currentTime);

		if (needsUpdate) {
			this.controls.update();

			if (this.needsRender || this.controls.hasChanged) {
				this.renderer.render(this.scene, this.camera);
				this.needsRender = false;
				this.controls.hasChanged = false;
			}
		}

		this.lastFrameTime = currentTime;
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



	showErrorMessage(message) {
		if (this.loadingController) {
			this.loadingController.setError(message);
		} else {
			// Fallback for cases where loading controller isn't available
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
	}

	setBackgroundLightColor(color) {
		if (this.backgroundLight.material) {
			this.backgroundLight.color.set(color);
			this.backgroundLight.material.uniforms.color.value = this.backgroundLight.color;
			this.needsRender = true;
		}
	}

	setBackgroundLightIntensity(intensity) {
		this.backgroundLight.intensity = intensity;
		if (this.backgroundLight.material) {
			this.backgroundLight.material.uniforms.intensity.value = intensity;
			this.needsRender = true;
		}
	}

	toggleBackgroundLight() {
		this.backgroundLight.enabled = !this.backgroundLight.enabled;
		if (this.backgroundLight.mesh) {
			this.backgroundLight.mesh.visible = this.backgroundLight.enabled;
			this.needsRender = true;
		}
	}

	dispose() {
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
		}

		// Hide loading screen if it's still visible
		if (this.loadingController) {
			this.loadingController.hide();
			this.loadingController = null;
		}

		// Clean up DRACO loader
		if (this.dracoLoader) {
			this.dracoLoader.dispose();
			this.dracoLoader = null;
		}

		this.gltfLoader = null;

		// ... rest of existing dispose method ...

		if (this.backgroundLight.mesh) {
			this.backgroundLight.mesh.geometry.dispose();
			this.backgroundLight.material.dispose();
			this.scene.remove(this.backgroundLight.mesh);
		}

		if (this.lightmapTexture) {
			this.lightmapTexture.dispose();
			this.lightmapTexture = null;
		}

		if (this.graffitiLightmapTexture) {
			this.graffitiLightmapTexture.dispose();
			this.graffitiLightmapTexture = null;
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
			this.scene.remove(this.graffitiWall);
			this.graffitiWall = null;
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

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initViewer);
} else {
	initViewer();
}

window.addEventListener('beforeunload', () => {
	if (viewer) {
		viewer.dispose();
	}
});




window.viewer = viewer;