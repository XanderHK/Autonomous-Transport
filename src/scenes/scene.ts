// abstract class Scene {



//     protected _OnWindowResize() {
//         this._camera.aspect = window.innerWidth / window.innerHeight;
//         this._camera.updateProjectionMatrix();
//         this._threejs.setSize(window.innerWidth, window.innerHeight);
//     }

//     protected _RAF() {
//         requestAnimationFrame(() => {
//             this._threejs.render(this._scene, this._camera);
//             this._RAF();
//         });
//     }
// }

// export default Scene