import { SpeedInsights } from '@vercel/speed-insights/next';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: '@brickifyio/editor',
};

type Props = PropsWithChildren;

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
