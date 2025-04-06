import * as THREE from 'three';
import { camera, enemies, scene } from '../globals.js';
import { ENEMY_SETTINGS } from './enemyTypes.js';
import { createEnemyObject } from './enemyFactory.js';
import { initializeEnemySounds } from './enemyAudio.js';
import { canSeePlayer, moveEnemy, getNewPatrolTarget } from './enemyMovement.js';
import { enemyShoot, enemyMeleeAttack } from './enemyCombat.js';

// State timers and flags
const MEMORY_DURATION = 5000; // How long enemies remember seeing player (ms)

// Initialize the enemy system
export function initializeEnemySystem() {
    console.log("Initializing enemy system");
    initializeEnemySounds();
}

// Add an enemy to the game
export function spawnEnemy(x, y, z) {
    if (enemies.length >= ENEMY_SETTINGS.MAX_COUNT) {
        console.warn("Maximum enemy count reached");
        return null;
    }
    
    const enemy = createEnemyObject(x, y, z);
    scene.add(enemy);
    enemies.push(enemy);
    
    return enemy;
}

// Remove an enemy from the game
export function removeEnemy(enemy) {
    const index = enemies.indexOf(enemy);
    if (index !== -1) {
        // Remove from arrays
        enemies.splice(index, 1);
        
        const objIndex = scene.children.indexOf(enemy);
        if (objIndex !== -1) {
            scene.remove(enemy);
        }
        
        // Clean up geometry and materials
        enemy.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                if (child.material.dispose) {
                    child.material.dispose();
                }
            }
        });
    }
}

// Deal damage to an enemy
export function damageEnemy(enemy, damage) {
    if (!enemy || !enemy.userData) return false;
    
    enemy.userData.health -= damage;
    
    // Change color to indicate damage
    enemy.traverse((child) => {
        if (child instanceof THREE.Mesh && 
            child.material instanceof THREE.MeshStandardMaterial) {
            child.material.emissive.set(0xff0000);
            child.material.emissiveIntensity = 0.5;
            
            // Reset after a short time
            setTimeout(() => {
                if (child.material) {
                    child.material.emissiveIntensity = 0;
                }
            }, 150);
        }
    });
    
    // Check if enemy is defeated
    if (enemy.userData.health <= 0) {
        // Enemy is defeated
        removeEnemy(enemy);
        return true;
    }
    
    return false;
}

// Update all enemies (main update function)
export function updateEnemies(deltaTime) {
    // Get player position from camera
    const playerPosition = new THREE.Vector3();
    camera.getWorldPosition(playerPosition);
    
    // Update each enemy
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Skip invalid enemies
        if (!enemy || !enemy.userData) continue;
        
        // Check if player is visible
        const canSee = canSeePlayer(enemy, playerPosition);
        
        // Update enemy state based on player visibility
        updateEnemyState(enemy, playerPosition, canSee, deltaTime);
        
        // Handle behavior based on current state
        switch (enemy.userData.state) {
            case 'patrol':
                handlePatrolState(enemy, deltaTime);
                break;
            case 'chase':
                handleChaseState(enemy, playerPosition, deltaTime);
                break;
            case 'shooting':
                handleShootingState(enemy, playerPosition, deltaTime);
                break;
            case 'attack':
                handleAttackState(enemy, playerPosition, deltaTime);
                break;
        }
    }
}

// Update enemy state based on player visibility and distance
function updateEnemyState(enemy, playerPosition, canSeePlayer, deltaTime) {
    const distanceToPlayer = enemy.position.distanceTo(playerPosition);
    const currentTime = Date.now();
    
    // If player is visible, remember the position
    if (canSeePlayer) {
        enemy.userData.lastSeenPlayerPosition = playerPosition.clone();
        enemy.userData.lastSeenPlayerTime = currentTime;
        
        // Determine state based on distance
        if (distanceToPlayer < ENEMY_SETTINGS.MELEE_RANGE) {
            enemy.userData.state = 'attack';
        } else if (distanceToPlayer < ENEMY_SETTINGS.SHOOTING_RANGE && 
                  distanceToPlayer > ENEMY_SETTINGS.SHOOTING_MIN_RANGE) {
            enemy.userData.state = 'shooting';
        } else {
            enemy.userData.state = 'chase';
        }
    } else {
        // Player not visible
        // If we recently saw the player, continue with chase
        if (enemy.userData.lastSeenPlayerPosition && 
            currentTime - enemy.userData.lastSeenPlayerTime < MEMORY_DURATION) {
            if (enemy.userData.state !== 'patrol') {
                enemy.userData.state = 'chase';
            }
        } else {
            // Lost track of player, go back to patrol
            enemy.userData.state = 'patrol';
            enemy.userData.lastSeenPlayerPosition = null;
        }
    }
}

// Handle patrol state behavior
function handlePatrolState(enemy, deltaTime) {
    // If we don't have a patrol target, get one
    if (!enemy.userData.patrolTarget) {
        enemy.userData.patrolTarget = getNewPatrolTarget(enemy);
    }
    
    // Move toward patrol target
    const reached = moveEnemy(
        enemy, 
        enemy.userData.patrolTarget, 
        deltaTime, 
        true // isPatrolling
    );
    
    // If reached target, get a new one
    if (reached) {
        enemy.userData.patrolTarget = getNewPatrolTarget(enemy);
    }
}

// Handle chase state behavior
function handleChaseState(enemy, playerPosition, deltaTime) {
    // Chase player directly if visible
    if (enemy.userData.lastSeenPlayerPosition) {
        moveEnemy(
            enemy, 
            enemy.userData.lastSeenPlayerPosition, 
            deltaTime, 
            false // not patrolling
        );
        
        // Always face toward last known player position
        enemy.lookAt(
            enemy.userData.lastSeenPlayerPosition.x, 
            enemy.position.y, 
            enemy.userData.lastSeenPlayerPosition.z
        );
    } else {
        // Fall back to patrol if we don't know where player is
        enemy.userData.state = 'patrol';
    }
}

// Handle shooting state behavior
function handleShootingState(enemy, playerPosition, deltaTime) {
    // Always face player when shooting
    enemy.lookAt(playerPosition.x, enemy.position.y, playerPosition.z);
    
    // Only shoot if cooldown has elapsed
    const currentTime = Date.now();
    if (currentTime - enemy.userData.lastShootTime > enemy.userData.shootingCooldown * 1000) {
        enemyShoot(enemy, playerPosition);
        enemy.userData.lastShootTime = currentTime;
    }
}

// Handle melee attack state behavior
function handleAttackState(enemy, playerPosition, deltaTime) {
    // Always face player when attacking
    enemy.lookAt(playerPosition.x, enemy.position.y, playerPosition.z);
    
    // Only attack if cooldown has elapsed
    const currentTime = Date.now();
    if (currentTime - enemy.userData.lastAttackTime > enemy.userData.attackCooldown * 1000) {
        enemyMeleeAttack(enemy);
        enemy.userData.lastAttackTime = currentTime;
    }
}
