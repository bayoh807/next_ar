import Image from 'next/image';
import React from 'react';

const LandingPage: React.FC = () => {
    return (
        <div className=" bg-sky-50 ">
            <div className="w-full h-screen relative bg-cover bg-no-repeat bg-bottom bg-[url('/background.svg')] ">
                    <Image
                        className="absolute animate__animated animate__bounceInRight  top-[20%] right-0 max-w-[300px] w-100"
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
