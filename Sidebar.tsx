import React, { useState } from "react";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Search, 
  Compass
} from "lucide-react";
import { ContentProject } from "../types";

interface SidebarProps {
  projects: ContentProject[];
  selectedProjectId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export default function Sidebar({
  projects,
  selectedProjectId,
  onSelect,
  onNew,
  onDelete,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-slate-950 border-r border-slate-900 flex flex-col overflow-hidden">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              CopyCraft AI
            </h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              SEO Content Studio
            </p>
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="p-4 space-y-3">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 active:scale-[0.98] transition cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Borrador
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar borradores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs py-2.5 pl-10 pr-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Drafts List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2 mb-2">
          Tus Borradores ({filteredProjects.length})
        </div>

        {filteredProjects.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-900 rounded-xl">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-60" />
            <p className="text-xs text-slate-500 font-medium">No hay borradores</p>
            <p className="text-[10px] text-slate-600 mt-1">Crea uno para empezar</p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const isSelected = project.id === selectedProjectId;
            const wordCount = project.content
              ? project.content.trim().split(/\s+/).filter(Boolean).length
              : 0;

            return (
              <div
                key={project.id}
                className={`group flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 border border-slate-800 text-white shadow-sm"
                    : "hover:bg-slate-900/40 border border-transparent text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => onSelect(project.id)}
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <FileText
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isSelected ? "text-emerald-400" : "text-slate-500"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isSelected ? "text-slate-100" : "text-slate-300"}`}>
                      {project.title || "Sin título"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-slate-500 font-mono">
                        {wordCount} palabras
                      </span>
                      {project.lastAnalysis && (
                        <span className={`text-[8px] font-bold px-1 rounded-sm ${
                          project.lastAnalysis.seoScore >= 80
                            ? "bg-emerald-500/10 text-emerald-400"
                            : project.lastAnalysis.seoScore >= 50
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}>
                          SEO: {project.lastAnalysis.seoScore}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete button (only show on hover or selected on touch) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(project.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-800 text-slate-500 hover:text-rose-400 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer with simple version */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/60">
        <div className="flex items-center justify-between text-[10px] text-slate-500 px-2">
          <span>Versión 1.0.0</span>
          <span className="text-emerald-500/80 font-semibold flex items-center gap-1">
            ● Copiloto Listo
          </span>
        </div>
      </div>
    </div>
  );
}
