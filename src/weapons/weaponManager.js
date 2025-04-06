// Main weapon system manager
import { initializeWeaponSounds } from './weaponAudio.js';
import { loadWeaponModel, currentWeaponMesh } from './weaponModel.js';
import { 
    ammoState,
    getCurrentAmmo,
    getMaxAmmo,
    updateAmmo, 
    addReserveAmmo, 
    reloadWeapon, 
    getIsReloading,
    updateReloadState,
    currentAmmo,
    maxAmmo
} from './ammoManager.js';
import { DEFAULT_WEAPON } from './weaponData.js';

// Initialize the weapon system
export async function initializeWeaponSystem() {
    console.log("Initializing weapon system...");
    
    // Load sounds
    initializeWeaponSounds();
    
    // Load weapon model
    try {
        await loadWeaponModel(DEFAULT_WEAPON);
        console.log("Weapon system initialized successfully");
    } catch (error) {
        console.error("Failed to initialize weapon system:", error);
    }
}

// Update weapon system (call this in the animation loop)
export function updateWeaponSystem() {
    updateReloadState();
}

// Export everything needed for backward compatibility
export {
    currentWeaponMesh,
    currentAmmo,
    maxAmmo,
    updateAmmo,
    addReserveAmmo,
    reloadWeapon,
    getIsReloading,
    getCurrentAmmo
};
