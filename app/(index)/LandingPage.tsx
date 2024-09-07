import Image from 'next/image';
import React from 'react';

const LandingPage: React.FC = () => {
    return (
        <div className="relative w-full h-screen bg-sky-50 flex flex-col justify-between">
            <Image
                src="/background.svg"
                layout="fill"
                quality={100}
                alt="Background"
                priority
            />
            <div className="absolute bottom-20 right-0">
                <Image
                    src="/monkey-scooter.svg"
                    width={500}
                    height={500}
                    objectFit="contain"
                    alt="Monkey riding a scooter"
                />
            </div>
        </div>
    );
};

export default LandingPage;