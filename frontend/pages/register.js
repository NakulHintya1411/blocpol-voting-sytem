import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useWallet } from '../contexts/WalletContext';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Mail, Wallet, CheckCircle, AlertCircle } from 'lucide-react';

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

export default function Register() {
  const router = useRouter();
  const { account, isConnected, connectWallet, signMessage } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (isConnected && account) {
      checkRegistrationStatus();
    }
  }, [isConnected, account]);

  const checkRegistrationStatus = async () => {
    try {
      const status = await apiService.getVoterStatus(account);
      if (status.registered) {
        setIsRegistered(true);
        toast.info('You are already registered!');
      }
    } catch (error) {
      // User not registered yet, which is expected
      console.log('User not registered yet');
    }
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setSubmitting(true);

    try {
      // Sign a message for authentication
      const message = `Register for BlocPol voting system with email: ${values.email}`;
      const signature = await signMessage(message);

      const voterData = {
        name: values.name,
        email: values.email,
        walletAddress: account,
        signature: signature,
        message: message,
      };

      const response = await apiService.registerVoter(voterData);
      
      toast.success('Registration successful!');
      setIsRegistered(true);
      
      // Redirect to candidates page after a short delay
      setTimeout(() => {
        router.push('/candidates');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  if (isRegistered) {
    return (
      <>
        <Head>
          <title>Registration Complete - BlocPol</title>
          <meta name="description" content="Registration completed successfully" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Navbar />
          
          <div className="max-w-2xl mx-auto px-4 py-20">
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Registration Complete!
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                You have successfully registered for the voting system. You can now view candidates and cast your vote.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/candidates')}
                  className="btn-primary"
                >
                  View Candidates
                </button>
                <button
                  onClick={() => router.push('/results')}
                  className="btn-outline"
                >
                  View Results
                </button>
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Register - BlocPol</title>
        <meta name="description" content="Register to participate in secure blockchain voting" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        <div className="max-w-2xl mx-auto px-4 py-20">
          <Card className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Register to Vote
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Join our secure blockchain voting system
              </p>
            </div>

            {!isConnected ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Wallet Required
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Please connect your MetaMask wallet to continue with registration.
                </p>
                <button
                  onClick={connectWallet}
                  className="btn-primary"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <Formik
                initialValues={{
                  name: '',
                  email: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="space-y-6">
                    {/* Wallet Address Display */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                      <label className="form-label flex items-center space-x-2">
                        <Wallet className="w-4 h-4" />
                        <span>Connected Wallet</span>
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                        {account}
                      </p>
                    </div>

                    {/* Name Field */}
                    <div>
                      <label htmlFor="name" className="form-label flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Full Name</span>
                      </label>
                      <Field
                        type="text"
                        id="name"
                        name="name"
                        className={`form-input ${errors.name && touched.name ? 'border-red-500' : ''}`}
                        placeholder="Enter your full name"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="form-label flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>Email Address</span>
                      </label>
                      <Field
                        type="email"
                        id="email"
                        name="email"
                        className={`form-input ${errors.email && touched.email ? 'border-red-500' : ''}`}
                        placeholder="Enter your email address"
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="small" text="" />
                          <span>Registering...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Register</span>
                        </>
                      )}
                    </button>
                  </Form>
                )}
              </Formik>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
