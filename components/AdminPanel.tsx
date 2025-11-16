import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AdminUser } from '../types';
import DashboardStats from './DashboardStats';
import UserManagement from './UserManagement';
import EditUserModal from './EditUserModal';
import ConfirmationModal from './ConfirmationModal';

const initialUsers: AdminUser[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', status: 'Active', imagesGenerated: 85, plan: 'Pro' },
  { id: 2, name: 'Bob Williams', email: 'bob@example.com', status: 'Active', imagesGenerated: 23, plan: 'Starter' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', status: 'Blocked', imagesGenerated: 150, plan: 'Pro' },
  { id: 4, name: 'Diana Miller', email: 'diana@example.com', status: 'Active', imagesGenerated: 450, plan: 'Ultimate' },
  { id: 5, name: 'Ethan Davis', email: 'ethan@example.com', status: 'Active', imagesGenerated: 98, plan: 'Starter' },
  { id: 7, name: 'Grace Hall', email: 'grace@example.com', status: 'Active', imagesGenerated: 5, plan: 'Free' },
];

interface AdminPanelProps {
    t: (key: string, replacements?: Record<string, string>) => string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ t }) => {
  const [users, setUsers] = useState<AdminUser[]>(() => {
    const hasBeenSeeded = localStorage.getItem('dreamcanvas_admin_users_seeded');
    let savedUsersData = localStorage.getItem('dreamcanvas_admin_users');

    if (!hasBeenSeeded) {
        // First time ever. Seed the data.
        savedUsersData = JSON.stringify(initialUsers);
        localStorage.setItem('dreamcanvas_admin_users', savedUsersData);
        localStorage.setItem('dreamcanvas_admin_users_seeded', 'true');
    }

    try {
        // If savedUsersData is null (because it was cleared, but 'seeded' flag is still there),
        // parse will get null, so we return an empty array as a fallback.
        return savedUsersData ? JSON.parse(savedUsersData) : [];
    } catch (error) {
        console.error('Could not parse users from localStorage', error);
        return []; // Return empty array on parsing error
    }
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState<AdminUser | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('dreamcanvas_admin_users', JSON.stringify(users));
    } catch (error) {
      console.error('Could not save users to localStorage', error);
    }
  }, [users]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeSubscriptions = users.filter(u => u.status === 'Active').length;
    const totalImagesGenerated = users.reduce((acc, user) => acc + user.imagesGenerated, 0);
    return { totalUsers, activeSubscriptions, totalImagesGenerated };
  }, [users]);

  const toggleUserStatus = useCallback((userId: number) => {
    setUsers(prevUsers => prevUsers.map(user =>
      user.id === userId
        ? { ...user, status: user.status === 'Active' ? 'Blocked' : 'Active' }
        : user
    ));
  }, []);

  const handleOpenEditModal = useCallback((user: AdminUser) => {
    setCurrentUserToEdit(user);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setCurrentUserToEdit(null);
  }, []);

  const handleUpdateUser = useCallback((updatedUser: AdminUser) => {
    setUsers(prevUsers => prevUsers.map(user =>
      user.id === updatedUser.id ? updatedUser : user
    ));
    handleCloseEditModal();
  }, [handleCloseEditModal]);

  const handleOpenConfirmModal = useCallback((user: AdminUser) => {
    setUserToDelete(user);
    setIsConfirmModalOpen(true);
  }, []);

  const handleCloseConfirmModal = useCallback(() => {
    setIsConfirmModalOpen(false);
    setUserToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (userToDelete) {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id));
    }
    handleCloseConfirmModal();
  }, [userToDelete, handleCloseConfirmModal]);

  return (
    <div className="space-y-8">
      <DashboardStats stats={stats} t={t} />
      <UserManagement 
        users={users} 
        onToggleStatus={toggleUserStatus} 
        onEditUser={handleOpenEditModal}
        onDeleteUser={handleOpenConfirmModal}
        t={t}
      />
      {isEditModalOpen && currentUserToEdit && (
        <EditUserModal 
          user={currentUserToEdit}
          onClose={handleCloseEditModal}
          onSave={handleUpdateUser}
          t={t}
        />
      )}
      {isConfirmModalOpen && userToDelete && (
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={handleCloseConfirmModal}
            onConfirm={handleConfirmDelete}
            title={t('admin.confirmModal.title')}
            message={t('admin.confirmModal.message', { userName: userToDelete.name })}
            t={t}
        />
      )}
    </div>
  );
};

export default AdminPanel;