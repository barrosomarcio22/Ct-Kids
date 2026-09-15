import React, { useState, useEffect, useMemo } from 'react';
import { Agendamento, CapacidadeSlot, FirebaseConnectionStatus } from './types';
import {
  HORARIOS_CT,
  CAPACIDADE_PADRAO_POR_HORARIO,
  getHojeLocalString,
  getLinkWhatsAppSuporte,
  WHATSAPP_RECEPCAO_FORMATADO,
} from './constants';
import {
  subscribeAgendamentos,
  salvarAgendamento,
  cancelarAgendamento,
  atualizarStatusCheckIn,
  getFirebaseStatus,
} from './firebase';
import { Header } from './components/Header';
import { BookingForm } from './components/BookingForm';
import { CapacityOverview } from './components/CapacityOverview';
import { BookingsList } from './components/BookingsList';
import { VercelGuideModal } from './components/VercelGuideModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { StaffAuthModal } from './components/StaffAuthModal';
import { QrCodeModal } from './components/QrCodeModal';
import { WhatsAppSupportButton } from './components/WhatsAppSupportButton';
import { CheckCircleIcon } from './components/Icons';

export default function App() {
  const [dataSelecionada, setDataSelecionada] = useState<string>(getHojeLocalString());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string>(HORARIOS_CT[1].label); // 07:00 - 08:00
  const [capacidadeMaxima, setCapacidadeMaxima] = useState<number>(CAPACIDADE_PADRAO_POR_HORARIO);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isUpdatingStatusId, setIsUpdatingStatusId] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showMyBookings, setShowMyBookings] = useState<boolean>(false);
  const [showStaffAuth, setShowStaffAuth] = useState<boolean>(false);
  const [showQrCodeModal, setShowQrCodeModal] = useState<boolean>(false);
  const [savedTelefone, setSavedTelefone] = useState<string>('');
  const [status, setStatus] = useState<FirebaseConnectionStatus>(getFirebaseStatus());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'agendar' | 'portaria'>('agendar');

  // Recupera telefone salvo do cliente no localStorage
  useEffect(() => {
    try {
      const fone = localStorage.getItem('iron_kids_responsavel_fone') || localStorage.getItem('mini_kings_responsavel_fone');
      if (fone) setSavedTelefone(fone);
    } catch {
      // Ignora
    }
  }, []);

  // Total de crianças presentes no espaço agora
  const totalPresentesDia = useMemo(
    () => agendamentos.filter((a) => a.status === 'presente').length,
    [agendamentos]
  );

  // Verifica se o responsável atual já possui agendamentos hoje
  const temMeusAgendamentosHoje = useMemo(() => {
    if (!savedTelefone) return false;
    const digitsSaved = savedTelefone.replace(/\D/g, '');
    if (!digitsSaved) return false;
    return agendamentos.some((a) => a.responsavelTelefone.replace(/\D/g, '') === digitsSaved);
  }, [agendamentos, savedTelefone]);

  // Escuta os agendamentos da data selecionada em tempo real (Firestore)
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeAgendamentos(
      dataSelecionada,
      (dados) => {
        setAgendamentos(dados);
        setIsLoading(false);
      },
      (err) => {
        console.error('Erro na subscrição:', err);
        setIsLoading(false);
      }
    );

    setStatus(getFirebaseStatus());

    return () => {
      unsubscribe();
    };
  }, [dataSelecionada]);

  // Cálculo da capacidade por horário para a data ativa
  const capacidades = useMemo(() => {
    const mapa: Record<string, CapacidadeSlot> = {};

    HORARIOS_CT.forEach((slot) => {
      const doHorario = agendamentos.filter((a) => a.horario === slot.label);
      const ocupadas = doHorario.length;
      const disponiveis = Math.max(0, capacidadeMaxima - ocupadas);

      mapa[slot.label] = {
        horario: slot.label,
        totalVagas: capacidadeMaxima,
        ocupadas,
        disponiveis,
        esgotado: disponiveis <= 0,
        agendamentos: doHorario,
      };
    });

    return mapa;
  }, [agendamentos, capacidadeMaxima]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handler de novo agendamento (suporta 1 ou mais irmãos simultaneamente)
  const handleNovoAgendamento = async (dados: {
    responsavelNome: string;
    responsavelTelefone: string;
    criancas: Array<{ nome: string; idade: number }>;
    horario: string;
    observacoes: string;
  }) => {
    setIsLoading(true);
    try {
      for (const crianca of dados.criancas) {
        await salvarAgendamento({
          responsavelNome: dados.responsavelNome,
          responsavelTelefone: dados.responsavelTelefone,
          criancaNome: crianca.nome,
          criancaIdade: crianca.idade,
          horario: dados.horario,
          observacoes: dados.observacoes,
          data: dataSelecionada,
        });
      }

      // Atualiza o telefone salvo em memória
      setSavedTelefone(dados.responsavelTelefone);

      if (dados.criancas.length > 1) {
        showToast(`Vagas confirmadas para ${dados.criancas.map((c) => c.nome).join(' e ')}!`);
      } else {
        showToast(`Vaga confirmada para ${dados.criancas[0].nome}!`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handler de exclusão / liberação de vaga
  const handleDeletarAgendamento = async (id: string, criancaNome: string) => {
    setIsDeletingId(id);
    try {
      await cancelarAgendamento(id);
      showToast(`Vaga de ${criancaNome} liberada.`);
    } catch (err: any) {
      alert(`Erro ao cancelar agendamento: ${err.message || 'Tente novamente'}`);
    } finally {
      setIsDeletingId(null);
    }
  };

  // Handler de Check-in dos Instrutores na chegada da criança
  const handleToggleCheckIn = async (
    id: string,
    novoStatus: 'presente' | 'agendado',
    criancaNome: string
  ) => {
    setIsUpdatingStatusId(id);
    try {
      await atualizarStatusCheckIn(id, novoStatus);
      if (novoStatus === 'presente') {
        showToast(`Presença confirmada para ${criancaNome}!`);
      } else {
        showToast(`Check-in desfeito.`);
      }
    } catch (err: any) {
      alert(`Erro ao atualizar status: ${err.message || 'Tente novamente'}`);
    } finally {
      setIsUpdatingStatusId(null);
    }
  };

  // Handler de Check-in Presencial / Balcão
  const handleQuickCheckIn = async (dados: {
    responsavelNome: string;
    responsavelTelefone: string;
    criancaNome: string;
    criancaIdade: number;
    horario: string;
    observacoes: string;
    fazerCheckInImediato: boolean;
  }) => {
    setIsLoading(true);
    try {
      await salvarAgendamento({
        responsavelNome: dados.responsavelNome,
        responsavelTelefone: dados.responsavelTelefone,
        criancaNome: dados.criancaNome,
        criancaIdade: dados.criancaIdade,
        horario: dados.horario,
        observacoes: dados.observacoes,
        data: dataSelecionada,
        status: dados.fazerCheckInImediato ? 'presente' : 'agendado',
        checkInEm: dados.fazerCheckInImediato ? Date.now() : undefined,
      });

      setSavedTelefone(dados.responsavelTelefone);
      showToast(
        dados.fazerCheckInImediato
          ? `Check-in imediato realizado para ${dados.criancaNome}!`
          : `Agendamento criado para ${dados.criancaNome}!`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090c] text-zinc-100 flex flex-col font-sans selection:bg-red-900 selection:text-white">
      {/* Toast de notificação */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-red-900 border border-red-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-sm font-semibold">
          <CheckCircleIcon className="w-5 h-5 text-white flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cabeçalho */}
      <Header
        status={status}
        dataSelecionada={dataSelecionada}
        setDataSelecionada={setDataSelecionada}
        onOpenGuide={() => setShowGuideModal(true)}
        totalAgendamentosDia={agendamentos.length}
        totalPresentesDia={totalPresentesDia}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRequestPortaria={() => setShowStaffAuth(true)}
        onOpenMyBookings={() => setShowMyBookings(true)}
        hasMyBookings={temMeusAgendamentosHoje}
        onOpenQrCode={() => setShowQrCodeModal(true)}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8">
        {/* MODO 1: AGENDAMENTO DO CLIENTE (Simples, Claro e Direto) */}
        {activeTab === 'agendar' && (
          <div className="max-w-2xl mx-auto">
            <BookingForm
              capacidades={capacidades}
              horarioSelecionado={horarioSelecionado}
              setHorarioSelecionado={setHorarioSelecionado}
              onSubmit={handleNovoAgendamento}
              isLoading={isLoading}
              dataSelecionada={dataSelecionada}
              onOpenMyBookings={() => setShowMyBookings(true)}
              temAgendamentosHoje={temMeusAgendamentosHoje}
            />
          </div>
        )}

        {/* MODO 2: PORTARIA / INSTRUTORES (Check-in e Presença) */}
        {activeTab === 'portaria' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#121217] border border-zinc-800 rounded-2xl p-4">
              <div>
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider block">
                  Área da Recepção / Portaria
                </span>
                <h3 className="font-display text-lg font-black text-white">
                  Lista de Presença - IRON KIDS
                </h3>
                <p className="text-xs text-zinc-400">
                  Marque o check-in quando o responsável chegar com o pequeno atleta.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('agendar')}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs transition cursor-pointer"
              >
                + Novo Agendamento
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 space-y-6">
                <CapacityOverview
                  capacidades={capacidades}
                  horarioSelecionado={horarioSelecionado}
                  setHorarioSelecionado={setHorarioSelecionado}
                  capacidadeMaxima={capacidadeMaxima}
                  setCapacidadeMaxima={setCapacidadeMaxima}
                  dataSelecionada={dataSelecionada}
                />
              </div>

              <div className="lg:col-span-7 space-y-6">
                <BookingsList
                  agendamentos={agendamentos}
                  onDelete={handleDeletarAgendamento}
                  onToggleCheckIn={handleToggleCheckIn}
                  onSaveQuickCheckIn={handleQuickCheckIn}
                  isDeletingId={isDeletingId}
                  isUpdatingStatusId={isUpdatingStatusId}
                  dataSelecionada={dataSelecionada}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Rodapé Simples e Discreto */}
      <footer className="mt-auto border-t border-zinc-900 bg-[#08080a] py-6 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="IRON KIDS" className="w-6 h-6 object-contain" />
            <span className="font-display font-black text-red-500 tracking-wider">CT IRON KINGS</span>
            <span>•</span>
            <span className="text-zinc-400">Espaço Kids</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-zinc-500">
            <a
              href={getLinkWhatsAppSuporte()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-emerald-400 transition flex items-center gap-1"
              title="Falar no WhatsApp da Recepção"
            >
              <span className="text-emerald-500">●</span>
              <span>WhatsApp: {WHATSAPP_RECEPCAO_FORMATADO}</span>
            </a>
            <span>•</span>
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
            >
              Configuração / Vercel
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'agendar') {
                  setShowStaffAuth(true);
                } else {
                  setActiveTab('agendar');
                }
              }}
              className="text-zinc-400 hover:text-red-400 transition cursor-pointer"
            >
              {activeTab === 'agendar' ? 'Acesso Portaria' : 'Agendar Horário'}
            </button>
          </div>
        </div>
      </footer>

      {/* Modal: Minhas Vagas (Exclusivo para o Cliente) */}
      <MyBookingsModal
        isOpen={showMyBookings}
        onClose={() => setShowMyBookings(false)}
        agendamentos={agendamentos}
        onCancel={handleDeletarAgendamento}
        isCancellingId={isDeletingId}
        savedTelefone={savedTelefone}
        dataSelecionada={dataSelecionada}
      />

      {/* Modal: Autenticação PIN da Portaria/Recepção */}
      <StaffAuthModal
        isOpen={showStaffAuth}
        onClose={() => setShowStaffAuth(false)}
        onSuccess={() => {
          setShowStaffAuth(false);
          setActiveTab('portaria');
        }}
      />

      {/* Modal de Instruções Vercel / Firebase */}
      <VercelGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* Modal: Display de Balcão e QR Code */}
      <QrCodeModal
        isOpen={showQrCodeModal}
        onClose={() => setShowQrCodeModal(false)}
      />

      {/* Botão Flutuante de Suporte / Dúvidas via WhatsApp */}
      <WhatsAppSupportButton />
    </div>
  );
}
