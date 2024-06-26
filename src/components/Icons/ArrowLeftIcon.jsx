import { useTheme } from '@emotion/react';

export default function ArrowRightIcon(props) {
  const theme = useTheme();
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width='16' height='16' viewBox="0 0 16 16"
      fill={theme.palette.icon.fill.primary}
      {...props}
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M10.3536 13.3536C10.5488 13.1583 10.5488 12.8417 10.3536 12.6464L5.70711 8L10.3536 3.35355C10.5488 3.15829 10.5488 2.84171 10.3536 2.64645C10.1583 2.45118 9.84171 2.45118 9.64645 2.64645L5 7.29289C4.60948 7.68342 4.60948 8.31658 5 8.70711L9.64645 13.3536C9.84171 13.5488 10.1583 13.5488 10.3536 13.3536Z" />    </svg>
  );
}
