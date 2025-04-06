import * as THREE from 'three';
import { camera } from '../globals.js';
import { DEFAULT_WEAPON } from './weaponData.js';

// Weapon model state
export let currentWeaponMesh = null;
let initialWeaponPosition = null;

// Create a simple gun model using primitives
function createSimpleGunModel() {
    const gunGroup = new THREE.Group();
    
    // Gun barrel (cylinder)
    const barrelGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 16);
    const barrelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.rotation.x = Math.PI / 2; // Rotate to point forward
    barrel.position.z = -0.15;
    gunGroup.add(barrel);
    
    // Gun body (box)
    const bodyGeometry = new THREE.BoxGeometry(0.08, 0.12, 0.2);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -0.08;
    gunGroup.add(body);
    
    // Gun handle (box)
    const handleGeometry = new THREE.BoxGeometry(0.05, 0.15, 0.06);
    const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = -0.18;
    gunGroup.add(handle);
    
    // Add a trigger guard
    const guardGeometry = new THREE.TorusGeometry(0.02, 0.005, 8, 16, Math.PI);
    const guardMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const guard = new THREE.Mesh(guardGeometry, guardMaterial);
    guard.rotation.x = Math.PI / 2;
    guard.position.set(0, -0.13, -0.02);
    gunGroup.add(guard);
    
    return gunGroup;
}

// Load the weapon model
export function loadWeaponModel(weaponData = DEFAULT_WEAPON) {
    if (!camera) {
        console.error("Camera not initialized before loading weapon model.");
        return null;
    }
    
    // Create a simple model using primitives
    console.log("Creating simple weapon model");
    currentWeaponMesh = createSimpleGunModel();
    setupWeaponMesh(currentWeaponMesh, weaponData);
    return Promise.resolve(currentWeaponMesh);
}

// Set up the weapon mesh with position, rotation, etc.
function setupWeaponMesh(mesh, weaponData) {
    mesh.position.copy(weaponData.position);
    mesh.rotation.copy(weaponData.rotation);
    mesh.scale.copy(weaponData.scale);
    
    // Store initial position for reload animation
    initialWeaponPosition = mesh.position.clone();
    
    // Configure weapon materials
    mesh.traverse((child) => {
        if (child.isMesh) {
            child.material.fog = false;
            child.castShadow = true;
        }
    });
    
    camera.add(mesh);
    console.log("Weapon model loaded and attached to camera.");
}

// Start reload animation
export function startReloadAnimation() {
    if (currentWeaponMesh && initialWeaponPosition) {
        // Slightly lower the weapon
        const reloadAnimation = new THREE.Vector3(
            initialWeaponPosition.x,
            initialWeaponPosition.y - 0.05, // Move down slightly
            initialWeaponPosition.z + 0.1  // Move backward slightly
        );
        
        currentWeaponMesh.position.copy(reloadAnimation);
        currentWeaponMesh.rotation.x += 0.2; // Tilt the weapon down
    }
}

// Update reload animation progress
export function updateReloadAnimation(progress, reloadTime) {
    if (!currentWeaponMesh || !initialWeaponPosition) return;
    
    const normalizedTime = progress / reloadTime;
    
    // Only animate during first half of reload time
    if (normalizedTime < 0.5) {
        // Animation already set at the beginning of reload
    } 
    // Start returning to original position during second half
    else if (normalizedTime < 1.0) {
        const returnProgress = (normalizedTime - 0.5) / 0.5; // 0 to 1 during second half
        
        // Interpolate back to initial position
        currentWeaponMesh.position.lerp(initialWeaponPosition, returnProgress);
        
        // Interpolate rotation back to original
        const currentRotation = currentWeaponMesh.rotation.clone();
        currentRotation.x = THREE.MathUtils.lerp(
            currentRotation.x, 
            DEFAULT_WEAPON.rotation.x, 
            returnProgress
        );
        currentWeaponMesh.rotation.copy(currentRotation);
    }
}

// Reset weapon position completely
export function resetWeaponPosition() {
    if (currentWeaponMesh && initialWeaponPosition) {
        currentWeaponMesh.position.copy(initialWeaponPosition);
        currentWeaponMesh.rotation.copy(DEFAULT_WEAPON.rotation);
    }
}
