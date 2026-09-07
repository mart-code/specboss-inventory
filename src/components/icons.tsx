import { ReactNode, ReactElement } from "react";

interface IconProps {
  className?: string;
  children?: ReactNode;
}

function Icon({ className = "w-5 h-5", children }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      {children}
    </svg>
  );
}

export const icons: Record<string, ReactElement> = {
  dashboard: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5V6a3 3 0 013-3h9a9 9 0 11-9 9v2.5M12 12V3m0 0l-3 3m3-3l3 3" />
    </Icon>
  ),
  products: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 6.75l-1.5 6h18l-1.5-6M3.75 6.75L2.25 3h19.5l-1.5 3.75z" />
    </Icon>
  ),
  inventory: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.174-.087A3.75 3.75 0 0016.5 4.5h-3a.75.75 0 00-.75.75V9h-3V4.5A2.25 2.25 0 009 2.25h6a2.25 2.25 0 012.25 2.25v3.75zM6.75 8.25C6.75 6.84 7.89 5.75 9.25 5.75h5.5c1.36 0 2.5 1.14 2.5 2.5v6.5a2.5 2.5 0 01-2.5 2.5h-5.5A2.5 2.5 0 014.25 14.75V8.25z" />
    </Icon>
  ),
  orders: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6a2 2 0 012-2h1l2 2h6l2-2h1a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />
    </Icon>
  ),
  companies: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M5.25 21a2.25 2.25 0 11-4.5 0m4.5 0V10.5A2.25 2.25 0 019 8.25h6a2.25 2.25 0 012.25 2.25V21m-6 0h6M9 21V9.75a2.25 2.25 0 011.125-1.95l3-1.5a2.25 2.25 0 013 1.95V21" />
    </Icon>
  ),
  states: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6.75c0 1.38-.71 2.62-1.875 3.25A4.5 4.5 0 003 15.75c0 .52.185 1 .525 1.375.35.375.87.59 1.425.59h12.57c.555 0 1.07-.215 1.425-.59.34-.375.525-.855.525-1.375a4.498 4.498 0 00-1.875-3.25 3.998 3.998 0 010-6.5A3.998 3.998 0 0118.75 6.75c0-1.14-.48-2.2-1.25-2.875a4.267 4.267 0 00-3.625-.875 4.23 4.23 0 00-2.875.875A4.23 4.23 0 003 6.75z" />
    </Icon>
  ),
  reports: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5h1.5L6 6h12L21 7.5V3M3 3h18M3 3l-3 9v6h6v-6h6v6h6v-6l-3-9z" />
    </Icon>
  ),
};
