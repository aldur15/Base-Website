import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

class OptimizedViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Render optimization
        this.needsRender = true;
        this.isLoading = false;
        this.animationId = null;
        this.lastInteraction = Date.now();
        this.lastFrameTime = 0;
        this.isInteracting = false;

        // Add lightmap properties
        this.lightmapTexture = null;
    this.graffitiLightmapTexture = null; // New property for graffiti wall
    this.isLoadingLightmap = false;
    this.graffitiWall = null; // Store separate graffiti wall object
    this.isLoadingGraffitiWall = false;
        
        // Configuration
        this.config = {
            maxPixelRatio: Math.min(window.devicePixelRatio, 2),
            shadowMapSize: 512,
            interactionTimeout: 10000 // 10 seconds
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

        this.paperData = {
            'paper_1': {
    title: 'The Influence of Persona and Conversational Task on Social Interactions with a LLM-Controlled Embodied Conversational Agent',
    content: `
        <h2>Abstract</h2>
        <p>
            Large Language Models (LLMs) can be embodied as virtual humans in Virtual Reality (VR), 
            enabling naturalistic face-to-face interactions. This study investigated how an agent’s 
            persona (extraverted vs. introverted) and conversational tasks (small talk, knowledge 
            test, convincing) affect social evaluation, emotional experience, realism, and behavioral 
            engagement. Forty-six participants interacted with an LLM-controlled virtual agent in VR. 
            Results showed that the extraverted agent was rated as more likable, realistic, and 
            engaging, and elicited a more pleasant experience compared to the introverted agent. 
            While persona influenced evaluations and engagement, conversational tasks modulated 
            arousal, realism, and social presence. Findings demonstrate that personality prompts in 
            LLM-controlled agents strongly shape user experience and behavior in immersive social 
            interactions.
        </p>

        <h2>Introduction</h2>
        <p>
            Advances in LLMs have transformed conversational AI, allowing dynamic and context-sensitive 
            interactions. When combined with embodied conversational agents (ECAs) in VR, they enable 
            multimodal, face-to-face encounters. Social interactions are influenced by both the 
            personality of agents and the conversational context. Drawing on the CASA framework, users 
            are expected to evaluate and respond to virtual agents similarly to humans. Previous 
            research has shown that personality traits such as extraversion impact perceived social 
            presence and likability in chat-based systems. This study aimed to examine how persona and 
            conversational task jointly influence evaluation, emotional experience, and interactive 
            behavior in LLM-driven VR interactions.
        </p>

        <h2>Methodology</h2>
        <p>
            Forty-six participants (mean age 21.2 years) engaged in three VR-based conversational tasks 
            with a male virtual agent: small talk, a knowledge test, and a convincing task. The agent’s 
            persona was manipulated via LLM prompts to be either extraverted or introverted. 
            Conversations were conducted in VR using Unreal Engine with real-time speech-to-text and 
            text-to-speech pipelines. Dependent measures included self-reported ratings of sympathy, 
            valence, arousal, closeness, realism, and social presence, as well as behavioral metrics 
            such as number of words, turns, and requests for help during the knowledge test. Data were 
            analyzed using mixed ANOVAs.
        </p>

        <h2>Results</h2>
        <p>
            The extraverted persona was consistently rated as more sympathetic and pleasant, and 
            participants engaged in longer and more interactive conversations. Arousal was primarily 
            driven by task, with knowledge test and convincing tasks rated as more arousing than small 
            talk. Realism ratings were influenced by persona in the convincing task, where extraverted 
            agents appeared more realistic. Social presence was strongest in small talk. In the 
            knowledge test, participants were more confident in their answers when assisted by the 
            agent, though persona did not affect willingness to seek help. Overall, persona shaped 
            social evaluation and engagement, while task modulated arousal and realism.
        </p>

        <h2>Discussion</h2>
        <p>
            Findings demonstrate that persona cues in LLM-controlled ECAs significantly affect user 
            experience in immersive VR interactions. Extraverted agents elicited more positive 
            evaluations and behavioral engagement, mirroring real-world social dynamics. Task demands 
            influenced arousal, realism, and confidence, with knowledge-based tasks rated as especially 
            engaging. These results support the CASA framework by showing that users apply social 
            evaluation processes to LLM-driven agents, treating them similarly to human partners. 
            Implications include applications in education, training, and healthcare, where tailoring 
            agent personality and conversational style may enhance engagement and outcomes. Future 
            research should investigate long-term interactions, incorporate multimodal nonverbal cues, 
            and assess individual differences in user responses.
        </p>
    `
}
,
            'paper_2': {
    title: 'Affective Interactions with AI-Controlled Conversational Agents in Virtual Reality',
    content: `
        <h2>Abstract</h2>
        <p>
            The exchange of affective information lies at the core of social interactions. 
            Embodied conversational agents (ECAs) in Virtual Reality (VR) enable naturalistic 
            verbal exchanges with AI-controlled partners. We evaluated a paradigm where ECAs 
            conveyed affective information in conversations about emotional life events. 
            Data from 46 human–AI interactions showed that agents successfully generated 
            context-specific affective content (happy, angry, sad). Target emotions appeared 
            most strongly at the beginning of conversations but decreased over turns. Findings 
            indicate that AI-controlled ECAs are a promising tool for simulating naturalistic, 
            affective dialogue.
        </p>

        <h2>Introduction</h2>
        <p>
            Social interaction relies on verbal and nonverbal cues to infer intentions and 
            emotional states. While earlier research focused mainly on nonverbal expressions, 
            verbal affective information remains less explored in controlled experimental 
            settings. Large Language Models (LLMs) can provide adaptive and empathetic 
            conversational responses. Combining LLMs with ECAs in VR creates opportunities 
            for interactive, multimodal exchanges. The present study tested whether ECAs 
            could generate convincing affective content across different emotional contexts, 
            and how such content evolves over the course of an interaction.
        </p>

        <h2>Methods</h2>
        <p>
            Forty-eight participants engaged in four conversational tasks (small talk, happy, 
            sad, angry) with a male VR-based ECA. Speech input was transcribed with Whisper, 
            processed by a German LLM, and analyzed using a fine-tuned RoBERTa sentiment 
            model. Emotional categories (anger, fear, sadness, joy, neutral) were logged and 
            in some conditions mapped to facial expressions of the agent. Conversations lasted 
            about 6 minutes each, and emotional distributions were analyzed across and within 
            topics.
        </p>

        <h2>Results</h2>
        <p>
            Distinct emotional profiles emerged across topics: joy was most frequent in the 
            happy condition, anger in the anger condition, and sadness in the sad condition. 
            Fear frequently co-occurred, especially in anger and sad contexts. Across 
            conversations, target emotions were strongest at the start but declined over turns, 
            with joy and fear increasing as substitutes in some conditions. These results show 
            that AI-controlled ECAs can produce context-appropriate affective information, 
            though not always perfectly aligned with the target emotion.
        </p>

        <h2>Discussion</h2>
        <p>
            This study demonstrates that AI-driven ECAs can generate and sustain affective 
            information in interactive VR dialogues. Distinct emotion patterns were detected 
            across conversational topics, and temporal analyses showed a decline of target 
            emotions over time. These findings highlight the potential of ECAs for research on 
            social and affective dynamics, as well as applications in training, education, and 
            therapy. Future work should refine semantic control of LLMs and explore how 
            emotional content influences user experience and social evaluations of virtual 
            agents.
        </p>
    `
},
            'paper_3':{}

        };

        this.collisionObjects = new Map();
        
        this.init();
    }

    async init() {
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
            this.setupEventListeners();
            
            // Start render loop and load model
            this.animate();
            
            // Load lightmap first, then model
            await this.loadLightmap();
            this.loadModel();
            
        } catch (error) {
            console.error('Error initializing Three.js:', error);
            this.showErrorMessage('Failed to initialize 3D viewer');
        }

        document.getElementById('back-to-blackboard')?.addEventListener('click', () => {
            if (viewer) {
                viewer.focusOnBlackboardCamera();
            }
        });
    }
