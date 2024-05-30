import { SpeedInsights } from '@vercel/speed-insights/next';
import { type PropsWithChildren } from 'react';

export const metadata = {
  title: '@brickifyio/editor',
};

type Props = PropsWithChildren;

const RootLayout: React.FC<Props> = ({ children }) => {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}

export default RootLayout;
