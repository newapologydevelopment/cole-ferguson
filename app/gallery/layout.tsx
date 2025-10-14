import React, { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
    return (
        <section className=''>
            {children}
            {/* <LenisProvider /> */}
        </section>
    )
}

export default Layout