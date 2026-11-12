/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


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
    </footer>
  );
}
