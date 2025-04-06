import * as THREE from 'three';
import { objects, takePlayerDamage } from '../globals.js';
import { ENEMY_SETTINGS } from './enemyTypes.js';
import { playEnemyShootSound } from './enemyAudio.js';

// Create a bullet impact from enemy shots
export function createEnemyBulletImpact(position) {
    const impactGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const impactMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const impactSphere = new THREE.Mesh(impactGeometry, impactMaterial);
    impactSphere.position.copy(position);
    
    // Add a small light flash
    const light = new THREE.PointLight(0xffffaa, 1, 3);
    light.position.copy(position);
    
    // Add to scene
    const scene = objects[0]?.parent; // Find scene from any object
    if (scene) {
        scene.add(impactSphere);
        scene.add(light);
        
        // Remove the impact effect after a short duration
        setTimeout(() => {
            scene.remove(impactSphere);
            scene.remove(light);
            impactSphere.geometry.dispose();
            impactMaterial.dispose();
        }, 150); // Duration in milliseconds
    }
}

// Enemy shooting function
export function enemyShoot(enemy, playerPosition) {
    // Play shooting sound
    playEnemyShootSound(enemy);
    
    // Direction from enemy to player
    const direction = new THREE.Vector3()
        .subVectors(playerPosition, enemy.position)
        .normalize();
    
    // For accuracy variation, add some randomness to the direction
    if (Math.random() > ENEMY_SETTINGS.ACCURACY) {
        const spread = 0.1; // Bullet spread
        direction.x += (Math.random() - 0.5) * spread;
        direction.y += (Math.random() - 0.5) * spread;
        direction.z += (Math.random() - 0.5) * spread;
        direction.normalize();
    }
    
    // Create a raycaster for the bullet
    const raycaster = new THREE.Raycaster(
        enemy.position.clone().add(new THREE.Vector3(0, 1, 0)), // Start at enemy gun height
        direction
    );
    
    // Check for hits
    const intersects = raycaster.intersectObjects(objects);
    
    if (intersects.length > 0) {
        // Hit something
        const hit = intersects[0];
        
        // Create a visual impact
        createEnemyBulletImpact(hit.point);
        
        // Check if it's the player (camera) we hit
        if (Math.random() < ENEMY_SETTINGS.ACCURACY && 
            hit.distance > 0.5 && 
            hit.distance < ENEMY_SETTINGS.SHOOTING_RANGE) {
            
            // Apply damage to player when hit (with falloff based on distance)
            const distanceFactor = 1 - (hit.distance / ENEMY_SETTINGS.SHOOTING_RANGE);
            const damage = Math.max(1, Math.floor(enemy.userData.shootingDamage * distanceFactor));
            takePlayerDamage(damage);
            console.log(`Enemy shot player for ${damage} damage`);
        }
    }
}

// Handle enemy melee attack
export function enemyMeleeAttack(enemy) {
    takePlayerDamage(enemy.userData.damage);
    console.log("Enemy melee attacks!");
}
