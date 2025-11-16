
import React, { useState, createContext, useContext, useCallback, useEffect } from 'react';
import { ImageGeneratorIcon, SparkIcon, BoltIcon, ImageEditIcon, UserGroupIcon, LogoutIcon, TagIcon } from './components/Icons';
import ImageGeneration from './components/ImageGeneration';
import ImageEditing from './components/ImageEditing';
import GeminiProChat from './components/GeminiProChat';
import FastChat from './components/FastChat';
import AdminPanel from './components/AdminPanel';
import LoginScreen from './components/LoginScreen';
import PricingPage from './components/PricingPage';

// --- I18N SETUP ---

const enTranslations = {
  app: {
    title: "DreamCanvas",
    adminPanel: "Admin Panel",
    dreamCanvasView: "DreamCanvas",
    logout: "Logout",
    poweredBy: "Powered by Google Gemini"
  },
  features: {
    generate: "Generate Image",
    edit: "Edit Image",
    chat: "Complex Chat",
    fastChat: "Fast Chat",
    pricing: "Pricing"
  },
  login: {
    welcome: "Welcome to DreamCanvas",
    signInContinue: "Sign in to continue",
    googleSignIn: "Sign in with Google",
    emailSignUp: "Sign up with email",
    adminPrompt: "Or continue with Admin",
    adminUsernameLabel: "Admin Username",
    adminPasswordLabel: "Admin Password",
    adminSignInButton: "Sign in as Admin",
    invalidCredentialsError: "Invalid admin credentials."
  },
  signup: {
    createAccount: "Create an Account",
    getStarted: "Get started with DreamCanvas today.",
    emailLabel: "Email address",
    passwordLabel: "Password",
    createAccountButton: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    signInLink: "Sign in"
  },
  imageGeneration: {
    title: "Image Generation with Imagen",
    description: "Describe an image, and let Imagen bring it to life. Be as descriptive as you like for the best results.",
    promptPlaceholder: "e.g., A majestic lion wearing a crown, sitting on a throne in a jungle",
    generateButton: "Generate Image",
    generatingButton: "Generating...",
    downloadButton: "Download",
    deleteButton: "Delete",
    removeBgButton: "Remove Background",
    processingButton: "Processing...",
    historyTitle: "Generation History",
    emptyHistory: "Your generated images will appear here.",
    placeholder: "Your generated image will appear here."
  },
  imageEditing: {
      title: "Image Editing with Nano Banana",
      description: "Upload an image and describe your desired edits. From simple tweaks to creative transformations.",
      uploadPlaceholder: "Upload your image here",
      editedPlaceholder: "Your edited image will appear here",
      promptPlaceholder: "Describe your edits... e.g., 'Make the background black and white' or 'Add a superhero cape'.",
      applyEditButton: "Apply Edit",
      editingButton: "Editing..."
  },
  chat: {
    complexChatTitle: "Complex Chat with Gemini Pro",
    fastChatTitle: "Fast Chat with Gemini Flash Lite",
    libraryButton: "Library",
    complexPromptPlaceholder: "Ask a complex question...",
    fastPromptPlaceholder: "Ask a quick question...",
    sendButton: "Send",
    libraryTitle: "Prompt Library",
    copyPrompt: "Copy prompt",
    usePrompt: "Use",
    emptyLibrary: "Your saved prompts will appear here.",
    emptyLibraryDesc: "Prompts you send in the chat are automatically added."
  },
  pricing: {
    title: "Find the right plan for you",
    description: "Start for free, then upgrade to a plan that fits your creative needs.",
    mostPopular: "Most Popular",
    currentPlan: "Current Plan",
    choosePlan: "Choose Plan",
    modalTitle: "Complete your purchase",
    modalSubtitle: "You are subscribing to the {planName} plan.",
    creditCardTab: "Credit Card",
    pixTab: "PIX",
    payButton: "Pay {price}",
    processingButton: "Processing...",
    successTitle: "Payment Successful!",
    successMessage: "Your {planName} plan is now active. Happy creating!"
  },
  admin: {
    dashboard: {
      totalSubscribers: "Total Subscribers",
      activeSubscriptions: "Active Subscriptions",
      totalImages: "Total Images Generated"
    },
    users: {
      title: "Subscribers List",
      description: "Manage your subscribers.",
      headerUser: "Subscriber",
      headerPlan: "Plan",
      headerImages: "Images Generated",
      headerStatus: "Status",
      headerActions: "Actions",
      blockButton: "Block",
      activateButton: "Activate",
      deleteButton: "Delete"
    },
    editModal: {
      title: "Edit Subscriber",
      description: "Update details for {userName}.",
      nameLabel: "Name",
      emailLabel: "Email",
      planLabel: "Plan",
      cancelButton: "Cancel",
      saveButton: "Save Changes"
    },
    confirmModal: {
      title: "Confirm Deletion",
      message: "Are you sure you want to delete \"{userName}\"? This action cannot be undone.",
      cancelButton: "Cancel",
      confirmButton: "Yes, I'm sure"
    }
  }
};

