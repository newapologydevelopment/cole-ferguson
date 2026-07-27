'use client';

export function InformationButton() {
  const handleClick = () => {
    window.dispatchEvent(new Event('infoshell:toggle'));
  };

  return (
    <button
      type="button"
      className="hidden xl:block cursor-pointer hover:text-[#717171] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2"
      data-hide-cursor="true"
      data-information-control
      onClick={handleClick}
    >
      Information
    </button>
  );
}
