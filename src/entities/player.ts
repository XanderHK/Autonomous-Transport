import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { AnimationMixer, Scene } from "three"

class Player {

    private _gltfLoader: GLTFLoader
    private _mixer?: AnimationMixer
    private _url: string
    private _onLoad: any
    private _scene : any

    constructor(url: string, onLoad: any, scene : Scene) {
        this._gltfLoader = new GLTFLoader()
        
        this._url = url
        this._onLoad = onLoad
        this._scene = scene
        this._Init()
    }

    private _Init() {
        // this._LoadModel()
        this._LoadAnimatedModel()
    }

    private _LoadAnimatedModel() {
        const loader = new FBXLoader()
        loader.setPath('./assets/zombie/')
        loader.load(
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
    }

    private _LoadModel() {
        this._gltfLoader.load(
            this._url,
            this._onLoad,
            undefined,
            (error) => console.error(error)
        )
    }
}

export default Player