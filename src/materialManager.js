import * as THREE from 'three';

// Texture Loader
const textureLoader = new THREE.TextureLoader();

// Load and configure textures
export function createMaterials() {
    // Load textures
    const wallTexture = textureLoader.load('assets/images/wall-tile.png');
    const floorTexture = textureLoader.load('assets/images/floor-tile.png');
    
    // Configure texture repetition
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    
    // Adjust repetition based on texture size and desired scale
    wallTexture.repeat.set(1, 1);
    floorTexture.repeat.set(0.5, 0.5);
    
    // Create materials with textures
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        map: wallTexture,
        roughness: 0.7,
        metalness: 0.2
    });
    
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        map: floorTexture,
        roughness: 0.8,
        metalness: 0.1
    });
    
    const ceilingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x444444 
    });
    
    const doorFrameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x444444 
    });
    
    return {
        wallMaterial,
        floorMaterial,
        ceilingMaterial,
        doorFrameMaterial,
        wallTexture,
        floorTexture
    };
}

// Create a wall-specific material with properly scaled texture
export function createWallMaterial(baseMaterial, wallTexture, length, height) {
    const wallMaterialClone = baseMaterial.clone();
    wallMaterialClone.map = wallTexture.clone();
    wallMaterialClone.map.repeat.set(length / 2, height / 2);
    return wallMaterialClone;
}

// Create a floor-specific material with properly scaled texture
export function createFloorMaterial(baseMaterial, floorTexture, width, depth) {
    const floorMaterialClone = baseMaterial.clone();
    floorMaterialClone.map = floorTexture.clone();
    floorMaterialClone.map.repeat.set(width / 5, depth / 5); // Repeat texture every 5 units
    return floorMaterialClone;
}
