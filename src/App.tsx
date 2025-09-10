import React, { useState, useEffect, useCallback } from 'react';
import { User, UserFormData, Notification as NotificationType, PaginationInfo } from './lib/types';
import { userAPI } from './lib/api';
import { useDebounce } from './hooks/useDebounce';
import UserProfileForm from './components/UserProfileForm';
import UserProfileList from './components/UserProfileList';
import SearchBar from './components/SearchBar';
import ConfirmModal from './components/ConfirmModal';
import Notification from './components/Notification';
import QRCodeModal from './components/QRCodeModal';
import { UserPlus, Users, QrCode } from 'lucide-react';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Debounced search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // QR Code modal states
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrModalMode, setQrModalMode] = useState<'generate' | 'scan'>('generate');
  const [qrUser, setQrUser] = useState<User | null>(null);
  const [scannedUserData, setScannedUserData] = useState<UserFormData | null>(null);
  
  // Notifications
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const addNotification = useCallback((type: NotificationType['type'], message: string, duration?: number) => {
    const notification: NotificationType = {
      id: Date.now().toString(),
      type,
      message,
      duration
    };
    
    setNotifications(prev => [...prev, notification]);
  }, []);

  const loadUsers = useCallback(async (page: number = 1, search: string = '') => {
    try {
      setIsLoading(true);
      const response = await userAPI.getAllUsers(page, 20, search);
      
      if (response.success) {
        setUsers(response.data.data);
        setPagination(response.data.pagination);
      } else {
        addNotification('error', 'Failed to load users');
      }
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Load users with pagination when component mounts or when page/search changes
  useEffect(() => {
    loadUsers(currentPage, debouncedSearchQuery);
  }, [currentPage, debouncedSearchQuery, loadUsers]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleCreateUser = async (userData: UserFormData) => {
    try {
      setIsFormLoading(true);
      const response = await userAPI.createUser(userData);
      
      if (response.success) {
        addNotification('success', 'User created successfully!');
        setShowForm(false);
        // Reload current page to show new user
        loadUsers(currentPage, debouncedSearchQuery);
      } else {
        addNotification('error', response.message);
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleUpdateUser = async (userData: UserFormData) => {
    if (!editingUser) return;
    
    try {
      setIsFormLoading(true);
      const response = await userAPI.updateUser(editingUser.id, userData);
      
      if (response.success) {
        addNotification('success', 'User updated successfully!');
        setShowForm(false);
        setEditingUser(null);
        // Reload current page to show updated user
        loadUsers(currentPage, debouncedSearchQuery);
      } else {
        addNotification('error', response.message);
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const response = await userAPI.deleteUser(userToDelete.id);
      
      if (response.success) {
        addNotification('success', 'User deleted successfully!');
        setShowDeleteModal(false);
        setUserToDelete(null);
        // Reload current page after deletion
        loadUsers(currentPage, debouncedSearchQuery);
      } else {
        addNotification('error', response.message);
      }
    } catch {
      addNotification('error', 'Failed to delete user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setScannedUserData(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleGenerateQR = (user: User) => {
    setQrUser(user);
    setQrModalMode('generate');
    setShowQRModal(true);
  };

  const handleScanQR = () => {
    setQrModalMode('scan');
    setShowQRModal(true);
  };

  const handleUserDataScanned = (userData: UserFormData) => {
    setScannedUserData(userData);
    setShowForm(true);
    setEditingUser(null);
  };

  const handleSubmitForm = (userData: UserFormData) => {
    if (editingUser) {
      handleUpdateUser(userData);
    } else {
      handleCreateUser(userData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">User Profile Manager</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleScanQR}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Scan QR Code
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <SearchBar
            searchQuery={searchQuery}
            onSearch={handleSearch}
            isLoading={isLoading}
          />
          
          {/* Pagination Info */}
          {pagination.totalUsers > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)} of{' '}
              {pagination.totalUsers} users
            </div>
          )}
        </div>

        {/* User List */}
        <UserProfileList
          users={users}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onGenerateQR={handleGenerateQR}
          pagination={pagination}
          onPageChange={handlePageChange}
        />

        {/* Modals */}
        {showForm && (
          <UserProfileForm
            user={editingUser}
            scannedData={scannedUserData}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
            isLoading={isFormLoading}
          />
        )}

        {showDeleteModal && userToDelete && (
          <ConfirmModal
            title="Delete User"
            message={`Are you sure you want to delete ${userToDelete.fullName}? This action cannot be undone.`}
            onConfirm={handleDeleteUser}
            onCancel={handleCancelDelete}
          />
        )}

        {showQRModal && (
          <QRCodeModal
            isOpen={showQRModal}
            onClose={() => setShowQRModal(false)}
            user={qrUser}
            mode={qrModalMode}
            onUserDataScanned={handleUserDataScanned}
          />
        )}

        {/* Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <Notification
              key={notification.id}
              notification={notification}
              onRemove={removeNotification}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
