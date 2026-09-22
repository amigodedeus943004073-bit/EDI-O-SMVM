import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  QrCode,
  Download,
  Sparkles,
  ExternalLink,
  Smartphone,
  Image as ImageIcon,
} from 'lucide-react';
import QRCode from 'qrcode';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  documentName: string;
  imageElementRef: React.RefObject<HTMLImageElement | null>;
  is4kEnabled?: boolean;
  onDownloadClick?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  documentName,
  imageElementRef,
  is4kEnabled = true,
  onDownloadClick,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showQr, setShowQr] = useState<boolean>(false);
  const [isSharingNative, setIsSharingNative] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://smvm.ia';
  const shareTitle = `${documentName} - Editado com SMVM IA`;
  const shareText = `Confira esta foto que editei com inteligência artificial em qualidade ${
    is4kEnabled ? '4K Ultra-HD' : 'alta resolução'
  } na plataforma SMVM IA!`;

  // Generate QR Code for sharing on mobile devices
  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(
        shareUrl,
        {
          width: 240,
          margin: 1.5,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (err, url) => {
          if (!err && url) {
            setQrCodeDataUrl(url);
          }
        }
      );
    }
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  // 1. Copy Link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setShareFeedback('Link copiado para a área de transferência!');
      setTimeout(() => {
        setCopiedLink(false);
        setShareFeedback(null);
      }, 3000);
    } catch {
      setShareFeedback('Não foi possível copiar o link.');
    }
  };

  // 2. Copy Image directly to clipboard (Ctrl+V into WhatsApp, Telegram, etc.)
  const handleCopyImage = async () => {
    try {
      if (!imageElementRef.current) return;
      const img = imageElementRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 1200;
      canvas.height = img.naturalHeight || 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const item = new (window as any).ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          setCopiedImage(true);
          setShareFeedback('Imagem copiada! Cole com Ctrl+V no WhatsApp, Telegram ou Photoshop.');
          setTimeout(() => {
            setCopiedImage(false);
            setShareFeedback(null);
          }, 3500);
        } catch {
          setShareFeedback('Seu navegador não suporta copiar imagem diretamente. Use o download ou link.');
        }
      }, 'image/png');
    } catch {
      setShareFeedback('Erro ao copiar imagem.');
    }
  };

  // 3. Web Share API (Native device sheet)
  const handleNativeShare = async () => {
    if (navigator.share) {
      setIsSharingNative(true);
      try {
        let fileToShare: File | null = null;
        if (imageElementRef.current) {
          const img = imageElementRef.current;
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 1200;
          canvas.height = img.naturalHeight || 800;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
            if (blob) {
              fileToShare = new File([blob], `${documentName || 'foto-smvm'}.jpg`, { type: 'image/jpeg' });
            }
          }
        }

        const shareData: ShareData = {
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        };

        if (fileToShare && navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
          shareData.files = [fileToShare];
        }

        await navigator.share(shareData);
        setShareFeedback('Compartilhado com sucesso!');
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          console.warn('Erro ao compartilhar:', err);
        }
      } finally {
        setIsSharingNative(false);
      }
    } else {
      setShowQr(true);
    }
  };

  // 4. Social Direct Links
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;

  const naturalW = imageElementRef.current?.naturalWidth || 3840;
  const naturalH = imageElementRef.current?.naturalHeight || 2160;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Compartilhar Imagem</span>
                {is4kEnabled && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    4K UHD
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-400">
                Compartilhe nas redes sociais, copie para a área de transferência ou envie para o celular
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert if available */}
        {shareFeedback && (
          <div className="px-4 py-2 bg-emerald-950/70 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{shareFeedback}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800">
          {/* Image Mini Preview Card */}
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
              <img
                src={imageSrc}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{documentName || 'Minha Foto SMVM'}</h4>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400 font-mono">
                <span>{naturalW} &times; {naturalH} px</span>
                <span className="text-neutral-600">•</span>
                <span className="text-amber-400 font-semibold">{((naturalW * naturalH) / 1000000).toFixed(1)} MP</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-0.5 truncate">
                Edição profissional com Inteligência Artificial SMVM
              </p>
            </div>
          </div>

          {/* Primary Action: Native Device Share (WhatsApp, Instagram, AirDrop) */}
          <div className="space-y-2">
            <button
              onClick={handleNativeShare}
              disabled={isSharingNative}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-98"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span>
                {isSharingNative ? 'Abrindo Compartilhamento...' : 'Compartilhar no Celular / WhatsApp / Redes'}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              {/* Copy Image (Ctrl+V friendly) */}
              <button
                type="button"
                onClick={handleCopyImage}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  copiedImage
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-200 hover:border-neutral-700 hover:bg-neutral-800'
                }`}
              >
                {copiedImage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ImageIcon className="w-3.5 h-3.5 text-blue-400" />}
                <span>{copiedImage ? 'Imagem Copiada!' : 'Copiar Imagem (Ctrl+V)'}</span>
              </button>

              {/* Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  copiedLink
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-200 hover:border-neutral-700 hover:bg-neutral-800'
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link do App'}</span>
              </button>
            </div>
          </div>

          {/* Social Media 1-Click Sharing */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Compartilhar Direto:
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-950/50 text-emerald-400 flex flex-col items-center justify-center gap-1 transition-all group"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold text-emerald-300">WhatsApp</span>
              </a>

              {/* Telegram */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-sky-950/30 border border-sky-500/30 hover:border-sky-500 hover:bg-sky-950/50 text-sky-400 flex flex-col items-center justify-center gap-1 transition-all group"
              >
                <Send className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold text-sky-300">Telegram</span>
              </a>

              {/* Twitter / X */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800 text-white flex flex-col items-center justify-center gap-1 transition-all group"
              >
                <Twitter className="w-4 h-4 text-neutral-200 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold text-neutral-300">X (Twitter)</span>
              </a>

              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/30 hover:border-blue-500 hover:bg-blue-950/50 text-blue-400 flex flex-col items-center justify-center gap-1 transition-all group"
              >
                <Facebook className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold text-blue-300">Facebook</span>
              </a>

              {/* LinkedIn */}
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-950/50 text-indigo-400 flex flex-col items-center justify-center gap-1 transition-all group"
              >
                <Linkedin className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold text-indigo-300">LinkedIn</span>
              </a>

              {/* Email */}
              <a
                href={emailUrl}
                className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800 text-neutral-300 flex flex-col items-center justify-center gap-1 transition-all group"
              >
                <Mail className="w-4 h-4 text-neutral-300 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold text-neutral-300">E-mail</span>
              </a>
            </div>
          </div>

          {/* QR Code Section for Smartphone scanning */}
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-white">Abrir e Baixar no Smartphone</span>
              </div>
              <button
                type="button"
                onClick={() => setShowQr((prev) => !prev)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{showQr ? 'Ocultar QR' : 'Mostrar QR Code'}</span>
              </button>
            </div>

            {showQr && qrCodeDataUrl && (
              <div className="p-3 bg-white rounded-xl flex flex-col items-center justify-center gap-2 mt-2">
                <img src={qrCodeDataUrl} alt="QR Code" className="w-40 h-40 object-contain rounded" />
                <span className="text-[10px] text-neutral-800 font-bold text-center">
                  Aponte a câmera do seu celular para abrir o editor e foto
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <span className="text-[11px] text-neutral-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            100% Gratuito & Ilimitado
          </span>
          <div className="flex items-center gap-2">
            {onDownloadClick && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDownloadClick();
                }}
                className="py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Imagem</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
