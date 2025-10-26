import { AuthProvider } from './providers/AuthProvider';
import './globals.css';

export const metadata = {
  title: '4AIV5',
  description: '4AI Comparison Tool - Compare responses from Claude, ChatGPT, Grok, and Perplexity',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
