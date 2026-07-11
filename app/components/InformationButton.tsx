'use client';

export function InformationButton() {
  const handleClick = () => {
    window.dispatchEvent(new Event('infoshell:toggle'));
  };

  return (
    <div
      className="hidden xl:block cursor-pointer hover:text-[#717171] transition-colors duration-300"
      data-hide-cursor="true"
      data-information-control
      onClick={handleClick}
    >
      Information
    </div>
  );
}
