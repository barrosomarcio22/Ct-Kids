import React, { useState } from 'react';
import { Agendamento } from '../types';
import { CrownIcon, PrinterIcon, PhoneIcon, UserIcon, CheckIcon } from './Icons';

interface BadgeModalProps {
  agendamento: Agendamento | null;
  onClose: () => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({ agendamento, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!agendamento) return null;

  const horaCheckIn = agendamento.checkInEm
    ? new Date(agendamento.checkInEm).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const handlePrint = () => {
    // 1. Tenta criar um iframe oculto na mesma página para impressão instantânea (à prova de bloqueio de popup!)
    try {
      const existingFrame = document.getElementById('badge-print-frame');
      if (existingFrame) {
        existingFrame.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'badge-print-frame';
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
            <title>Crachá - ${agendamento.criancaNome} - CT Iron Kings</title>
            <style>
              @page {
                size: auto;
                margin: 6mm;
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
                justify-content: center;
                align-items: center;
                padding: 10px;
              }
              .cracha {
                width: 290px;
                border: 3px solid #b91c1c;
                border-radius: 18px;
                padding: 20px 16px;
                text-align: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.08);
              }
              .coroa {
                font-size: 26px;
                line-height: 1;
                margin-bottom: 2px;
              }
              .ct {
                font-size: 11px;
                font-weight: 900;
                letter-spacing: 2px;
                color: #b91c1c;
              }
              .titulo {
                font-size: 17px;
                font-weight: 900;
                color: #000000;
                letter-spacing: -0.5px;
              }
              .sub {
                font-size: 9px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #555555;
                border-bottom: 1.5px solid #e5e7eb;
                padding-bottom: 8px;
                margin-bottom: 12px;
              }
              .box-crianca {
                background: #f4f4f5;
                border: 1px solid #d4d4d8;
                border-radius: 12px;
                padding: 12px 10px;
                margin-bottom: 12px;
              }
              .label-mini-king {
                font-size: 9px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #6b7280;
                margin-bottom: 2px;
              }
              .nome-crianca {
                font-size: 21px;
                font-weight: 900;
                color: #000000;
                line-height: 1.1;
                text-transform: uppercase;
              }
              .idade {
                display: inline-block;
                background: #b91c1c;
                color: #ffffff;
                font-size: 11px;
                font-weight: 800;
                padding: 2px 10px;
                border-radius: 9999px;
                margin-top: 6px;
              }
              .info-list {
                border-top: 1px solid #f3f4f6;
                padding-top: 6px;
                margin-bottom: 8px;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 11px;
                padding: 5px 0;
                border-bottom: 1px dashed #e5e7eb;
                text-align: left;
              }
              .info-label {
                color: #4b5563;
                font-weight: 600;
              }
              .info-val {
                font-weight: 800;
                color: #111827;
              }
              .obs-box {
                margin-top: 8px;
                padding: 6px 8px;
                border-radius: 8px;
                background: #fffbeb;
                border: 1px solid #fde68a;
                font-size: 10px;
                text-align: left;
                color: #92400e;
              }
              .rodape-tag {
                margin-top: 10px;
                font-size: 8px;
                color: #9ca3af;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
            </style>
          </head>
          <body>
            <div class="cracha">
              <div class="coroa">👑</div>
              <div class="ct">CT IRON KINGS</div>
              <div class="titulo">ESPAÇO IRON KIDS</div>
              <div class="sub">Crachá de Identificação do Atleta</div>
              
              <div class="box-crianca">
                <div class="label-mini-king">Iron Kid</div>
                <div class="nome-crianca">${agendamento.criancaNome}</div>
                <div class="idade">${agendamento.criancaIdade} ${agendamento.criancaIdade === 1 ? 'ano' : 'anos'}</div>
              </div>

              <div class="info-list">
                <div class="info-row">
                  <span class="info-label">Responsável:</span>
                  <span class="info-val">${agendamento.responsavelNome}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">WhatsApp:</span>
                  <span class="info-val">${agendamento.responsavelTelefone}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Horário Treino:</span>
                  <span class="info-val">${agendamento.horario}</span>
                </div>
                ${
                  horaCheckIn
                    ? `<div class="info-row"><span class="info-label">Entrada / Check-in:</span><span class="info-val">${horaCheckIn}</span></div>`
                    : ''
                }
              </div>

              ${
                agendamento.observacoes
                  ? `<div class="obs-box"><strong>Atenção/Cuidados:</strong> ${agendamento.observacoes}</div>`
                  : ''
              }

              <div class="rodape-tag">Segurança & Cuidado CT Iron Kings</div>
            </div>
          </body>
        </html>
      `;

      const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(htmlContent);
        frameDoc.close();

        // Dispara a impressão direto pelo iframe sem depender de popup
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        }, 250);
        return;
      }
    } catch (err) {
      console.warn('Iframe print falhou, tentando popup/window.print', err);
    }

    // 2. Método de fallback: janela/popup
    try {
      const printWindow = window.open('', '_blank', 'width=450,height=650');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <body style="font-family:sans-serif; text-align:center; padding:20px;">
              <h2>👑 CT IRON KINGS - ESPAÇO IRON KIDS</h2>
              <hr/>
              <h1 style="font-size:26px; margin:15px 0;">${agendamento.criancaNome}</h1>
              <p><strong>Idade:</strong> ${agendamento.criancaIdade} anos</p>
              <p><strong>Responsável:</strong> ${agendamento.responsavelNome}</p>
              <p><strong>Telefone:</strong> ${agendamento.responsavelTelefone}</p>
              <p><strong>Horário:</strong> ${agendamento.horario}</p>
              ${agendamento.observacoes ? `<p style="color:#b91c1c;"><strong>Obs:</strong> ${agendamento.observacoes}</p>` : ''}
              <script>window.onload=function(){window.print();}</script>
            </body>
          </html>
        `);
        printWindow.document.close();
        return;
      }
    } catch {
      // Falha silenciosa
    }

    // 3. Fallback final
    window.print();
  };

