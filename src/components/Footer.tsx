/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Building2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 w-full py-8 px-6 flex flex-col md:flex-row justify-between items-center gap-4 mt-auto">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <span className="text-base font-semibold text-slate-900 flex items-center gap-2" id="footer-logo">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-[10px]">L</div>
          <span>LegisTrack CL</span>
        </span>
        <div className="hidden md:block h-6 w-px bg-slate-200"></div>
        <p className="text-xs text-slate-500">
          © 2026 LegisTrack CL | Transparencia • Seguimiento • Mejores leyes para Chile
        </p>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
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
          onClick={(e) => { e.preventDefault(); alert("Terminos de uso LegisTrack CL 2026"); }}
          id="footer-link-terms"
        >
          Términos de uso
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
          className="hover:text-blue-600 font-semibold transition-colors text-blue-600" 
          href="https://www.congreso.cl" 
          target="_blank" 
          rel="noopener noreferrer"
          id="footer-link-congreso"
        >
          Congreso Nacional
        </a>
      </div>
    </footer>
  );
}
