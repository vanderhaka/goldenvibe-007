import * as THREE from 'three';
import { audioListener } from '../globals.js';

// Audio objects
let reloadSound;
let shootSound;

// Initialize and load weapon sounds
export function initializeWeaponSounds() {
    const audioLoader = new THREE.AudioLoader();
    
    // Load reload sound
    audioLoader.load('assets/sounds/gun/reload.mp3', function(buffer) {
        console.log("Reload sound loaded successfully");
        reloadSound = new THREE.Audio(audioListener);
        reloadSound.setBuffer(buffer);
        reloadSound.setVolume(0.7);
    }, undefined, function(err) {
        console.error('Error loading reload sound:', err);
    });
    
    // Load shooting sound (already implemented in shooting.js, but included here for completeness)
    audioLoader.load('assets/sounds/gun/bullet.mp3', function(buffer) {
        console.log("Bullet sound loaded successfully");
        shootSound = new THREE.Audio(audioListener);
        shootSound.setBuffer(buffer);
        shootSound.setVolume(0.5);
    }, undefined, function(err) {
        console.error('Error loading bullet sound:', err);
    });
}

// Play reload sound
export function playReloadSound() {
    if (reloadSound) {
        if (reloadSound.isPlaying) {
            reloadSound.stop(); // Stop if already playing
        }
        reloadSound.play();
    } else {
        console.log("Reload sound not loaded yet or failed to load.");
    }
}

// Get shoot sound - might be needed if implementing multiple weapons with different sounds
export function getShootSound() {
    return shootSound;
}
