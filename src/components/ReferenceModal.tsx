import { X, Volume2, CheckCircle2, CircleDashed } from 'lucide-react';
import {
  formatMorseDisplay,
  MORSE_ALPHABET,
  playMorseLetter,
} from '../utils/morse';
import { ENDINGS, EndingId } from '../data/story';

interface ReferenceModalProps {
  activeTab: 'morse' | 'endings' | null;
  unlockedEndings: EndingId[];
  muted: boolean;
  onClose: () => void;
  onSwitchTab: (tab: 'morse' | 'endings') => void;
}

const ENDING_ORDER: EndingId[] = [
  'lost_in_swamp',
  'cold_porridge',
  'warm_porridge',
];

export function ReferenceModal({
  activeTab,
  unlockedEndings,
  muted,
  onClose,
  onSwitchTab,
}: ReferenceModalProps) {
  if (!activeTab) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={
        activeTab === 'morse'
          ? 'Guia de Código Morse'
          : 'Registro dos Finais'
      }
    >
      <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#32483c] bg-[#16221c] p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-[#283a30] pb-4">
          <div className="flex items-center gap-1 rounded-lg bg-[#101914] p-1">
            <button
              type="button"
              onClick={() => onSwitchTab('morse')}
              className={`min-h-9 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'morse'
                  ? 'bg-[#24372d] text-[#f4efe6]'
                  : 'text-[#9fb5a8] hover:text-[#f4efe6]'
              }`}
            >
              Guia Morse
            </button>
            <button
              type="button"
              onClick={() => onSwitchTab('endings')}
              className={`min-h-9 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'endings'
                  ? 'bg-[#24372d] text-[#f4efe6]'
                  : 'text-[#9fb5a8] hover:text-[#f4efe6]'
              }`}
            >
              Finais ({unlockedEndings.length}/3)
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2f4237] text-[#b4c6bb] transition-colors hover:bg-[#203028] hover:text-[#f4efe6]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {activeTab === 'morse' ? (
          <div className="mt-5">
            <h2 className="text-xl font-semibold text-[#f4efe6]">
              Como ler as placas do pântano
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#b7c8be]">
              Cada letra é formada por pontos curtos (·) e traços longos (—).
              Clique em qualquer letra abaixo para ouvir seu som correspondente.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {Object.entries(MORSE_ALPHABET).map(([letter, code]) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => playMorseLetter(code, muted)}
                  className="flex min-h-12 items-center justify-between rounded-lg border border-[#2a3d33] bg-[#111b17] px-3 py-2 transition-colors hover:border-amber-400/50 hover:bg-[#1a2922]"
                >
                  <span className="text-sm font-bold text-[#f4efe6]">
                    {letter}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-xs text-amber-300">
                    {formatMorseDisplay(code)}
                    <Volume2 className="h-3 w-3 opacity-60" aria-hidden="true" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <h2 className="text-xl font-semibold text-[#f4efe6]">
              Finais da Travessia
            </h2>
            <p className="text-sm text-[#b7c8be]">
              Existem 3 desfechos diferentes dependendo de em quem você
              acredita, como traduz as placas e quanto tempo leva no trajeto.
            </p>
            <div className="mt-4 space-y-3">
              {ENDING_ORDER.map((id, index) => {
                const ending = ENDINGS[id];
                const unlocked = unlockedEndings.includes(id);
                return (
                  <div
                    key={id}
                    className="rounded-lg border border-[#2a3d33] bg-[#111b17] p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-[#9fb5a8]">
                        Final {index + 1}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#c5d4cb]">
                        {unlocked ? (
                          <>
                            <CheckCircle2
                              className="h-4 w-4 text-emerald-400"
                              aria-hidden="true"
                            />
                            <span>Descoberto</span>
                          </>
                        ) : (
                          <>
                            <CircleDashed
                              className="h-4 w-4 text-[#738a7c]"
                              aria-hidden="true"
                            />
                            <span>Ainda não descoberto</span>
                          </>
                        )}
                      </span>
                    </div>
                    <h3 className="mt-1 text-base font-semibold text-[#f4efe6]">
                      {unlocked ? ending.title : 'Desfecho misterioso'}
                    </h3>
                    <p className="mt-1 text-sm text-[#a6b8ad]">
                      {unlocked
                        ? ending.subtitle
                        : 'Jogue e experimente outras escolhas no pântano para liberar este final.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
