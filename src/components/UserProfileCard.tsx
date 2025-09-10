import React from 'react';
import { User } from '../lib/types';
import { Edit, Trash2, Mail, Phone, MapPin, Calendar, User as UserIcon, QrCode } from 'lucide-react';

interface UserProfileCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onGenerateQR?: (user: User) => void; // New prop for QR code generation
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  onEdit,
  onDelete,
  onGenerateQR
}) => {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const calculateAge = (dateString?: string): number | null => {
    if (!dateString) return null;
    
    try {
      const birthDate = new Date(dateString);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch {
      return null;
    }
  };

  const age = calculateAge(user.dateOfBirth);

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 h-24">
        <div className="absolute -bottom-8 left-6">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`${user.fullName}'s avatar`}
              className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center shadow-lg">
              <UserIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onGenerateQR && (
            <button
              onClick={() => onGenerateQR(user)}
              className="bg-white bg-opacity-20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-opacity-30 transition-all"
              title="Generate QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(user)}
            className="bg-white bg-opacity-20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-opacity-30 transition-all"
            title="Edit profile"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="bg-white bg-opacity-20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-red-500 hover:bg-opacity-100 transition-all"
            title="Delete profile"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="pt-10 p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{user.fullName}</h3>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Mail className="w-4 h-4 mr-2" />
            <a 
              href={`mailto:${user.email}`}
              className="hover:text-blue-600 transition-colors truncate"
            >
              {user.email}
            </a>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {user.phoneNumber && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
              <a 
                href={`tel:${user.phoneNumber}`}
                className="hover:text-blue-600 transition-colors"
              >
                {user.phoneNumber}
              </a>
            </div>
          )}

          {user.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{user.location}</span>
            </div>
          )}

          {user.dateOfBirth && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>
                {formatDate(user.dateOfBirth)}
                {age !== null && (
                  <span className="text-gray-500 ml-1">({age} years old)</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Bio Section */}
        {user.bio && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {user.bio}
            </p>
          </div>
        )}

        {/* Footer with timestamps */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
          <span>Created: {formatDate(user.createdAt)}</span>
          {user.updatedAt !== user.createdAt && (
            <span>Updated: {formatDate(user.updatedAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;