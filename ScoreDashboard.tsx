import React from "react";
import { 
  CheckCircle2, 
  HelpCircle, 
  ArrowUpRight, 
  Sparkles, 
  Bookmark, 
  AlertCircle, 
  Check, 
  Plus 
} from "lucide-react";
import { AnalysisResult } from "../types";

interface ScoreDashboardProps {
  analysis?: AnalysisResult;
  content: string;
}

export default function ScoreDashboard({ analysis, content }: ScoreDashboardProps) {
  if (!analysis) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center h-full text-slate-400">
        <AlertCircle className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
        <h3 className="font-bold text-slate-200">No se ha auditado el borrador</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
          Escribe contenido en tu espacio de trabajo y presiona el botón <span className="text-emerald-400 font-semibold">"Auditar Core SEO"</span> de arriba para extraer puntuaciones SEO, lectura, tonos de voz y palabras clave.
        </p>
      </div>
    );
  }

  // Check if secondary keywords exist on the page text
  const isKeywordInContent = (keyword: string) => {
    if (!content) return false;
    const cleanK = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${cleanK}\\b`, "gi");
    return regex.test(content);
  };

  // Convert scores into color themes
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 stroke-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "text-amber-400 stroke-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 stroke-rose-500 bg-rose-500/10 border-rose-500/20";
  };

  const getFleschLabel = (score: number) => {
    if (score >= 80) return "Extremadamente Sencillo";
    if (score >= 60) return "Estándar / Fácil de leer";
    if (score >= 40) return "Moderado / Técnico";
    return "Académico / Muy complejo";
  };

  return (
    <div className="space-y-6">

      {/* Header info */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
          Auditoría de Relevancia SEO
        </h3>
      </div>

      {/* Hero Bento Score grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Core SEO Score Circular Ring */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full blur-xs group-hover:bg-emerald-500/10 transition"></div>
          
          <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">
            Puntuación SEO
          </h4>

          {/* Svg Radial circle */}
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${getScoreColor(analysis.seoScore).split(" ")[1]} transition-all duration-1000`}
                strokeDasharray={`${analysis.seoScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-100">{analysis.seoScore}</span>
              <span className="text-[8px] text-slate-500 uppercase font-bold">de 100</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-4 leading-relaxed px-1">
            Optimización de densidad, metas y longitud de copia.
          </p>
        </div>

        {/* Readability Score and Level */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-bl-full blur-xs group-hover:bg-indigo-500/10 transition"></div>
          
          <div>
            <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">
              Comprensión Lectora
            </h4>
            <div className="space-y-1">
              <p className="text-xl font-black text-white">{analysis.readabilityGrade}</p>
              <p className="text-xs font-bold text-emerald-400">{getFleschLabel(analysis.readabilityScore)}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 mt-4">
            <p className="text-[10px] text-slate-500">Índice Flesch Ease</p>
            <p className="text-lg font-bold text-slate-100">{analysis.readabilityScore} <span className="text-xs text-slate-500 font-normal">/ 100</span></p>
          </div>
        </div>
      </div>

      {/* Tone & Sentiment Indicator card */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tono / Sentimiento</p>
          <p className="text-sm font-bold text-slate-200 mt-1">{analysis.sentimentTone}</p>
        </div>
        <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold rounded-lg font-mono">
          Detectado
        </div>
      </div>

      {/* Sub Metric linear progress bars */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4">
        <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Métricas de Copywriting
        </h4>

        <div className="space-y-3.5">
          {[
            { label: "Persuasión y CTA", val: analysis.toneScores.persuasiveness, color: "bg-emerald-500" },
            { label: "Claridad Gramatical", val: analysis.toneScores.clarity, color: "bg-teal-500" },
            { label: "Estructura Profesional", val: analysis.toneScores.professionalism, color: "bg-indigo-500" },
            { label: "Engache y Viralidad", val: analysis.toneScores.engagement, color: "bg-purple-500" },
          ].map((bar, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">{bar.label}</span>
                <span className="text-slate-200 font-mono font-bold">{bar.val}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-full ${bar.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${bar.val}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keyword Checklist */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4">
        <div>
          <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            Recomendaciones LSI (Palabras Clave)
          </h4>
          <p className="text-[10px] text-slate-500">
            Maximiza el tráfico semántico incluyendo estas sugerencias en el artículo.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {analysis.suggestedKeywords.map((kw, i) => {
            const detected = isKeywordInContent(kw);
            return (
              <div
                key={i}
                className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition duration-150 ${
                  detected
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {detected ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
                <span className="truncate font-medium">{kw}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable improvement tips */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4">
        <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Plan de Mejora Editorial
        </h4>

        <div className="space-y-3">
          {analysis.improvementTips.map((tip, i) => (
            <div key={i} className="flex gap-3 items-start select-none">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{tip}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
