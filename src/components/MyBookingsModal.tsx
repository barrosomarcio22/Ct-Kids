import React, { useState } from 'react';
import { Agendamento } from '../types';
import { ClockIcon, CrownIcon, CheckCircleIcon, TrashIcon, PhoneIcon, TagIcon } from './Icons';
import { BadgeModal } from './BadgeModal';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  agendamentos: Agendamento[];
  onCancel: (id: string, criancaNome: string) => Promise<void>;
  isCancellingId: string | null;
  savedTelefone: string;
  dataSelecionada: string;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  onClose,
  agendamentos,
  onCancel,
  isCancellingId,
  savedTelefone,
  dataSelecionada,
}) => {
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Agendamento | null>(null);

  if (!isOpen) return null;

  const digitsSaved = savedTelefone.replace(/\D/g, '');

  // Filtra agendamentos do cliente pelo telefone salvo (se houver) ou mostra aviso
  const meusAgendamentos = agendamentos.filter((a) => {
    if (!digitsSaved) return false;
    const itemDigits = a.responsavelTelefone.replace(/\D/g, '');
    return itemDigits === digitsSaved;
  });

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-[#14141b] border border-zinc-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
          {/* Cabeçalho */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-[#181824]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-900/60 border border-red-700 flex items-center justify-center text-red-300">
                <CrownIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-white text-base">
                  Meus Agendamentos
                </h3>
                <p className="text-xs text-zinc-400">
                  Data: {dataSelecionada}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Conteúdo */}
          <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
            {!savedTelefone ? (
              <div className="text-center py-8 text-zinc-400 text-sm">
                <p>Nenhum agendamento recente encontrado neste aparelho.</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Ao agendar uma vaga, o número fica salvo para consulta rápida.
                </p>
              </div>
            ) : meusAgendamentos.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 text-sm">
                <p>Nenhum agendamento ativo para a data selecionada ({dataSelecionada}).</p>
                <p className="text-xs text-zinc-500 mt-1 flex items-center justify-center gap-1">
                  <PhoneIcon className="w-3.5 h-3.5" /> Telefone registrado: {savedTelefone}
                </p>
              </div>
            ) : (
              meusAgendamentos.map((item) => {
                const isPresente = item.status === 'presente';
                const isCancelling = isCancellingId === item.id;
                const isConfirmingThis = confirmCancelId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition ${
                      isPresente
                        ? 'bg-emerald-950/30 border-emerald-800/80'
                        : 'bg-zinc-900/90 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {item.criancaNome}
                          </span>
                          <span className="text-[11px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md">
                            {item.criancaIdade} {item.criancaIdade === 1 ? 'ano' : 'anos'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-red-400 font-semibold mt-1">
                          <ClockIcon className="w-3.5 h-3.5" />
                          <span>{item.horario}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Botão para ver e imprimir crachá */}
                        <button
                          type="button"
                          onClick={() => setSelectedBadge(item)}
                          className="text-[11px] text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded-lg border border-zinc-700 flex items-center gap-1 transition cursor-pointer font-semibold"
                          title="Ver e Imprimir Crachá da Criança"
                        >
                          <TagIcon className="w-3 h-3 text-red-400" />
                          <span>Crachá</span>
                        </button>

                        {isPresente ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-900/70 border border-emerald-600 text-emerald-300">
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            <span>No Espaço</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-zinc-800 text-zinc-300">
                            <span>Vaga Garantida</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {item.observacoes && (
                      <div className="text-[11px] text-zinc-400 bg-zinc-950/70 p-2 rounded-lg mb-2">
                        <span className="text-zinc-500 font-semibold">Obs:</span> {item.observacoes}
                      </div>
                    )}

                    {/* Ação de Cancelamento pelo próprio cliente */}
                    {!isPresente && (
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-zinc-500">
                          Não vai conseguir ir? Libere a vaga.
                        </span>

                        {isConfirmingThis ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isCancelling}
                              onClick={async () => {
                                await onCancel(item.id, item.criancaNome);
                                setConfirmCancelId(null);
                              }}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-700 hover:bg-red-600 text-white transition cursor-pointer"
                            >
                              {isCancelling ? 'Liberando...' : 'Confirmar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmCancelId(null)}
                              className="px-2 py-1 text-xs rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                            >
                              Voltar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmCancelId(item.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-300 transition cursor-pointer"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                            <span>Liberar vaga</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Rodapé */}
          <div className="p-4 bg-[#181824] border-t border-zinc-800 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {/* Modal do Crachá quando acionado pelo cliente */}
      <BadgeModal
        agendamento={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </>
  );
};
