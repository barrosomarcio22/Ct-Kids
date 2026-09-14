import React, { useState } from 'react';
import { CloseIcon, CastleIcon, ShieldCheckIcon } from './Icons';

interface VercelGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelGuideModal: React.FC<VercelGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  if (!isOpen) return null;

  const envSample = `VITE_FIREBASE_API_KEY=AIzaSyDtQOYTxlfvo_LaJuJQRa8-YoVhdjN6bCg
VITE_FIREBASE_AUTH_DOMAIN=turing-node-507pf.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=turing-node-507pf
VITE_FIREBASE_FIRESTORE_DATABASE_ID=ai-studio-espaominikingsct-6c41e0d4-93d8-494d-87b5-9426e0c40ca6
VITE_FIREBASE_STORAGE_BUCKET=turing-node-507pf.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=157116187285
VITE_FIREBASE_APP_ID=1:157116187285:web:f13d3859a3ddc0c5b1119c`;

  const firestoreRulesSample = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /agendamentos/{agendamentoId} {
      // Leitura pública em tempo real das vagas do Reino
      allow read: if true;
      // Criação de agendamento pelos responsáveis
      allow create: if request.resource.data.responsavelNome is string
                    && request.resource.data.criancaNome is string
                    && request.resource.data.horario is string
                    && request.resource.data.data is string;
      // Cancelamento / exclusão para liberação da vaga
      allow delete: if true;
      // Check-in dos instrutores (atualização do campo status)
      allow update: if true;
    }
  }
}`;

  const copyToClipboard = (text: string, type: 'env' | 'rules') => {
    navigator.clipboard.writeText(text);
    if (type === 'env') {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 3000);
    } else {
      setCopiedRules(true);
      setTimeout(() => setCopiedRules(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#121216] border border-red-900/60 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 relative text-zinc-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          aria-label="Fechar"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-zinc-800">
          <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-800/80 text-red-400">
            <CastleIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-red-500 tracking-wider">
              Guia de Produção
            </span>
            <h2 className="text-xl font-black text-white">
              Como subir na Vercel & Conectar o Firebase
            </h2>
          </div>
        </div>

        <div className="space-y-6 text-xs sm:text-sm">
          {/* Passo 1: Firebase Console */}
          <div className="bg-[#181820] border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 font-bold text-white text-sm">
              <span className="w-6 h-6 rounded-full bg-red-900 text-red-200 flex items-center justify-center text-xs">
                1
              </span>
              <span>Criar o Projeto no Firebase</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-zinc-300 ml-2">
              <li>Acesse <strong className="text-white">console.firebase.google.com</strong> e crie um projeto.</li>
              <li>No menu lateral, vá em <strong className="text-white">Build &gt; Firestore Database</strong> e clique em <strong className="text-white">Criar Banco de Dados</strong>.</li>
              <li>Selecione a região mais próxima (ex: <code className="text-red-400">southamerica-east1</code>).</li>
              <li>Na aba <strong className="text-white">Regras (Rules)</strong>, cole a regra abaixo para permitir que os responsáveis agendem e cancelem:</li>
            </ol>

            <div className="mt-3 relative">
              <pre className="bg-black/80 border border-zinc-800 p-3 rounded-lg text-[11px] font-mono text-zinc-300 overflow-x-auto">
                {firestoreRulesSample}
              </pre>
              <button
                type="button"
                onClick={() => copyToClipboard(firestoreRulesSample, 'rules')}
                className="absolute top-2 right-2 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-semibold transition"
              >
                {copiedRules ? 'Copiado!' : 'Copiar Regras'}
              </button>
            </div>
          </div>

          {/* Passo 2: Pegar as Chaves */}
          <div className="bg-[#181820] border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 font-bold text-white text-sm">
              <span className="w-6 h-6 rounded-full bg-red-900 text-red-200 flex items-center justify-center text-xs">
                2
              </span>
              <span>Configurar as Variáveis de Ambiente</span>
            </div>
            <p className="text-zinc-300 mb-2">
              No Firebase Console, vá nas configurações do projeto (ícone de engrenagem) &gt; <strong className="text-white">Seus Aplicativos</strong> &gt; Adicionar App Web (<strong>&lt;/&gt;</strong>).
              Copie os dados e adicione nas variáveis de ambiente da Vercel (ou no arquivo <code className="text-red-400">.env.local</code>):
            </p>

            <div className="relative">
              <pre className="bg-black/80 border border-zinc-800 p-3 rounded-lg text-[11px] font-mono text-zinc-300 overflow-x-auto">
                {envSample}
              </pre>
              <button
                type="button"
                onClick={() => copyToClipboard(envSample, 'env')}
                className="absolute top-2 right-2 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-semibold transition"
              >
                {copiedEnv ? 'Copiado!' : 'Copiar Variáveis'}
              </button>
            </div>
          </div>

          {/* Passo 3: Deploy na Vercel */}
          <div className="bg-[#181820] border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 font-bold text-white text-sm">
              <span className="w-6 h-6 rounded-full bg-red-900 text-red-200 flex items-center justify-center text-xs">
                3
              </span>
              <span>Deploy na Vercel em 2 Minutos</span>
            </div>
            <ul className="space-y-1.5 text-zinc-300">
              <li>• Faça o push deste projeto para um repositório no <strong className="text-white">GitHub</strong>.</li>
              <li>• Acesse <strong className="text-white">vercel.com/new</strong> e selecione o repositório.</li>
              <li>• O framework será detectado automaticamente como <strong className="text-red-400 font-mono">Vite</strong>.</li>
              <li>• Na seção <strong className="text-white">Environment Variables</strong>, adicione cada variável <code className="text-red-400">VITE_FIREBASE_...</code>.</li>
              <li>• Clique em <strong className="text-white">Deploy</strong>. O site estará online imediatamente!</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-red-800 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition"
          >
            Entendido, Voltar ao Reino
          </button>
        </div>
      </div>
    </div>
  );
};
