import * as THREE from 'three';
import { audioListener } from '../globals.js';

// Sound effects for enemies
const enemyShootSounds = [];
const audioLoader = new THREE.AudioLoader();

// Load enemy shooting sound - follows the game's audio pattern
export function initializeEnemySounds() {
    // Load shooting sounds
    audioLoader.load('assets/sounds/gun/bullet.mp3', function(buffer) {
        // Create multiple instances for different enemies to use
        for (let i = 0; i < 5; i++) {
            const sound = new THREE.PositionalAudio(audioListener);
            sound.setBuffer(buffer);
            sound.setVolume(0.3);
            sound.setRefDistance(5);
            sound.setDistanceModel('exponential');
            sound.setRolloffFactor(2);
            sound.setMaxDistance(25);
            enemyShootSounds.push(sound);
        }
        console.log("Enemy shooting sounds loaded");
    }, undefined, function(err) {
        console.error('Error loading enemy shooting sound:', err);
    });
}

// Get a sound instance for an enemy
export function getEnemyShootSound() {
    if (enemyShootSounds.length > 0) {
        const soundIndex = Math.floor(Math.random() * enemyShootSounds.length);
        return enemyShootSounds[soundIndex].clone();
    }
    return null;
}

// Play sound when enemy shoots
export function playEnemyShootSound(enemy) {
    let sound = null;
    // Find the sound component in the enemy
    enemy.traverse((child) => {
        if (child instanceof THREE.PositionalAudio) {
            sound = child;
        }
    });
    
    // Play sound if found and not already playing
    if (sound && !sound.isPlaying) {
        sound.play();
    }
}
