
import React, { useState } from 'react';
import { SparkIcon, GoogleIcon } from './Icons';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  t: (key: string) => string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, t }) => {
  const [view, setView] = useState<'login' | 'signup'>('login');

  // State for admin login form
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('password');
  const [loginError, setLoginError] = useState('');

  // State for signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername === 'admin' && loginPassword === 'password') {
      setLoginError('');
      onLoginSuccess();
    } else {
      setLoginError(t('login.invalidCredentialsError'));
    }
  };

  const handleGoogleLogin = () => {
    // Simulate Google login
    console.log("Simulating Google Login...");
    onLoginSuccess();
  };

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword) {
      setSignupError('Please fill in all fields.');
      return;
    }
    // Simulate successful signup and login
    console.log(`Simulating signup for ${signupEmail}`);
    setSignupError('');
    onLoginSuccess();
  };

  const renderLoginView = () => (
    <>
      <div className="text-center">
          <SparkIcon className="mx-auto w-12 h-12 text-blue-500" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">
            {t('login.welcome')}
          </h1>
          <p className="mt-2 text-sm text-gray-400">
              {t('login.signInContinue')}
          </p>
      </div>
      
      <div className="space-y-4 mt-8">
        <button
          onClick={handleGoogleLogin}
          className="w-full flex justify-center items-center py-3 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
        >
          <GoogleIcon className="w-5 h-5 mr-2" />
          {t('login.googleSignIn')}
        </button>

        <button
          onClick={() => setView('signup')}
          className="w-full flex justify-center items-center py-3 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
        >
          {t('login.emailSignUp')}
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-800 text-gray-400">{t('login.adminPrompt')}</span>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleAdminLogin}>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300">{t('login.adminUsernameLabel')}</label>
          <div className="mt-1">
            <input id="username" name="username" type="text" required value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)}
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="password"className="block text-sm font-medium text-gray-300">{t('login.adminPasswordLabel')}</label>
          <div className="mt-1">
            <input id="password" name="password" type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
        {loginError && <p className="text-sm text-red-400">{loginError}</p>}
        <div>
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500">
            {t('login.adminSignInButton')}
          </button>
        </div>
      </form>
    </>
  );

  const renderSignupView = () => (
    <>
      <div className="text-center">
          <SparkIcon className="mx-auto w-12 h-12 text-purple-500" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">
            {t('signup.createAccount')}
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            {t('signup.getStarted')}
          </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleEmailSignup}>
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-300">{t('signup.emailLabel')}</label>
          <div className="mt-1">
            <input id="signup-email" name="email" type="email" autoComplete="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
          </div>
        </div>
        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-gray-300">{t('signup.passwordLabel')}</label>
          <div className="mt-1">
            <input id="signup-password" name="password" type="password" autoComplete="new-password" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
          </div>
        </div>
        {signupError && <p className="text-sm text-red-400">{signupError}</p>}
        <div>
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500">
            {t('signup.createAccountButton')}
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400">
        {t('signup.alreadyHaveAccount')}{' '}
        <button onClick={() => setView('login')} className="font-medium text-blue-400 hover:text-blue-300">
          {t('signup.signInLink')}
        </button>
      </p>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-xl shadow-lg border border-gray-700">
            {view === 'login' ? renderLoginView() : renderSignupView()}
        </div>
    </div>
  );
};

export default LoginScreen;
