
import React, { useState, useEffect } from 'react';
import { AdminUser, UserPlan } from '../types';

interface EditUserModalProps {
  user: AdminUser;
  onClose: () => void;
  onSave: (user: AdminUser) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}

const planOptions: UserPlan[] = ['Free', 'Starter', 'Pro', 'Ultimate'];

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave, t }) => {
  const [formData, setFormData] = useState<AdminUser>(user);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 border border-gray-700">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">{t('admin.editModal.title')}</h2>
            <p className="text-sm text-gray-400">{t('admin.editModal.description', { userName: user.name })}</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">{t('admin.editModal.nameLabel')}</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">{t('admin.editModal.emailLabel')}</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="plan" className="block text-sm font-medium text-gray-300 mb-1">{t('admin.editModal.planLabel')}</label>
              {formData.plan === 'Reseller' ? (
                <input
                  type="text"
                  name="plan"
                  id="plan"
                  value="Reseller"
                  disabled
                  className="w-full px-3 py-2 text-gray-400 bg-gray-900 border border-gray-600 rounded-md"
                />
              ) : (
                <select
                  name="plan"
                  id="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {planOptions.map(plan => (
                    <option key={plan} value={plan}>{plan}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-700/50 flex justify-end space-x-3 rounded-b-lg">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              {t('admin.editModal.cancelButton')}
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {t('admin.editModal.saveButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
