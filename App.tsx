// App.tsx
import React, { useState, useCallback, useEffect, JSX } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Asset, HistoryEntry, Category, User } from './types';
import { APP_NAME, ACCENT_COLOR_CLASS_BG } from './constants';
import HomeScreen from './components/screens/HomeScreen';
import ScanScreen from './components/screens/ScanScreen';
import AssetListScreen from './components/screens/AssetListScreen';
import AssetDetailScreen from './components/screens/AssetDetailScreen';
import LoginScreen from './components/screens/LoginScreen';
import Button from './components/ui/Button';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Função para buscar ativos
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/assets`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Asset[] = await response.json();
      const assetsWithHistory = data.map(asset => ({ ...asset, historico: asset.historico || [] }));
      setAssets(assetsWithHistory);
    } catch (e: any) {
      console.error("Erro ao buscar ativos:", e);
      setError("Falha ao carregar dados dos ativos. Verifique se o backend está a correr.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Função para buscar categorias
  const fetchCategories = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/assets/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Category[] = await response.json();
      setCategories(data);
    } catch (e: any) {
      console.error("Erro ao buscar categorias:", e);
      setError("Falha ao carregar categorias.");
    }
  }, [API_BASE_URL]);


  useEffect(() => {
    // Tentar carregar o token e o usuário do localStorage ao iniciar
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('currentUser');
    if (storedToken && storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      // Poderia validar o token com o backend aqui para maior segurança
    }
    fetchAssets();
    fetchCategories();
  }, [fetchAssets, fetchCategories]);


  const findAssetById = useCallback((id: string): Asset | undefined => {
    return assets.find(asset => asset.id.toLowerCase() === id.toLowerCase());
  }, [assets]);

  const handleScan = (id: string) => {
    const asset = findAssetById(id);
    if (asset) {
      navigate(`/asset/${asset.id}`);
    } else {
      alert(`Máquina com ID "${id}" não encontrada na lista carregada.`);
      navigate('/scan', { replace: true });
    }
  };

  // Função para fazer login
  const handleLogin = useCallback(async (username: string, password: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAuthError(errorData.message || "Erro de login desconhecido.");
        return false;
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      setCurrentUser(data.user);
      return true;
    } catch (e: any) {
      console.error("Erro ao realizar login:", e);
      setAuthError("Falha na conexão com o servidor. Tente novamente.");
      return false;
    }
  }, [API_BASE_URL]);

  // Função para fazer logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigate('/login'); // Redireciona para a tela de login
  }, [navigate]);


  // Helper para obter headers de autorização
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, []);


  const updateAsset = useCallback(async (updatedAssetData: Omit<Asset, 'historico' | 'ultima_atualizacao'>) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/assets/${updatedAssetData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        } as HeadersInit, // <--- ADICIONADO: cast para HeadersInit
        body: JSON.stringify(updatedAssetData),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) { handleLogout(); } // Se não autorizado, faz logout
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const updatedAssetFromServer: Asset = await response.json();

      setAssets(prevAssets =>
        prevAssets.map(asset =>
          asset.id === updatedAssetFromServer.id
            ? { ...asset, ...updatedAssetFromServer }
            : asset
        )
      );
      return true;
    } catch (e: any) {
      console.error("Erro ao atualizar ativo:", e);
      setError(`Falha ao atualizar ativo: ${e.message}`);
      return false;
    }
  }, [API_BASE_URL, getAuthHeaders, handleLogout]);

  const addAsset = useCallback(async (newAssetData: Omit<Asset, 'historico' | 'ultima_atualizacao' | 'id' | 'id_interno' | 'atualizado_por'>) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        } as HeadersInit, // <--- ADICIONADO: cast para HeadersInit
        body: JSON.stringify(newAssetData),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) { handleLogout(); } // Se não autorizado, faz logout
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const addedAssetFromServer: Asset = await response.json();

      setAssets(prevAssets => [...prevAssets, { ...addedAssetFromServer, historico: [] }]);
      return true;
    } catch (e: any) {
      console.error("Erro ao adicionar ativo:", e);
      setError(`Falha ao adicionar ativo: ${e.message}`);
      return false;
    }
  }, [API_BASE_URL, getAuthHeaders, handleLogout]);

  const addCategory = useCallback(async (categoryName: string, categoryPrefix: string) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/assets/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        } as HeadersInit, // <--- ADICIONADO: cast para HeadersInit
        body: JSON.stringify({ name: categoryName, prefix: categoryPrefix }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) { handleLogout(); } // Se não autorizado, faz logout
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const newCategory: Category = await response.json();
      setCategories(prevCategories => [...prevCategories, newCategory]);
      return newCategory;
    }
    catch (e: any) {
      console.error("Erro ao adicionar categoria:", e);
      setError(`Falha ao adicionar categoria: ${e.message}`);
      return null;
    }
  }, [API_BASE_URL, getAuthHeaders, handleLogout]);


  const addHistoryEntry = useCallback(async (assetId: string, entryData: Omit<HistoryEntry, 'id' | 'timestamp' | 'asset_id'>) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/assets/${assetId}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        } as HeadersInit, // <--- ADICIONADO: cast para HeadersInit
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) { handleLogout(); } // Se não autorizado, faz logout
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newHistoryEntry: HistoryEntry = await response.json();

      setAssets(prevAssets =>
        prevAssets.map(asset => {
          if (asset.id === assetId) {
            return {
              ...asset,
              historico: [newHistoryEntry, ...(asset.historico || [])],
            };
          }
          return asset;
        })
      );
      return true;
    } catch (e: any) {
      console.error("Erro ao adicionar histórico:", e);
      setError(`Falha ao adicionar histórico: ${e.message}`);
      return false;
    }
  }, [API_BASE_URL, getAuthHeaders, handleLogout]);


  const deleteAsset = useCallback(async (assetId: string) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/assets/${assetId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        } as HeadersInit, // <--- ADICIONADO: cast para HeadersInit
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) { handleLogout(); } // Se não autorizado, faz logout
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      if (responseText) {
        try {
          const deletedAssetFromServer = JSON.parse(responseText);
          console.log("Ativo excluído:", deletedAssetFromServer.deletedAsset);
        } catch (parseError) {
          console.warn("Resposta não é JSON válido, mas a exclusão foi bem-sucedida:", responseText);
        }
      } else {
        console.log("Ativo excluído com sucesso (resposta vazia).");
      }
      setAssets(prevAssets => prevAssets.filter(asset => asset.id !== assetId));
      return true;
    } catch (e: any) {
      console.error("Erro ao excluir ativo:", e);
      setError(`Falha ao excluir ativo: ${e.message}`);
      return false;
    }
  }, [API_BASE_URL, getAuthHeaders, handleLogout]);


  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }

  // Componente privado que requer autenticação
  const PrivateRoute = ({ children, roles }: { children: JSX.Element; roles?: string[] }) => {
    // Removido o useEffect para redirecionar para login, pois o Router v6+ lida com isso.
    // O redirecionamento agora é feito no useEffect abaixo, após verificar o currentUser.
    if (!currentUser) {
      // Usamos uma "chave" para forçar o useEffect a rodar apenas uma vez quando o currentUser muda
      // e para evitar loops de redirecionamento.
      useEffect(() => {
        // Apenas redireciona se já tentou carregar e não há usuário
        if (!loading && !currentUser) { // Garante que não redireciona enquanto carrega
            navigate('/login', { replace: true });
        }
      }, [currentUser, navigate, loading]);
      return null; // Não renderiza nada enquanto redireciona
    }

    if (roles && !roles.includes(currentUser.role)) {
      useEffect(() => { navigate('/', { replace: true }); alert("Acesso negado. Você não tem permissão para acessar esta página."); }, [navigate]);
      return null;
    }
    return children;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className={`${ACCENT_COLOR_CLASS_BG} text-white p-4 shadow-md sticky top-0 z-50`}>
        <h1 className="text-xl font-semibold text-center">{APP_NAME}</h1>
        {currentUser && (
          <div className="absolute right-4 top-4 flex items-center space-x-2 text-sm">
            <span className="font-medium">Olá, {currentUser.username} ({currentUser.role})</span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>Sair</Button>
          </div>
        )}
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Erro: </strong>
            <span className="block sm:inline">{error}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Fechar</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </span>
          </div>
        )}
        <Routes>
          {/* Rota de Login (Pública) */}
          <Route
            path="/login"
            element={
              <LoginScreen
                onLogin={handleLogin}
                errorMessage={authError}
                clearError={() => setAuthError(null)}
              />
            }
          />

          {/* Rotas Protegidas (Exigem Login) */}
          <Route path="/" element={<PrivateRoute><HomeScreen onAddAsset={() => navigate('/add-asset')} /></PrivateRoute>} />
          <Route path="/scan" element={<PrivateRoute><ScanScreen onScan={handleScan} /></PrivateRoute>} />
          <Route path="/assets" element={<PrivateRoute><AssetListScreen assets={assets} categories={categories} /></PrivateRoute>} />
          <Route
            path="/asset/:assetId"
            element={
              <PrivateRoute>
                <AssetDetailScreen
                  onUpdateAsset={updateAsset}
                  onAddHistoryEntry={addHistoryEntry}
                  onDeleteAsset={deleteAsset}
                  apiBaseUrl={API_BASE_URL}
                  categories={categories}
                  onAddCategory={addCategory}
                />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-asset"
            element={
              <PrivateRoute>
                <AssetDetailScreen
                  mode="addAsset"
                  onAddAsset={addAsset}
                  onUpdateAsset={updateAsset}
                  onAddHistoryEntry={addHistoryEntry}
                  apiBaseUrl={API_BASE_URL}
                  categories={categories}
                  onAddCategory={addCategory}
                />
              </PrivateRoute>
            }
          />
          {/* TODO: Adicionar rotas para gerenciamento de usuários (apenas admin) */}
          {/* <Route path="/users" element={<PrivateRoute roles={['admin']}> <UserManagementScreen /> </PrivateRoute>} /> */}
        </Routes>
      </main>
      <footer className="text-center p-4 text-sm text-slate-500 border-t border-slate-200">
        © {new Date().getFullYear()} Make Distribuidora. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default App;