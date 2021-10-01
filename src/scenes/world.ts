import * as THREE from 'three'
import { AnimationMixer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Player from '../entities/player';
// import Scene from './scene';

class World {

    private _threejs: any
    private _camera: any
    private _scene: any
    private _mixer : any

    constructor() {
        // super()
        this._Initialize()
    }

    _Initialize() {
        this._threejs = new THREE.WebGLRenderer({
            antialias: true,
        });
        this._threejs.shadowMap.enabled = true;
        this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
        this._threejs.setPixelRatio(window.devicePixelRatio);
        this._threejs.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(this._threejs.domElement);

        window.addEventListener('resize', () => {
            this._OnWindowResize();
        }, false);

        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1000.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(75, 20, 0);

        this._scene = new THREE.Scene();

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

        const controls = new OrbitControls(
            this._camera, this._threejs.domElement);
        controls.target.set(0, 20, 0);
        controls.update();

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

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 10, 10),
            new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
            }));
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        this._scene.add(plane);

        // const box = new THREE.Mesh(
        //     new THREE.BoxGeometry(2, 2, 2),
        //     new THREE.MeshStandardMaterial({
        //         color: 0xFFFFFF,
        //     }));
        // box.position.set(0, 1, 0);
        // box.castShadow = true;
        // box.receiveShadow = true;
        // this._scene.add(box);

        // for (let x = -8; x < 8; x++) {
        //     for (let y = -8; y < 8; y++) {
        //         const box = new THREE.Mesh(
        //             new THREE.BoxGeometry(2, 2, 2),
        //             new THREE.MeshStandardMaterial({
        //                 color: 0x808080,
        //             }));
        //         box.position.set(Math.random() + x * 5, Math.random() * 4.0 + 2.0, Math.random() + y * 5);
        //         box.castShadow = true;
        //         box.receiveShadow = true;
        //         this._scene.add(box);
        //     }
        // }


        // const gltfLoader = new GLTFLoader();

        // gltfLoader.load('./assets/scene.gltf', (gltf) => {
        // gltf.scene.scale.set(50, 50, 50)
        // gltf.scene.position.set(0, 25, 0)
        // gltf.scene.castShadow = true;
        // gltf.scene.receiveShadow = true;
        // this._scene.add(gltf.scene);

        // }, undefined, function (error) {

        //     console.error(error);

        // });

        // const player: Player = new Player('./assets/scene.gltf', (gltf : GLTF) => {
        //     gltf.scene.scale.set(50, 50, 50)
        //     gltf.scene.position.set(0, 25, 0)
        //     gltf.scene.traverse(c => c.castShadow = true)
        //     this._scene.add(gltf.scene);
        // }, this._scene)

        const fbxloader = new FBXLoader()
        fbxloader.setPath('./assets/zombie/')
        fbxloader.load(
            'mremireh_o_desbiens.fbx',
            (fbx) => {
                fbx.scale.setScalar(0.1)
                fbx.traverse(c => c.castShadow = true)

                const anim = new FBXLoader()
                anim.setPath('./assets/zombie/')
                anim.load('Hip Hop Dancing.fbx', anim => {
                    this._mixer = new AnimationMixer(fbx)
                    const idle = this._mixer.clipAction(anim.animations[0])
                    idle.play()
                })

                this._scene.add(fbx)
            }
        )

        this._RAF();
    }

    _OnWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threejs.setSize(window.innerWidth, window.innerHeight);
    }

    _RAF() {
        requestAnimationFrame(() => {
            this._threejs.render(this._scene, this._camera);
            this._RAF();
        });
    }
}

export default World