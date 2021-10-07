import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three'
import CharacterControls from '../controls/characterControls';
import { Raycaster, Vector2, AnimationMixer, Object3D } from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js'

class World {

    private _renderer: THREE.WebGLRenderer
    private _camera: THREE.PerspectiveCamera
    private _scene: THREE.Scene
    private _mixer?: THREE.AnimationMixer
    private _playerModel?: THREE.Object3D<THREE.Event>
    private _buildingModel?: THREE.Object3D<THREE.Event>
    private _clock: THREE.Clock
    private _controls?: OrbitControls
    private _keysPressed: { [key: string]: boolean }
    private _characterControls?: CharacterControls;
    private _raycaster: Raycaster
    private _mouse: Vector2
    private _pivotPoint?: Object3D

    constructor() {
        this._renderer = new THREE.WebGLRenderer({ antialias: true })
        this._camera = new THREE.PerspectiveCamera()
        this._scene = new THREE.Scene()
        this._clock = new THREE.Clock()
        this._keysPressed = {}
        this._raycaster = new Raycaster()
        this._mouse = new Vector2()

        this._Init()
    }

    private _Init() {

        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this._renderer.domElement);

        this._AddListeners()
        this._Camera()
        this._Lighting()
        this._Controls()
        this._Skybox()
        this._Plane()
        this._LoadAnimatedModel()
        this._LoadBuildings()
        this._LoadRotatingObjectAroundPivot()
        this._LoadText()

