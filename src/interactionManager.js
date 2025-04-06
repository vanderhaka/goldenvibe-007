import * as THREE from 'three';
import {
    camera,
    scene,
    objects
} from './globals.js';
import {
    showInteractionPrompt,
    hideInteractionPrompt
} from './playerControls.js';
import { addReserveAmmo } from './weaponManager.js';

const INTERACTION_RANGE = 2.5; // How close player needs to be
let nearbyInteractable = null; // Store the object player can interact with

// Function to create an ammo crate
export function createAmmoCrate(x, y, z) {
    const crateGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const crateMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown color
    const crate = new THREE.Mesh(crateGeometry, crateMaterial);
    crate.position.set(x, y, z);
    crate.userData = {
        type: 'ammoCrate',
        ammoAmount: 10, // How much ammo this crate gives
        isInteractable: true,
        interactionText: 'Press E for Ammo'
    };
    scene.add(crate);
    objects.push(crate); // Add to collidable/shootable objects maybe?
    return crate;
}

// Check for nearby interactable objects
export function checkInteraction() {
    if (!camera) return;
    const playerPosition = camera.position;
    let foundInteractable = null;

    // Check distance to all objects with isInteractable flag
    for (const obj of objects) {
        if (obj.userData.isInteractable) {
            const distance = playerPosition.distanceTo(obj.position);
            if (distance <= INTERACTION_RANGE) {
                foundInteractable = obj;
                break; // Interact with the first one found in range
            }
        }
    }

    if (foundInteractable) {
        if (nearbyInteractable !== foundInteractable) {
            // New interactable found, show prompt
            showInteractionPrompt(foundInteractable.userData.interactionText || 'Press E to interact');
            nearbyInteractable = foundInteractable;
        }
    } else {
        if (nearbyInteractable) {
            // No interactable in range anymore, hide prompt
            hideInteractionPrompt();
            nearbyInteractable = null;
        }
    }
}

// Called when player presses the interaction key (E)
export function tryInteract() {
    if (nearbyInteractable) {
        console.log('Interacting with:', nearbyInteractable.userData.type);
        // Handle different interaction types
        switch (nearbyInteractable.userData.type) {
            case 'ammoCrate':
                handleAmmoCrateInteraction(nearbyInteractable);
                break;
            // Add cases for other interactable types (doors, objectives)
        }
        // Clear interaction state after successful interaction
        hideInteractionPrompt();
        nearbyInteractable = null;
    }
}

function handleAmmoCrateInteraction(crate) {
    addReserveAmmo(crate.userData.ammoAmount || 24);

    // Remove the crate from scene and objects array
    scene.remove(crate);
    const index = objects.indexOf(crate);
    if (index > -1) {
        objects.splice(index, 1);
    }
    // Dispose geometry/material
    if (crate.geometry) crate.geometry.dispose();
    if (crate.material) crate.material.dispose();
} 