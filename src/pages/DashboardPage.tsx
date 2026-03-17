import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, CreditCard, Settings, Package, Heart, Bell } from 'lucide-react';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase';
import ProfileSection from '../components/dashboard/ProfileSection';
import AddressSection from '../components/dashboard/AddressSection';
import TransactionHistory from '../components/dashboard/TransactionHistory';
import PasswordSection from '../components/dashboard/PasswordSection';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        toast.error('Please login to access dashboard');
        return;
      }

      setUser(user);

      // Load user profile
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      } else {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'addresses', name: 'Addresses', icon: MapPin },
    { id: 'transactions', name: 'Transactions', icon: CreditCard },
    { id: 'password', name: 'Password', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="bg-gray-300 rounded-lg h-64"></div>
              <div className="lg:col-span-3 bg-gray-300 rounded-lg h-96"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {userProfile?.full_name || user?.email}! Manage your account and preferences.
            </p>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { icon: Package, label: 'Total Orders', value: '12', color: 'bg-blue-500' },
              { icon: Heart, label: 'Wishlist Items', value: '8', color: 'bg-red-500' },
              { icon: MapPin, label: 'Saved Addresses', value: '3', color: 'bg-green-500' },
              { icon: Bell, label: 'Notifications', value: '5', color: 'bg-purple-500' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-full mr-4`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-green-100 text-green-700 border-l-4 border-green-500'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-3 bg-white rounded-xl shadow-lg p-6"
            >
              {activeTab === 'profile' && (
                <ProfileSection 
                  user={user} 
                  userProfile={userProfile} 
                  onProfileUpdate={setUserProfile}
                />
              )}
              {activeTab === 'addresses' && (
                <AddressSection userId={user?.id} />
              )}
              {activeTab === 'transactions' && (
                <TransactionHistory userId={user?.id} />
              )}
              {activeTab === 'password' && (
                <PasswordSection />
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;