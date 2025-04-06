// Updated to use the modular weapon system
// This file now acts as a backward-compatible wrapper

// Import all functionality from the modular system
import {
    currentWeaponMesh as weaponMesh,
    updateWeaponSystem,
    currentAmmo as ammoValue,
    maxAmmo as maxAmmoValue,
    getCurrentAmmo,
    updateAmmo as updateAmmoCount,
    addReserveAmmo as addReserveAmmoAmount,
    reloadWeapon as reload,
    getIsReloading as checkIsReloading
} from './weapons/weaponManager.js';

// For backward compatibility with any code using the original weaponManager
export let currentWeaponMesh = weaponMesh;
export let currentAmmo = ammoValue;
export const maxAmmo = maxAmmoValue;
// Export getCurrentAmmo function
export { getCurrentAmmo };

// Re-export the weapon data for backward compatibility
import { DEFAULT_WEAPON as weaponData } from './weapons/weaponData.js';
export { weaponData };

// Initialize the weapon system
import { initializeWeaponSystem } from './weapons/weaponManager.js';
initializeWeaponSystem();

// Load weapon model (backward compatibility wrapper)
export function loadWeaponModel() {
    console.log("Using modular weapon loading system");
    // The initialization is already handled in initializeWeaponSystem
}

// Update ammo (backward compatibility wrapper)
export function updateAmmo(newAmmoCount) {
    console.log("updateAmmo called in weaponManager.js, current:", getCurrentAmmo(), "new:", newAmmoCount);
    const result = updateAmmoCount(newAmmoCount);
    // Update our exported variable for backward compatibility
    currentAmmo = getCurrentAmmo();
    return result;
}

// Add reserve ammo (backward compatibility wrapper)
export function addReserveAmmo(amount) {
    addReserveAmmoAmount(amount);
}

// Reload weapon (backward compatibility wrapper)
export function reloadWeapon() {
    console.log("reloadWeapon called in weaponManager.js, current ammo:", getCurrentAmmo());
    const result = reload();
    // Update our exported variable after reload (even though the actual update happens asynchronously)
    setTimeout(() => { 
        currentAmmo = getCurrentAmmo();
        console.log("After reload, currentAmmo =", currentAmmo);
    }, 50);
    return result;
}

// Get reload state (backward compatibility wrapper)
export function getIsReloading() {
    return checkIsReloading();
}

// Update reload animation (backward compatibility wrapper)
export function updateReloadAnimation() {
    updateWeaponSystem();
    // Keep currentAmmo in sync
    currentAmmo = getCurrentAmmo();
}