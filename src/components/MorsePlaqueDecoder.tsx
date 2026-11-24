import { useEffect, useMemo, useState } from 'react';
import { Check, Delete, RotateCcw, Volume2 } from 'lucide-react';
import {
  encodeWordToMorse,
  formatMorseDisplay,
  MORSE_ALPHABET,
  playMorseLetter,
  playMorseWord,
  playUiFeedback,
  stopAllAudio,
} from '../utils/morse';

interface MorsePlaqueDecoderProps {
  morseWord: string;
  meaningHint: string;
  solved: boolean;
  muted: boolean;
  onSolved: () => void;
}

const ALPHABET_ENTRIES = Object.entries(MORSE_ALPHABET);

export function MorsePlaqueDecoder({
  morseWord,
  meaningHint,
  solved,
  muted,
  onSolved,
}: MorsePlaqueDecoderProps) {
  const target = morseWord.toUpperCase();
  const morseLetters = useMemo(() => encodeWordToMorse(target), [target]);
  const [guessChars, setGuessChars] = useState<string[]>([]);
  const [activeSoundIdx, setActiveSoundIdx] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setGuessChars([]);
    setActiveSoundIdx(null);
    setErrorMessage(null);
    return () => {
      stopAllAudio();
    };
  }, [target]);

  const handleSelectChar = (char: string) => {
    if (solved) return;
    if (guessChars.length >= target.length) return;

    const next = [...guessChars, char.toUpperCase()];
    setGuessChars(next);
    setErrorMessage(null);

    if (next.length === target.length) {
      const candidate = next.join('');
      if (candidate === target) {
        playUiFeedback('success', muted);
        onSolved();
      } else {
        playUiFeedback('error', muted);
        setErrorMessage(
          'Tradução incorreta. Confira os pontos e traços de cada letra na tabela.'
        );
      }
    } else {
      playUiFeedback('click', muted);
    }
  };

  const handleBackspace = () => {
    if (solved || guessChars.length === 0) return;
    playUiFeedback('click', muted);
    setGuessChars((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    if (solved || guessChars.length === 0) return;
    playUiFeedback('click', muted);
    setGuessChars([]);
    setErrorMessage(null);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (solved) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      const upper = e.key.toUpperCase();
      if (/^[A-Z]$/.test(upper)) {
        handleSelectChar(upper);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const handlePlayWholeWord = () => {
    playMorseWord(target, muted, (idx) => {
      setActiveSoundIdx(idx);
    });
  };

  return (
    <section
      aria-label="Tradutor da placa em código Morse"
      className="rounded-xl border border-[#2d4036] bg-[#16221c] p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#25362d] pb-4">
        <div>
          <p className="text-xs font-medium text-[#9fb5a8]">
            Placa entalhada em código Morse
          </p>
          <h3 className="mt-0.5 text-lg font-semibold text-[#f4efe6]">
            Traduza o sinal da trilha
          </h3>
        </div>

        <button
          type="button"
          onClick={handlePlayWholeWord}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#3c5648] bg-[#1d2d25] px-3.5 py-2 text-xs font-semibold text-[#f4efe6] transition-colors hover:border-amber-400/60 hover:bg-[#24372d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 whitespace-nowrap shrink-0"
        >
          <Volume2 className="h-4 w-4 text-amber-400" aria-hidden="true" />
          <span>Ouvir Placa</span>
        </button>
      </div>

      {/* Morse Tiles */}
      <div className="mt-4">
        <p className="text-xs text-[#9fb5a8]">
          Clique em uma letra da placa para ouvir o código correspondente:
        </p>
        <div
          className="mt-2.5 grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${morseLetters.length}, minmax(0, 1fr))`,
          }}
        >
          {morseLetters.map((code, idx) => {
            const filledLetter = solved ? target[idx] : guessChars[idx] ?? '';
            const isSpeaking = activeSoundIdx === idx;
            const isNext = !solved && idx === guessChars.length;

            return (
              <button
                key={`${target}-${idx}`}
                type="button"
                onClick={() => playMorseLetter(code, muted)}
                title={`Ouvir letra ${idx + 1}: ${formatMorseDisplay(code)}`}
                className={`flex flex-col items-center justify-between gap-2 rounded-lg border px-2 py-3 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                  solved
                    ? 'border-emerald-500/50 bg-emerald-950/35'
                    : isSpeaking
                      ? 'border-amber-400 bg-amber-950/35'
                      : isNext
                        ? 'border-amber-500/70 bg-[#1e2d25]'
                        : 'border-[#2c3f34] bg-[#121c17] hover:border-[#436050]'
                }`}
              >
                <span className="font-mono text-sm font-semibold tracking-wider text-amber-300 sm:text-base">
                  {formatMorseDisplay(code)}
                </span>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-md border font-mono text-base font-semibold ${
                    solved
                      ? 'border-emerald-500/50 bg-emerald-900/40 text-emerald-200'
                      : filledLetter
                        ? 'border-[#456252] bg-[#1e2f26] text-[#f4efe6]'
                        : 'border-dashed border-[#34493d] text-[#6d8477]'
                  }`}
                >
                  {filledLetter || '·'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls or Solved confirmation */}
      {solved ? (
        <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-950/30 p-3.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
            <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            <span>Placa traduzida: {target}</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[#c6d6cc]">
            {meaningHint}
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#9fb5a8]">
              Digite no teclado ou clique nas letras da tabela:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleBackspace}
                disabled={guessChars.length === 0}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[#31453a] bg-[#1b2922] px-2.5 py-1 text-xs font-medium text-[#d4e0d8] transition-colors hover:bg-[#23342b] disabled:opacity-40 whitespace-nowrap shrink-0"
              >
                <Delete className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Apagar</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={guessChars.length === 0}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[#31453a] bg-[#1b2922] px-2.5 py-1 text-xs font-medium text-[#d4e0d8] transition-colors hover:bg-[#23342b] disabled:opacity-40 whitespace-nowrap shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Limpar</span>
              </button>
            </div>
          </div>

          {errorMessage ? (
            <p
              role="alert"
              className="mt-2.5 rounded-lg border border-rose-400/35 bg-rose-950/30 px-3 py-2 text-xs text-rose-200"
            >
              {errorMessage}
            </p>
          ) : null}

          {/* Full A-Z Reference Grid */}
          <div className="mt-3 border-t border-[#25362d] pt-3">
            <p className="mb-2 text-xs font-medium text-[#9fb5a8]">
              Tabela de Código Morse (A–Z)
            </p>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
              {ALPHABET_ENTRIES.map(([letter, code]) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => handleSelectChar(letter)}
                  className="flex min-h-10 flex-col items-center justify-center rounded-md border border-[#2a3c32] bg-[#121c17] px-1.5 py-1.5 transition-colors hover:border-amber-400/55 hover:bg-[#1d2c24] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-400"
                >
                  <span className="text-xs font-bold text-[#f4efe6]">
                    {letter}
                  </span>
                  <span className="font-mono text-[11px] leading-tight text-amber-300/90">
                    {code.replace(/\./g, '·').replace(/-/g, '—')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
