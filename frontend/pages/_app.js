import React from 'react';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import { WalletProvider } from '../contexts/WalletContext';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          <title>BlocPol - Secure Blockchain Voting</title>
          <meta name="description" content="A secure, transparent, and verifiable voting system powered by blockchain technology." />
        </Head>
        
        <Component {...pageProps} />
        
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="rounded-2xl"
          bodyClassName="font-medium"
        />
      </WalletProvider>
    </ErrorBoundary>
  );
}