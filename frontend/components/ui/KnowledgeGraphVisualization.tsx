'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Badge } from './badge';
import { Button } from './button';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Maximize, 
  Minimize,
  ZoomIn,
  ZoomOut 
} from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'concept' | 'paper' | 'author' | 'institution' | 'keyword';
  position: { x: number; y: number; z: number };
  properties?: Record<string, any>;
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'authored_by' | 'studies' | 'cites' | 'collaborates' | 'related' | 'contains';
  weight: number;
}

interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters?: {
    id: string;
    name: string;
    nodes: string[];
    color: string;
    size: number;
  }[];
}

interface KnowledgeGraphVisualizationProps {
  data: KnowledgeGraphData;
  width?: number;
  height?: number;
  is3D?: boolean;
  isAnimating?: boolean;
  onNodeClick?: (node: GraphNode) => void;
  onEdgeClick?: (edge: GraphEdge) => void;
}

const nodeTypeColors = {
  concept: '#3B82F6',
  paper: '#10B981',
  author: '#F59E0B',
  institution: '#EF4444',
  keyword: '#8B5CF6',
};

const edgeTypeColors = {
  authored_by: '#64748B',
  studies: '#059669',
  cites: '#2563EB',
  collaborates: '#DC2626',
  related: '#7C3AED',
  contains: '#EA580C',
};

