import World from "./scenes/world";

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
    _APP = new World();
});