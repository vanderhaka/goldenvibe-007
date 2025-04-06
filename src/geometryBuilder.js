import * as THREE from 'three';
import { scene, objects } from './globals.js';
import { createWallMaterial, createFloorMaterial } from './materialManager.js';

// Function to create a wall
export function createWall(start, end, height, baseMaterial, wallTexture, y = 0) {
    // Calculate center position, width, and rotation
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const length = Math.sqrt(dx * dx + dz * dz);

    // Don't create walls with zero length
    if (length < 0.01) return null;

    const centerX = (start.x + end.x) / 2;
    const centerZ = (start.z + end.z) / 2;
    const angle = Math.atan2(dz, dx);

    // Create wall geometry at the calculated center position
    const wallGeometry = new THREE.BoxGeometry(length, height, 0.3); // Wall thickness is 0.3
    
    // Create material with correct texture scaling
    const wallMaterialInstance = createWallMaterial(baseMaterial, wallTexture, length, height);
    
    const wall = new THREE.Mesh(wallGeometry, wallMaterialInstance);
    wall.position.set(centerX, y + height / 2, centerZ);
    wall.rotation.y = angle;
    scene.add(wall);
    objects.push(wall);
    return wall;
}

// Function to create a floor panel
export function createFloorPanel(points, baseMaterial, floorTexture, y = 0) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].z);

    for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i].x, points[i].z);
    }
    
    // Close the shape
    shape.lineTo(points[0].x, points[0].z);

    const geometry = new THREE.ShapeGeometry(shape);
    
    // Calculate floor dimensions to adjust texture repeat
    const bounds = {
        minX: Math.min(...points.map(p => p.x)),
        maxX: Math.max(...points.map(p => p.x)),
        minZ: Math.min(...points.map(p => p.z)),
        maxZ: Math.max(...points.map(p => p.z))
    };
    
    const width = bounds.maxX - bounds.minX;
    const depth = bounds.maxZ - bounds.minZ;
    
    // Create material with correct texture scaling
    const floorMaterialInstance = createFloorMaterial(baseMaterial, floorTexture, width, depth);
    
    const mesh = new THREE.Mesh(geometry, floorMaterialInstance);
    mesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    mesh.position.y = y;
    scene.add(mesh);
    objects.push(mesh);
    return mesh;
}