  const handleCopySummary = async () => {
    const text = `👑 CRACHÁ IRON KIDS - CT IRON KINGS\nCriança: ${agendamento.criancaNome} (${agendamento.criancaIdade} anos)\nResponsável: ${agendamento.responsavelNome} (${agendamento.responsavelTelefone})\nHorário: ${agendamento.horario}\nEntrada: ${horaCheckIn || 'Aguardando'}${agendamento.observacoes ? `\nCuidados: ${agendamento.observacoes}` : ''}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in print-modal-overlay">
      <div className="w-full max-w-sm bg-[#15151e] border border-zinc-700/90 rounded-3xl p-6 shadow-2xl relative text-left print-modal-box">
        {/* Botão fechar (oculto na impressão) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-sm p-1 cursor-pointer no-print"
        >
          ✕
        </button>

        {/* Topo do Crachá */}
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
          <h2 className="font-display font-black text-xl text-white tracking-tight">
            ESPAÇO IRON KIDS
          </h2>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase">
            Crachá de Identificação do Atleta
          </p>
        </div>

        {/* Dados da Criança */}
        <div className="my-5 text-center bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block mb-1">
            Iron Kid
          </span>
          <h1 className="font-display font-black text-2xl text-white tracking-tight leading-tight">
            {agendamento.criancaNome}
          </h1>
          <div className="mt-1 inline-block px-3 py-0.5 rounded-full bg-red-900/60 border border-red-700 text-red-200 text-xs font-bold">
            {agendamento.criancaIdade} {agendamento.criancaIdade === 1 ? 'ano' : 'anos'}
          </div>
        </div>

        {/* Informações de Segurança e Contato */}
        <div className="space-y-2 text-xs text-zinc-300 border-t border-zinc-800/80 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5" />
              Responsável:
            </span>
            <span className="font-bold text-white">
              {agendamento.responsavelNome}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-500 flex items-center gap-1">
              <PhoneIcon className="w-3.5 h-3.5" />
              WhatsApp:
            </span>
            <span className="font-bold text-emerald-400">
              {agendamento.responsavelTelefone}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Horário Treino:</span>
            <span className="font-bold text-zinc-200">
              {agendamento.horario}
            </span>
          </div>

          {horaCheckIn && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Entrada:</span>
              <span className="font-bold text-emerald-400">
                {horaCheckIn}
              </span>
            </div>
          )}

          {agendamento.observacoes && (
            <div className="mt-2 p-2 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-[11px]">
              <span className="font-bold block text-amber-400 uppercase text-[9px]">
                Atenção / Cuidados:
              </span>
              {agendamento.observacoes}
            </div>
          )}
        </div>

        {/* Rodapé e Ações */}
        <div className="mt-6 flex flex-col gap-2 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-2.5 px-4 rounded-xl bg-red-700 hover:bg-red-600 active:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-red-950/50"
          >
            <PrinterIcon className="w-4 h-4" />
            <span>Imprimir Crachá / Etiqueta</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="w-full py-2 px-4 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border border-zinc-700/60"
          >
            {copied ? (
              <>
                <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copiado para colar no WhatsApp!</span>
              </>
            ) : (
              <span>Copiar Dados do Crachá</span>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-1.5 px-4 text-zinc-400 hover:text-white text-xs transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
