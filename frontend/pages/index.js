import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWallet } from '../contexts/WalletContext';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { Shield, Vote, BarChart3, Users, CheckCircle, Lock } from 'lucide-react';

export default function Home() {
  const { isConnected } = useWallet();

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-primary-500" />,
      title: 'Secure Voting',
      description: 'Blockchain-powered voting ensures transparency and immutability of votes.',
    },
    {
      icon: <Vote className="w-8 h-8 text-primary-500" />,
      title: 'Easy Voting',
      description: 'Simple and intuitive interface for casting your vote securely.',
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary-500" />,
      title: 'Real-time Results',
      description: 'View live election results and statistics as votes are cast.',
    },
    {
      icon: <Users className="w-8 h-8 text-primary-500" />,
      title: 'Transparent Process',
      description: 'Every vote is recorded on the blockchain for complete transparency.',
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-primary-500" />,
      title: 'Verified Results',
      description: 'Cryptographic verification ensures the integrity of election results.',
    },
    {
      icon: <Lock className="w-8 h-8 text-primary-500" />,
      title: 'Privacy Protected',
      description: 'Your vote is private while maintaining verifiability.',
    },
  ];

  return (
    <>
      <Head>
        <title>BlocPol - Secure Blockchain Voting System</title>
        <meta name="description" content="A secure, transparent, and verifiable voting system powered by blockchain technology." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Secure Voting with{' '}
                <span className="gradient-text">Blockchain</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                Experience the future of democracy with our transparent, secure, and verifiable voting system. 
                Every vote counts, every vote is protected.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isConnected ? (
                  <Link href="/candidates" className="btn-primary text-lg px-8 py-4">
                    View Candidates
                  </Link>
                ) : (
                  <Link href="/register" className="btn-primary text-lg px-8 py-4">
                    Get Started
                  </Link>
                )}
                <Link href="/results" className="btn-outline text-lg px-8 py-4">
                  View Results
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose BlocPol?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our platform combines cutting-edge blockchain technology with user-friendly design 
                to create the most secure voting experience possible.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="p-6 text-center hover:shadow-2xl transition-all duration-300"
                  gradient
                >
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 to-primary-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Vote Securely?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of voters who trust BlocPol for secure, transparent elections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isConnected ? (
                <Link href="/candidates" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                  Start Voting
                </Link>
              ) : (
                <Link href="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                  Register Now
                </Link>
              )}
              <Link href="/results" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105">
                View Results
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BP</span>
                </div>
                <span className="text-xl font-bold">BlocPol</span>
              </div>
              <p className="text-gray-400 mb-4">
                Secure, Transparent, Verifiable Voting
              </p>
              <p className="text-sm text-gray-500">
                © 2024 BlocPol. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
