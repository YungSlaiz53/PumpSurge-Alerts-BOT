/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  FileCode, 
  FileText, 
  Package, 
  Download, 
  FolderTree, 
  CheckCircle2 
} from 'lucide-react';
import { CODE_FILES, CodeFile } from '../data/codeFiles';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(CODE_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name.split('/').pop() || 'file.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.ts') || name.endsWith('.js')) {
      return <FileCode className="w-4 h-4 text-emerald-400" />;
    }
    if (name.endsWith('.json')) {
      return <Package className="w-4 h-4 text-amber-400" />;
    }
    return <FileText className="w-4 h-4 text-cyan-400" />;
  };

  const lines = selectedFile.content.split('\n');

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Code2 className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-zinc-100">Production Codebase Explorer</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Browse and copy the modular, production-tested files for local testing or immediate deployment on your Linux VPS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-950"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard!' : `Copy ${selectedFile.name}`}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            title="Download File"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: File Tree + Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: File Tree */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 lg:col-span-1 space-y-2">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2 py-1 flex items-center gap-2">
            <FolderTree className="w-3.5 h-3.5 text-zinc-500" />
            <span>Repository Files</span>
          </div>

          <div className="space-y-1">
            {CODE_FILES.map((file) => {
              const isSelected = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono flex items-center gap-2.5 transition ${
                    isSelected
                      ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  {getFileIcon(file.name)}
                  <span className="truncate">{file.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="bg-[#0b0d13] border border-zinc-800 rounded-2xl overflow-hidden lg:col-span-3 flex flex-col shadow-2xl">
          {/* File Tab Header */}
          <div className="px-4 py-3 bg-[#121620] border-b border-zinc-800/90 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono text-xs">
              {getFileIcon(selectedFile.name)}
              <span className="text-zinc-100 font-bold">{selectedFile.path}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400 text-[11px]">{lines.length} lines</span>
            </div>

            <span className="text-xs text-zinc-400 italic">
              {selectedFile.description}
            </span>
          </div>

          {/* Code Text with line numbers */}
          <div className="p-4 overflow-x-auto max-h-[650px] font-mono text-xs text-zinc-300 leading-relaxed bg-[#090b10]">
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/20 group">
                    <td className="w-10 pr-4 text-right text-zinc-600 select-none text-[11px] group-hover:text-zinc-400">
                      {idx + 1}
                    </td>
                    <td className="pl-2 whitespace-pre text-zinc-200">
                      {line}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
