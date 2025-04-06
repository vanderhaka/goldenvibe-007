import * as THREE from 'three';
import {
    camera,
    audioListener,
    raycaster,
    objects,
    scene,
    enemies,
    getIsPlayerDead
} from './globals.js';
import { 
    getCurrentAmmo, 
    updateAmmo, 
    getIsReloading 
} from './weaponManager.js';
import { 
    createBulletImpact, 
    createBulletTracer, 
    processHit 
} from './weapons/shootingEffects.js';

// --- Audio Setup ---
let shootSound;
const audioLoader = new THREE.AudioLoader();
audioLoader.load('assets/sounds/gun/bullet.mp3', function(buffer) {
    console.log("Bullet sound loaded successfully");
    shootSound = new THREE.Audio(audioListener); // Use the global listener
    shootSound.setBuffer(buffer);
    shootSound.setVolume(0.5); // Adjust volume as needed
}, undefined, function(err) {
    console.error('Error loading bullet sound:', err);
});

// --- Enemy Hit Sound Setup ---
const personHitSounds = [];
const personImHitSounds = [];

// Load regular hit sounds (5 variants)
for (let i = 1; i <= 5; i++) {
    audioLoader.load(`assets/sounds/person-hit/person-hit-${i}.mp3`, function(buffer) {
        const sound = new THREE.Audio(audioListener);
        sound.setBuffer(buffer);
        sound.setVolume(0.6);
        personHitSounds.push(sound);
        console.log(`Person hit sound ${i} loaded`);
    }, undefined, function(err) {
        console.error(`Error loading person hit sound ${i}:`, err);
    });
}

// Load "I'm hit" voice lines (3 variants)
for (let i = 1; i <= 3; i++) {
    audioLoader.load(`assets/sounds/person-im-hit/person-im-hit-${i}.mp3`, function(buffer) {
        const sound = new THREE.Audio(audioListener);
        sound.setBuffer(buffer);
        sound.setVolume(0.7); // Slightly louder for voice lines
        personImHitSounds.push(sound);
        console.log(`Person "I'm hit" sound ${i} loaded`);
    }, undefined, function(err) {
        console.error(`Error loading person "I'm hit" sound ${i}:`, err);
    });
}

// Function to play a random hit sound with 5% chance for "I'm hit" voice
function playRandomHitSound() {
    // 1 in 20 chance (5%) to play "I'm hit" sound
    const playImHitSound = Math.random() < 0.05;
    
    if (playImHitSound && personImHitSounds.length > 0) {
        // Play a random "I'm hit" voice line
        const randomIndex = Math.floor(Math.random() * personImHitSounds.length);
        if (personImHitSounds[randomIndex].isPlaying) {
            personImHitSounds[randomIndex].stop();
        }
        personImHitSounds[randomIndex].play();
    } else if (personHitSounds.length > 0) {
        // Play a random regular hit sound
        const randomIndex = Math.floor(Math.random() * personHitSounds.length);
        if (personHitSounds[randomIndex].isPlaying) {
            personHitSounds[randomIndex].stop();
        }
        personHitSounds[randomIndex].play();
    }
}

