// _app.js
import "@/styles/globals.css";
import { AuthProvider } from '@/store/authContext';
import AppNavbar from '@/components/AppNavbar/AppNavbar';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isHome = router.pathname === '/';

  return (
    <AuthProvider>
      {isHome ? (
        <Component {...pageProps} />
      ) : (
        <>
          <AppNavbar />
          <Component {...pageProps} />
        </>
      )}
    </AuthProvider>
  );
}
