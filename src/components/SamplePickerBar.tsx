import React from 'react';
import { Upload, Sparkles, Image as ImageIcon, Layers, FileImage } from 'lucide-react';
import { SAMPLE_IMAGES, SampleImage } from '../data/sampleImages';

interface SamplePickerBarProps {
  currentImageId: string | null;
  onSelectSample: (sample: SampleImage) => void;
  onUploadClick: () => void;
  onOpenBatchCleaner?: () => void;
  onUploadCustomLogo?: (dataUrl: string, fileName: string) => void;
}

export const SamplePickerBar: React.FC<SamplePickerBarProps> = ({
  currentImageId,
  onSelectSample,
  onUploadClick,
  onOpenBatchCleaner,
  onUploadCustomLogo,
}) => {
  return (
    <div className="smvm-samplebar h-14 border-t border-neutral-800 bg-neutral-900/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-20 select-none overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-2 text-xs text-neutral-400 shrink-0">
        <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
        <span className="hidden md:inline font-medium">Fotos de Demonstração & Referências:</span>
      </div>

      {/* Thumbnails row */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none mx-2">
        {SAMPLE_IMAGES.map((sample) => {
          const isSelected = currentImageId === sample.id;
          return (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all shrink-0 ${
                isSelected
                  ? 'border-indigo-500 bg-neutral-800 text-white shadow-sm ring-1 ring-indigo-500'
                  : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <img
                src={sample.thumb}
                alt={sample.title}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded object-cover"
              />
              <span className="whitespace-nowrap">{sample.title}</span>
            </button>
          );
        })}

        {/* Upload Custom Logo Button directly on the reference bar */}
        {onUploadCustomLogo && (
          <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 text-xs font-semibold border border-blue-500/40 hover:border-blue-400 transition-colors whitespace-nowrap cursor-pointer shrink-0">
            <FileImage className="w-3.5 h-3.5 text-blue-400" />
            <span>Inserir Meu Logo</span>
            <input
              type="file"
              accept="image/png,image/svg+xml,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                  const url = evt.target?.result as string;
                  if (url) onUploadCustomLogo(url, file.name);
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
        )}

        {/* Bulk Clean Up Quick Trigger */}
        {onOpenBatchCleaner && (
          <button
            type="button"
            onClick={onOpenBatchCleaner}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-950/40 hover:bg-pink-900/50 text-pink-300 text-xs font-semibold border border-pink-500/40 hover:border-pink-400 transition-colors whitespace-nowrap shrink-0"
          >
            <Layers className="w-3.5 h-3.5 text-pink-400" />
            <span>Limpeza em Massa (10)</span>
          </button>
        )}

        <div className="h-4 w-px bg-neutral-800 mx-1 hidden sm:block shrink-0" />

        <button
          onClick={onUploadClick}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 hover:border-neutral-600 transition-colors whitespace-nowrap shrink-0"
        >
          <Upload className="w-3.5 h-3.5 text-indigo-400" />
          <span>Carregar Foto</span>
        </button>
      </div>

      <div className="hidden xl:flex items-center gap-1 text-[11px] text-neutral-500 font-mono shrink-0">
        <span>Arraste ou cole (Ctrl+V)</span>
      </div>
    </div>
  );
};
