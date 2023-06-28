import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'BrickJS',
};

type Props = PropsWithChildren;

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