const ptTranslations = {
  app: {
    title: "DreamCanvas",
    adminPanel: "Painel Admin",
    dreamCanvasView: "DreamCanvas",
    logout: "Sair",
    poweredBy: "Desenvolvido com Google Gemini"
  },
  features: {
    generate: "Gerar Imagem",
    edit: "Editar Imagem",
    chat: "Chat Complexo",
    fastChat: "Chat Rápido",
    pricing: "Preços"
  },
  login: {
    welcome: "Bem-vindo ao DreamCanvas",
    signInContinue: "Faça login para continuar",
    googleSignIn: "Entrar com Google",
    emailSignUp: "Cadastrar-se com e-mail",
    adminPrompt: "Ou continue como Admin",
    adminUsernameLabel: "Usuário Admin",
    adminPasswordLabel: "Senha Admin",
    adminSignInButton: "Entrar como Admin",
    invalidCredentialsError: "Credenciais de administrador inválidas."
  },
  signup: {
    createAccount: "Criar uma Conta",
    getStarted: "Comece a usar o DreamCanvas hoje.",
    emailLabel: "Endereço de e-mail",
    passwordLabel: "Senha",
    createAccountButton: "Criar Conta",
    alreadyHaveAccount: "Já tem uma conta?",
    signInLink: "Entrar"
  },
  imageGeneration: {
    title: "Geração de Imagem com Imagen",
    description: "Descreva uma imagem e deixe o Imagen dar vida a ela. Seja o mais descritivo possível para obter os melhores resultados.",
    promptPlaceholder: "ex: Um leão majestoso usando uma coroa, sentado em um trono na selva",
    generateButton: "Gerar Imagem",
    generatingButton: "Gerando...",
    downloadButton: "Baixar",
    deleteButton: "Excluir",
    removeBgButton: "Remover Fundo",
    processingButton: "Processando...",
    historyTitle: "Histórico de Geração",
    emptyHistory: "Suas imagens geradas aparecerão aqui.",
    placeholder: "Sua imagem gerada aparecerá aqui."
  },
  imageEditing: {
      title: "Edição de Imagem com Nano Banana",
      description: "Envie uma imagem e descreva as edições desejadas. De ajustes simples a transformações criativas.",
      uploadPlaceholder: "Envie sua imagem aqui",
      editedPlaceholder: "Sua imagem editada aparecerá aqui",
      promptPlaceholder: "Descreva suas edições... ex: 'Deixe o fundo preto e branco' ou 'Adicione uma capa de super-herói'.",
      applyEditButton: "Aplicar Edição",
      editingButton: "Editando..."
  },
  chat: {
    complexChatTitle: "Chat Complexo com Gemini Pro",
    fastChatTitle: "Chat Rápido com Gemini Flash Lite",
    libraryButton: "Biblioteca",
    complexPromptPlaceholder: "Faça uma pergunta complexa...",
    fastPromptPlaceholder: "Faça uma pergunta rápida...",
    sendButton: "Enviar",
    libraryTitle: "Biblioteca de Prompts",
    copyPrompt: "Copiar prompt",
    usePrompt: "Usar",
    emptyLibrary: "Seus prompts salvos aparecerão aqui.",
    emptyLibraryDesc: "Os prompts que você envia no chat são adicionados automaticamente."
  },
  pricing: {
    title: "Encontre o plano certo para você",
    description: "Comece de graça e depois atualize para um plano que atenda às suas necessidades criativas.",
    mostPopular: "Mais Popular",
    currentPlan: "Plano Atual",
    choosePlan: "Escolher Plano",
    modalTitle: "Complete sua compra",
    modalSubtitle: "Você está assinando o plano {planName}.",
    creditCardTab: "Cartão de Crédito",
    pixTab: "PIX",
    payButton: "Pagar {price}",
    processingButton: "Processando...",
    successTitle: "Pagamento bem-sucedido!",
    successMessage: "Seu plano {planName} está ativo. Boas criações!"
  },
  admin: {
    dashboard: {
      totalSubscribers: "Total de Assinantes",
      activeSubscriptions: "Assinaturas Ativas",
      totalImages: "Total de Imagens Geradas"
    },
    users: {
      title: "Lista de Assinantes",
      description: "Gerencie seus assinantes.",
      headerUser: "Assinante",
      headerPlan: "Plano",
      headerImages: "Imagens Geradas",
      headerStatus: "Status",
      headerActions: "Ações",
      blockButton: "Bloquear",
      activateButton: "Ativar",
      deleteButton: "Excluir"
    },
    editModal: {
      title: "Editar Assinante",
      description: "Atualize os detalhes de {userName}.",
      nameLabel: "Nome",
      emailLabel: "Email",
      planLabel: "Plano",
      cancelButton: "Cancelar",
      saveButton: "Salvar Alterações"
    },
    confirmModal: {
      title: "Confirmar Exclusão",
      message: "Tem certeza de que deseja excluir \"{userName}\"? Esta ação não pode ser desfeita.",
      cancelButton: "Cancelar",
      confirmButton: "Sim, tenho certeza"
    }
  }
};

