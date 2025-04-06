import * as THREE from 'three'; // Assuming you import Three.js via a module loader
import { Vector3, Raycaster, Vector2, AudioListener } from 'three'; // Import specific classes if needed
import { updateHUD } from './hud.js';

export let scene;
export let camera;
export let renderer;
export let controls;
export let audioListener;
export let moveForward = false;
export let moveBackward = false;
export let moveLeft = false;
export let moveRight = false;
export let isSprinting = false; // Track if Q key is pressed for sprint
export let velocity = new THREE.Vector3();
export let direction = new THREE.Vector3();
export let prevTime = performance.now();
export const objects = []; // For collision detection and shooting
export const enemies = []; // Separate array for enemies
export const raycaster = new Raycaster();
export const mouse = new Vector2();

// --- Player State ---
export let playerHealth = 100;
export const maxPlayerHealth = 100;
let isPlayerDead = false;

// --- Ammo State ---
export let reserveAmmo = 24; // Starting reserve ammo

// Functions to update exported variables
export function setScene(newScene) { scene = newScene; }
export function setCamera(newCamera) { camera = newCamera; }
export function setRenderer(newRenderer) { renderer = newRenderer; }
export function setControls(newControls) { controls = newControls; }
export function setAudioListener(listener) { audioListener = listener; }
export function setMoveForward(value) { moveForward = value; }
export function setMoveBackward(value) { moveBackward = value; }
export function setMoveLeft(value) { moveLeft = value; }
export function setMoveRight(value) { moveRight = value; }
export function setIsSprinting(value) { isSprinting = value; } // Setter for sprint state
export function setVelocity(newVelocity) { velocity.copy(newVelocity); } // Use copy for vectors
export function setDirection(newDirection) { direction.copy(newDirection); } // Use copy for vectors
export function setPrevTime(newTime) { prevTime = newTime; }
export function setReserveAmmo(value) { reserveAmmo = Math.max(0, value); } // Setter for reserve ammo

export function takePlayerDamage(amount) {
    if (isPlayerDead) return;
    playerHealth = Math.max(0, playerHealth - amount);
    console.log(`Player Health: ${playerHealth}/${maxPlayerHealth}`);
    updateHUD(); // Update HUD on damage
    // TODO: Add screen flash effect
    if (playerHealth <= 0) {
        handlePlayerDeath();
    }
}

export function resetPlayerState() {
    playerHealth = maxPlayerHealth;
    isPlayerDead = false;
    console.log("Player state reset.");
    updateHUD(); // Update HUD on reset
    // TODO: Reset player position, potentially reload scene/level
}

function handlePlayerDeath() {
    isPlayerDead = true;
    console.error("PLAYER DIED!");
    controls.unlock(); // Unlock cursor
    // TODO: Show 'Game Over' screen
    // TODO: Disable player input/shooting
}

export function getIsPlayerDead() {
    return isPlayerDead;
}

// Note: objects and enemies arrays are mutated directly via push, no setter needed if imported modules use the exported array. 