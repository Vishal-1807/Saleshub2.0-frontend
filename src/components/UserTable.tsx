import { useState } from 'react';
import { User } from '../types';
import { roleConfig } from '../config/permissions';
import { 
  Mail, 
  Phone, 
  Calendar, 
  MoreVertical, 
  Edit, 
  Trash2, 
  UserX, 
  UserCheck,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface UserTableProps {
  users: User[];
  currentUser: User;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
  onToggleStatus?: (userId: string, status: 'active' | 'inactive' | 'suspended') => void;
  showHierarchy?: boolean;
  expandable?: boolean;
}

interface UserRowProps {
  user: User;
  currentUser: User;
  level?: number;
  children?: User[];
  onEditUser?: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
  onToggleStatus?: (userId: string, status: 'active' | 'inactive' | 'suspended') => void;
  showHierarchy?: boolean;
  expandable?: boolean;
}

function UserRow({ 
  user, 
  currentUser, 
  level = 0, 
  children = [], 
  onEditUser, 
  onDeleteUser, 
  onToggleStatus,
  showHierarchy = false,
  expandable = false
}: UserRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  const roleInfo = roleConfig[user.role] || { label: 'Unknown Role', description: '' };
  const hasChildren = children.length > 0;
  const canManage = currentUser.id !== user.id; // Can't manage yourself
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'suspended': return 'text-red-600 bg-red-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active': return <UserCheck className="w-3 h-3" />;
      case 'inactive': return <UserX className="w-3 h-3" />;
      case 'suspended': return <UserX className="w-3 h-3" />;
      default: return <UserCheck className="w-3 h-3" />;
    }
  };

  return (
    <>
      <tr className="hover:bg-slate-50/50 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3" style={{ paddingLeft: `${level * 20}px` }}>
            {expandable && hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
              </button>
            )}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-slate-900">{user.full_name}</div>
              <div className="text-sm text-slate-600">{user.email}</div>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {roleInfo.label}
            </span>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
            {getStatusIcon(user.status)}
            {user.status || 'active'}
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4" />
                {user.phone}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="w-4 h-4" />
              {user.email}
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4" />
            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
          </div>
        </td>
        
        <td className="px-6 py-4">
          {canManage && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-slate-500" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                  {onEditUser && (
                    <button
                      onClick={() => {
                        onEditUser(user);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit User
                    </button>
                  )}
                  
                  {onToggleStatus && (
                    <button
                      onClick={() => {
                        const newStatus = user.status === 'active' ? 'suspended' : 'active';
                        onToggleStatus(user.id, newStatus);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      {user.status === 'active' ? (
                        <>
                          <UserX className="w-4 h-4" />
                          Suspend User
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Activate User
                        </>
                      )}
                    </button>
                  )}
                  
                  {onDeleteUser && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this user?')) {
                          onDeleteUser(user.id);
                        }
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete User
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </td>
      </tr>
      
      {expandable && isExpanded && children.map(child => (
        <UserRow
          key={child.id}
          user={child}
          currentUser={currentUser}
          level={level + 1}
          onEditUser={onEditUser}
          onDeleteUser={onDeleteUser}
          onToggleStatus={onToggleStatus}
          showHierarchy={showHierarchy}
          expandable={expandable}
        />
      ))}
    </>
  );
}

export default function UserTable({
  users,
  currentUser,
  onEditUser,
  onDeleteUser,
  onToggleStatus,
  showHierarchy = false,
  expandable = false
}: UserTableProps) {
  // Close any open action menus when clicking outside
  const handleTableClick = () => {
    // This would close action menus - simplified for now
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No users found</h3>
        <p className="text-slate-600">No users match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/50 overflow-hidden">
      <div className="overflow-x-auto" onClick={handleTableClick}>
        <table className="w-full">
          <thead className="bg-slate-50/50 border-b border-slate-200/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50">
            {users.map(user => (
              <UserRow
                key={user.id}
                user={user}
                currentUser={currentUser}
                onEditUser={onEditUser}
                onDeleteUser={onDeleteUser}
                onToggleStatus={onToggleStatus}
                showHierarchy={showHierarchy}
                expandable={expandable}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
