import Image from 'next/image';
import React from 'react';
import Logo from './../../public/Logo.gif'
import Monkey from './../../public/monkey-scooter.svg'
import Bg from './../../public/monkey-scooter.svg'
const LandingPage: React.FC = () => {

    console.log(Bg)

    return (
        <div className=" bg-sky-50 ">
            <div className={`w-full h-screen relative bg-cover bg-no-repeat bg-bottom loading-bg`}

            >
                    <Image
                        className="absolute animate__animated top-[1%] left-10 max-w-[200px] w-100 max-h-[100px] "
                        src={Logo}

                        width={500}
                        height={500}
                        objectFit="contain"
                        alt="Monkey riding a scooter"
                    />
                    <Image
                        className="absolute animate__animated animate__bounceInRight  top-[20%] right-0 max-w-[300px] w-100"
                        src={Monkey}
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
