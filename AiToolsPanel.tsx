import React, { useState } from "react";
import { 
  Sparkles, 
  RefreshCw, 
  BookOpen, 
  Heading, 
  Share2, 
  Clipboard, 
  Check, 
  Layers, 
  TrendingUp, 
  Wand2,
  Plus
} from "lucide-react";
import { WritingTone } from "../types";

interface AiToolsPanelProps {
  onRewrite: (text: string, tone: WritingTone, instructions: string) => Promise<string>;
  onGenerateOutline: (topic: string, keyword: string, audience: string) => Promise<string>;
  onInsertEditor: (text: string) => void;
}

export default function AiToolsPanel({
  onRewrite,
  onGenerateOutline,
  onInsertEditor,
}: AiToolsPanelProps) {
  // Tabs
  const [activeTool, setActiveTool] = useState<"rewrite" | "outline">("rewrite");

  // State: Tone Rewriter
  const [rewriteText, setRewriteText] = useState("");
  const [tone, setTone] = useState<WritingTone>("Persuasivo");
  const [customInstructions, setCustomInstructions] = useState("");
  const [rewrittenOutput, setRewrittenOutput] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [copiedRewrite, setCopiedRewrite] = useState(false);

  // State: Outline Generator
  const [outlineTopic, setOutlineTopic] = useState("");
  const [outlineKeyword, setOutlineKeyword] = useState("");
  const [outlineAudience, setOutlineAudience] = useState("");
  const [generatedOutline, setGeneratedOutline] = useState("");
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [copiedOutline, setCopiedOutline] = useState(false);

  // Handlers: Rewrite
  const handleRewriteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewriteText) return;
    setIsRewriting(true);
    setRewrittenOutput("");
    try {
      const result = await onRewrite(rewriteText, tone, customInstructions);
      setRewrittenOutput(result);
    } catch (err) {
      console.error(err);
      setRewrittenOutput("Error al generar reescritura. Verifica tu conexión API.");
    } finally {
      setIsRewriting(false);
    }
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handlers: Outline
  const handleOutlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outlineTopic) return;
    setIsGeneratingOutline(true);
    setGeneratedOutline("");
    try {
      const result = await onGenerateOutline(outlineTopic, outlineKeyword, outlineAudience);
      setGeneratedOutline(result);
    } catch (err) {
      console.error(err);
      setGeneratedOutline("Error al generar esquema. Verifica la configuración de la clave.");
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tool Toggle Tabs */}
      <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-900">
        <button
          onClick={() => setActiveTool("rewrite")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTool === "rewrite"
              ? "bg-slate-900 border border-slate-800 text-emerald-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          Reescribir Texto
        </button>
        <button
          onClick={() => setActiveTool("outline")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTool === "outline"
              ? "bg-slate-900 border border-slate-800 text-emerald-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Estructura Esquema
        </button>
      </div>

      {activeTool === "rewrite" ? (
        /* Rewrite Tool Panel */
        <form onSubmit={handleRewriteSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">
              Párrafo, Frase o Segmento a Transformar
            </label>
            <textarea
              required
              placeholder="Ej. Bienvenidos a nuestro producto. Ofrecemos marketing digital para mejorar tus ventas hoy..."
              value={rewriteText}
              onChange={(e) => setRewriteText(e.target.value)}
              rows={4}
              className="w-full text-xs p-3 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl focus:outline-hidden focus:border-emerald-500 text-slate-100 placeholder-slate-600 transition resize-y font-sans leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">
                Tono Objetivo (Style)
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as WritingTone)}
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-lg focus:outline-hidden focus:border-emerald-500 text-slate-300 font-medium cursor-pointer"
              >
                <option value="Persuasivo">Persuasivo (Neuromarketing)</option>
                <option value="Profesional">Profesional Corporativo</option>
                <option value="Casual">Casual y Cercano</option>
                <option value="Viral LinkedIn">Viral LinkedIn (Enganchador)</option>
                <option value="Técnico">Técnico Analítico</option>
                <option value="Directo y Caliente">Copywriting Directo</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">
                Instrucciones Extras
              </label>
              <input
                type="text"
                placeholder="Ej. más corto, añade emojis, viñetas..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-lg focus:outline-hidden focus:border-emerald-500 text-slate-200 placeholder-slate-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isRewriting || !rewriteText}
            className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-900 text-emerald-400 font-bold border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl text-xs active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            {isRewriting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                Reescribiendo con Gemini...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Transformar Frase / Tono
              </>
            )}
          </button>

          {/* Rewrite Results Box */}
          {rewrittenOutput && (
            <div className="bg-slate-950 rounded-xl border border-slate-900 p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  Resultado Mejorado
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(rewrittenOutput, setCopiedRewrite)}
                    className="p-1 px-2 rounded-md hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white text-[10px] font-bold flex items-center gap-1 transition"
                  >
                    {copiedRewrite ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-3 h-3" />
                        Copiar
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onInsertEditor(rewrittenOutput)}
                    className="p-1 px-2 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" /> Insertar
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap select-text">
                {rewrittenOutput}
              </p>
            </div>
          )}
        </form>
      ) : (
        /* Outline Planner Tool Panel */
        <form onSubmit={handleOutlineSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">
                Tema de Post o Artículo
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Cómo cultivar aguacates en interiores..."
                value={outlineTopic}
                onChange={(e) => setOutlineTopic(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-lg focus:outline-hidden focus:border-emerald-500 text-slate-100 placeholder-slate-600 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">
                  Palabra Clave Objetivo
                </label>
                <input
                  type="text"
                  placeholder="Ej. plantar aguacates"
                  value={outlineKeyword}
                  onChange={(e) => setOutlineKeyword(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-lg focus:outline-hidden focus:border-emerald-500 text-slate-200 placeholder-slate-600 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">
                  Audiencia Objetivo
                </label>
                <input
                  type="text"
                  placeholder="Ej. jardineros principiantes"
                  value={outlineAudience}
                  onChange={(e) => setOutlineAudience(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-lg focus:outline-hidden focus:border-emerald-500 text-slate-200 placeholder-slate-600 transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isGeneratingOutline || !outlineTopic}
            className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-900 text-emerald-400 font-bold border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl text-xs active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            {isGeneratingOutline ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                Estructurando Esquema...
              </>
            ) : (
              <>
                <BookOpen className="w-3.5 h-3.5" />
                Generar Esquema Estructurado
              </>
            )}
          </button>

          {/* Generated Outline Results Box */}
          {generatedOutline && (
            <div className="bg-slate-950 rounded-xl border border-slate-900 p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  Estructura SEO Generada
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generatedOutline, setCopiedOutline)}
                    className="p-1 px-2 rounded-md hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white text-[10px] font-bold flex items-center gap-1 transition"
                  >
                    {copiedOutline ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-3 h-3" />
                        Copiar
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onInsertEditor(generatedOutline)}
                    className="p-1 px-2 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" /> Insertar
                  </button>
                </div>
              </div>

              <div className="max-h-[350px] overflow-y-auto pr-1 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap select-text scrollbar-thin scrollbar-thumb-slate-900">
                {generatedOutline}
              </div>
            </div>
          )}
        </form>
      )}

      {/* Static Power Words Copywriting Helper tip box */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
        <p className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" /> Palabras de Poder Copywriting
        </p>
        <p className="text-[10px] text-slate-400 leading-relaxed leading-normal">
          Incrementa el CTR en cabeceras usando palabras de alto impacto emocional:
        </p>
        <div className="flex flex-wrap gap-1 pt-1">
          {["Probado", "Garantizado", "Secreto", "Instantáneo", "Científico", "Absoluto", "Exclusivo", "Único"].map((w, i) => (
            <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-900 border border-slate-850 rounded-sm text-slate-400">
              {w}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
