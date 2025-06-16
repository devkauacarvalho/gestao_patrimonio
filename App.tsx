import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Asset, HistoryEntry } from './types'; // Assuming types are still valid
import { APP_NAME, ACCENT_COLOR_CLASS_BG } from './constants';
import HomeScreen from './components/screens/HomeScreen';
import ScanScreen from './components/screens/ScanScreen';
import AssetListScreen from './components/screens/AssetListScreen';
import AssetDetailScreen from './components/screens/AssetDetailScreen';

// Define a base URL for the API. Adjust if your backend runs elsewhere.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const App: React.FC = () => {
  // State to hold assets fetched from the API
  const [assets, setAssets] = useState<Asset[]>([]);
  // State to handle loading indicators
  const [loading, setLoading] = useState<boolean>(true);
  // State to handle errors during API calls
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch all assets from the API when the component mounts
  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/assets`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Asset[] = await response.json();
        // Ensure 'historico' is always an array, even if API returns null/undefined
        const assetsWithHistory = data.map(asset => ({ ...asset, historico: asset.historico || [] }));
        setAssets(assetsWithHistory);
      } catch (e: any) {
        console.error("Erro ao buscar ativos:", e);
        setError("Falha ao carregar dados dos ativos. Verifique se o backend está a correr.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []); // Empty dependency array means this runs once on mount

  // Function to find an asset in the current state (used by handleScan)
  // Note: This relies on the initially fetched list. For absolute freshness,
  // handleScan could trigger a specific fetch, but this is simpler for now.
  const findAssetById = useCallback((id: string): Asset | undefined => {
    return assets.find(asset => asset.id.toLowerCase() === id.toLowerCase());
  }, [assets]);

  // Handle navigation after scanning/manual ID entry
  const handleScan = (id: string) => {
    const asset = findAssetById(id);
    if (asset) {
      navigate(`/asset/${asset.id}`);
    } else {
      // Maybe fetch the specific asset here if not found in the list?
      // For now, just show an alert.
      alert(`Máquina com ID "${id}" não encontrada na lista carregada.`);
      // Consider adding a fetch here: fetch(`${API_BASE_URL}/api/assets/${id}`).then(...)
      navigate('/scan', { replace: true });
    }
  };

  // Update an asset via API PUT request
  const updateAsset = useCallback(async (updatedAssetData: Omit<Asset, 'historico' | 'ultima_atualizacao'>) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/assets/${updatedAssetData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedAssetData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const updatedAssetFromServer: Asset = await response.json();

      // Update the local state
      setAssets(prevAssets =>
        prevAssets.map(asset =>
          asset.id === updatedAssetFromServer.id
            ? { ...asset, ...updatedAssetFromServer } // Merge server data, keeping existing history if not returned
            : asset
        )
      );
      return true; // Indicate success
    } catch (e: any) {
      console.error("Erro ao atualizar ativo:", e);
      setError(`Falha ao atualizar ativo: ${e.message}`);
      return false; // Indicate failure
    }
  }, []);

  // Add a new asset via API POST request
  const addAsset = useCallback(async (newAssetData: Omit<Asset, 'historico' | 'ultima_atualizacao'>) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAssetData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const addedAssetFromServer: Asset = await response.json();

      // Update the local state by adding the new asset
      setAssets(prevAssets => [...prevAssets, { ...addedAssetFromServer, historico: [] }]);
      return true; // Indicate success
    } catch (e: any) {
      console.error("Erro ao adicionar ativo:", e);
      setError(`Falha ao adicionar ativo: ${e.message}`);
      return false; // Indicate failure
    }
  }, []);

  // Add a history entry via API POST request
  const addHistoryEntry = useCallback(async (assetId: string, entryData: Omit<HistoryEntry, 'id' | 'timestamp' | 'asset_id'>) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/assets/${assetId}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newHistoryEntry: HistoryEntry = await response.json();

      // Update the local state by adding the new history entry to the correct asset
      setAssets(prevAssets =>
        prevAssets.map(asset => {
          if (asset.id === assetId) {
            // Add the new entry and update the timestamp from the server if available
            // (The backend updates ultima_atualizacao, but doesn't return the whole asset here)
            // We could refetch the asset for perfect sync, or just add the history entry locally.
            return {
              ...asset,
              historico: [newHistoryEntry, ...(asset.historico || [])],
              // Optionally update ultima_atualizacao locally if needed immediately,
              // otherwise rely on next full fetch or detail view fetch.
              // ultima_atualizacao: new Date().toISOString() // Or use timestamp from newHistoryEntry?
            };
          }
          return asset;
        })
      );
      return true; // Indicate success
    } catch (e: any) {
      console.error("Erro ao adicionar histórico:", e);
      setError(`Falha ao adicionar histórico: ${e.message}`);
      return false; // Indicate failure
    }
  }, []);

  // Display loading or error messages
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }

  // Removed the footer note about localStorage

  return (
    <div className="min-h-screen flex flex-col">
      <header className={`${ACCENT_COLOR_CLASS_BG} text-white p-4 shadow-md sticky top-0 z-50`}>
        <h1 className="text-xl font-semibold text-center">{APP_NAME}</h1>
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
          {/* Pass addAsset to HomeScreen */}
          <Route path="/" element={<HomeScreen onAddAsset={() => navigate('/add-asset')} />} />
          <Route path="/scan" element={<ScanScreen onScan={handleScan} />} />
          {/* Pass assets fetched from API to AssetListScreen */}
          <Route path="/assets" element={<AssetListScreen assets={assets} />} />
          {/* AssetDetailScreen will now fetch its own data but needs update/add functions */}
          <Route
            path="/asset/:assetId"
            element={
              <AssetDetailScreen
                // assets={assets} // No longer pass the whole list
                onUpdateAsset={updateAsset}
                onAddHistoryEntry={addHistoryEntry}
                apiBaseUrl={API_BASE_URL} // Pass API URL
              />
            }
          />
          {/* New route for adding a new asset */}
          <Route
            path="/add-asset"
            element={
              <AssetDetailScreen
                mode="addAsset" // Pass a mode to indicate it's for adding
                onAddAsset={addAsset}
                onUpdateAsset={updateAsset} // Keep this for type compatibility, though not used in add mode
                onAddHistoryEntry={addHistoryEntry} // Keep this for type compatibility, though not used in add mode
                apiBaseUrl={API_BASE_URL}
              />
            }
          />
        </Routes>
      </main>
      <footer className="text-center p-4 text-sm text-slate-500 border-t border-slate-200">
        © {new Date().getFullYear()} Make Distribuidora. Todos os direitos reservados.
        {/* Removed the note about localStorage */}
      </footer>
    </div>
  );
};

export default App;