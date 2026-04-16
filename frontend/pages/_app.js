import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0a1a18',
            color: '#e8f4f3',
            border: '1px solid #1a3532',
            borderRadius: '12px',
            fontFamily: 'DM Sans, sans-serif',
          },
          success: { iconTheme: { primary: '#1ea99e', secondary: '#050d0c' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#050d0c' } },
        }}
      />
    </>
  );
}
