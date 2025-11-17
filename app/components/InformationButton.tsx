'use client';

import { useEffect, useState } from 'react';

export function InformationButton() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleStateChange = (e: CustomEvent<{ open: boolean }>) => {
      setIsOpen(e.detail.open);
    };

    window.addEventListener(
      'infoshell:state',
      handleStateChange as EventListener
    );
    return () => {
      window.removeEventListener(
        'infoshell:state',
        handleStateChange as EventListener
      );
    };
  }, []);

  const handleClick = () => {
    window.dispatchEvent(new Event('infoshell:toggle'));
  };

  return (
    <div
      className={`hidden xl:block cursor-pointer transition-opacity duration-500 hover:text-[#717171] transition-colors duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      data-hide-cursor="true"
      onClick={handleClick}
    >
      Information
    </div>
  );
}