        this._RAF()
    }

    private _LoadText() {
        const loader = new THREE.FontLoader()
        loader.load('https://cdn.rawgit.com/mrdoob/three.js/master/examples/fonts/helvetiker_regular.typeface.json', (font :any) => {

            const geometry = new THREE.TextGeometry('Hello three.js!', {
              font: font,
              size: 80,
              height: 5,
              curveSegments: 12,
              bevelEnabled: true,
              bevelThickness: 10,
              bevelSize: 8,
              bevelSegments: 5
            });
        
            const material = new THREE.MeshLambertMaterial({
              color: 0xF3FFE2
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(0, 2, 0);
            mesh.scale.multiplyScalar(0.01)
            mesh.castShadow = true;
            this._scene.add(mesh);
        
        
            const canv = document.createElement('canvas')
            canv.width = canv.height = 256;
            const ctx = canv.getContext('2d')
            if(ctx !== null){
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canv.width, canv.height);
                ctx.fillStyle = 'black'
                ctx.fillText("HERE IS SOME 2D TEXT", 20, 20);
            }
            var tex = new THREE.Texture(canv);
            tex.needsUpdate = true;
            var mat = new THREE.MeshBasicMaterial({
              map: tex
            });
            var plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), mat);
            this._scene.add(plane)
          });
        
    }

    private _LoadRotatingObjectAroundPivot() {
        const geometry = new THREE.BoxGeometry(10, 10, 10)
        const material = new THREE.MeshBasicMaterial({ opacity : 0.0, transparent : true});
        const rect = new THREE.Mesh(geometry, material);
        this._scene.add(rect);
        this._pivotPoint = new THREE.Object3D()
        rect.add(this._pivotPoint)
        const sphereGeometry2 = new THREE.SphereBufferGeometry(30, 20, 20);

        // Sphere Material 2
        const sphereMaterial2 = new THREE.MeshLambertMaterial({
            color: 0x6ed3cf
        });

        // Sphere Mesh 2
        const sphereMesh2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2);

        // Position from pivot point to sphere 2
        sphereMesh2.position.set(500, 4, 6);

        // make the pivotpoint the sphere's parent.
        this._pivotPoint.add(sphereMesh2);
    }

    private _AddListeners() {
        // Resizes the screen properly
        window.addEventListener('resize', () => {
            this._OnWindowResize();
        }, false);

        // sets the x and y of the mouse 
        window.addEventListener('mousedown', (e) => {
            this._mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this._mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
        }, false)

        // Gets the intersected objects and opens the url of the intersected object
        window.addEventListener('click', (e) => {
            const intersects = this._raycaster.intersectObjects(this._scene.children);
            for (let i = 0; i < intersects.length; i++) {
                window.open(intersects[i].object.userData.URL);
                (<THREE.MeshStandardMaterial>(<THREE.Mesh>intersects[i].object).material).color.set(0xff0000)
            }
        })

        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.shiftKey && this._characterControls) {
                this._characterControls._SwitchRunToggle()
            } else {
                this._keysPressed[e.key.toLowerCase()] = true
            }
        }, false)

        window.addEventListener('keyup', (e: KeyboardEvent) => {
            this._keysPressed[e.key.toLowerCase()] = false
        }, false)
    }

    private _Camera() {
        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1000.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(75, 20, 0);
    }

    private _Lighting() {
        const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light.position.set(20, 100, 10);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.left = 100;
        light.shadow.camera.right = -100;
        light.shadow.camera.top = 100;
        light.shadow.camera.bottom = -100;
        this._scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x101010);
        this._scene.add(ambientLight);
    }

    private _Skybox() {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            './assets/posx.jpg',
            './assets/negx.jpg',
            './assets/posy.jpg',
            './assets/negy.jpg',
            './assets/posz.jpg',
            './assets/negz.jpg',
        ]);
        this._scene.background = texture;
    }

    private _Controls() {
        this._controls = new OrbitControls(
            this._camera, this._renderer.domElement);
        this._controls.target.set(0, 20, 0);
        this._controls.update();
    }

    private _Plane() {
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 10, 10),
            new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
            }));
        plane.userData = { URL: 'https://google.com' }
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        this._scene.add(plane);
        // const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

        // const water = new Water(
        //     waterGeometry,
        //     {
        //         textureWidth: 512,
        //         textureHeight: 512,
        //         waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function (texture) {

        //             texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

        //         }),
        //         sunDirection: new THREE.Vector3(),
        //         sunColor: 0xffffff,
        //         waterColor: 0x001e0f,
        //         distortionScale: 3.7,
        //         fog: this._scene.fog !== undefined
        //     }
        // );

        // water.rotation.x = - Math.PI / 2;

        // this._scene.add(water);

    }

    private _LoadBuildings() {
        const loader = new GLTFLoader()
        loader.load('./assets/building/scene.gltf', (gltf) => {
            const model = gltf.scene

            model.traverse(c => {
                c.castShadow = true
            })
            model.scale.set(10, 10, 10)
            model.position.set(-50, 0, 50)
            this._scene.add(model)
        })

        // const loader2 = new GLTFLoader()
        // loader2.load('./assets/building/scene.gltf', (gltf) => {
        //     const model = gltf.scene
        //     model.traverse(c => {
        //         c.castShadow = true
        //     })

        //     model.scale.set(10, 10, 10)
        //     model.position.set(-50, 0, -50)
        //     this._buildingModel = model
        //     this._scene.add(model)
        // })
    }

    private _LoadAnimatedModel() {
        const loader = new GLTFLoader()
        loader.load('./assets/Soldier.glb', (gltf) => {
            const model = gltf.scene
            model.traverse(c => {
                c.castShadow = true
            })
            model.scale.set(10, 10, 10)
            this._scene.add(model)

            const animations = gltf.animations
            const mixer = new THREE.AnimationMixer(model)
            const animationsMap: Map<string, THREE.AnimationAction> = new Map()
            animations
                .filter(a => a.name != 'TPose')
                .forEach((a: THREE.AnimationClip) => animationsMap.set(a.name, mixer.clipAction(a)))

            this._characterControls = this._controls !== undefined ? new CharacterControls(model, mixer, animationsMap, this._controls, this._camera, 'Idle') : undefined
        })

        // const fbxLoader = new FBXLoader()
        // fbxLoader.setPath('./assets/zombie/')
        // fbxLoader.load('mremireh_o_desbiens.fbx', (fbx) => {
        //     fbx.scale.setScalar(0.1)
        //     fbx.traverse(c => {
        //         c.castShadow = true
        //     })


        //     const danceAnim = new FBXLoader()
        //     danceAnim.setPath('./assets/zombie/')
        //     danceAnim.load('Hip Hop Dancing.fbx', anim => {
        //         this._mixer = new AnimationMixer(fbx)
        //         const idle = this._mixer?.clipAction(anim.animations[0])
        //         idle.play()
        //     })

        //     fbx.position.set(50, 0, 50)
        //     this._scene.add(fbx)
        // })
    }

    private _OnWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private _RAF() {
        requestAnimationFrame(() => {
            this._raycaster.setFromCamera(this._mouse, this._camera);
            if (this._mixer !== undefined) this._mixer.update(this._clock.getDelta())
            if (this._characterControls) this._characterControls._Update(this._clock.getDelta(), this._keysPressed)
            if (this._buildingModel !== undefined) {
                this._buildingModel.rotation.y += 0.03;
                this._buildingModel.position.x = 20 * Math.cos(0) + 0;
                this._buildingModel.position.z = 20 * Math.sin(0) + 0;
            }
            if (this._pivotPoint !== undefined) this._pivotPoint.rotation.y += 0.05;
            this._renderer.render(this._scene, this._camera);
            this._RAF();
        });
    }
}

export default World