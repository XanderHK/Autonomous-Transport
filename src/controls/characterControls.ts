import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

class CharacterControls {

    private _animationsMap: Map<string, THREE.AnimationAction> = new Map()
    private _orbitControl: OrbitControls
    private _camera: THREE.Camera
    private _mixer: THREE.AnimationMixer
    private _model: THREE.Group

    //state
    private _toggleRun: boolean = true
    private _currentAction: string

    // temporary data
    private _walkDirection = new THREE.Vector3()
    private _rotateAngle = new THREE.Vector3(0, 1, 0)
    private _rotateQuarternion: THREE.Quaternion = new THREE.Quaternion()
    private _cameraTarget = new THREE.Vector3()

    // constants
    private _fadeDuration = 0.2
    private _runVelocity = 50
    private _walkVelocity = 20

    constructor(
        model: THREE.Group,
        mixer: THREE.AnimationMixer,
        animationsMap: Map<string, THREE.AnimationAction>,
        orbitControls: OrbitControls,
        camera: THREE.Camera,
        currentAction: string
    ) {
        this._model = model
        this._mixer = mixer
        this._animationsMap = animationsMap
        this._camera = camera
        this._orbitControl = orbitControls
        this._currentAction = currentAction

        this._animationsMap.forEach((value, key) => {
            if (key === currentAction) value.play()
        })
    }

    public _SwitchRunToggle() {
        this._toggleRun = !this._toggleRun
        console.log(this._toggleRun)
    }

    public _Update(delta: number, keysPressed: any) {
        const directionPressed = ['w', 'a', 's', 'd'].some(key => keysPressed[key] === true)
        let play = '';
        if (this._toggleRun && directionPressed) play = 'Run'
        if (!this._toggleRun && directionPressed) play = 'Walk'
        if (!directionPressed) play = 'Idle'

        console.log(play)

        if (this._currentAction !== play) {
            const toPlay = this._animationsMap.get(play)
            const current = this._animationsMap.get(this._currentAction)

            current?.fadeOut(this._fadeDuration)

            toPlay?.reset().fadeIn(this._fadeDuration).play()

            this._currentAction = play
        }


        this._mixer.update(delta)

        this._RotateCharacter(delta, keysPressed)
    }

    private _UpdateCameraTarget(moveX: number, moveZ: number) {
        // move camera
        this._camera.position.x += moveX
        this._camera.position.z += moveZ

        this._cameraTarget.x = this._model.position.x
        this._cameraTarget.y = this._model.position.y
        this._cameraTarget.z = this._model.position.z
        this._orbitControl.target = this._cameraTarget
    }

    private _RotateCharacter(delta: number, keysPressed: any) {
        if (this._currentAction === 'Run' || this._currentAction === 'Walk') {

            // calculate towards camera direction
            const angleYCameraDirection = Math.atan2(
                (this._camera.position.x - this._model.position.x),
                (this._camera.position.z - this._model.position.z)
            )
            // diagonal movement angle offset
            const directionOffset = this._DirectionOffset(keysPressed)

            // rotate model
            this._rotateQuarternion.setFromAxisAngle(this._rotateAngle, angleYCameraDirection + directionOffset)
            this._model.quaternion.rotateTowards(this._rotateQuarternion, 0.2)

            // calculate direction
            this._camera.getWorldDirection(this._walkDirection)
            this._walkDirection.y = 0
            this._walkDirection.normalize()
            this._walkDirection.applyAxisAngle(this._rotateAngle, directionOffset)

            // run/walk velocity
            const velocity = this._currentAction === 'Run' ? this._runVelocity : this._walkVelocity

            // move model & camera
            const moveX = this._walkDirection.x * velocity * delta
            const moveZ = this._walkDirection.z * velocity * delta
            this._model.position.x += moveX
            this._model.position.z += moveZ
            this._UpdateCameraTarget(moveX, moveZ)
        }
    }

    private _DirectionOffset(keysPressed: any) {
        let directionOffset = 0 // w

        if (keysPressed['w']) {
            if (keysPressed['a']) {
                directionOffset = Math.PI / 4 // w+a
            } else if (keysPressed['d']) {
                directionOffset = - Math.PI / 4 // w+d
            }
        } else if (keysPressed['s']) {
            if (keysPressed['a']) {
                directionOffset = Math.PI / 4 + Math.PI / 2 // s+a
            } else if (keysPressed['d']) {
                directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d
            } else {
                directionOffset = Math.PI // s
            }
        } else if (keysPressed['a']) {
            directionOffset = Math.PI / 2 // a
        } else if (keysPressed['d']) {
            directionOffset = - Math.PI / 2 // d
        }

        return directionOffset
    }
}

export default CharacterControls