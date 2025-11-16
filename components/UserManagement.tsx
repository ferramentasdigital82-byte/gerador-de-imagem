
import React from 'react';
import { AdminUser } from '../types';
import { EditIcon, TrashIcon } from './Icons';

interface UserManagementProps {
  users: AdminUser[];
  onToggleStatus: (userId: number) => void;
  onEditUser: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
  t: (key: string) => string;
}

const planColorMap = {
  'Pro': 'bg-blue-900 text-blue-300',
  'Ultimate': 'bg-purple-900 text-purple-300',
  'Starter': 'bg-green-900 text-green-300',
  'Free': 'bg-gray-700 text-gray-300',
  'Reseller': 'bg-yellow-900 text-yellow-300',
};

const UserManagement: React.FC<UserManagementProps> = ({ users, onToggleStatus, onEditUser, onDeleteUser, t }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
      <div className="p-5 border-b border-gray-700 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">{t('admin.users.title')}</h2>
          <p className="text-sm text-gray-400">{t('admin.users.description')}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
            <tr>
              <th scope="col" className="px-6 py-3">{t('admin.users.headerUser')}</th>
              <th scope="col" className="px-6 py-3">{t('admin.users.headerPlan')}</th>
              <th scope="col" className="px-6 py-3 text-center">{t('admin.users.headerImages')}</th>
              <th scope="col" className="px-6 py-3 text-center">{t('admin.users.headerStatus')}</th>
              <th scope="col" className="px-6 py-3 text-center">{t('admin.users.headerActions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                  <div className="font-bold">{user.name}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${planColorMap[user.plan] || 'bg-gray-600 text-gray-200'}`}>
                    {user.plan}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">{user.imagesGenerated.toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.status === 'Active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex justify-center items-center space-x-3">
                     <button
                       onClick={() => onEditUser(user)}
                       className="text-gray-400 hover:text-white transition-colors"
                       aria-label={`Edit ${user.name}`}
                     >
                       <EditIcon className="w-5 h-5" />
                     </button>
                     <button
                      onClick={() => onToggleStatus(user.id)}
                      className={`text-xs font-bold py-1 px-3 rounded-full transition-colors ${
                          user.status === 'Active' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                      aria-label={user.status === 'Active' ? `Block ${user.name}` : `Activate ${user.name}`}
                     >
                      {user.status === 'Active' ? t('admin.users.blockButton') : t('admin.users.activateButton')}
                     </button>
                     <button
                        onClick={() => onDeleteUser(user)}
                        className="flex items-center space-x-1.5 text-xs font-bold py-1 px-3 rounded-full transition-colors bg-red-800 hover:bg-red-700 text-white"
                        aria-label={`Delete ${user.name}`}
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span>{t('admin.users.deleteButton')}</span>
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