const translations: Record<string, any> = { en: enTranslations, pt: ptTranslations };

type Language = 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem('dreamcanvas_language');
      return (savedLang === 'en' || savedLang === 'pt') ? savedLang : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    try {
      localStorage.setItem('dreamcanvas_language', lang);
    } catch (error) {
        console.error("Could not save language to localStorage", error);
    }
    setLanguageState(lang);
  };

  const t = useCallback((key: string, replacements: Record<string, string> = {}): string => {
    const keys = key.split('.');
    let result = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        let fallbackResult = translations['en'];
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
        }
        if (fallbackResult !== undefined) {
            result = fallbackResult;
            break;
        }
        return key;
      }
    }
    
    if (typeof result === 'string') {
        Object.keys(replacements).forEach(placeholder => {
            result = result.replace(`{${placeholder}}`, replacements[placeholder]);
        });
        return result;
    }
    
    return key;
  }, [language]);
  
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

// --- END I18N SETUP ---

type Feature = 'generate' | 'edit' | 'chat' | 'fast-chat' | 'pricing';
type View = 'client' | 'admin';

const AppContent: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeFeature, setActiveFeature] = useState<Feature>('generate');
  const [view, setView] = useState<View>('client');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const features: { id: Feature; name: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { id: 'generate', name: t('features.generate'), icon: ImageGeneratorIcon },
    { id: 'edit', name: t('features.edit'), icon: ImageEditIcon },
    { id: 'chat', name: t('features.chat'), icon: SparkIcon },
    { id: 'fast-chat', name: t('features.fastChat'), icon: BoltIcon },
    { id: 'pricing', name: t('features.pricing'), icon: TagIcon },
  ];

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} t={t} />;
  }

  const renderFeature = () => {
    switch (activeFeature) {
      case 'generate':
        return <ImageGeneration t={t} />;
      case 'edit':
        return <ImageEditing t={t} />;
      case 'chat':
        return <GeminiProChat t={t} />;
      case 'fast-chat':
        return <FastChat t={t} />;
      case 'pricing':
        return <PricingPage t={t} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              {t('app.title')}
            </h1>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative">
                <button
                  onClick={() => setIsLangMenuOpen(prev => !prev)}
                  className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  {language.toUpperCase()}
                </button>
                {isLangMenuOpen && (
                  <div className="absolute right-0 mt-2 w-24 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
                    <button onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">English</button>
                    <button onClick={() => { setLanguage('pt'); setIsLangMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Português</button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setView(v => v === 'client' ? 'admin' : 'client')}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label={view === 'client' ? t('app.adminPanel') : t('app.dreamCanvasView')}
              >
                <UserGroupIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{view === 'client' ? t('app.adminPanel') : t('app.dreamCanvasView')}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-300 bg-red-800/50 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                aria-label={t('app.logout')}
              >
                <LogoutIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{t('app.logout')}</span>
              </button>
            </div>
          </div>
          {view === 'client' && (
            <nav className="overflow-x-auto">
              <ul className="flex space-x-2 sm:space-x-4 border-b border-gray-700">
                {features.map((feature) => (
                  <li key={feature.id} className="flex-shrink-0">
                    <button
                      onClick={() => setActiveFeature(feature.id)}
                      className={`flex items-center space-x-2 px-3 py-3 text-sm sm:text-base font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-t-lg ${
                        activeFeature === feature.id
                          ? 'text-blue-400 border-b-2 border-blue-400'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <feature.icon className="w-5 h-5" />
                      <span>{feature.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        <div className="w-full">
          {view === 'client' ? renderFeature() : <AdminPanel t={t} />}
        </div>
      </main>

      <footer className="text-center p-4 text-xs text-gray-500 border-t border-gray-800">
        {t('app.poweredBy')}
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};


export default App;
