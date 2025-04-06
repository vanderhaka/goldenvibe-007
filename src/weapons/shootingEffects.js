import * as THREE from 'three';
import { scene } from '../globals.js';
import { damageEnemy } from '../enemyManager.js';

// Creates a visual effect at the bullet impact point
export function createBulletImpact(position, isEnemy = false) {
    // Create a small sphere to represent the impact point
    const geometry = new THREE.SphereGeometry(0.02, 8, 8);
    // Use red for enemy hits, yellow for other surfaces
    const material = new THREE.MeshBasicMaterial({ 
        color: isEnemy ? 0xff0000 : 0xffff00,
        transparent: true,
        opacity: 0.8
    });
    const impactMesh = new THREE.Mesh(geometry, material);
    impactMesh.position.copy(position);
    scene.add(impactMesh);

    // Add a point light at the impact point for a flash effect
    const impactLight = new THREE.PointLight(
        isEnemy ? 0xff0000 : 0xffff00, // Same color as the impact
        1, // Intensity
        0.5 // Distance the light reaches
    );
    impactLight.position.copy(position);
    scene.add(impactLight);

    // Create blood splatter effect for enemy hits
    if (isEnemy) {
        createBloodSplatter(position);
    }

    // Decay effect for the impact
    const startTime = Date.now();
    const duration = 200; // milliseconds
    
    function animateImpact() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress < 1) {
            // Gradually reduce the opacity and light intensity
            impactMesh.material.opacity = 0.8 * (1 - progress);
            impactLight.intensity = 1 * (1 - progress);
            requestAnimationFrame(animateImpact);
        } else {
            // Remove the impact and light from the scene when done
            scene.remove(impactMesh);
            scene.remove(impactLight);
            impactMesh.geometry.dispose();
            impactMesh.material.dispose();
        }
    }
    
    requestAnimationFrame(animateImpact);
}

// Enhanced blood splatter with options
function createBloodSplatter(position, options = {}) {
    // Default options
    const settings = {
        particleCount: options.particleCount || 15,
        particleSize: options.particleSize || 0.03,
        spread: options.spread || 0.1,
        color: options.color || 0xdd0000,
        duration: options.duration || 500
    };
    
    // Create blood particles
    for (let i = 0; i < settings.particleCount; i++) {
        // Create small red sphere for blood particle
        const size = Math.random() * settings.particleSize + 0.01;
        const particleGeometry = new THREE.SphereGeometry(size, 6, 6);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: settings.color,
            transparent: true,
            opacity: 0.9
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Set initial position at impact point
        particle.position.copy(position);
        
        // Add random velocity in a cone shape away from impact
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * settings.spread,
            Math.random() * settings.spread,
            (Math.random() - 0.5) * settings.spread
        );
        
        // Slightly bias direction outward from impact
        const outwardDir = new THREE.Vector3().copy(velocity).normalize();
        velocity.add(outwardDir.multiplyScalar(0.05));
        
        // Add gravity effect
        const gravity = -0.005;
        
        // Add to scene
        scene.add(particle);
        
        // Animate the particle
        const startTime = Date.now();
        const duration = settings.duration + Math.random() * 300;
        
        function animateBloodParticle() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                // Move according to velocity and gravity
                particle.position.x += velocity.x;
                particle.position.y += velocity.y + (gravity * elapsed / 50);
                particle.position.z += velocity.z;
                
                // Reduce opacity over time
                particle.material.opacity = 0.9 * (1 - progress);
                
                requestAnimationFrame(animateBloodParticle);
            } else {
                // Remove particle when done
                scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
            }
        }
        
        requestAnimationFrame(animateBloodParticle);
    }
}

