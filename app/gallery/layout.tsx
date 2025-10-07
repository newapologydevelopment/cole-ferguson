import React, { ReactNode } from 'react';
import { LenisProvider } from '../components';

interface Props {
    children: ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
    return (
        <section className='h-[400vh] bg-green-50 p-[24px]'>
            {children}
            <LenisProvider />
        </section>
    )
}

export default Layout