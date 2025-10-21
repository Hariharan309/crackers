'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSiteSettings } from '@/lib/api';

// Site settings interface
export interface SiteSettings {
  company_name: string;
  company_description: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  company_city: string;
  company_state: string;
  company_country: string;
  company_pincode: string;
  company_logo?: string;
  company_website?: string;
  established_year: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_youtube?: string;
}

// Site settings context interface
interface SiteSettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

// Default/fallback settings
const defaultSettings: SiteSettings = {
  company_name: 'Cracker Shop',
  company_description: 'Premium quality crackers and fireworks for all your celebrations. Bringing joy and sparkle to your special moments since 1995.',
  company_email: 'info@crackershop.com',
  company_phone: '+91 9876543210',
  company_address: '123 Main Street',
  company_city: 'Chennai',
  company_state: 'Tamil Nadu',
  company_country: 'India',
  company_pincode: '600001',
  company_website: 'www.crackershop.com',
  established_year: '1995',
  social_facebook: 'https://facebook.com/crackershop',
  social_instagram: 'https://instagram.com/crackershop',
  social_twitter: 'https://twitter.com/crackershop',
  social_youtube: 'https://youtube.com/crackershop'
};

// Create context
const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

// Site settings provider component
interface SiteSettingsProviderProps {
  children: ReactNode;
}

export function SiteSettingsProvider({ children }: SiteSettingsProviderProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getSiteSettings();
      
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        // Use default settings if API call succeeds but no data
        setSettings(defaultSettings);
      }
    } catch (err) {
      console.warn('Failed to fetch site settings, using defaults:', err);
      // Use default settings if API is not available
      setSettings(defaultSettings);
      setError(null); // Don't show error to user, just use defaults
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const value: SiteSettingsContextType = {
    settings,
    loading,
    error,
    refreshSettings,
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

// Custom hook to use site settings context
export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}