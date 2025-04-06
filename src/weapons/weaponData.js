// Define weapon data and constants
import * as THREE from 'three';

export const PP7 = {
    modelPath: 'assets/models/pp7.glb',
    position: new THREE.Vector3(0.3, -0.3, -0.5),
    rotation: new THREE.Euler(0, Math.PI, 0),
    scale: new THREE.Vector3(0.15, 0.15, 0.15),
    reloadTime: 1.0,
    magazineSize: 8,
    damage: 25,
    fireRate: 0.25, // Time between shots in seconds
    accuracy: 0.9
};

// Will allow for multiple weapons in the future
export const WEAPONS = {
    PP7
};

// Default weapon settings
export const DEFAULT_WEAPON = PP7;
export const MAX_RESERVE_AMMO = 200;
