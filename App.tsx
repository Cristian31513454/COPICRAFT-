import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Layers, 
  Wand2, 
  Sparkle, 
  Crown, 
  Compass, 
  BookOpen, 
  History, 
  ChevronRight, 
  X, 
  Settings, 
  Volume2, 
  AlertCircle,
  FileEdit
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import EditorArea from "./components/EditorArea";
import ScoreDashboard from "./components/ScoreDashboard";
import AiToolsPanel from "./components/AiToolsPanel";
import { ContentProject, AnalysisResult, MetaAnalysis, WritingTone } from "./types";

const LOCAL_STORAGE_KEY = "copycraft_projects_v1";
const PRO_STATE_KEY = "copycraft_is_pro_v1";

const DEFAULT_PROJECTS: ContentProject[] = [
  {
    id: "tutorial-guide",
    title: "Guía de Optimización SEO y Redacción con Copiloto IA",
    targetKeyword: "marketing digital",
    content: `El marketing digital es una de las disciplinas más dinámicas del mercado global. Sin embargo, miles de creadores fallan al redactar porque ignoran el balance fundamental entre la optimización técnica de Google y el copywriting persuasivo.

¿Qué es exactamente la redacción orientada a conversión?
Básicamente consiste en escribir textos que capturen la atención inmediata del lector y lo convenzan de tomar una acción (como suscribirse o realizar una compra directa).

Para maximizar tus resultados en marketing digital, debes centrar tus esfuerzos en:
1. Encontrar un nicho altamente especializado con intención comercial clara.
2. Investigar palabras clave secundarias (LSI) que complementen tu enfoque principal.
3. Desarrollar borradores estructurados con cabeceras H2 y H3 optimizadas.
4. Generar metadatos (Title y Meta Description) atractivos para maximizar los clics en buscadores de forma instantánea.

Prueba ahora mismo el análisis en tiempo real haciendo clic en "Auditar Core SEO" en la sección superior derecha de tu pantalla para evaluar este borrador.`,
    createdAt: new Date().toISOString(),
  }
];