// Creates a visual tracer effect for the bullet's path
export function createBulletTracer(startPosition, endPosition) {
    // Calculate direction and length of the tracer
    const direction = new THREE.Vector3().subVectors(endPosition, startPosition);
    const length = direction.length();
    
    // Create a line for the tracer
    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -length)
    ]);
    
    // Create a glowing yellow material for the tracer
    const material = new THREE.LineBasicMaterial({ 
        color: 0xffff00,
        transparent: true,
        opacity: 0.6,
        linewidth: 1
    });
    
    const tracer = new THREE.Line(geometry, material);
    
    // Position and orient the tracer
    tracer.position.copy(startPosition);
    tracer.lookAt(endPosition);
    
    scene.add(tracer);
    
    // Fade out and remove the tracer
    const startTime = Date.now();
    const duration = 150; // milliseconds
    
    function animateTracer() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress < 1) {
            tracer.material.opacity = 0.6 * (1 - progress);
            requestAnimationFrame(animateTracer);
        } else {
            scene.remove(tracer);
            tracer.geometry.dispose();
            tracer.material.dispose();
        }
    }
    
    requestAnimationFrame(animateTracer);
}

// Recursive function to find the root enemy object from a hit object
function findEnemyRoot(object) {
    console.log("🔍 DEBUG: findEnemyRoot examining object:", object && object.uuid ? object.uuid.substring(0, 6) : 'undefined');
    
    // If object is null or undefined, return early
    if (!object) {
        console.log("🔍 DEBUG: Object is null or undefined");
        return { root: null, part: null };
    }
    
    // Check for userData - needed to identify enemy parts
    if (!object.userData) {
        console.log("🔍 DEBUG: Object has no userData");
        return { root: null, part: null };
    }

    // DETAILED DEBUG - Print object's full userData for debugging
    console.log("🔍 DEBUG: Object userData:", JSON.stringify(object.userData));
    
    // If this is the enemy root itself
    if (object.userData && object.userData.isEnemy) {
        console.log("🔍 DEBUG: Found enemy root directly:", object);
        return { root: object, part: object };
    }
    
    // If this is a part of an enemy
    if (object.userData && object.userData.hitZone) {
        console.log("🔍 DEBUG: Found enemy part with hitZone:", object.userData.hitZone);
        // Start looking for parent
        let current = object;
        let depth = 0;
        while (current.parent && depth < 10) { // Limit search depth to avoid infinite loops
            depth++;
            // Move up to parent
            current = current.parent;
            console.log(`🔍 DEBUG: Checking parent at depth ${depth}:`, current);
            
            // Check if we have userData and if parent is an enemy
            if (current.userData) {
                console.log("🔍 DEBUG: Parent userData:", JSON.stringify(current.userData));
            }
            
            // Check if this is the enemy root
            if (current.userData && current.userData.isEnemy) {
                console.log("🔍 DEBUG: Found enemy root at parent level:", current);
                return { root: current, part: object };
            }
        }
        
        if (depth >= 10) {
            console.warn("⚠️ WARNING: Reached maximum parent search depth without finding enemy root");
        }
    }
    
    // New approach: Check direct parent hierarchy before going deeper into children
    if (object.parent) {
        console.log("🔍 DEBUG: Checking object's parent directly");
        let parent = object.parent;
        if (parent.userData && parent.userData.isEnemy) {
            console.log("🔍 DEBUG: Found enemy root as direct parent!");
            return { root: parent, part: object };
        }
        
        // Try one more level up (grandparent)
        if (parent.parent && parent.parent.userData && parent.parent.userData.isEnemy) {
            console.log("🔍 DEBUG: Found enemy root as grandparent!");
            return { root: parent.parent, part: object };
        }
    }
    
    // Traverse all children recursively
    if (object.children && object.children.length > 0) {
        console.log(`🔍 DEBUG: Searching ${object.children.length} children`);
        for (const child of object.children) {
            const result = findEnemyRoot(child);
            if (result.root) {
                console.log("🔍 DEBUG: Found enemy through child traversal");
                return result;
            }
        }
    }
    
    // No enemy found
    console.log("🔍 DEBUG: No enemy found in this branch");
    return { root: null, part: null };
}

