import React from 'react';
import { Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { SAMPLE_IMAGES, SampleImage } from '../data/sampleImages';

interface SamplePickerBarProps {
  currentImageId: string | null;
  onSelectSample: (sample: SampleImage) => void;
  onUploadClick: () => void;
}

export const SamplePickerBar: React.FC<SamplePickerBarProps> = ({
  currentImageId,
  onSelectSample,
  onUploadClick,
}) => {
  return (
    <div className="h-14 border-t border-neutral-800 bg-neutral-900/90 backdrop-blur-md px-4 flex items-center justify-between z-20 select-none">
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
        <span className="hidden sm:inline font-medium">Fotos de Demonstração:</span>
      </div>

      {/* Thumbnails row */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        {SAMPLE_IMAGES.map((sample) => {
          const isSelected = currentImageId === sample.id;
          return (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
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

        <div className="h-4 w-px bg-neutral-800 mx-1 hidden sm:block" />

        <button
          onClick={onUploadClick}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 hover:border-neutral-600 transition-colors whitespace-nowrap"
        >
          <Upload className="w-3.5 h-3.5 text-indigo-400" />
          <span>Carregar Minha Foto</span>
        </button>
      </div>

      <div className="hidden lg:flex items-center gap-1 text-[11px] text-neutral-500 font-mono">
        <span>Arraste ou cole (Ctrl+V)</span>
      </div>
    </div>
  );
};