// Helper method to find objects by partial name
findObjectByPartialName(parent, partialName) {
    let foundObject = null;
    parent.traverse((child) => {
        if (child.name && child.name.toLowerCase().includes(partialName.toLowerCase()) && !foundObject) {
            foundObject = child;
        }
    });
    return foundObject;
}

    // Load main lightmap only
async loadMainLightmap() {
    if (this.lightmapTexture) return;
    
    console.log('Loading main lightmap...');
    const loader = new RGBELoader();
    
    try {
        const texture = await new Promise((resolve, reject) => {
            loader.load('assets/lightmap.hdr', resolve, undefined, reject);
        });
        
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.flipY = false;
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        
        this.lightmapTexture = texture;
        console.log('Main lightmap loaded successfully');
        
    } catch (error) {
        console.error('Failed to load main lightmap:', error);
    }
}

// Load graffiti lightmap only
async loadGraffitiLightmap() {
    if (this.graffitiLightmapTexture) return;
    
    console.log('Loading graffiti lightmap...');
    const loader = new RGBELoader();
    
    try {
        const texture = await new Promise((resolve, reject) => {
            loader.load('assets/graffiti_lightmap.hdr', resolve, undefined, reject);
        });
        
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.flipY = false;
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        
        this.graffitiLightmapTexture = texture;
        console.log('Graffiti lightmap loaded successfully');
        
    } catch (error) {
        console.error('Failed to load graffiti lightmap:', error);
    }
}

