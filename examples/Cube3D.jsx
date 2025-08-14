// @requires three@^0.160.0
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

function Cube3D() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cubeRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);
  const [isRotating, setIsRotating] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  
  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // White background
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75, 
      400 / 300, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 300);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    
    // Cube geometry and material
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x8b5cf6, // Purple
      shininess: 100,
      wireframe: false
    });
    
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cubeRef.current = cube;
    scene.add(cube);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xf8f8f2, 0.4); // Soft white light
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x50fa7b, 1); // Green light
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xff79c6, 0.8, 100); // Pink light
    pointLight.position.set(-5, 5, 0);
    scene.add(pointLight);
    
    // Add to DOM
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }
    
    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      if (isRotating && cubeRef.current) {
        cubeRef.current.rotation.x += 0.01;
        cubeRef.current.rotation.y += 0.01;
      }
      
      renderer.render(scene, camera);
    };
    animate();
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isRotating]);
  
  // Update wireframe when toggle changes
  useEffect(() => {
    if (cubeRef.current) {
      cubeRef.current.material.wireframe = wireframe;
    }
  }, [wireframe]);
  
  const resetRotation = () => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x = 0;
      cubeRef.current.rotation.y = 0;
    }
  };
  
  const randomColor = () => {
    if (cubeRef.current) {
      const colors = [0x8b5cf6, 0x50fa7b, 0xff79c6, 0xffb86c, 0xff5555, 0x6272a4];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      cubeRef.current.material.color.setHex(randomColor);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-600 mt-10">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Zap className="text-purple-400" size={28} />
        <h2 className="text-2xl font-bold text-white">
          Three.js 3D Cube
        </h2>
      </div>
      
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mb-6">
        <div ref={mountRef} className="flex justify-center" />
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button 
          onClick={() => setIsRotating(!isRotating)}
          className={`flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 ${
            isRotating 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-500 hover:bg-gray-400 text-white'
          }`}
        >
          {isRotating ? <Pause size={16} /> : <Play size={16} />}
          {isRotating ? 'Pause' : 'Play'}
        </button>
        
        <button 
          onClick={resetRotation}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setWireframe(!wireframe)}
          className={`px-4 py-2 font-medium rounded-lg transition-all duration-200 ${
            wireframe 
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-600 hover:bg-gray-500 text-white'
          }`}
        >
          {wireframe ? 'Solid' : 'Wireframe'}
        </button>
        
        <button 
          onClick={randomColor}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          Random Color
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          🎮 Interactive 3D cube powered by Three.js
        </p>
      </div>
    </div>
  );
}

export default Cube3D;
