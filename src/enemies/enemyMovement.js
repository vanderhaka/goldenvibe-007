import * as THREE from 'three';
import { objects } from '../globals.js';
import { ENEMY_SETTINGS } from './enemyTypes.js';

// For detecting walls during patrol
const patrolRaycaster = new THREE.Raycaster();
export const patrolDirections = [
    new THREE.Vector3(1, 0, 0),   // +X
    new THREE.Vector3(0, 0, 1),   // +Z
    new THREE.Vector3(-1, 0, 0),  // -X
    new THREE.Vector3(0, 0, -1)   // -Z
];

// Helper function to get a random patrol point
export function getRandomPatrolPoint(origin, distance) {
    const angle = Math.random() * Math.PI * 2;
    return new THREE.Vector3(
        origin.x + Math.cos(angle) * distance,
        origin.y,
        origin.z + Math.sin(angle) * distance
    );
}

// Move enemy along patrol path or toward player
export function moveEnemy(enemy, target, deltaTime, isPatrolling) {
    const moveSpeed = isPatrolling ? 
        enemy.userData.patrolSpeed : 
        enemy.userData.speed;
    
    const distanceToTarget = enemy.position.distanceTo(target);
    
    // Only move if not too close to the target
    if (distanceToTarget > 0.2) {
        // Direction vector to the target
        const direction = new THREE.Vector3()
            .subVectors(target, enemy.position)
            .normalize();
        
        // Calculate movement distance for this frame
        const moveDistance = moveSpeed * deltaTime;
        
        // Move the enemy
        enemy.position.add(direction.multiplyScalar(moveDistance));
        
        // Face the direction of movement
        if (!isPatrolling) {
            // When chasing player, look at player's height
            enemy.lookAt(target.x, enemy.position.y, target.z);
        } else {
            // When patrolling, look in direction of movement
            const lookAtPoint = new THREE.Vector3(
                enemy.position.x + direction.x,
                enemy.position.y,
                enemy.position.z + direction.z
            );
            enemy.lookAt(lookAtPoint);
        }
        
        return true; // Moved
    }
    
    return false; // Reached target or too close
}

// Check if path is clear for patrol
export function isPathClear(position, direction, distance) {
    patrolRaycaster.set(
        position.clone().add(new THREE.Vector3(0, 0.5, 0)), // Start slightly above ground
        direction
    );
    
    const intersects = patrolRaycaster.intersectObjects(objects);
    return !intersects.length || intersects[0].distance > distance;
}

// Determine if enemy can see player (line of sight)
export function canSeePlayer(enemy, playerPosition) {
    const distanceToPlayer = enemy.position.distanceTo(playerPosition);
    
    // If player is beyond sight range, can't see
    if (distanceToPlayer > ENEMY_SETTINGS.SIGHT_RANGE) {
        return false;
    }
    
    // Cast a ray to check for obstacles
    const direction = new THREE.Vector3()
        .subVectors(playerPosition, enemy.position)
        .normalize();
    
    const raycaster = new THREE.Raycaster(
        enemy.position.clone().add(new THREE.Vector3(0, 1, 0)), // Start at enemy's eye level
        direction
    );
    
    const intersects = raycaster.intersectObjects(objects);
    
    // Check if we can see the player (no walls in between)
    if (intersects.length > 0) {
        const firstHitDist = intersects[0].distance;
        
        // If the player is closer than the first hit object, or the first hit is close to player distance
        // then the enemy can see the player
        return firstHitDist >= distanceToPlayer - 0.5 || 
              (firstHitDist > 0 && Math.abs(firstHitDist - distanceToPlayer) < 0.5);
    }
    
    return false;
}

// Find a new patrol target for the enemy
export function getNewPatrolTarget(enemy) {
    const possibleDirections = [];
    
    // Check each direction for obstacles
    for (let i = 0; i < patrolDirections.length; i++) {
        if (isPathClear(enemy.position, patrolDirections[i], 3)) {
            possibleDirections.push(i);
        }
    }
    
    // If we have possible directions, choose one randomly
    if (possibleDirections.length > 0) {
        enemy.userData.currentPatrolDirection = possibleDirections[
            Math.floor(Math.random() * possibleDirections.length)
        ];
    } else {
        // If no clear paths, try going back toward spawn point
        const toSpawn = new THREE.Vector3()
            .subVectors(enemy.userData.spawnPoint, enemy.position)
            .normalize();
        
        // Find the closest direction to spawn point
        let bestDot = -1;
        let bestDir = 0;
        
        for (let i = 0; i < patrolDirections.length; i++) {
            const dot = toSpawn.dot(patrolDirections[i]);
            if (dot > bestDot) {
                bestDot = dot;
                bestDir = i;
            }
        }
        
        enemy.userData.currentPatrolDirection = bestDir;
    }
    
    // Set new target based on direction
    const direction = patrolDirections[enemy.userData.currentPatrolDirection].clone();
    const distance = 2 + Math.random() * 3; // 2-5 units
    
    return new THREE.Vector3(
        enemy.position.x + direction.x * distance,
        enemy.position.y,
        enemy.position.z + direction.z * distance
    );
}