export default function KnowledgeGraphVisualization({
  data,
  width = 800,
  height = 600,
  is3D = true,
  isAnimating = false,
  onNodeClick,
  onEdgeClick,
}: KnowledgeGraphVisualizationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<any>();
  const animationRef = useRef<number>();
  const nodesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const edgesRef = useRef<Map<string, THREE.Line>>(new Map());
  const labelSpritesRef = useRef<Map<string, THREE.Sprite>>(new Map());
  const raycasterRef = useRef<THREE.Raycaster>();
  const mouseRef = useRef<THREE.Vector2>();

  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, z: 100 });

  useEffect(() => {
    if (!mountRef.current) return;

    initializeScene();
    createGraph();
    setupEventListeners();
    animate();

    return () => {
      cleanup();
    };
  }, [data, is3D]);

  useEffect(() => {
    if (isAnimating) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }, [isAnimating]);

  const initializeScene = () => {
    // Scene
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(0x1a1a1a);

    // Camera
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    cameraRef.current.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);

    // Renderer
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current.setSize(width, height);
    rendererRef.current.shadowMap.enabled = true;
    rendererRef.current.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    sceneRef.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    sceneRef.current.add(directionalLight);

    // Controls (would need OrbitControls from three/examples/jsm/controls/OrbitControls)
    // For now, we'll handle camera manually

    // Raycaster for mouse interaction
    raycasterRef.current = new THREE.Raycaster();
    mouseRef.current = new THREE.Vector2();

    // Add to DOM
    if (mountRef.current) {
      mountRef.current.appendChild(rendererRef.current.domElement);
    }
  };

  const createGraph = () => {
    if (!sceneRef.current) return;

    // Clear existing objects
    clearGraph();

    // Create nodes
    data.nodes.forEach((node) => {
      createNode(node);
    });

    // Create edges
    data.edges.forEach((edge) => {
      createEdge(edge);
    });
  };

  const createNode = (node: GraphNode) => {
    if (!sceneRef.current) return;

    const geometry = new THREE.SphereGeometry(
      Math.max(2, (node.properties?.size || 5)),
      16,
      16
    );
    
    const material = new THREE.MeshLambertMaterial({
      color: nodeTypeColors[node.type] || '#666666',
      transparent: true,
      opacity: 0.8,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      node.position.x,
      node.position.y,
      is3D ? node.position.z : 0
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { node };

    sceneRef.current.add(mesh);
    nodesRef.current.set(node.id, mesh);

    // Create label
    createLabel(node);
  };

  const createEdge = (edge: GraphEdge) => {
    if (!sceneRef.current) return;

    const sourceNode = data.nodes.find(n => n.id === edge.source);
    const targetNode = data.nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) return;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
      sourceNode.position.x, sourceNode.position.y, is3D ? sourceNode.position.z : 0,
      targetNode.position.x, targetNode.position.y, is3D ? targetNode.position.z : 0,
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: edgeTypeColors[edge.type] || '#666666',
      transparent: true,
      opacity: 0.6,
      linewidth: Math.max(1, edge.weight * 3),
    });

    const line = new THREE.Line(geometry, material);
    line.userData = { edge };

    sceneRef.current.add(line);
    edgesRef.current.set(`${edge.source}-${edge.target}`, line);
  };

  const createLabel = (node: GraphNode) => {
    if (!sceneRef.current) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    const fontSize = 48;
    context.font = `${fontSize}px Arial`;
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    const text = node.label.length > 20 ? node.label.substring(0, 20) + '...' : node.label;
    const textWidth = context.measureText(text).width;
    
    canvas.width = textWidth + 20;
    canvas.height = fontSize + 20;
    
    context.font = `${fontSize}px Arial`;
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    
    sprite.position.set(
      node.position.x,
      node.position.y + 10,
      is3D ? node.position.z : 0
    );
    sprite.scale.set(canvas.width / 10, canvas.height / 10, 1);

    sceneRef.current.add(sprite);
    labelSpritesRef.current.set(node.id, sprite);
  };

  const clearGraph = () => {
    if (!sceneRef.current) return;

    // Remove nodes
    nodesRef.current.forEach((mesh) => {
      sceneRef.current?.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    nodesRef.current.clear();

    // Remove edges
    edgesRef.current.forEach((line) => {
      sceneRef.current?.remove(line);
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    });
    edgesRef.current.clear();

    // Remove labels
    labelSpritesRef.current.forEach((sprite) => {
      sceneRef.current?.remove(sprite);
      sprite.material.dispose();
    });
    labelSpritesRef.current.clear();
  };

  const setupEventListeners = () => {
    if (!rendererRef.current) return;

    const canvas = rendererRef.current.domElement;

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onMouseClick);
    canvas.addEventListener('wheel', onMouseWheel);
  };

  const onMouseMove = (event: MouseEvent) => {
    if (!rendererRef.current || !cameraRef.current || !raycasterRef.current) return;

    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouseRef.current!.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current!.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current!, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(
      Array.from(nodesRef.current.values())
    );

    if (intersects.length > 0) {
      const node = intersects[0].object.userData.node;
      setHoveredNode(node);
    } else {
      setHoveredNode(null);
    }
  };

  const onMouseClick = (event: MouseEvent) => {
    if (!rendererRef.current || !cameraRef.current || !raycasterRef.current) return;

    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouseRef.current!.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current!.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current!, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(
      Array.from(nodesRef.current.values())
    );

    if (intersects.length > 0) {
      const node = intersects[0].object.userData.node;
      setSelectedNode(node);
      onNodeClick?.(node);
    }
  };

  const onMouseWheel = (event: WheelEvent) => {
    if (!cameraRef.current) return;

    const zoomSpeed = 0.1;
    const direction = event.deltaY > 0 ? 1 : -1;
    
    cameraRef.current.position.multiplyScalar(1 + direction * zoomSpeed);
    setCameraPosition({
      x: cameraRef.current.position.x,
      y: cameraRef.current.position.y,
      z: cameraRef.current.position.z,
    });
  };

  const animate = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    const render = () => {
      if (isAnimating) {
        // Rotate camera around the scene
        const time = Date.now() * 0.001;
        const radius = 100;
        cameraRef.current!.position.x = Math.cos(time) * radius;
        cameraRef.current!.position.z = Math.sin(time) * radius;
        cameraRef.current!.lookAt(0, 0, 0);
      }

      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
      animationRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const startAnimation = () => {
    // Animation is handled in the render loop
  };

  const stopAnimation = () => {
    // Animation is controlled by isAnimating prop
  };

  const resetCamera = () => {
    if (!cameraRef.current) return;
    
    cameraRef.current.position.set(0, 0, 100);
    cameraRef.current.lookAt(0, 0, 0);
    setCameraPosition({ x: 0, y: 0, z: 100 });
  };

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    clearGraph();
    
    if (rendererRef.current) {
      rendererRef.current.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    }
  };

  return (
    <div className="relative">
      <div ref={mountRef} className="rounded-lg overflow-hidden border" />
      
      {/* Controls */}
      <div className="absolute top-4 left-4 space-y-2">
        <Badge variant="secondary">
          {data.nodes.length} nodes
        </Badge>
        <Badge variant="secondary">
          {data.edges.length} edges
        </Badge>
        {data.clusters && (
          <Badge variant="secondary">
            {data.clusters.length} clusters
          </Badge>
        )}
      </div>

      {/* Hovered Node Info */}
      {hoveredNode && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border max-w-xs">
          <h4 className="font-semibold text-sm">{hoveredNode.label}</h4>
          <p className="text-xs text-muted-foreground capitalize">{hoveredNode.type}</p>
          {hoveredNode.properties && (
            <div className="mt-2 space-y-1">
              {Object.entries(hoveredNode.properties).slice(0, 3).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="capitalize">{key.replace('_', ' ')}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">{selectedNode.label}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedNode(null)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
          <p className="text-sm text-muted-foreground capitalize mb-2">{selectedNode.type}</p>
          {selectedNode.properties && (
            <div className="space-y-1">
              {Object.entries(selectedNode.properties).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="capitalize">{key.replace('_', ' ')}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Camera Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={resetCamera}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onMouseWheel({ deltaY: -120 } as WheelEvent)}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onMouseWheel({ deltaY: 120 } as WheelEvent)}>
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border max-w-xs">
        <h4 className="font-semibold text-sm mb-2">Node Types</h4>
        <div className="space-y-1">
          {Object.entries(nodeTypeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 