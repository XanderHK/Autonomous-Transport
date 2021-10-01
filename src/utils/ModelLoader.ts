// import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// class ModelLoader {

//     private _gltfLoader: GLTFLoader
//     private _url: string
//     private _onLoad: ((gltf: GLTF) => void | undefined)
//     private _onProgess: ((event: ProgressEvent<EventTarget>) => void)
//     private _onError: Function

//     constructor(url: string, onLoad?: (gltf: GLTF) => void | undefined, onProgress?: ((event: ProgressEvent<EventTarget>) => void) | undefined, onError?: Function) {
//         this._gltfLoader = new GLTFLoader()
//         this._url = url
//         this._onLoad = onLoad
//         if(onProgress !== undefined) this._onProgess = onProgress
//         // this._onError = onError !== undefined ? onError : undefined
//     }

//     public onLoad(callback: (gltf: GLTF) => void) {
//         this._onLoad = callback
//     }

//     public onProgress(callback: ((event: ProgressEvent<EventTarget>) => void)) {
//         this._onProgess = callback
//     }

//     public onError(callback: Function) {
//         this._onError = callback
//     }

//     public exec() {
//         this._gltfLoader.load(
//             this._url,
//             this._onLoad,
//             this._onProgess,
//             this._onError
//         )
//     }
// }

// export default ModelLoader

// const gltfLoader = new GLTFLoader();

// gltfLoader.load('./assets/scene.gltf', (gltf) => {
//     gltf.scene.scale.set(50, 50, 50)
//     gltf.scene.position.set(0, 25, 0)
//     gltf.scene.castShadow = true;
//     gltf.scene.receiveShadow = true;
//     this._scene.add(gltf.scene);

// }, undefined, function (error) {

//     console.error(error);

// });