import { playerHealth, maxPlayerHealth, reserveAmmo } from './globals.js';
import { currentAmmo, maxAmmo } from './weaponManager.js';

let healthElement;
let ammoElement;

export function initHUD() {
    // Create HUD elements dynamically or assume they exist in HTML
    const hudContainer = document.createElement('div');
    hudContainer.id = 'hud';
    hudContainer.style.position = 'fixed';
    hudContainer.style.bottom = '20px';
    hudContainer.style.left = '20px';
    hudContainer.style.color = 'white';
    hudContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    hudContainer.style.padding = '10px';
    hudContainer.style.fontFamily = 'Arial, sans-serif';
    hudContainer.style.fontSize = '16px';
    hudContainer.style.zIndex = '100'; // Ensure it's above the canvas

    healthElement = document.createElement('div');
    healthElement.id = 'health-display';
    hudContainer.appendChild(healthElement);

    ammoElement = document.createElement('div');
    ammoElement.id = 'ammo-display';
    hudContainer.appendChild(ammoElement);

    document.body.appendChild(hudContainer);

    // Initial update
    updateHUD();
}

export function updateHUD() {
    if (!healthElement || !ammoElement) {
        console.warn("HUD elements not found, cannot update.");
        return;
    }

    // Update display text
    healthElement.textContent = `Health: ${playerHealth} / ${maxPlayerHealth}`;
    ammoElement.textContent = `Ammo: ${currentAmmo} | ${reserveAmmo}`;
} 