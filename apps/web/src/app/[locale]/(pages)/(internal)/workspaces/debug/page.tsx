"use client";

import { useState } from "react";
import { Button } from "@ordo-todo/ui";
import { Card } from "@ordo-todo/ui";
import { useWorkspaces, useDeletedWorkspaces } from "@/lib/api-hooks";
import { apiClient } from "@/lib/api-client";
import axios from "axios";

// Interfaz local laxa para debug, permitiendo propiedades extra que no están en el tipo oficial
interface DebugWorkspace {
  id: string;
  name: string;
  slug: string;
  isDeleted?: boolean;
  deletedAt?: string | Date;
  [key: string]: any;
}

export default function DebugWorkspacesPage() {
  const [message, setMessage] = useState("");
  const [isFixing, setIsFixing] = useState(false);
  
  // Usar los hooks existentes que ya tienen auth configurada
  const { data: activeWorkspaces = [], isLoading: loadingActive, refetch: refetchActive } = useWorkspaces();
  const { data: deletedWorkspaces = [], isLoading: loadingDeleted, refetch: refetchDeleted } = useDeletedWorkspaces();

  // Combinar activos + eliminados para ver TODOS y castear a DebugWorkspace
  const allWorkspaces: DebugWorkspace[] = [...activeWorkspaces, ...deletedWorkspaces] as unknown as DebugWorkspace[];

  const fixCarros = async () => {
    if (!confirm("¿Marcar todos los workspaces 'Carros' como eliminados?")) return;

    setIsFixing(true);
    try {
      // Llamar al endpoint debug usando axios directamente
      const token = localStorage.getItem('ordo_auth_token');
      const result = await axios.delete("/api/workspaces/debug/fix-carros", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage(`✅ Actualizados: ${result.data.updated} de ${result.data.total} workspaces`);
      console.log("Resultado:", result.data);

      // Recargar datos
      await refetchActive();
      await refetchDeleted();
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
      console.error("Error fixing carros:", error);
    }
    setIsFixing(false);
  };

  const loading = loadingActive || loadingDeleted || isFixing;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔧 Debug Workspaces</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Herramienta para debuggear el estado de los workspaces
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={() => { refetchActive(); refetchDeleted(); }} disabled={loading}>
          🔄 Recargar Todos
        </Button>
        <Button onClick={fixCarros} disabled={loading} variant="destructive">
          🔧 Fix Carros
        </Button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded-md">
          {message}
        </div>
      )}

      {message && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Todos los workspaces */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            📋 Todos los Workspaces ({allWorkspaces.length})
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {allWorkspaces.length === 0 ? (
              <p className="text-gray-500">No hay workspaces</p>
            ) : (
              allWorkspaces.map((ws) => (
                <div
                  key={ws.id}
                  className={`p-4 rounded-lg border-2 ${
                    ws.isDeleted
                      ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800"
                      : "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{ws.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Slug: {ws.slug}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ID: {ws.id.slice(0, 8)}...
                      </p>
                    </div>
                    <div>
                      {ws.isDeleted ? (
                        <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                          ELIMINADO
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                          ACTIVO
                        </span>
                      )}
                    </div>
                  </div>
                  {ws.deletedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Eliminado: {new Date(ws.deletedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Solo eliminados */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            🗑️ Solo Eliminados ({deletedWorkspaces.length})
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {deletedWorkspaces.length === 0 ? (
              <p className="text-gray-500">La papelera está vacía</p>
            ) : (
              (deletedWorkspaces as unknown as DebugWorkspace[]).map((ws) => (
                <div
                  key={ws.id}
                  className="p-4 rounded-lg border-2 bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800"
                >
                  <h3 className="font-semibold text-lg">{ws.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Slug: {ws.slug}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ID: {ws.id.slice(0, 8)}...
                  </p>
                  {ws.deletedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Eliminado: {new Date(ws.deletedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Buscar "Carros" específicamente */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">
          🚗 Workspaces "Carros"
        </h2>
        <div className="space-y-3">
          {allWorkspaces
            .filter((ws) => ws.name.toLowerCase().includes("carros"))
            .map((ws) => (
              <div
                key={ws.id}
                className={`p-4 rounded-lg border-2 ${
                  ws.isDeleted
                    ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800"
                    : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{ws.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Slug: {ws.slug}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ID: {ws.id}
                    </p>
                    <p className="text-sm font-medium mt-2">
                      isDeleted: {ws.isDeleted ? "✅ true" : "❌ false"}
                    </p>
                    {ws.deletedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        deletedAt: {
                          ws.deletedAt instanceof Date 
                            ? ws.deletedAt.toISOString() 
                            : String(ws.deletedAt)
                        }
                      </p>
                    )}
                  </div>
                  <div>
                    {ws.isDeleted ? (
                      <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                        ELIMINADO ✅
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-600 text-white text-xs font-semibold rounded-full">
                        NO ELIMINADO ⚠️
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          {allWorkspaces.filter((ws) => ws.name.toLowerCase().includes("carros"))
            .length === 0 && (
            <p className="text-gray-500">
              No se encontraron workspaces con "carros" en el nombre
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
