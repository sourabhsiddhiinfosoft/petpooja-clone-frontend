'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { ModalBox } from './ModalBox';
import { logout } from '../store/slices/authSlice';
import BranchSelector from './BranchSelector';
import { useMeQuery } from '../store/api/authApi';
import { useCurrentBranch } from '../store/hooks/useCurrentBranch';

// Import Heroicons
import {
  ChartBarIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  PresentationChartLineIcon,
  UserIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  TableCellsIcon,
  MapIcon,
  DocumentTextIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const DashboardLayout = ({ children, userType }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const [modelActive, setModelActive] = useState(false);
  const { user } = useCurrentBranch();

  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    setUserDropdownOpen(false);
  };

  // Navigation items based on user type (RBAC) - Updated with Heroicons
  const getNavigationItems = () => {
    if (userType === 'admin') {
      return [
        { name: 'Dashboard', href: `/${userType}/dashboard`, icon: ChartBarIcon },
        { name: 'MANAGE', isHeader: true },
        { name: 'Restaurants', href: `/${userType}/restaurants`, icon: BuildingStorefrontIcon },
        { name: 'Owners', href: `/${userType}/owners`, icon: UserGroupIcon },
        { name: 'Support Tickets', href: `/${userType}/support`, icon: PresentationChartLineIcon },
        { name: 'Settings', href: `/${userType}/settings`, icon: CogIcon },
        // { name: 'REPORTS', isHeader: true },
        // { name: 'Reports', href: `/${userType}/reports`, icon: PresentationChartLineIcon },
      ];
    }

    if (userType === 'owner') {
      return [
        { name: 'Dashboard', href: `/${userType}/dashboard`, icon: ChartBarIcon },
        { name: 'RESTAURANT', isHeader: true },
        { name: 'Restaurant Details', href: `/${userType}/restaurant`, icon: BuildingStorefrontIcon },
        { name: 'Branches', href: `/${userType}/branches`, icon: BuildingStorefrontIcon },
        { name: 'Profile', href: `/${userType}/profile`, icon: UserIcon },
        { name: 'Categories', href: `/${userType}/categories`, icon: FolderIcon },
        { name: 'Menu Items', href: `/${userType}/menu-items`, icon: ClipboardDocumentListIcon },
        { name: 'Inventory', href: `/${userType}/inventory`, icon: CubeIcon },
        { name: 'Tables', href: `/${userType}/tables`, icon: TableCellsIcon },
        { name: 'Areas', href: `/${userType}/areas`, icon: MapIcon },
        {name: 'Discounts', href: `/${userType}/discounts`, icon: DocumentTextIcon },
        { name: 'ORDER MANAGEMENT', isHeader: true },
        { name: 'Take Order', href: `/${userType}/takeOrder`, icon: DocumentTextIcon },
        { name: 'Orders', href: `/${userType}/orders`, icon: DocumentTextIcon },
        { name: 'STAFF', isHeader: true },
        { name: 'Staff', href: `/${userType}/staff`, icon: UserGroupIcon },
        { name: 'REPORTS', isHeader: true },
        { name: 'Reports', href: `/${userType}/reports`, icon: PresentationChartLineIcon },
        { name: 'Settings', href: `/${userType}/settings`, icon: CogIcon },
        { name: 'Support', isHeader: true },
        { name: 'Support Tickets', href: `/${userType}/support`, icon: PresentationChartLineIcon },

      ];
    }

    // staff waiter
    if (userType === 'waiter') {
      return [
        { name: 'Dashboard', href: `/${userType}/dashboard`, icon: ChartBarIcon },
        { name: 'SERVICE', isHeader: true },
        { name: 'Take Order', href: `/${userType}/takeOrder`, icon: TableCellsIcon },
        {name: 'Merge Tables', href: `/${userType}/merge-tables`, icon: TableCellsIcon },
        { name: 'Kots', href: `/${userType}/runningKOTs`, icon: DocumentTextIcon },
        { name: 'Running Tables', href: `/${userType}/runningTables`, icon: TableCellsIcon },
        { name: 'Orders', href: `/${userType}/orders`, icon: DocumentTextIcon },
      ];
    }

    if (userType === 'chef') {
      return [
        { name: 'Dashboard', href: `/${userType}/dashboard`, icon: ChartBarIcon },
        { name: 'KOTs', href: `/${userType}/runningKOTs`, icon: DocumentTextIcon },
      ];
    }

    return [
      { name: 'Dashboard', href: `/${userType}/dashboard`, icon: ChartBarIcon },
    ];
  };

  const navigationItems = getNavigationItems();

  const isActive = (href) => {
    if (href === `/${userType}/dashboard`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  let ProfileName = user && user?.name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase())
    .join("");
    
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } overflow-y-auto`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
              {userType === 'admin' ? 'AD' : userType === 'owner' ? 'OW' : 'ST'}
            </div>
            <span className="font-bold text-lg">{user?.restaurantName || "Restaurant"}</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {navigationItems.map((item, index) => {
              if (item.isHeader) {
                return (
                  <li key={index} className="px-3 py-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {item.name}
                    </div>
                  </li>
                );
              }

              return (
                <li key={index}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.href)
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-600 hover:text-slate-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className={`${userType != "owner" ? "hidden" : "" }`}>
                <BranchSelector className="w-64" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* User dropdown */}
              <div className="relative">
                {
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <div className="text-sm text-slate-600">
                      <div className="font-medium"> </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-slate-600">{ProfileName}</span>
                    </div>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                }

                {/* Dropdown menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                    <Link
                      href={`/${userType}/profile`}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Link>
                    <Link
                      href={`/${userType}/settings`}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <span
                      className="flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={() => setModelActive(true)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <ModalBox
          title="Logout"
          active={modelActive}
          onClose={() => setModelActive(false)}
          onConfirm={handleLogout}
          confirmText="Logout"
        >
          <p>Are you sure you want to logout?</p>
        </ModalBox>

        {/* Main content area */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Click outside to close dropdowns */}
      {(userDropdownOpen || sidebarOpen) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setUserDropdownOpen(false);
            setSidebarOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