export default function App() {
  const [projects, setProjects] = useState<ContentProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [rightActiveTab, setRightActiveTab] = useState<"scores" | "assistants">("assistants");
  const [activeMobileView, setActiveMobileView] = useState<"drafts" | "editor" | "ai" | "audit">("editor");

  // Loadings
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Initialize and Sync LocalStorage
  useEffect(() => {
    // Load Projects
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          setProjects(parsed);
          setSelectedProjectId(parsed[0].id);
        } else {
          setProjects(DEFAULT_PROJECTS);
          setSelectedProjectId(DEFAULT_PROJECTS[0].id);
        }
      } catch (e) {
        setProjects(DEFAULT_PROJECTS);
        setSelectedProjectId(DEFAULT_PROJECTS[0].id);
      }
    } else {
      setProjects(DEFAULT_PROJECTS);
      setSelectedProjectId(DEFAULT_PROJECTS[0].id);
    }

    // Fetch Backend Config state
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(data.hasApiKey);
      })
      .catch((err) => console.error("Error connecting with backend config state: ", err));
  }, []);

  const saveProjectsToStorage = (updatedList: ContentProject[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  };

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Modify current project draft
  const handleProjectUpdate = (updates: Partial<ContentProject>) => {
    if (!currentProject) return;
    const updated = projects.map((p) => {
      if (p.id === currentProject.id) {
        return { ...p, ...updates };
      }
      return p;
    });
    setProjects(updated);
    saveProjectsToStorage(updated);
  };

  // Create new blank draft
  const handleCreateNewProject = () => {
    const newProj: ContentProject = {
      id: "proj-" + Date.now(),
      title: "Nuevo Borrador sin título",
      targetKeyword: "",
      content: "",
      createdAt: new Date().toISOString(),
    };
    const updated = [newProj, ...projects];
    setProjects(updated);
    setSelectedProjectId(newProj.id);
    saveProjectsToStorage(updated);
    setRightActiveTab("assistants");
    setActiveMobileView("editor");
  };

  // Delete draft
  const handleDeleteProject = (projectId: string) => {
    const updated = projects.filter((p) => p.id !== projectId);
    setProjects(updated);
    saveProjectsToStorage(updated);
    if (selectedProjectId === projectId) {
      if (updated.length > 0) {
        setSelectedProjectId(updated[0].id);
      } else {
        // If empty reset default
        setProjects(DEFAULT_PROJECTS);
        setSelectedProjectId(DEFAULT_PROJECTS[0].id);
        saveProjectsToStorage(DEFAULT_PROJECTS);
      }
    }
  };

  // API Call: Analyze text structure
  const handleAuditSEO = async () => {
    if (!currentProject || !currentProject.content) return;
    setIsAnalyzing(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentProject.title,
          content: currentProject.content,
          targetKeyword: currentProject.targetKeyword,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Fallo en la comunicación con el servidor.");
      }

      const report: AnalysisResult = await res.json();
      handleProjectUpdate({ lastAnalysis: report });
      setRightActiveTab("scores"); // automatically switch tabs to show audit results
      setActiveMobileView("audit"); // auto switch mobile tab to show results
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "La llamada a la API de auditoría falló.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // API Call: Meta optimizer snippet
  const handleAutoSnippet = async () => {
    if (!currentProject || !currentProject.content) return;
    setIsGeneratingMeta(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/ai/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentProject.title,
          content: currentProject.content,
          targetKeyword: currentProject.targetKeyword,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Fallo al generar metadatos.");
      }

      const meta: MetaAnalysis = await res.json();
      handleProjectUpdate({ lastMetadata: meta });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Error al generar recomendación de Snippet.");
    } finally {
      setIsGeneratingMeta(false);
    }
  };

  // API Call forwarded from AiToolsPanel: Rewrite tone
  const handleRewriteAction = async (text: string, tone: WritingTone, instructions: string): Promise<string> => {
    const res = await fetch("/api/ai/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, tone, instructions }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Fallo al procesar reescritura de tono.");
    }

    const data = await res.json();
    return data.rewrittenText || "";
  };

  // API Call forwarded from AiToolsPanel: Outline Planner
  const handleGenerateOutlineAction = async (topic: string, keyword: string, audience: string): Promise<string> => {
    const res = await fetch("/api/ai/outline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, primaryKeyword: keyword, audience }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Fallo al estructurar esquema.");
    }

    const data = await res.json();
    return data.outline || "";
  };

  // Appending rewritten paragraphs to editor area
  const handleInsertEditor = (insertedText: string) => {
    if (!currentProject) return;
    const currentText = currentProject.content;
    const separator = currentText ? "\n\n" : "";
    handleProjectUpdate({
      content: currentText + separator + insertedText,
    });
  };

  return (
    <div id="app" className="flex h-screen w-screen bg-slate-900 text-slate-100 overflow-hidden font-sans antialiased">
      {/* Sidebar: Document Tree wrapper (responsive drawer behaviour) */}
      <div className={`relative ${activeMobileView === "drafts" ? "flex w-full" : "hidden"} md:flex md:w-80 shrink-0 h-full overflow-hidden`}>
        <Sidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelect={(id) => {
            setSelectedProjectId(id);
            setActiveMobileView("editor"); // Auto transition to editor on mobile
          }}
          onNew={handleCreateNewProject}
          onDelete={handleDeleteProject}
        />
      </div>

      {/* Main Content Workspace Column wrapper */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden select-none`}>
        
        {/* API Alerts warnings info banner if missing key (lazy setup preview guide) */}
        {!hasApiKey && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 p-3 px-4 md:px-6 flex items-center justify-between text-amber-300 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span className="truncate max-w-[220px] sm:max-w-none">
                Clave <strong>GEMINI_API_KEY</strong> requerida para las herramientas de IA.
              </span>
            </div>
            <span className="text-[10px] shrink-0 font-bold bg-amber-500/15 py-0.5 px-2 rounded-sm uppercase tracking-wider">
              Preview Mode
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-rose-500/15 border-b border-rose-500/25 p-3 px-4 md:px-6 flex items-center justify-between text-rose-300 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentProject ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
              
              {/* Editor Workspace Container */}
              <div className={`${activeMobileView === "editor" ? "flex" : "hidden"} md:flex flex-1 flex-col h-full overflow-hidden`}>
                <EditorArea
                  project={currentProject}
                  onChange={handleProjectUpdate}
                  onAnalyze={handleAuditSEO}
                  isAnalyzing={isAnalyzing}
                  hasApiKey={hasApiKey}
                  onAutoMetadata={handleAutoSnippet}
                  isGeneratingMeta={isGeneratingMeta}
                />
              </div>

              {/* Right Tools Dashboard Area with tabs */}
              <div className={`${
                activeMobileView === "ai" || activeMobileView === "audit" ? "flex" : "hidden"
              } md:flex w-full md:w-96 bg-slate-950/40 md:border-l border-slate-900 flex-col h-full overflow-hidden`}>
                
                {/* Dashboard Navigation Tabs Header */}
                <div className="grid grid-cols-2 p-3 border-b border-slate-900 bg-slate-950/80 shrink-0">
                  <button
                    onClick={() => {
                      setRightActiveTab("assistants");
                      setActiveMobileView("ai");
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      rightActiveTab === "assistants"
                        ? "bg-slate-900/80 border border-slate-800 text-emerald-400 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Redactores IA
                  </button>
                  <button
                    onClick={() => {
                      setRightActiveTab("scores");
                      setActiveMobileView("audit");
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      rightActiveTab === "scores"
                        ? "bg-slate-900/80 border border-slate-800 text-emerald-400 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Auditoría Core
                  </button>
                </div>

                {/* Dynamic Scrollable Panel Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-5 scrollbar-thin scrollbar-thumb-slate-900 pb-24 md:pb-5">
                  {rightActiveTab === "assistants" ? (
                    <AiToolsPanel
                      onRewrite={handleRewriteAction}
                      onGenerateOutline={handleGenerateOutlineAction}
                      onInsertEditor={(insertedText) => {
                        handleInsertEditor(insertedText);
                        // Take back to editor on small screen so they can see inserted text
                        if (window.innerWidth < 768) {
                          setActiveMobileView("editor");
                        }
                      }}
                    />
                  ) : (
                    <ScoreDashboard
                      analysis={currentProject.lastAnalysis}
                      content={currentProject.content}
                    />
                  )}
                </div>

              </div>
            </div>

            {/* Premium Bottom Navigation Tab Bar (visible ONLY on mobile) */}
            <div className="md:hidden border-t border-slate-900 bg-slate-950/95 backdrop-blur-md px-1 py-2 flex justify-around items-center shrink-0 z-40">
              <button
                onClick={() => setActiveMobileView("drafts")}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                  activeMobileView === "drafts" ? "text-emerald-400 font-bold" : "text-slate-400"
                }`}
              >
                <BookOpen className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-medium tracking-tight">Borradores</span>
              </button>

              <button
                onClick={() => setActiveMobileView("editor")}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                  activeMobileView === "editor" ? "text-emerald-400 font-bold" : "text-slate-400"
                }`}
              >
                <FileEdit className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-medium tracking-tight">Editor</span>
              </button>

              <button
                onClick={() => {
                  setActiveMobileView("ai");
                  setRightActiveTab("assistants");
                }}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                  activeMobileView === "ai" ? "text-emerald-400 font-bold" : "text-slate-400"
                }`}
              >
                <Wand2 className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-medium tracking-tight">Cofundador IA</span>
              </button>

              <button
                onClick={() => {
                  setActiveMobileView("audit");
                  setRightActiveTab("scores");
                }}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                  activeMobileView === "audit" ? "text-emerald-400 font-bold" : "text-slate-400"
                }`}
              >
                <Layers className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-medium tracking-tight">Auditoría</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <Compass className="w-16 h-16 text-slate-800 mb-4 animate-spin" />
            <h3 className="font-bold text-slate-300 text-lg">Cargando borrador...</h3>
            <p className="text-xs text-slate-500 mt-2">Inicializando base de datos...</p>
          </div>
        )}

      </div>

    </div>
  );
}