// Process what happens when a bullet hits something
export function processHit(hitObject, hitPosition) {
    console.log("⚡ DEBUG: processHit started with object:", hitObject);
    console.log("⚡ DEBUG: Hit position:", hitPosition);
    
    // Find the enemy root and hit part using our recursive function
    console.log("⚡ DEBUG: Calling findEnemyRoot to locate enemy hierarchy");
    const { root: enemyRoot, part: hitPart } = findEnemyRoot(hitObject);
    const isEnemy = !!enemyRoot;
    
    // Debug logging
    console.log(`⚡ DEBUG: Hit detection result: isEnemy=${isEnemy}`);
    if (isEnemy) {
        console.log(`⚡ DEBUG: Found enemy root:`, enemyRoot);
        console.log(`⚡ DEBUG: Hit part:`, hitPart?.userData?.hitZone || "unknown");
        console.log(`⚡ DEBUG: Current enemy health:`, enemyRoot.userData?.health);
    }
    
    // Create the impact effect
    console.log(`⚡ DEBUG: Creating bullet impact effect, isEnemy=${isEnemy}`);
    createBulletImpact(hitPosition, isEnemy);
    
    // If it's an enemy, handle damage
    if (isEnemy && enemyRoot) {
        // Create more effects for critical hits
        const isCriticalHitZone = hitPart?.userData?.hitZone === 'head';
        const baseColor = isCriticalHitZone ? 0xff0000 : 0xdd0000; // Brighter red for headshots
        
        // Apply high damage to ensure enemies die - increase from 60 to 100 for faster kills
        const damageAmount = 100; // Guaranteed one-shot kill for standard enemies
        console.log(`💥 DEBUG: Applying ${damageAmount} damage to enemy`);
        let hitResult = { damage: damageAmount, isCritical: false, hitZone: 'body' };
        
        try {
            // Check if we have a proper enemy object with damage handling
            if (enemyRoot.userData && typeof enemyRoot.userData.takeDamage === 'function') {
                // Use the enemy's built-in damage function if available, passing the hit part
                console.log(`💥 DEBUG: Using enemy's built-in takeDamage function`);
                hitResult = enemyRoot.userData.takeDamage(damageAmount, hitPart);
                
                // Debug logging for health tracking
                console.log(`💥 DEBUG: Enemy health after hit: ${enemyRoot.userData.health}`);
                if (enemyRoot.userData.health <= 0) {
                    console.log("💥 DEBUG: Enemy should be dead! Health <= 0");
                }
            } else {
                // Otherwise use the general damageEnemy function
                console.log(`💥 DEBUG: Using general damageEnemy function`);
                const killed = damageEnemy(enemyRoot, damageAmount);
                console.log("💥 DEBUG: damageEnemy result (killed):", killed);
            }
        } catch (error) {
            console.error("💥 ERROR: Error applying damage to enemy:", error);
            // Force removal of enemy as a fallback
            try {
                console.log("💥 DEBUG: Forcing enemy removal due to error");
                damageEnemy(enemyRoot, 9999);
            } catch (e) {
                console.error("💥 ERROR: Even forced enemy removal failed:", e);
            }
        }
        
        // Create additional effects for headshots
        if (hitPart?.userData?.hitZone === 'head') {
            console.log("🎯 DEBUG: Creating headshot effects");
            // Create a larger blood splatter for headshots
            const headShotPosition = hitPosition.clone();
            createBloodSplatter(headShotPosition, {
                particleCount: 25,
                particleSize: 0.04,
                spread: 0.15,
                color: baseColor,
                duration: 800
            });
            
            // Add a special effect for critical hits (instant kills)
            if (hitResult.isCritical) {
                console.log("🎯 DEBUG: Critical headshot detected!");
                // Create a flash effect
                const flashLight = new THREE.PointLight(0xff0000, 2, 3);
                flashLight.position.copy(hitPosition);
                scene.add(flashLight);
                
                // Remove after a short duration
                setTimeout(() => {
                    scene.remove(flashLight);
                }, 150);
                
                console.log("🎯 DEBUG: CRITICAL HEADSHOT! Instant kill!");
            }
        }
        
        // Return true to indicate an enemy was hit (so sounds can be played)
        return true;
    }
    
    return isEnemy;
}
