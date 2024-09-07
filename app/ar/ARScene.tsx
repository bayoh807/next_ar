"use client"

import { ARCanvas, ARMarker } from '@artcom/react-three-arjs';
import { useEffect, useState, useRef } from 'react';
import { Box } from '@react-three/drei';
import { useGLTF } from '@react-three/drei';
import  ball  from  '../../public/Ball.glb';


const Model = ({ url }: { url: string }) => {
    const { scene } = useGLTF(url);
    useEffect(() => {
    console.log('Model loaded', scene);
  }, [scene]);
  return <primitive object={scene} scale={[1, 1, 1]} position={[0, 0, 0]} />;
};

export default function ARScene() {
    const [isClient, setIsClient] = useState(true);
    const domElementRef = useRef(null);
    useEffect(() => {
        // setIsClient(true);
        // if (domElementRef.current) {
        //     // Ensure the DOM element exists before modifying its style
        //     domElementRef.current.style.backgroundColor = 'blue';
        // }
    }, []);
    useEffect(() => {

        console.log('ARScene mounted');
    }, []);
    return (
       isClient && (  <div >
        <ARCanvas>
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 10, 5]} intensity={1} />
          <ARMarker
            type="pattern"
            patternUrl="./patt.hiro"
            onMarkerFound={() => console.log('Marker found')}
            onMarkerLost={() => console.log('Marker lost')}
          >
            <Box position={[0, 1, 0]} scale={[0.5, 0.5, 0.5]}>
              <meshStandardMaterial attach="material" color="yellow" />
            </Box>
            <Model url={ball}/>
          </ARMarker>
        </ARCanvas>
       </div>)
    );
}
