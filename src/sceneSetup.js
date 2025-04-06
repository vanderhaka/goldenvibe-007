import * as THREE from 'three';
import {
    scene,
    camera,
    renderer,
    setScene,
    setCamera,
    setRenderer,
    setAudioListener
} from './globals.js';

export function initScene() {
    const newScene = new THREE.Scene();
    newScene.background = new THREE.Color(0x87ceeb); // Sky blue background
    newScene.fog = new THREE.Fog(0x87ceeb, 0, 75);
    setScene(newScene);
}

export function initCamera() {
    const newCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Add AudioListener
    const listener = new THREE.AudioListener();
    newCamera.add(listener); // Attach listener to camera
    setAudioListener(listener); // Store globally

    setCamera(newCamera);
    scene.add(camera); // Add camera to the scene so we can attach things to it
}

export function initRenderer() {
    const newRenderer = new THREE.WebGLRenderer({ antialias: true });
    newRenderer.setSize(window.innerWidth, window.innerHeight);
    newRenderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(newRenderer.domElement);
    setRenderer(newRenderer);
}

export function initLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);
}

export function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}