
"use client"

import { useLayoutEffect, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import LandingPage from './LandingPage';
import { handleConnectionMessage } from '../../util/handleConnectionMessage';


// const ARScene = dynamic(() => import('../../components/ARScene'), { ssr: false });



export default function Index() {

    const router = useRouter();
    const [data, setData] = useState<any>(null);

    useLayoutEffect(() => {
        const name = 'launch_map';
        let data = null;

        const handleMessage = async () => {
            await handleConnectionMessage(name, data);
            setData(data);
        };

        handleMessage();
        setTimeout(() => {
            console.log(111);
            setData(1);
        }, 6000);

    }, []);

    useEffect(() => {
        if (data) {
            // router.push('/map');
        }
    }, [data, router]);

    return (
        <>
            <LandingPage/>
        </>
    )
}

