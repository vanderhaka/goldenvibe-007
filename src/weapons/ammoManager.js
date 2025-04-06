import { updateHUD } from '../hud.js';
import { reserveAmmo, setReserveAmmo } from '../globals.js';
import { DEFAULT_WEAPON } from './weaponData.js';
import { playReloadSound } from './weaponAudio.js';
import { startReloadAnimation, resetWeaponPosition, updateReloadAnimation } from './weaponModel.js';

// Export a SINGLE source of truth for ammo state
export const ammoState = {
  current: DEFAULT_WEAPON.magazineSize,
  max: DEFAULT_WEAPON.magazineSize,
  isReloading: false,
  reloadStartTime: 0
};

// Export currentAmmo directly for backward compatibility
export const currentAmmo = ammoState.current;
export const maxAmmo = ammoState.max;

// Create getters for external modules
export function getCurrentAmmo() {
  return ammoState.current;
}

export function getMaxAmmo() {
  return ammoState.max;
}

// Function to update ammo count
export function updateAmmo(newAmmoCount) {
  const oldValue = ammoState.current;
  ammoState.current = Math.max(0, Math.min(newAmmoCount, ammoState.max));
  
  // Only update HUD and notify listeners if the value actually changed
  if (oldValue !== ammoState.current) {
    // Update the HUD
    updateHUD();
    console.log(`Ammo updated: ${oldValue} -> ${ammoState.current}`);
  }
  
  return ammoState.current;
}

// Function to add ammo to the reserve (e.g., from crates)
export function addReserveAmmo(amount) {
  const newReserveAmmo = reserveAmmo + amount;
  setReserveAmmo(newReserveAmmo);
  console.log(`Added ${amount} reserve ammo. Total reserve: ${newReserveAmmo}`);
  
  // Update the HUD
  updateHUD();
}

// Start reloading the weapon
export function reloadWeapon() {
  // Can't reload if already reloading
  if (ammoState.isReloading) {
    console.log("Already reloading");
    return false;
  }
  
  // Can't reload if magazine is full
  if (ammoState.current >= ammoState.max) {
    console.log("Magazine already full");
    return false;
  }
  
  // Can't reload if no reserve ammo
  if (reserveAmmo <= 0) {
    console.log("No reserve ammo");
    return false;
  }
  
  // Start the reload process
  ammoState.isReloading = true;
  ammoState.reloadStartTime = Date.now();
  
  // Play reload sound
  playReloadSound();
  
  // Start reload animation
  startReloadAnimation();
  
  console.log("Started reloading");
  return true;
}

// Internal function to complete the reload
function finishReload() {
  // Calculate how many bullets we need and have available
  const bulletsNeeded = ammoState.max - ammoState.current;
  const bulletsAvailable = Math.min(bulletsNeeded, reserveAmmo);
  
  // Add bullets to the magazine
  updateAmmo(ammoState.current + bulletsAvailable);
  
  // Remove bullets from reserve
  setReserveAmmo(reserveAmmo - bulletsAvailable);
  
  // Reset reload state
  ammoState.isReloading = false;
  
  // Reset weapon position
  resetWeaponPosition();
  
  console.log(`Reload complete. Current ammo: ${ammoState.current}, Reserve: ${reserveAmmo}`);
  
  // Update the HUD
  updateHUD();
}

// Check if the weapon is currently reloading
export function getIsReloading() {
  return ammoState.isReloading;
}

// Update the reload animation (call this in the animation loop)
export function updateReloadState() {
  if (!ammoState.isReloading) return;
  
  const currentTime = Date.now();
  const reloadTime = DEFAULT_WEAPON.reloadTime;
  const elapsedTime = currentTime - ammoState.reloadStartTime;
  
  // Check if reload is complete
  if (elapsedTime >= reloadTime) {
    finishReload();
  } else {
    updateReloadAnimation(elapsedTime / 1000, reloadTime);
  }
}