export function shoot() {
    // Always get the current ammo value from the getter function
    const currentAmmo = getCurrentAmmo();
    
    // Logging to debug
    console.log("🔫 Shoot function called. ammo:", currentAmmo, "reloading:", getIsReloading());
    
    // Check conditions *before* playing sound
    if (getIsPlayerDead()) {
        console.log("Can't shoot: player is dead");
        return;
    }
    
    if (getIsReloading()) {
        console.log("Can't shoot: currently reloading");
        return;
    }
    
    if (!camera) {
        console.log("Can't shoot: no camera");
        return;
    }
    
    if (currentAmmo <= 0) {
        console.log("Can't shoot: no ammo left. Current ammo:", currentAmmo);
        return;
    }

    // --- Play Sound --- 
    if (shootSound && shootSound.isPlaying) {
        shootSound.stop(); // Stop previous sound if still playing
    }
    if (shootSound) {
        shootSound.play();
    } else {
        console.log("Shoot sound not loaded yet or failed to load.");
    }

    // Consume ammo
    updateAmmo(currentAmmo - 1);

    // Set up raycaster from camera
    raycaster.setFromCamera({ x: 0, y: 0 }, camera); // Ray starts from center of screen
    console.log("📊 DEBUG: Raycaster origin:", raycaster.ray.origin);
    console.log("📊 DEBUG: Raycaster direction:", raycaster.ray.direction);

    // Check ALL objects to see what we could potentially hit
    console.log("📊 DEBUG: Objects count:", objects.length);
    
    // Show enemy data specifically to debug
    const enemyObjects = objects.filter(obj => obj.userData && obj.userData.isEnemy);
    console.log("📊 DEBUG: Enemy objects count:", enemyObjects.length);
    enemyObjects.forEach((enemy, idx) => {
        console.log(`📊 DEBUG: Enemy #${idx+1} position:`, enemy.position, "health:", enemy.userData.health);
        
        // Check if ray would hit this enemy with a direct test
        const directionToEnemy = new THREE.Vector3().subVectors(enemy.position, raycaster.ray.origin).normalize();
        const angleToEnemy = Math.acos(directionToEnemy.dot(raycaster.ray.direction));
        console.log(`📊 DEBUG: Angle to enemy #${idx+1}:`, (angleToEnemy * 180/Math.PI).toFixed(2), "degrees");
        
        // Test if ray is pointing at enemy (within 10 degrees)
        if (angleToEnemy < Math.PI / 18) { // 10 degrees in radians
            console.log(`📊 DEBUG: ⚠️ Enemy #${idx+1} is in front of player (within 10°)!`);
        }
    });

    // First try non-recursive intersection (for movement compatibility)
    const intersects = raycaster.intersectObjects(objects, false);
    console.log(`📊 DEBUG: Found ${intersects.length} non-recursive intersections`);
    
    // If we didn't hit an enemy, try recursive intersection specifically for enemies
    let hitEnemy = false;
    let finalIntersects = intersects;
    
    if (intersects.length > 0) {
        // Check if any hit is an enemy part through recursive checks
        const hasEnemyHit = intersects.some(hit => {
            if (hit.object.userData && hit.object.userData.isEnemy) return true;
            if (hit.object.userData && hit.object.userData.hitZone) return true;
            return false;
        });
        
        // If no enemy hit, try again with recursive mode for enemies only
        if (!hasEnemyHit) {
            console.log("📊 DEBUG: No enemy hit in non-recursive mode, trying recursive mode for enemies");
            const enemyIntersects = raycaster.intersectObjects(enemyObjects, true);
            if (enemyIntersects.length > 0) {
                console.log(`📊 DEBUG: Found ${enemyIntersects.length} recursive enemy intersections`);
                hitEnemy = true;
                finalIntersects = enemyIntersects;
            }
        } else {
            hitEnemy = true;
        }
    }

    console.log(`📊 DEBUG: Final intersections:`, finalIntersects);

    // Get bullet start position (the camera/gun position)
    const bulletStartPos = new THREE.Vector3();
    camera.getWorldPosition(bulletStartPos);
    
    // Add slight offset to start position to simulate bullet coming from gun
    bulletStartPos.y -= 0.1; // Slightly below camera
    bulletStartPos.x += camera.getWorldDirection(new THREE.Vector3()).x * 0.5;
    bulletStartPos.z += camera.getWorldDirection(new THREE.Vector3()).z * 0.5;

    if (finalIntersects.length > 0) {
        const intersection = finalIntersects[0];
        const objectHit = intersection.object;
        
        console.log("🎯 HIT DETECTED:", objectHit);
        console.log("📊 Distance:", intersection.distance);
        console.log("📊 Hit position:", intersection.point);
        console.log("📊 Object userData:", objectHit.userData);

        // Create bullet tracer effect
        createBulletTracer(bulletStartPos, intersection.point);
        
        // Handle the hit
        const isEnemyHit = processHit(objectHit, intersection.point);
        console.log("📊 isEnemyHit result:", isEnemyHit);
        
        // Play hit sound effect if it's an enemy
        if (isEnemyHit) {
            console.log("🔊 Playing enemy hit sound");
            playRandomHitSound();
        }
    } else {
        console.log("📊 DEBUG: No intersections found, bullet missed all objects");
        
        // No hit, but still show a tracer going in the camera direction
        const rayDirection = new THREE.Vector3();
        camera.getWorldDirection(rayDirection);
        
        // Create endpoint far away in the direction of looking
        const farEndpoint = new THREE.Vector3().copy(bulletStartPos).add(
            rayDirection.multiplyScalar(100)
        );
        
        createBulletTracer(bulletStartPos, farEndpoint);
    }
}