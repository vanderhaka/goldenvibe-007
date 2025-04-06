import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'; // Correct path might vary
import {
    camera,
    controls,
    setControls,
    moveForward, 
    moveBackward,
    moveLeft,
    moveRight,
    isSprinting,
    setMoveForward,
    setMoveBackward,
    setMoveLeft,
    setMoveRight,
    setIsSprinting
} from './globals.js';
import { shoot } from './shooting.js'; // We'll create this next
import { reloadWeapon, addReserveAmmo } from './weaponManager.js'; // Import reload function and addReserveAmmo function
import { tryInteract } from './interactionManager.js'; // We'll create this next

let crosshairElement;
let interactionPromptElement; // For showing "Press E to interact"

export function initControls() {
    try {
        // Check if camera is initialized
        if (!camera) {
            console.error("Camera not initialized before controls");
            return;
        }

        // Create new controls
        const newControls = new PointerLockControls(camera, document.body);
        
        // Set controls in globals
        setControls(newControls);

        // Get or create crosshair element
        crosshairElement = document.getElementById('crosshair');
        if (!crosshairElement) {
            console.warn("Crosshair element not found, controls might not display properly");
        }

        // Add interaction prompt element if not already present
        if (!document.getElementById('interaction-prompt')) {
            interactionPromptElement = document.createElement('div');
            interactionPromptElement.id = 'interaction-prompt';
            interactionPromptElement.style.position = 'fixed';
            interactionPromptElement.style.bottom = '80px'; // Above HUD
            interactionPromptElement.style.left = '50%';
            interactionPromptElement.style.transform = 'translateX(-50%)';
            interactionPromptElement.style.color = 'yellow';
            interactionPromptElement.style.fontFamily = 'Arial, sans-serif';
            interactionPromptElement.style.fontSize = '18px';
            interactionPromptElement.style.display = 'none'; // Hidden by default
            interactionPromptElement.style.zIndex = '101';
            document.body.appendChild(interactionPromptElement);
        } else {
            interactionPromptElement = document.getElementById('interaction-prompt');
        }

        // Add event listeners with error handling
        document.addEventListener('click', function () {
            if (controls && typeof controls.lock === 'function') {
                if (!controls.isLocked) {
                    controls.lock();
                }
            }
        });

        document.addEventListener('mousedown', onMouseDown);

        // Make sure controls is valid before adding event listeners
        if (controls && typeof controls.addEventListener === 'function') {
            controls.addEventListener('lock', function () {
                console.log('Pointer locked');
                if (crosshairElement) crosshairElement.style.display = 'block';
                // Hide menu, show crosshair, etc.
            });

            controls.addEventListener('unlock', function () {
                console.log('Pointer unlocked');
                if (crosshairElement) crosshairElement.style.display = 'none';
                // Show menu, hide crosshair, etc.
            });
        } else {
            console.error("Controls not properly initialized, events won't work");
        }

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        
        console.log("Controls initialized successfully");
    } catch (error) {
        console.error("Error initializing controls:", error);
    }
}

function onKeyDown(event) {
    try {
        if (!event || !event.code) return;
        
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                setMoveForward(true);
                break;
            case 'ArrowLeft':
            case 'KeyA':
                setMoveLeft(true);
                break;
            case 'ArrowDown':
            case 'KeyS':
                setMoveBackward(true);
                break;
            case 'ArrowRight':
            case 'KeyD':
                setMoveRight(true);
                break;
            case 'KeyQ': // Sprint key
                setIsSprinting(true);
                break;
            case 'KeyR': // Add reload key
                if (typeof reloadWeapon === 'function') {
                    reloadWeapon();
                }
                break;
            case 'KeyE': // Interaction key
                if (typeof tryInteract === 'function') {
                    tryInteract();
                }
                break;
            case 'KeyP': // TEMPORARY: Pickup ammo test key
                if (typeof addReserveAmmo === 'function') {
                    addReserveAmmo(24); // Add 24 reserve ammo
                }
                break;
        }
    } catch (error) {
        console.error("Error in key down handler:", error);
    }
}

function onKeyUp(event) {
    try {
        if (!event || !event.code) return;
        
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                setMoveForward(false);
                break;
            case 'ArrowLeft':
            case 'KeyA':
                setMoveLeft(false);
                break;
            case 'ArrowDown':
            case 'KeyS':
                setMoveBackward(false);
                break;
            case 'ArrowRight':
            case 'KeyD':
                setMoveRight(false);
                break;
            case 'KeyQ': // Sprint key release
                setIsSprinting(false);
                break;
        }
    } catch (error) {
        console.error("Error in key up handler:", error);
    }
}

function onMouseDown(event) {
    try {
        // Check if pointer is locked and it's a left click
        if (controls && controls.isLocked && event.button === 0 && typeof shoot === 'function') {
            shoot();
        }
    } catch (error) {
        console.error("Error in mouse down handler:", error);
    }
}

// Function to show/hide interaction prompt
export function showInteractionPrompt(text) {
    if (interactionPromptElement) {
        interactionPromptElement.textContent = text;
        interactionPromptElement.style.display = 'block';
    }
}

export function hideInteractionPrompt() {
    if (interactionPromptElement) {
        interactionPromptElement.style.display = 'none';
    }
}