import React from "react";
import { 
  FileEdit, 
  Eye, 
  Sparkles, 
  HelpCircle, 
  Globe, 
  CheckCircle2, 
  Search 
} from "lucide-react";
import { ContentProject } from "../types";

interface EditorAreaProps {
  project: ContentProject;
  onChange: (updates: Partial<ContentProject>) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  hasApiKey: boolean;
  onAutoMetadata: () => void;
  isGeneratingMeta: boolean;
}

export default function EditorArea({
  project,
  onChange,
  onAnalyze,
  isAnalyzing,
  hasApiKey,
  onAutoMetadata,
  isGeneratingMeta,
}: EditorAreaProps) {
  // Handlers
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ title: e.target.value });
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ targetKeyword: e.target.value });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ content: e.target.value });
  };

  // Live Stats calculations
  const characterCount = project.content ? project.content.length : 0;
  const wordCount = project.content
    ? project.content.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const readTimeMins = Math.max(1, Math.ceil(wordCount / 225)); // average reading speed 225 wpm

  // Check density of the target primary keyword
  const getKeywordDensity = () => {
    if (!project.targetKeyword || !project.content || wordCount === 0) return 0;
    const cleanKeyword = project.targetKeyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${cleanKeyword}\\b`, "gi");
    const matches = project.content.match(regex);
    const count = matches ? matches.length : 0;
    return parseFloat(((count / wordCount) * 100).toFixed(1));
  };

  const keywordDensity = getKeywordDensity();

  // Search Tag previews
  const googleTitle = project.lastMetadata?.titleTag || `${project.title || "Sin título"} - SEO CopyCraft`;
  const googleSlug = project.lastMetadata?.urlSlug || (project.title ? project.title.toLowerCase().trim().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "-") : "mi-articulo-seo");
  const googleDesc = project.lastMetadata?.metaDescription || (project.content ? project.content.substring(0, 150).trim() + "..." : "Escribe contenido creativo en el editor y genera metadatos profesionales indexables en segundos para optimizar el SEO del buscador.");

  return (
    <div className="flex-1 bg-slate-900 border-r border-slate-900 flex flex-col h-full overflow-y-auto">
      
      {/* Editor Controls / Topbar */}
      <div className="p-4 md:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <FileEdit className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xs md:text-sm font-bold text-slate-100 uppercase tracking-wider">
            Copywriter Studio Workspace
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Analyze CTA */}
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing || !project.content}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-slate-950 font-bold text-xs bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 transition cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/10 active:scale-95 duration-150"
          >
            {isAnalyzing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                Auditando SEO...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Auditar Core SEO
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        {/* Title, Keyword inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
              Título Corporativo o Post
            </label>
            <input
              type="text"
              placeholder="Ej. 10 Estrategias de Marketing Digital para 2026..."
              value={project.title}
              onChange={handleTitleChange}
              className="w-full font-sans text-sm py-2.5 md:py-3 px-4 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl text-white placeholder-slate-600 focus:outline-hidden transition shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
              Palabra Clave Objetivo (Keyword)
            </label>
            <input
              type="text"
              placeholder="Ej. marketing digital"
              value={project.targetKeyword}
              onChange={handleKeywordChange}
              className="w-full font-sans text-sm py-2.5 md:py-3 px-4 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-teal-500 rounded-xl text-teal-400 placeholder-slate-600 focus:outline-hidden transition shadow-inner font-semibold"
            />
          </div>
        </div>

        {/* Content Area Input */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Contenido Principal (Editor)
            </label>
            {project.targetKeyword && (
              <span className={`self-start sm:self-auto text-[10px] font-mono px-2 py-0.5 rounded-md ${
                keywordDensity >= 1 && keywordDensity <= 2.5
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : keywordDensity > 2.5
                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                  : "bg-slate-950 text-slate-500 border border-slate-800"
              }`}>
                Densidad Keyword: <span className="font-bold">{keywordDensity}%</span> {keywordDensity > 2.5 ? "(Sobreoptimizado)" : keywordDensity >= 1 ? "(Óptimo)" : "(Bajo)"}
              </span>
            )}
          </div>
          <textarea
            placeholder="Comienza a redactar tu contenido aquí. Utiliza las herramientas de Inteligencia Artificial para reescribir secciones, cambiar el tono, generar ideas y optimizar tu SEO..."
            value={project.content}
            onChange={handleContentChange}
            rows={10}
            className="w-full font-sans text-sm p-4 md:p-5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 hover:border-slate-700 transition leading-relaxed resize-y shadow-inner min-h-[220px] md:min-h-[350px]"
          />
        </div>

        {/* Content Metadata Stats strip */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950/75 border border-slate-800/60 rounded-xl font-mono text-center">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Palabras</p>
            <p className="text-base md:text-lg font-bold text-slate-200 mt-1">{wordCount}</p>
          </div>
          <div className="border-x border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Caracteres</p>
            <p className="text-base md:text-lg font-bold text-slate-200 mt-1">{characterCount}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Tiempo Lectura</p>
            <p className="text-base md:text-lg font-bold text-emerald-400 mt-1">~{readTimeMins} min</p>
          </div>
        </div>

        {/* Dynamic Mock Google Search Preview Card */}
        <div className="p-4 md:p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-tight">
                Vista Previa de Indexación Google (SERP Mockup)
              </h3>
            </div>
            <button
              onClick={onAutoMetadata}
              disabled={isGeneratingMeta || !project.content}
              className="py-1 px-3 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 w-full sm:w-auto"
            >
              {isGeneratingMeta ? (
                <>
                  <span className="w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></span>
                  Optimizando...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  Auto-optimizar Snippet (AI)
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Así es como se representará tu publicación en las páginas de resultados de búsqueda de Google. Optimizar el CTR incrementa exponencialmente los clics orgánicos.
          </p>

          <div className="p-3.5 md:p-5 bg-white rounded-lg border border-slate-200 shadow-sm space-y-1.5 max-w-2xl mx-auto select-none overflow-hidden">
            {/* Google Search Result display */}
            <div className="flex items-center gap-1 text-slate-600 text-[10px] md:text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">https://tuwebseo.com/blog/</span>
              <span className="text-[10px] py-[1px] px-1 rounded-sm bg-slate-100 font-bold font-mono">
                {googleSlug}
              </span>
            </div>
            
            <h4 className="text-sm md:text-lg text-[#1a0dab] hover:underline cursor-pointer font-medium leading-tight line-clamp-1">
              {googleTitle}
            </h4>

            <p className="text-xs md:text-sm text-[#4d5156] leading-relaxed line-clamp-2">
              {googleDesc}
            </p>
          </div>

          {project.lastMetadata && (
            <div className="p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-lg space-y-2">
              <p className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Recomendaciones SEO de Cabeceras
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 font-sans pl-1">
                {project.lastMetadata.headerStructureTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
