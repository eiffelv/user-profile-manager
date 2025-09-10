import React from 'react';
import { User, PaginationInfo } from '../lib/types';
import UserProfileCard from './UserProfileCard';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';

interface UserProfileListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onGenerateQR?: (user: User) => void;
  isLoading?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
}

const UserProfileList: React.FC<UserProfileListProps> = ({
  users,
  onEdit,
  onDelete,
  onGenerateQR,
  isLoading = false,
  pagination,
  onPageChange
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg text-gray-600">Loading profiles...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">No users found</h3>
        <p className="text-gray-500 mb-6">
          {pagination && pagination.totalUsers > 0 
            ? "No users match your search criteria." 
            : "Get started by creating your first user profile."
          }
        </p>
      </div>
    );
  }

  const renderPaginationControls = () => {
    if (!pagination || !onPageChange || pagination.totalPages <= 1) {
      return null;
    }

    const { currentPage, totalPages, hasPrevPage, hasNextPage } = pagination;
    const pageNumbers = [];
    
    // Calculate which page numbers to show
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>

        {/* Page Numbers */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-2 py-2 text-sm text-gray-500">...</span>
            )}
          </>
        )}

        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              page === currentPage
                ? 'text-white bg-blue-600 border border-blue-600'
                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-2 py-2 text-sm text-gray-500">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    );
  };

  return (
    <div>
      {/* Results Summary */}
      {pagination && (
        <div className="mb-6 text-center">
          <p className="text-gray-600">
            Showing {pagination.totalUsers > 0 ? ((pagination.currentPage - 1) * 20) + 1 : 0} to{' '}
            {Math.min(pagination.currentPage * 20, pagination.totalUsers)} of{' '}
            {pagination.totalUsers} {pagination.totalUsers === 1 ? 'user' : 'users'}
          </p>
        </div>
      )}

      {/* Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <UserProfileCard
            key={user.id}
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
            onGenerateQR={onGenerateQR}
          />
        ))}
      </div>
      
      {renderPaginationControls()}
    </div>
  );
};

export default UserProfileList;