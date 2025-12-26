import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M232 128a104 104 0 1 1-104-104a104.11 104.11 0 0 1 104 104Z"
        opacity=".2"
      />
      <path
        fill="currentColor"
        d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Zm-22-54.19a8 8 0 0 1-10.42 1.5l-24-12a8 8 0 0 1 0-14.62l24-12a8 8 0 0 1 10.42 1.5a8 8 0 0 1-1.5 10.42L95.38 128l18.7 9.35a8 8 0 0 1 1.5 10.42Zm39.51-24.31a8 8 0 0 1 2.49-11l32-24a8 8 0 0 1 11 11l-32 24a8 8 0 0 1-8.51 0a8.1 8.1 0 0 1-2.48 0Zm0 27.5a8 8 0 0 1 2.49-11l48-36a8 8 0 0 1 11 11l-48 36a8 8 0 0 1-8.51 0a8.1 8.1 0 0 1-2.48 0Zm-40.06 31.43a8 8 0 0 1-11-2.49l-16-32a8 8 0 0 1 13.42-6.71l16 32a8 8 0 0 1-2.42 11.2Z"
      />
    </svg>
  );
}
