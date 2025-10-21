'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface AdminHeaderProps {
  title: string;
  description?: string;
  backUrl?: string;
  backLabel?: string;
  children?: React.ReactNode;
}

export default function AdminHeader({ 
  title, 
  description, 
  backUrl = '/admin',
  backLabel = 'Back to Dashboard',
  children 
}: AdminHeaderProps) {
  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Link
              href={backUrl}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">{backLabel}</span>
            </Link>
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="text-gray-600">{description}</p>
              )}
            </div>
          </div>
          {children && (
            <div className="flex items-center space-x-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}