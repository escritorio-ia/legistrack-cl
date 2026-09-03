/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Landmark, Shield, Sparkles, ExternalLink, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/80 w-full py-8 px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
      <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2.5" id="footer-logo">
          <div className="w-7 h-7 bg-gradient-to-tr from-slate-950 to-blue-700 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-xs">
            E++
          </div>
          <span className="text-sm font-black text-slate-900 tracking-tight">
            Escritorio<span className="text-blue-600">++</span>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
        <a 
          className="hover:text-blue-600 transition-colors" 
          href="#" 
          onClick={(e) => { e.preventDefault(); alert("Contacto: soporte@legistrack.cl"); }}
          id="footer-link-privacy"
        >
          Privacidad
        </a>
        <a 
          className="hover:text-blue-600 transition-colors" 
          href="#" 
          onClick={(e) => { e.preventDefault(); alert("Términos de uso LegisTrack CL 2026"); }}
          id="footer-link-terms"
        >
          Términos
        </a>
        <a 
          className="hover:text-blue-600 transition-colors" 
          href="#" 
          onClick={(e) => { e.preventDefault(); alert("Contacto: contacto@legistrack.cl"); }}
          id="footer-link-contact"
        >
          Contacto
        </a>
        <a 
          className="hover:text-blue-600 font-bold transition-colors text-blue-600 flex items-center gap-1" 
          href="https://www.congreso.cl" 
          target="_blank" 
          rel="noopener noreferrer"
          id="footer-link-congreso"
        >
          <span>Portal Congreso</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </footer>
  );
}
