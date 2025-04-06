import * as THREE from 'three';
import {
    scene,
    camera,
    renderer,
    controls,
    prevTime,
    setPrevTime,
    getIsPlayerDead,
    resetPlayerState
} from './src/globals.js';
import {
    initScene,
    initCamera,
    initRenderer,
    initLighting,
    onWindowResize
} from './src/sceneSetup.js';
import { initControls } from './src/playerControls.js';
import { buildLevel } from './src/levelBuilder.js';
import { updateEnemies } from './src/enemyManager.js';
import { updatePlayerMovement } from './src/playerMovement.js';
import { loadWeaponModel, updateReloadAnimation } from './src/weaponManager.js'; // Use the wrapper for backward compatibility
import { initHUD, updateHUD } from './src/hud.js'; // Import HUD functions
import { checkInteraction } from './src/interactionManager.js'; // Import interaction check
// Import other modules as needed...

// --- Initialization ---
function init() {
    initScene();
    initCamera(); // Must be after scene
    initRenderer(); // Must be after camera
    initLighting(); // Must be after scene
    initControls(); // Must be after camera
    resetPlayerState(); // Reset health on init
    loadWeaponModel(); // Use the wrapper function for backward compatibility
    buildLevel(); // This now also places enemies
    initHUD(); // Initialize HUD elements
    window.addEventListener('resize', onWindowResize);
    animate();
}

// --- Animation Loop ---
function animate() {
    if (getIsPlayerDead()) {
        // Optionally stop the loop or just stop updates
        // requestAnimationFrame(animate);
        // renderer.render(scene, camera); // Keep rendering maybe?
        return; // Stop updates if dead
    }

    requestAnimationFrame(animate);

    const time = performance.now();
    const currentTimeSeconds = time / 1000; // Pass time in seconds
    const delta = (time - prevTime) / 1000;

    updatePlayerMovement(delta);
    updateEnemies(delta, currentTimeSeconds); // Pass current time for cooldowns
    checkInteraction(); // Check for nearby interactables
    updateHUD(); // Update HUD every frame
    updateReloadAnimation(); // Use the wrapper function for backward compatibility
    // Update other game systems (like HUD)

    setPrevTime(time);

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// --- Start the game ---
init();

// Remove old definitions that are now in modules
/*
let moveForward = false;
let moveBackward = false;
// ... etc ...
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
function onMouseDown(event) { ... }
function shoot() { ... }
*/