// Apply main lightmap to main model only
applyMainLightmap() {
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

// Apply graffiti lightmap to graffiti wall only
applyGraffitiLightmap() {
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


    async loadLightmap() {
    if (this.isLoadingLightmap || (this.lightmapTexture && this.graffitiLightmapTexture)) return;
    
    this.isLoadingLightmap = true;
    console.log('Loading lightmaps...');
    
    const loader = new RGBELoader();
    
    try {
        // Load main coffeeshop lightmap
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
        
        // Load graffiti wall lightmap
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
            
            // Check if this is the graffiti wall object - be more specific with naming
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
                    
                    // Ensure UV2 coordinates exist for lightmapping
                    if (!child.geometry.attributes.uv2) {
                        if (child.geometry.attributes.uv) {
                            child.geometry.setAttribute('uv2', child.geometry.attributes.uv);
                        } else {
                            console.warn(`No UV coordinates found for object: ${child.name}`);
                            return;
                        }
                    }
                    
                    // Apply appropriate lightmap based on object type
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
        for(let i = 0; i < 3; i++) {
            const spotLight = new THREE.SpotLight(0xffc200, 200, 8, 0.18, 0.1, 0);
            spotLight.position.set(8.2, 0.7, 6.72 - setOff);
            
            const debugCube = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.2, 0.2),
                new THREE.MeshBasicMaterial({ color: 0x00ff00 })
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
        const paperInfo = this.paperData[paperName];
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
        this.scene.background = new THREE.Color(0x1a1a1a);
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
        if (!this.cameraTargets?.blackboard) return;

        this.focusCameraTo({
            ...this.cameraTargets.blackboard,
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
    
    this.showLoadingMessage();
    
    const loader = new GLTFLoader();
    
    try {
        // Load main coffeeshop model
        const mainGltf = await this.loadGLTF(loader, 'assets/coffeeshop.glb');
        await this.handleMainModelLoad(mainGltf);
        
        // Load graffiti wall separately
        await this.loadGraffitiWall(loader);


        setTimeout(() => {
            this.focusOnBlackboardCamera();
        }, 500); 
        
    } catch (error) {
        console.error('Failed to load models:', error);
        this.showErrorMessage('Failed to load 3D models. Please check that the model files exist.');
    }
    
    this.hideLoadingMessage();
    this.isLoading = false;
}

    loadGLTF(loader, url) {
        return new Promise((resolve, reject) => {
            loader.load(url, resolve, undefined, reject);
        });
    }

    async handleMainModelLoad(gltf) {
    this.model = gltf.scene;

    // Remove graffiti wall from main model if it exists
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
    
    // Apply main lightmap to main model
    await this.loadMainLightmap();
    if (this.lightmapTexture) {
        this.applyMainLightmap();
    }

    this.setupLampionGlow();
    this.setupBlackBoardLight();
    this.fitCameraToModel();

    console.log('Main model loaded successfully');
}


async loadGraffitiWall(loader) {
    if (this.isLoadingGraffitiWall) return;
    this.isLoadingGraffitiWall = true;
    
    try {
        // You can either:
        // 1. Load from a separate GLB file: 'assets/graffiti-wall.glb'
        // 2. Load from the same file and extract just the graffiti wall
        const graffitiGltf = await this.loadGLTF(loader, 'assets/graffiti-wall.glb');
        
        this.graffitiWall = graffitiGltf.scene;
        
        // Position the graffiti wall exactly where it should be
        // Adjust these coordinates based on your model
        this.graffitiWall.position.set(0, 0, 0); // Set to exact position
        this.graffitiWall.rotation.set(0, 0, 0); // Set to exact rotation
        this.graffitiWall.scale.set(1, 1, 1);    // Set to exact scale
        
        this.optimizeModel(this.graffitiWall);
        this.scene.add(this.graffitiWall);
        
        // Apply graffiti lightmap only to graffiti wall
        await this.loadGraffitiLightmap();
        if (this.graffitiLightmapTexture) {
            this.applyGraffitiLightmap();
        }
        
        console.log('Graffiti wall loaded and positioned successfully');
        
    } catch (error) {
        console.warn('Failed to load separate graffiti wall, trying to extract from main model:', error);
        // Fallback: try to extract from main model if separate file doesn't exist
        await this.extractGraffitiFromMain(loader);
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
        
        // Handle nav objects
        if (lowerName.startsWith('nav-')) {
            if (lowerName.startsWith('nav-blackboard')) {
                this.focusOnBlackboardCamera();
            } else {
                this.handleNavigation(name);
            }
            return true;
        }
        
        // Handle paper objects
        if (lowerName.startsWith('paper_')) {
            console.log('Paper clicked:', name);
            this.createPaperOverlay(name);
            return true;
        }
        
        // Handle other collision objects
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

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const currentTime = performance.now();
        const isInteracting = (currentTime - this.lastInteraction) < 100;
        const needsUpdate = this.needsRender || isInteracting || this.controls.autoRotate;
        
        if (needsUpdate) {
            this.controls.update();
            
            if (this.needsRender || this.controls.hasChanged) {
                this.renderer.render(this.scene, this.camera);
                this.needsRender = false;
                this.controls.hasChanged = false;
            }
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

    showLoadingMessage() {
        const container = document.getElementById('threejs-container');
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-message';
        loadingDiv.id = 'loading-message';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading 3D Model...</p>
        `;
        container.appendChild(loadingDiv);
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
    if (this.animationId) {
        cancelAnimationFrame(this.animationId);
    }
    
    if (this.lightmapTexture) {
        this.lightmapTexture.dispose();
        this.lightmapTexture = null;
    }
    
    if (this.graffitiLightmapTexture) {
        this.graffitiLightmapTexture.dispose();
        this.graffitiLightmapTexture = null;
    }
    
    // Dispose graffiti wall
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