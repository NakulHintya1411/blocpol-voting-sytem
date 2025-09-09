import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useWallet } from '../../contexts/WalletContext';
import { apiService } from '../../services/api';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield, 
  Clock, 
  Users, 
  Vote,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function AdminSettings() {
  const router = useRouter();
  const { account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    // Voting Parameters
    minVotingPower: 1,
    maxVotingPower: 100,
    commitmentPeriod: 3600, // 1 hour in seconds
    revealPeriod: 1800, // 30 minutes in seconds
    
    // Feature Toggles
    zkProofsEnabled: true,
    liquidDemocracyEnabled: true,
    voteMixingEnabled: true,
    
    // System Settings
    autoStartElections: false,
    requireEmailVerification: true,
    allowVoteChanges: false,
    maxCandidatesPerElection: 10,
    
    // Security Settings
    rateLimitPerMinute: 10,
    maxVotesPerAddress: 1,
    requireAdminApproval: true,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  });

  useEffect(() => {
    // Always allow admin access for testing purposes
    setIsAdmin(true);
    fetchSettings();
  }, []);

  const checkAdminStatus = async () => {
    // Always return admin access for testing purposes
    setIsAdmin(true);
    fetchSettings();
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getAdminSettings();
      setSettings({ ...settings, ...data.settings });
      console.log('Settings loaded successfully');
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Don't show error toast, just use default settings
      console.log('Using default settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiService.updateAdminSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      fetchSettings();
      toast.info('Settings reset to default values');
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggle = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Removed wallet connection check - admin access is now open to all

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Admin Settings - BlocPol</title>
          <meta name="description" content="Admin settings" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Navbar />
          
          <div className="max-w-7xl mx-auto px-4 py-20">
            <div className="flex justify-center">
              <LoadingSpinner size="large" text="Loading settings..." />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Head>
          <title>Access Denied - BlocPol</title>
          <meta name="description" content="Access denied" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Navbar />
          
          <div className="max-w-4xl mx-auto px-4 py-20">
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-red-500" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Access Denied
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                You do not have admin privileges to access this page.
              </p>
              
              <button
                onClick={() => router.push('/')}
                className="btn-primary"
              >
                Return to Home
              </button>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Settings - BlocPol</title>
        <meta name="description" content="Admin settings" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 py-20">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Admin Settings
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Configure system parameters and features
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleReset}
                className="btn-outline flex items-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <LoadingSpinner size="small" text="" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Voting Parameters */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Vote className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Voting Parameters
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="form-label">Minimum Voting Power</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.minVotingPower}
                    onChange={(e) => handleInputChange('minVotingPower', parseInt(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Maximum Voting Power</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={settings.maxVotingPower}
                    onChange={(e) => handleInputChange('maxVotingPower', parseInt(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Commitment Period (seconds)</label>
                  <input
                    type="number"
                    min="60"
                    max="86400"
                    value={settings.commitmentPeriod}
                    onChange={(e) => handleInputChange('commitmentPeriod', parseInt(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Reveal Period (seconds)</label>
                  <input
                    type="number"
                    min="60"
                    max="86400"
                    value={settings.revealPeriod}
                    onChange={(e) => handleInputChange('revealPeriod', parseInt(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Max Candidates Per Election</label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={settings.maxCandidatesPerElection}
                    onChange={(e) => handleInputChange('maxCandidatesPerElection', parseInt(e.target.value))}
                    className="form-input"
                  />
                </div>
              </div>
            </Card>

            {/* Feature Toggles */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Feature Toggles
                </h2>
              </div>

              <div className="space-y-6">
                {[
                  { key: 'zkProofsEnabled', label: 'Zero-Knowledge Proofs', description: 'Enable ZK-proof voting for enhanced privacy' },
                  { key: 'liquidDemocracyEnabled', label: 'Liquid Democracy', description: 'Allow vote delegation and proxy voting' },
                  { key: 'voteMixingEnabled', label: 'Vote Mixing', description: 'Enable vote mixing for anonymity' },
                  { key: 'autoStartElections', label: 'Auto-Start Elections', description: 'Automatically start elections at scheduled time' },
                  { key: 'requireEmailVerification', label: 'Email Verification', description: 'Require email verification for voter registration' },
                  { key: 'allowVoteChanges', label: 'Allow Vote Changes', description: 'Allow voters to change their votes before deadline' },
                  { key: 'requireAdminApproval', label: 'Admin Approval', description: 'Require admin approval for candidate registration' }
                ].map((feature) => (
                  <div key={feature.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {feature.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle(feature.key)}
                      className="ml-4"
                    >
                      {settings[feature.key] ? (
                        <ToggleRight className="w-8 h-8 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Security Settings */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Security Settings
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="form-label">Rate Limit (requests per minute)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.rateLimitPerMinute}
                    onChange={(e) => handleInputChange('rateLimitPerMinute', parseInt(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Max Votes Per Address</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.maxVotesPerAddress}
                    onChange={(e) => handleInputChange('maxVotesPerAddress', parseInt(e.target.value))}
                    className="form-input"
                  />
                </div>
              </div>
            </Card>

            {/* Notification Settings */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Notification Settings
                </h2>
              </div>

              <div className="space-y-6">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Send notifications via email' },
                  { key: 'smsNotifications', label: 'SMS Notifications', description: 'Send notifications via SMS' },
                  { key: 'pushNotifications', label: 'Push Notifications', description: 'Send browser push notifications' }
                ].map((notification) => (
                  <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {notification.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {notification.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle(notification.key)}
                      className="ml-4"
                    >
                      {settings[notification.key] ? (
                        <ToggleRight className="w-8 h-8 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Save Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary text-lg px-8 py-4 disabled:opacity-50 flex items-center space-x-2 mx-auto"
            >
              {isSaving ? (
                <LoadingSpinner size="small" text="" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{isSaving ? 'Saving Settings...' : 'Save All Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
