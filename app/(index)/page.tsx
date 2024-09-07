
"use client"

import { extend } from '@react-three/fiber'
import { BoxGeometry } from 'three'
import { ARCanvas, ARMarker } from "@artcom/react-three-arjs"
import { useLayoutEffect } from 'react';
import { useConnectionMessage } from '../../util/useConnectionMessage';

import dynamic from 'next/dynamic';
import LandingPage from './LandingPage';


const ARScene = dynamic(() => import('../../components/ARScene'), { ssr: false });



export default function Index() {

    useLayoutEffect(() => {
        const name = 'launch_map';
        const data = null;

        useConnectionMessage(name, data);

      }, []); 
    // const { scene } = useGLTF('/ball.glb')
    console.log(123);
    return (
        <>
            <LandingPage/>
        </>
    )
}

