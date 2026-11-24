import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Compass,
  Flame,
  MapPin,
  RotateCcw,
  Snowflake,
  Thermometer,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  ENDINGS,
  EndingId,
  getPorridgeStatus,
  SCENES,
  SceneId,
  START_HOTSPOTS,
  STORY_IMAGES,
  StoryChoice,
} from './data/story';
import { SceneArtwork } from './components/SceneArtwork';
import { MorsePlaqueDecoder } from './components/MorsePlaqueDecoder';
import { ReferenceModal } from './components/ReferenceModal';
import { playMorseWord, playUiFeedback, stopAllAudio } from './utils/morse';

type GamePhase = 'TITLE' | 'PLAYING' | 'ENDING';

const STORAGE_KEY = 'gato_laranja_finais_v1';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('TITLE');
  const [currentSceneId, setCurrentSceneId] =
    useState<SceneId>('chapter_1_owl');
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);
  const [solvedScenes, setSolvedScenes] = useState<Record<string, boolean>>({});
  const [currentEndingId, setCurrentEndingId] =
    useState<EndingId>('lost_in_swamp');
  const [unlockedEndings, setUnlockedEndings] = useState<EndingId[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed as EndingId[];
      }
    } catch {
      // Ignore storage errors
    }
    return [];
  });
  const [muted, setMuted] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<'morse' | 'endings' | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedEndings));
    } catch {
      // Ignore storage errors
    }
  }, [unlockedEndings]);

  useEffect(() => {
    return () => stopAllAudio();
  }, []);

  const unlockEnding = (endingId: EndingId) => {
    setUnlockedEndings((prev) =>
      prev.includes(endingId) ? prev : [...prev, endingId]
    );
  };

  const handleStartGame = () => {
    stopAllAudio();
    playUiFeedback('click', muted);
    setCurrentSceneId('chapter_1_owl');
    setElapsedMinutes(0);
    setSolvedScenes({});
    setPhase('PLAYING');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestart = () => {
    stopAllAudio();
    playUiFeedback('click', muted);
    setCurrentSceneId('chapter_1_owl');
    setElapsedMinutes(0);
    setSolvedScenes({});
    setPhase('PLAYING');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToTitle = () => {
    stopAllAudio();
    playUiFeedback('click', muted);
    setPhase('TITLE');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSceneSolved = (sceneId: SceneId) => {
    setSolvedScenes((prev) => ({ ...prev, [sceneId]: true }));
  };

  const triggerEnding = (endingId: EndingId) => {
    stopAllAudio();
    setCurrentEndingId(endingId);
    unlockEnding(endingId);
    setPhase('ENDING');
    if (endingId === 'warm_porridge') {
      playUiFeedback('ending_good', muted);
    } else if (endingId === 'cold_porridge') {
      playUiFeedback('ending_cold', muted);
    } else {
      playUiFeedback('ending_lost', muted);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChoose = (choice: StoryChoice) => {
    stopAllAudio();
    const nextMinutes = elapsedMinutes + choice.minutesAdded;
    setElapsedMinutes(nextMinutes);

    if (choice.outcome.type === 'next_scene') {
      playUiFeedback('click', muted);
      setCurrentSceneId(choice.outcome.sceneId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (choice.outcome.type === 'ending') {
      triggerEnding(choice.outcome.endingId);
    } else if (choice.outcome.type === 'resolve_arrival') {
      if (nextMinutes <= 35) {
        triggerEnding('warm_porridge');
      } else {
        triggerEnding('cold_porridge');
      }
    }
  };

  const activeScene = SCENES[currentSceneId];
  const isCurrentSceneSolved = Boolean(solvedScenes[currentSceneId]);
  const porridgeStatus = getPorridgeStatus(elapsedMinutes);
  const activeEnding = ENDINGS[currentEndingId];

  return (
    <div className="min-h-screen bg-[#111b17] text-[#f4efe6]">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="border-b border-[#25362d] bg-[#131e19]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={handleGoToTitle}
            className="text-left font-serif text-lg font-bold tracking-tight text-[#f4efe6] transition-colors hover:text-amber-300 whitespace-nowrap shrink-0"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            O Gato e o Mingau
          </button>

          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-6 text-sm font-medium text-[#b5c7bc] md:flex"
          >
            <button
              type="button"
              onClick={handleGoToTitle}
              className="transition-colors hover:text-[#f4efe6] whitespace-nowrap shrink-0"
            >
              Início
            </button>
            <button
              type="button"
              onClick={() => setModalTab('morse')}
              className="transition-colors hover:text-[#f4efe6] whitespace-nowrap shrink-0"
            >
              Guia Morse
            </button>
            <button
              type="button"
              onClick={() => setModalTab('endings')}
              className="transition-colors hover:text-[#f4efe6] whitespace-nowrap shrink-0"
            >
              Finais ({unlockedEndings.length}/3)
            </button>
          </nav>

          <div className="flex items-center shrink-0">
            {phase === 'TITLE' ? (
              <button
                type="button"
                onClick={handleStartGame}
                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#e07a2f] px-4 py-2 text-xs font-semibold text-[#111b17] transition-colors hover:bg-[#eb8940] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 whitespace-nowrap shrink-0"
              >
                Começar Jogo
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#3a5244] bg-[#1a2921] px-4 py-2 text-xs font-semibold text-[#f4efe6] transition-colors hover:border-amber-400/60 hover:bg-[#22352b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 whitespace-nowrap shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reiniciar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        {phase === 'TITLE' && (
          <div className="space-y-12">
            {/* Hero 2-column split with items-stretch */}
            <section className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
              <div className="flex flex-col justify-between rounded-xl border border-[#2a3c32] bg-[#16221c] p-6 sm:p-8 lg:col-span-6">
                <div>
                  <p className="text-xs font-medium text-amber-300">
                    Aventura interativa · Código Morse · 3 finais
                  </p>
                  <h1 className="mt-3 text-3xl font-bold leading-tight text-[#f4efe6] sm:text-4xl">
                    O Gato Laranja e a Travessia do Pântano
                  </h1>
                  <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-[#cad7cf]">
                    Um gato de pelagem alaranjada recebeu um convite irresistível:
                    ir até a cabana do seu amigo Sapo de Óculos para comer mingau
                    quentinho.
                  </p>
                  <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-[#b2c3b9]">
                    Para chegar lá, você precisará atravessar o pântano ouvindo as
                    explicações de moradores que vivem afastados uns dos outros e
                    traduzir placas em código Morse antes de escolher seu caminho.
                  </p>
                </div>

                <div className="mt-8 border-t border-[#26382e] pt-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleStartGame}
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#e07a2f] px-6 py-2.5 text-sm font-semibold text-[#111b17] transition-colors hover:bg-[#eb8940] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 whitespace-nowrap shrink-0"
                    >
                      <span>Começar Jogo</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalTab('morse')}
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#354c3f] bg-[#1b2922] px-4 py-2.5 text-sm font-medium text-[#e4ece7] transition-colors hover:bg-[#23342b] whitespace-nowrap shrink-0"
                    >
                      <span>Ver Guia Morse</span>
                    </button>
                  </div>
                  <p className="mt-4 text-xs text-[#91a89b]">
                    Finais descobertos: {unlockedEndings.length} de 3
                    <span aria-hidden="true"> · </span>
                    <button
                      type="button"
                      onClick={() => setModalTab('endings')}
                      className="underline decoration-[#4e6a5a] underline-offset-4 hover:text-[#f4efe6]"
                    >
                      Ver registro
                    </button>
                  </p>
                </div>
              </div>

              <div className="lg:col-span-6">
                <SceneArtwork
                  src={STORY_IMAGES.start}
                  alt="Gato de pelagem alaranjada com lanterna na mão caminhando sobre uma passarela de madeira na entrada do pântano."
                  ambientEffect="swamp"
                  hotspots={START_HOTSPOTS}
                  muted={muted}
                  fillHeight
                />
              </div>
            </section>

            {/* Rules / Mechanics 3-column strip */}
            <section
              aria-label="Como funciona a travessia"
              className="grid gap-6 border-t border-[#25362d] pt-8 md:grid-cols-3"
            >
              <div>
                <h2 className="text-lg font-semibold text-[#f4efe6]">
                  01. Moradores Afastados
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#b2c3b9]">
                  Cada animal vive isolado em um ponto do pântano. Nem todos são
                  confiáveis — se você acreditar no morador errado, o gato se
                  perde na neblina.
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#f4efe6]">
                  02. Placas em Código Morse
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#b2c3b9]">
                  Em cada bifurcação há uma placa entalhada com pontos e traços.
                  Use a tabela interativa e o som dos sinais para descobrir a
                  palavra certa.
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#f4efe6]">
                  03. Três Finais Diferentes
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#b2c3b9]">
                  Você pode se perder no pântano, chegar à cabana depois que o
                  mingau esfriou ou chegar a tempo de comer mingau quentinho com o
                  sapo.
                </p>
              </div>
            </section>
          </div>
        )}

        {phase === 'PLAYING' && (
          <div className="space-y-6">
            {/* Compact Travel & Warmth HUD */}
            <section
              aria-label="Estado da travessia"
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#2a3c32] bg-[#16221c] px-5 py-3.5"
            >
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2 text-[#d7e2db]">
                  <MapPin className="h-4 w-4 text-amber-400" aria-hidden="true" />
                  <span className="font-semibold">{activeScene.chapterTitle}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#a5b8ac] tabular-nums">
                  <Compass className="h-4 w-4 text-[#85a392]" aria-hidden="true" />
                  <span>
                    Distância: {activeScene.distanceMeters} m /{' '}
                    {activeScene.totalMeters} m
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#a5b8ac] tabular-nums">
                  <span>Tempo decorrido: {elapsedMinutes} min</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <Thermometer
                    className={`h-4 w-4 ${porridgeStatus.toneClass}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-[140px]">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-[#a5b8ac]">Mingau:</span>
                      <span className={`font-semibold ${porridgeStatus.toneClass}`}>
                        {porridgeStatus.label}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#101914]">
                      <div
                        className={`h-full transition-all duration-300 ${porridgeStatus.barClass}`}
                        style={{ width: `${porridgeStatus.percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMuted((m) => !m)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#31453a] bg-[#1b2922] px-3 py-1.5 text-xs font-medium text-[#d4e0d8] transition-colors hover:bg-[#23342b] whitespace-nowrap shrink-0"
                >
                  {muted ? (
                    <VolumeX className="h-3.5 w-3.5 text-[#91a89b]" aria-hidden="true" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                  )}
                  <span>{muted ? 'Som: Desligado' : 'Som: Ligado'}</span>
                </button>
              </div>
            </section>

            {/* Main 2-column Gameplay Grid */}
            <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
              {/* Left: Artwork, Narrative, Residents & Choices */}
              <div className="space-y-6 lg:col-span-7">
                <SceneArtwork
                  src={activeScene.imageSrc}
                  alt={activeScene.imageAlt}
                  ambientEffect={activeScene.ambientEffect}
                  hotspots={activeScene.hotspots}
                  muted={muted}
                  onPlayMorse={() => playMorseWord(activeScene.morseWord, muted)}
                />

                <article className="rounded-xl border border-[#2a3c32] bg-[#16221c] p-6">
                  <h2 className="text-2xl font-bold text-[#f4efe6]">
                    {activeScene.location}
                  </h2>
                  <div className="mt-3 space-y-3 text-base leading-relaxed text-[#cfdcd4]">
                    {activeScene.narrative.map((para, idx) => (
                      <p key={idx} className="max-w-[65ch]">
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Residents */}
                  <div className="mt-6 border-t border-[#25362d] pt-5">
                    <h3 className="text-base font-semibold text-[#f4efe6]">
                      Explicações dos moradores próximos
                    </h3>
                    <div className="mt-3 space-y-3">
                      {activeScene.residents.map((resident) => (
                        <div
                          key={resident.name}
                          className="rounded-lg border border-[#2b3e33] bg-[#121c17] p-4"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className="text-sm font-semibold text-amber-300">
                              {resident.name}
                            </span>
                            <span className="text-xs text-[#8fa699]">
                              {resident.distanceLabel}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-[#8fa699]">
                            {resident.role}
                          </p>
                          <p className="mt-2.5 text-sm leading-relaxed text-[#e6ede8]">
                            {resident.quote}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Choices */}
                  <div className="mt-6 border-t border-[#25362d] pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-[#f4efe6]">
                        Qual caminho você escolhe?
                      </h3>
                      {!isCurrentSceneSolved ? (
                        <span className="text-xs font-medium text-amber-300">
                          Traduza a placa em Morse primeiro
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-300">
                          Caminhos liberados
                        </span>
                      )}
                    </div>

                    {!isCurrentSceneSolved ? (
                      <p className="mt-2 rounded-lg border border-[#32463b] bg-[#121c17] px-4 py-3 text-sm text-[#b4c5bb]">
                        Antes de decidir em quem acreditar, traduza a placa em
                        código Morse no painel ao lado para descobrir o que ela
                        realmente diz.
                      </p>
                    ) : null}

                    <div className="mt-3 space-y-2.5">
                      {activeScene.choices.map((choice) => (
                        <button
                          key={choice.id}
                          type="button"
                          disabled={!isCurrentSceneSolved}
                          onClick={() => handleChoose(choice)}
                          className="group flex min-h-14 w-full items-center justify-between gap-4 rounded-lg border border-[#33493d] bg-[#1a2921] px-4 py-3 text-left transition-colors hover:border-amber-400/70 hover:bg-[#22352b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-[#33493d] disabled:hover:bg-[#1a2921]"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#f4efe6]">
                              {choice.label}
                            </p>
                            <p className="mt-0.5 text-xs text-[#a5b8ac]">
                              {choice.detail}
                            </p>
                          </div>
                          <ArrowRight
                            className="h-4 w-4 shrink-0 text-amber-400 transition-transform group-hover:translate-x-0.5 group-disabled:translate-x-0"
                            aria-hidden="true"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              </div>

              {/* Right: Interactive Morse Plaque Decoder */}
              <div className="lg:sticky lg:top-6 lg:col-span-5">
                <MorsePlaqueDecoder
                  morseWord={activeScene.morseWord}
                  meaningHint={activeScene.morseMeaningHint}
                  solved={isCurrentSceneSolved}
                  muted={muted}
                  onSolved={() => handleSceneSolved(activeScene.id)}
                />
              </div>
            </div>
          </div>
        )}

        {phase === 'ENDING' && (
          <section
            aria-label={activeEnding.title}
            className="mx-auto max-w-4xl space-y-6"
          >
            <SceneArtwork
              src={activeEnding.imageSrc}
              alt={activeEnding.imageAlt}
              ambientEffect={activeEnding.ambientEffect}
              hotspots={activeEnding.hotspots}
              muted={muted}
            />

            <div className="rounded-xl border border-[#2d4036] bg-[#16221c] p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#9fb5a8]">
                <span className="inline-flex items-center gap-1.5 font-medium text-amber-300">
                  {currentEndingId === 'warm_porridge' ? (
                    <Flame className="h-4 w-4" aria-hidden="true" />
                  ) : currentEndingId === 'cold_porridge' ? (
                    <Snowflake className="h-4 w-4 text-sky-300" aria-hidden="true" />
                  ) : (
                    <Compass className="h-4 w-4 text-rose-300" aria-hidden="true" />
                  )}
                  <span>{activeEnding.badgeLabel}</span>
                </span>
                <span className="tabular-nums">
                  Tempo total: {elapsedMinutes} min · Finais descobertos:{' '}
                  {unlockedEndings.length} de 3
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-bold text-[#f4efe6] sm:text-4xl">
                {activeEnding.title}
              </h1>
              <p className="mt-2 text-base font-medium text-[#d8e3dc]">
                {activeEnding.subtitle}
              </p>

              <div className="mt-5 space-y-3 border-t border-[#25362d] pt-5 text-base leading-relaxed text-[#c6d5cc]">
                {activeEnding.paragraphs.map((p, idx) => (
                  <p key={idx} className="max-w-[65ch]">
                    {p}
                  </p>
                ))}
              </div>

              <p className="mt-5 rounded-lg border border-[#2b3d33] bg-[#121c17] px-4 py-3 text-sm text-[#b2c3b9]">
                {activeEnding.summaryNote}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#25362d] pt-6">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#e07a2f] px-6 py-2.5 text-sm font-semibold text-[#111b17] transition-colors hover:bg-[#eb8940] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Reiniciar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('endings')}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#354c3f] bg-[#1b2922] px-4 py-2.5 text-sm font-medium text-[#e4ece7] transition-colors hover:bg-[#23342b] whitespace-nowrap shrink-0"
                >
                  <span>Ver todos os finais ({unlockedEndings.length}/3)</span>
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <ReferenceModal
        activeTab={modalTab}
        unlockedEndings={unlockedEndings}
        muted={muted}
        onClose={() => setModalTab(null)}
        onSwitchTab={(tab) => setModalTab(tab)}
      />
    </div>
  );
}
