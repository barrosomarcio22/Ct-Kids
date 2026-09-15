import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { CrownIcon, DownloadIcon, PrinterIcon, QrCodeIcon } from './Icons';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose }) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  // URL atual da aplicação
  const appUrl =
    typeof window !== 'undefined'
      ? window.location.href.split('#')[0].split('?')[0]
      : 'https://ais-pre-7ojmpsksxykgweo67vio73-261095963946.us-west2.run.app';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(appUrl, {
        width: 800,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      })
        .then((url) => setDataUrl(url))
        .catch((err) => console.error('Erro ao gerar QR Code:', err));
    }
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (!dataUrl) return;

    // Método 1: Tenta imprimir via iframe oculto (imune ao bloqueador de popup do navegador)
    try {
      const existingFrame = document.getElementById('qrcode-print-frame');
      if (existingFrame) {
        existingFrame.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'qrcode-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
          <head>
            <meta charset="utf-8" />
            <title>Placa QR Code - Espaço IRON KIDS CT Iron Kings</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 15mm;
              }
              * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              }
              body {
                background: #ffffff;
                color: #000000;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 20px;
              }
              .placa-container {
                border: 4px solid #b91c1c;
                border-radius: 24px;
                padding: 40px 30px;
                max-width: 520px;
                width: 100%;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
              }
              .logo-coroa {
                font-size: 32px;
                line-height: 1;
                margin-bottom: 6px;
              }
              .ct-nome {
                font-size: 14px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 3px;
                color: #b91c1c;
              }
              .titulo {
                font-size: 28px;
                font-weight: 900;
                color: #000000;
                margin-top: 4px;
                letter-spacing: -0.5px;
              }
              .subtitulo {
                font-size: 14px;
                color: #555555;
                margin-top: 6px;
                margin-bottom: 24px;
              }
              .qr-box {
                background: #ffffff;
                border: 3px solid #000000;
                border-radius: 16px;
                padding: 16px;
                display: inline-block;
                margin-bottom: 16px;
              }
              .qr-img {
                width: 260px;
                height: 260px;
                display: block;
              }
              .tag-rapido {
                display: inline-block;
                background: #f3f4f6;
                border: 1px solid #d1d5db;
                padding: 6px 16px;
                border-radius: 9999px;
                font-size: 12px;
                font-weight: 700;
                color: #111827;
                margin-bottom: 24px;
              }
              .passos {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 16px;
                padding: 16px 20px;
                text-align: left;
                font-size: 13px;
              }
              .passo-item {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 10px;
                font-weight: 600;
                color: #1f2937;
              }
              .passo-item:last-child {
                margin-bottom: 0;
              }
              .passo-num {
                background: #b91c1c;
                color: #ffffff;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 900;
                flex-shrink: 0;
              }
              .link-texto {
                margin-top: 18px;
                font-size: 10px;
                color: #6b7280;
                word-break: break-all;
              }
            </style>
          </head>
          <body>
            <div class="placa-container">
              <div class="logo-coroa">👑</div>
              <div class="ct-nome">CT IRON KINGS</div>
              <div class="titulo">ESPAÇO IRON KIDS</div>
              <div class="subtitulo">Aponte a câmera do seu celular para agendar a vaga do seu filho</div>
              
              <div class="qr-box">
                <img class="qr-img" src="${dataUrl}" alt="QR Code IRON KIDS" />
              </div>
              
              <div>
                <span class="tag-rapido">✨ Sem senhas • Rápido em 15 segundos</span>
              </div>
              
              <div class="passos">
                <div class="passo-item">
                  <span class="passo-num">1</span>
                  <span>Abra a câmera do seu smartphone</span>
                </div>
                <div class="passo-item">
                  <span class="passo-num">2</span>
                  <span>Toque no link que surgir na tela</span>
                </div>
                <div class="passo-item">
                  <span class="passo-num">3</span>
                  <span>Escolha o horário do treino e confirme!</span>
                </div>
              </div>

              <div class="link-texto">
                ${appUrl}
                <div style="font-size: 11px; color: #71717A; margin-top: 6px; font-weight: bold;">
                  WhatsApp Recepção: (21) 97263-7144
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(htmlContent);
        frameDoc.close();

        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        }, 250);
        return;
      }
    } catch {
      // Fallback
    }

    // Fallback: window.print() direto
    window.print();
  };

  const handleDownloadImage = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'qrcode_mini_kings_ct_iron.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in text-left print-modal-overlay">
      <div className="w-full max-w-md bg-[#161622] border border-zinc-700/90 rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[95vh] overflow-y-auto print-modal-box">
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-sm p-1 cursor-pointer no-print"
        >
          ✕
        </button>

        {/* ÁREA IMPRIMÍVEL DO DISPLAY DE BALCÃO / PLACA */}
        <div ref={printableRef} className="print-area">
          {/* Topo / Brasão CT Iron Kings */}
          <div className="text-center pb-4 border-b border-zinc-800">
            <div className="flex justify-center mb-2">
              <img
                src="/logo.svg"
                alt="IRON KIDS"
                className="w-16 h-16 object-contain filter drop-shadow-[0_2px_8px_rgba(215,25,33,0.35)]"
              />
            </div>
            <h3 className="font-display font-black text-xs uppercase tracking-widest text-red-500">
              CT Iron Kings
            </h3>
            <h2 className="font-display font-black text-2xl text-white tracking-tight">
              ESPAÇO IRON KIDS
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Aponte a câmera do celular para agendar o treino do seu filho
            </p>
          </div>

          {/* QR Code em Moldura Nobre */}
          <div className="my-5 flex flex-col items-center justify-center">
            <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-red-700 inline-block">
              {dataUrl ? (
                <img
                  src={dataUrl}
                  alt="QR Code Espaço IRON KIDS"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg block"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-zinc-500">
                  <span className="text-xs animate-pulse font-semibold">Gerando QR Code...</span>
                </div>
              )}
            </div>

            <div className="mt-3 text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 font-bold text-[11px]">
                ✨ Sem senhas • Rápido em 15 segundos
              </span>
            </div>
          </div>

          {/* Instruções para os Pais */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 text-xs space-y-1.5 text-zinc-300">
            <div className="flex items-center gap-2 font-bold text-zinc-200">
              <span className="w-5 h-5 rounded-full bg-red-900/80 text-red-200 flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Abra a câmera do seu smartphone</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-zinc-200">
              <span className="w-5 h-5 rounded-full bg-red-900/80 text-red-200 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Toque no link que surgir na tela</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-zinc-200">
              <span className="w-5 h-5 rounded-full bg-red-900/80 text-red-200 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Escolha o horário do treino e confirme!</span>
            </div>
          </div>

          {/* Link direto impresso */}
          <div className="mt-3 text-center">
            <p className="text-[10px] text-zinc-500 break-all">
              {appUrl}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              WhatsApp Recepção: <strong className="text-emerald-400 font-semibold">(21) 97263-7144</strong>
            </p>
          </div>
        </div>

        {/* BOTÕES DE AÇÃO (OCULTOS NA IMPRESSÃO) */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col gap-2.5 no-print">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl bg-red-700 hover:bg-red-600 active:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-red-950/40"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>Imprimir Plaquinha</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-zinc-700"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>Baixar Imagem</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-2 px-3 rounded-xl bg-[#1f1f2e] hover:bg-[#27273a] text-zinc-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-zinc-700/60"
          >
            <QrCodeIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span>{copied ? '✓ Link Copiado com Sucesso!' : 'Copiar Link Direto para WhatsApp'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
