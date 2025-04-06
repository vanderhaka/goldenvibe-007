import * as THREE from 'three';
import { objects, scene } from '../globals.js';
import { ENEMY_TYPES, ENEMY_SETTINGS } from './enemyTypes.js';
import { getEnemyShootSound } from './enemyAudio.js';

// Create enemy mesh components
function createEnemyBody(color) {
    // Create body
    const bodyGeometry = new THREE.BoxGeometry(0.6, 1.5, 0.4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    
    // Mark as body hit zone
    body.userData = {
        hitZone: 'body',
        damageFactor: 1.0 // Standard damage
    };
    
    return body;
}

function createEnemyHead(color) {
    // Create head
    const headGeometry = new THREE.SphereGeometry(0.25, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ color });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.95; // Position on top of body
    head.castShadow = true;
    
    // Mark as head hit zone
    head.userData = {
        hitZone: 'head',
        damageFactor: 3.0, // 3x damage for headshots
        criticalHitChance: 0.3 // 30% chance of instant kill
    };
    
    return head;
}

function createEnemyArms(color) {
    // Create group for arms
    const armsGroup = new THREE.Group();
    
    // Create left arm
    const leftArmGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
    const leftArmMaterial = new THREE.MeshStandardMaterial({ color });
    const leftArm = new THREE.Mesh(leftArmGeometry, leftArmMaterial);
    leftArm.position.set(-0.35, 0.5, 0);
    leftArm.castShadow = true;
    
    // Mark as limb hit zone
    leftArm.userData = {
        hitZone: 'limb',
        damageFactor: 0.8 // 80% damage for limbs
    };
    
    // Create right arm for holding weapon
    const rightArmGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
    const rightArmMaterial = new THREE.MeshStandardMaterial({ color });
    const rightArm = new THREE.Mesh(rightArmGeometry, rightArmMaterial);
    rightArm.position.set(0.35, 0.5, 0);
    rightArm.castShadow = true;
    
    // Mark as limb hit zone
    rightArm.userData = {
        hitZone: 'limb',
        damageFactor: 0.8 // 80% damage for limbs
    };
    
    // Add to group
    armsGroup.add(leftArm);
    armsGroup.add(rightArm);
    
    return armsGroup;
}

function createEnemyWeapon() {
    // Create gun
    const gunGroup = new THREE.Group();
    
    // Gun body
    const gunBodyGeometry = new THREE.BoxGeometry(0.08, 0.1, 0.4);
    const gunMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const gunBody = new THREE.Mesh(gunBodyGeometry, gunMaterial);
    gunBody.castShadow = true;
    
    // Gun barrel
    const gunBarrelGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8);
    const gunBarrel = new THREE.Mesh(gunBarrelGeometry, gunMaterial);
    gunBarrel.rotation.x = Math.PI / 2;
    gunBarrel.position.z = 0.3;
    gunBarrel.castShadow = true;
    
    // Add to group
    gunGroup.add(gunBody);
    gunGroup.add(gunBarrel);
    
    // Position relative to enemy
    gunGroup.position.set(0.4, 0.5, 0.15);
    
    return gunGroup;
}

// Create full enemy object with all components
export function createEnemyObject(x, y, z) {
    // Choose a random enemy type
    const enemyTypeIndex = Math.floor(Math.random() * ENEMY_TYPES.length);
    const enemyType = ENEMY_TYPES[enemyTypeIndex];
    
    // Create main enemy container
    const enemy = new THREE.Group();
    enemy.position.set(x, y, z);
    
    // Create and add body parts
    const body = createEnemyBody(enemyType.color);
    const head = createEnemyHead(enemyType.color);
    const arms = createEnemyArms(enemyType.color);
    const weapon = createEnemyWeapon();
    
    // Add to enemy group
    enemy.add(body);
    enemy.add(head);
    enemy.add(arms);
    enemy.add(weapon);
    
    // Add shooting sound to enemy
    const shootSound = getEnemyShootSound();
    if (shootSound) {
        enemy.add(shootSound);
    }
    
    // Store enemy data in userData
    enemy.userData = {
        type: 'enemy',
        isEnemy: true, // Flag used for hit detection
        health: enemyType.health,
        maxHealth: enemyType.health,
        damage: ENEMY_SETTINGS.ATTACK_DAMAGE * enemyType.damage,
        shootingDamage: ENEMY_SETTINGS.SHOOTING_DAMAGE * enemyType.damage,
        speed: ENEMY_SETTINGS.MOVEMENT_SPEED * enemyType.speed,
        patrolSpeed: ENEMY_SETTINGS.PATROL_SPEED * enemyType.speed,
        attackCooldown: ENEMY_SETTINGS.ATTACK_COOLDOWN / enemyType.fireRate,
        shootingCooldown: ENEMY_SETTINGS.SHOOTING_COOLDOWN / enemyType.fireRate,
        isAttacking: false,
        isShooting: false,
        lastAttackTime: 0,
        lastShootTime: 0,
        spawnPoint: new THREE.Vector3(x, y, z),
        state: 'patrol', // patrol, chase, attack, shooting
        patrolTarget: null,
        currentPatrolDirection: Math.floor(Math.random() * 4),
        lastSeenPlayerPosition: null,
        lastSeenPlayerTime: 0,
        
        // Add custom take damage function to handle hit zones
        takeDamage: function(amount, hitPart) {
            let finalDamage = amount;
            let isCriticalHit = false;
            
            // Apply damage modifiers based on hit zone
            if (hitPart && hitPart.userData && hitPart.userData.hitZone) {
                // Apply damage factor based on hit zone
                finalDamage *= hitPart.userData.damageFactor || 1.0;
                
                // Check for critical hit (headshot)
                if (hitPart.userData.hitZone === 'head' && 
                    Math.random() < (hitPart.userData.criticalHitChance || 0)) {
                    console.log("CRITICAL HEADSHOT!");
                    finalDamage = this.health; // Instant kill
                    isCriticalHit = true;
                }
            }
            
            // Apply damage
            this.health -= finalDamage;
            console.log(`Enemy hit! Damage: ${finalDamage.toFixed(0)}, Remaining health: ${this.health.toFixed(0)}`);
            
            return { 
                damage: finalDamage, 
                isCritical: isCriticalHit,
                hitZone: hitPart?.userData?.hitZone || 'unknown'
            };
        }
    };
    
    // Add to collision objects
    objects.push(enemy);
    
    return enemy;
}
