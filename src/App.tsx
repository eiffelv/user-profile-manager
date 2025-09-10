import React, { useState, useEffect, useCallback } from 'react';
import { User, UserFormData, Notification as NotificationType } from './lib/types';
import { userAPI } from './lib/api';
import UserProfileForm from './components/UserProfileForm';
import UserProfileList from './components/UserProfileList';
import SearchBar from './components/SearchBar';
import ConfirmModal from './components/ConfirmModal';
import Notification from './components/Notification';
import { UserPlus, Users } from 'lucide-react';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Notifications
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Update filtered users when users or search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      handleSearch(searchQuery);
    }
  }, [users, searchQuery]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getAllUsers();
      
      if (response.success) {
        setUsers(response.data);
      } else {
        addNotification('error', 'Failed to load users');
      }
    } catch (error) {
      addNotification('error', 'Error loading users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredUsers(users);
      setIsSearchLoading(false);
      return;
    }

    try {
      setIsSearchLoading(true);
      const response = await userAPI.searchUsers(query);
      
      if (response.success) {
        setFilteredUsers(response.data);
      }
    } catch (error) {
      addNotification('error', 'Error searching users');
    } finally {
      setIsSearchLoading(false);
    }
  }, [users]);

  const addNotification = (type: NotificationType['type'], message: string, duration?: number) => {
    const notification: NotificationType = {
      id: Date.now().toString(),
      type,
      message,
      duration
    };
    
    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleCreateNew = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData: UserFormData) => {
    try {
      setIsFormLoading(true);
      
      let response;
      if (editingUser) {
        response = await userAPI.updateUser(editingUser.id, formData);
      } else {
        response = await userAPI.createUser(formData);
      }

      if (response.success) {
        await loadUsers();
        setShowForm(false);
        setEditingUser(null);
        addNotification('success', response.message);
      } else {
        addNotification('error', response.message);
      }
    } catch (error) {
      addNotification('error', `Error ${editingUser ? 'updating' : 'creating'} user`);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      const response = await userAPI.deleteUser(userToDelete.id);
      
      if (response.success) {
        await loadUsers();
        addNotification('success', response.message);
      } else {
        addNotification('error', response.message);
      }
    } catch (error) {
      addNotification('error', 'Error deleting user');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">User Profile Manager</h1>
                <p className="text-sm text-gray-500">Manage user profiles with ease</p>
              </div>
            </div>
            
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              New Profile
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search by name, email, location, or bio..."
            isLoading={isSearchLoading}
          />
        </div>

        {/* User List */}
        <UserProfileList
          users={filteredUsers}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onCreateNew={handleCreateNew}
          isLoading={isLoading}
          searchQuery={searchQuery}
        />
      </main>

      {/* Modals */}
      {showForm && (
        <UserProfileForm
          user={editingUser}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={isFormLoading}
        />
      )}

      {showDeleteModal && userToDelete && (
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Profile"
          message={`Are you sure you want to delete ${userToDelete.fullName}'s profile? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          type="danger"
        />
      )}

      {/* Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </div>
  );
}

export default App;