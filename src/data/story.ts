import type { ArtworkSoundKind } from '../utils/morse';

export type EndingId = 'lost_in_swamp' | 'cold_porridge' | 'warm_porridge';

export type SceneId =
  | 'chapter_1_owl'
  | 'chapter_2_tortoise'
  | 'chapter_3_fox';

export type AmbientEffect = 'swamp' | 'fog' | 'cold' | 'warm';

export interface ArtworkHotspot {
  id: string;
  label: string;
  xPercent: number;
  yPercent: number;
  description: string;
  sound: ArtworkSoundKind;
  action?: 'toggle_lantern' | 'play_morse';
}

export interface ResidentNote {
  name: string;
  role: string;
  distanceLabel: string;
  quote: string;
  tone: 'trustworthy' | 'suspicious' | 'cautious';
}

export interface StoryChoice {
  id: string;
  label: string;
  detail: string;
  minutesAdded: number;
  outcome:
    | { type: 'next_scene'; sceneId: SceneId }
    | { type: 'ending'; endingId: EndingId }
    | { type: 'resolve_arrival' };
}

export interface StoryScene {
  id: SceneId;
  chapterTitle: string;
  location: string;
  distanceMeters: number;
  totalMeters: number;
  imageSrc: string;
  imageAlt: string;
  ambientEffect: AmbientEffect;
  hotspots: ArtworkHotspot[];
  narrative: string[];
  residents: ResidentNote[];
  morseWord: string;
  morseMeaningHint: string;
  choices: StoryChoice[];
}

export interface EndingData {
  id: EndingId;
  badgeLabel: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  ambientEffect: AmbientEffect;
  hotspots: ArtworkHotspot[];
  paragraphs: string[];
  summaryNote: string;
}

export const STORY_IMAGES = {
  start: '/src/assets/images/cat_swamp_start_animado_1795519916223.jpg',
  signpost: '/src/assets/images/morse_signpost_bog_animado_1795519917003.jpg',
  lost: '/src/assets/images/ending_lost_fog_animado_1795519917953.jpg',
  cold: '/src/assets/images/ending_cold_porridge_animado_1795519918693.jpg',
  warm: '/src/assets/images/ending_warm_porridge_animado_1795519919057.jpg',
};

export const START_HOTSPOTS: ArtworkHotspot[] = [
  {
    id: 'start_lantern',
    label: 'Lanterna do gato',
    xPercent: 38,
    yPercent: 62,
    description:
      'A lanterna brilha mais forte e ilumina o musgo brilhante da passarela!',
    sound: 'lantern',
    action: 'toggle_lantern',
  },
  {
    id: 'start_cat',
    label: 'Gato alaranjado',
    xPercent: 53,
    yPercent: 44,
    description:
      'Miau! De colete e bolsinha pronta, o gato alaranjado está animado para comer mingau com o Sapo de Óculos!',
    sound: 'cat',
  },
  {
    id: 'start_trail',
    label: 'Trilha dos vaga-lumes',
    xPercent: 72,
    yPercent: 48,
    description:
      'Os vaga-lumes dançam sobre a passarela que leva aos moradores afastados do pântano.',
    sound: 'water',
  },
];

export const SCENES: Record<SceneId, StoryScene> = {
  chapter_1_owl: {
    id: 'chapter_1_owl',
    chapterTitle: 'Capítulo 1 · A Borda do Brejo',
    location: 'Passarela Oeste do Pântano',
    distanceMeters: 250,
    totalMeters: 1500,
    imageSrc: STORY_IMAGES.start,
    imageAlt:
      'Desenho animado de um gato alaranjado de colete segurando uma lanterna na passarela de um pântano cheio de vaga-lumes.',
    ambientEffect: 'swamp',
    hotspots: [
      {
        id: 'c1_lantern',
        label: 'Lanterna do gato',
        xPercent: 38,
        yPercent: 62,
        description:
          'A chama da lanterna clareia a beira das tábuas e espanta parte da névoa ao redor da primeira placa.',
        sound: 'lantern',
        action: 'toggle_lantern',
      },
      {
        id: 'c1_cat',
        label: 'Gato atento às vozes',
        xPercent: 53,
        yPercent: 44,
        description:
          'O gato escuta a voz da Coruja Clara lá no alto do cipreste e desconfia do tom apressado do Guaxinim.',
        sound: 'cat',
      },
      {
        id: 'c1_morse',
        label: 'Ouvir sinal da trilha',
        xPercent: 72,
        yPercent: 48,
        description:
          'Toque para ouvir os sinais da Placa 1 em código Morse antes de escolher seu caminho!',
        sound: 'lantern',
        action: 'play_morse',
      },
    ],
    narrative: [
      'O sol começa a se pôr quando você, um gato de pelagem alaranjada, ajeita sua pequena bolsa de couro e acende a lanterna. Seu melhor amigo, o Sapo de Óculos, mandou um bilhete avisando que acabou de colocar o mingau de aveia com mel no fogão.',
      'Os moradores do pântano vivem bem afastados uns dos outros, cada qual em seu canto entre os ciprestes. Logo no primeiro trecho, uma placa antiga entalhada em código Morse aponta para a trilha da esquerda, enquanto uma passarela firme segue pela direita.',
    ],
    residents: [
      {
        name: 'Coruja Clara',
        role: 'Mora no cipreste alto da entrada (120 m atrás)',
        distanceLabel: 'Isolada na copa oeste',
        quote:
          '“As placas em Morse avisam o que há pela frente! Traduza a palavra antes de pisar fora das tábuas. E tome cuidado: o Guaxinim da Névoa adora inventar significados falsos para confundir viajantes.”',
        tone: 'trustworthy',
      },
      {
        name: 'Guaxinim da Névoa',
        role: 'Escondido em um tronco oco à beira da lama',
        distanceLabel: 'Afastado à esquerda da bifurcação',
        quote:
          '“Ei, gatinho laranja! Não ligue para a Coruja. Na língua antiga do pântano, a palavra dessa placa significa atalho macio e seguro! Pode acreditar em mim e entrar pela trilha da esquerda!”',
        tone: 'suspicious',
      },
    ],
    morseWord: 'LAMA',
    morseMeaningHint:
      'A placa entalhada na estaca da esquerda descreve exatamente o que existe naquela trilha.',
    choices: [
      {
        id: 'c1_walkway',
        label: 'Acreditar na Coruja Clara e seguir pela passarela seca à direita',
        detail: 'Você lê o aviso LAMA na placa e evita a trilha traiçoeira.',
        minutesAdded: 10,
        outcome: { type: 'next_scene', sceneId: 'chapter_2_tortoise' },
      },
      {
        id: 'c1_raccoon',
        label: 'Acreditar no Guaxinim da Névoa e seguir pela trilha da placa à esquerda',
        detail: 'Confiar na explicação do Guaxinim de que a trilha é um atalho macio.',
        minutesAdded: 15,
        outcome: { type: 'ending', endingId: 'lost_in_swamp' },
      },
    ],
  },

  chapter_2_tortoise: {
    id: 'chapter_2_tortoise',
    chapterTitle: 'Capítulo 2 · A Ilha do Jabuti',
    location: 'Lagoa Central dos Nenúfares',
    distanceMeters: 850,
    totalMeters: 1500,
    imageSrc: STORY_IMAGES.signpost,
    imageAlt:
      'Desenho animado de um poste de madeira com lanterna acesa em um pântano com pedras sobre a água turquesa e nenúfares.',
    ambientEffect: 'swamp',
    hotspots: [
      {
        id: 'c2_sign',
        label: 'Placa entalhada em Morse',
        xPercent: 17,
        yPercent: 41,
        description:
          'Você bate na placa de madeira e escuta a sequência em código Morse ecoando sobre a lagoa!',
        sound: 'lantern',
        action: 'play_morse',
      },
      {
        id: 'c2_lantern',
        label: 'Lanterna do poste',
        xPercent: 31,
        yPercent: 26,
        description:
          'A lanterna pendurada acende mais forte, revelando a água clara e o caminho pelas pedras.',
        sound: 'lantern',
        action: 'toggle_lantern',
      },
      {
        id: 'c2_stones',
        label: 'Pedras na lagoa',
        xPercent: 68,
        yPercent: 59,
        description:
          'Pedras largas e firmes ligam os dois lados da lagoa — bem mais rápido do que contornar a margem inteira.',
        sound: 'water',
      },
    ],
    narrative: [
      'A passarela de madeira trouxe você com segurança até o coração do pântano, onde os vaga-lumes acendem sob a neblina. O cheiro distante de fumaça de lareira lembra que o mingau do Sapo de Óculos continua esquentando.',
      'Bem distante de qualquer vizinho, sobre uma grande rocha coberta de musgo, vive Seu Jabuti. Perto dele, uma segunda placa em código Morse balança ao lado de duas rotas possíveis para atravessar a lagoa.',
    ],
    residents: [
      {
        name: 'Seu Jabuti',
        role: 'Morador solitário da Ilha de Musgo',
        distanceLabel: 'Isolado no centro da lagoa',
        quote:
          '“Boa noite, gato alaranjado! A placa mostra o caminho mais rápido, mas eu sou muito cauteloso e nunca arrisco atalhos sobre a água. Se quiser ir sem pressa, dê a volta comprida pelo Salgueiro Velho — só aviso que demora bastante!”',
        tone: 'cautious',
      },
    ],
    morseWord: 'PEDRA',
    morseMeaningHint:
      'A placa aponta o material firme da travessia direta sobre a lagoa.',
    choices: [
      {
        id: 'c2_stones',
        label: 'Seguir a placa decifrada (PEDRA) e atravessar pelas pedras firmes',
        detail: 'Travessia direta e ágil sobre a lagoa iluminada pela lanterna.',
        minutesAdded: 10,
        outcome: { type: 'next_scene', sceneId: 'chapter_3_fox' },
      },
      {
        id: 'c2_detour',
        label: 'Ouvir o conselho cauteloso do Seu Jabuti e dar a volta pelo Salgueiro Velho',
        detail: 'Um contorno bem mais longo e seguro ao redor de toda a margem.',
        minutesAdded: 45,
        outcome: { type: 'next_scene', sceneId: 'chapter_3_fox' },
      },
      {
        id: 'c2_reeds',
        label: 'Ignorar a placa e o Jabuti e tentar cortar pelos juncos fechados',
        detail: 'Seguir sem referência alguma pela vegetação densa.',
        minutesAdded: 25,
        outcome: { type: 'ending', endingId: 'lost_in_swamp' },
      },
    ],
  },

  chapter_3_fox: {
    id: 'chapter_3_fox',
    chapterTitle: 'Capítulo 3 · O Córrego da Neblina',
    location: 'Última Bifurcação antes da Cabana',
    distanceMeters: 1320,
    totalMeters: 1500,
    imageSrc: STORY_IMAGES.signpost,
    imageAlt:
      'Desenho animado do último poste em código Morse iluminado por lanterna diante da ponte final do pântano.',
    ambientEffect: 'swamp',
    hotspots: [
      {
        id: 'c3_sign',
        label: 'Placa final em Morse',
        xPercent: 17,
        yPercent: 41,
        description:
          'A última placa transmite o rumo exato da cabana do Sapo de Óculos em código Morse!',
        sound: 'lantern',
        action: 'play_morse',
      },
      {
        id: 'c3_lantern',
        label: 'Lanterna da bifurcação',
        xPercent: 31,
        yPercent: 26,
        description:
          'Sob a luz da lanterna, dá para notar que a placa foi pregada recentemente — nada de placa velha como diz a raposa!',
        sound: 'lantern',
        action: 'toggle_lantern',
      },
      {
        id: 'c3_lilies',
        label: 'Água do córrego',
        xPercent: 68,
        yPercent: 59,
        description:
          'Daqui já se sente um leve perfume de aveia quente trazido pela brisa do Norte.',
        sound: 'water',
      },
    ],
    narrative: [
      'Você está quase atravessando o pântano inteiro. Do outro lado de um riacho escuro, uma última lanterna ilumina o poste final com uma placa em código Morse.',
      'Antes de decidir para qual lado virar, você escuta duas vozes vindas de pontos completamente opostos do brejo: uma bem ao longe, sobre os caniços altos, e outra logo abaixo de uma árvore torta.',
    ],
    residents: [
      {
        name: 'Dona Garça',
        role: 'Moradora da margem leste dos caniços',
        distanceLabel: 'Gritando à distância do outro lado do lago',
        quote:
          '“Vi a luz da cozinha do Sapo de Óculos agora há pouco! A cabana dele fica exatamente na direção marcada pela última placa. Não se deixe enganar!”',
        tone: 'trustworthy',
      },
      {
        name: 'Raposa-do-Brejo',
        role: 'Sentada numa raiz retorcida perto do riacho',
        distanceLabel: 'Afastada na sombra da margem sul',
        quote:
          '“Psiu, gatinho! O Sapo de Óculos teve goteira no telhado e mudou de cabana hoje de manhã! Essa placa está velha — siga para o Sul agora mesmo se quiser comer mingau!”',
        tone: 'suspicious',
      },
    ],
    morseWord: 'NORTE',
    morseMeaningHint:
      'A última placa indica o ponto cardeal exato onde fica a cabana do Sapo de Óculos.',
    choices: [
      {
        id: 'c3_sign',
        label: 'Confiar na Dona Garça, seguir a placa (NORTE) e ir para o Norte',
        detail: 'Ignorar a história da raposa e seguir a direção verdadeira.',
        minutesAdded: 10,
        outcome: { type: 'resolve_arrival' },
      },
      {
        id: 'c3_fox',
        label: 'Acreditar na Raposa-do-Brejo e seguir para o Sul na neblina',
        detail: 'Ir atrás da suposta cabana nova indicada pela raposa.',
        minutesAdded: 20,
        outcome: { type: 'ending', endingId: 'lost_in_swamp' },
      },
    ],
  },
};

export const ENDINGS: Record<EndingId, EndingData> = {
  lost_in_swamp: {
    id: 'lost_in_swamp',
    badgeLabel: 'Final 1 de 3 · Caminho Errado',
    title: 'Perdido no Pântano',
    subtitle: 'Você acreditou no animal errado e se afastou da trilha segura.',
    imageSrc: STORY_IMAGES.lost,
    imageAlt:
      'Desenho animado do gato alaranjado confuso levantando as patas no meio da névoa roxa do pântano sob a lua crescente.',
    ambientEffect: 'fog',
    hotspots: [
      {
        id: 'e1_cat',
        label: 'Gato perdido',
        xPercent: 51,
        yPercent: 47,
        description:
          'Miau...! O gato gira as orelhas procurando alguma placa ou voz amigável no brejo.',
        sound: 'cat',
      },
      {
        id: 'e1_mist',
        label: 'Espiral de neblina',
        xPercent: 22,
        yPercent: 61,
        description:
          'A neblina fria cobre o caminho de volta e esconde todas as marcas nas árvores.',
        sound: 'mist',
      },
      {
        id: 'e1_moon',
        label: 'Lua crescente',
        xPercent: 31,
        yPercent: 20,
        description:
          'A noite chegou rápido. Vale tentar novamente desconfiando dos animais enganadores!',
        sound: 'lantern',
      },
    ],
    paragraphs: [
      'Acreditando em quem não devia, você deixou a trilha marcada pelas placas e deu poucos passos antes que a neblina fechasse tudo ao redor. Os troncos parecem todos iguais, a lanterna ilumina apenas juncos altos e o som da água não revela direção alguma.',
      'Sem conseguir enxergar os postes nem ouvir os moradores corretos, o gato alaranjado acabou completamente perdido no meio do pântano — e o mingau na casa do Sapo de Óculos ficou esperando para outro dia.',
    ],
    summaryNote: 'Dica: compare o que cada morador diz com a tradução exata das placas em código Morse.',
  },

  cold_porridge: {
    id: 'cold_porridge',
    badgeLabel: 'Final 2 de 3 · Chegada Atrasada',
    title: 'O Mingau Esfriou',
    subtitle: 'Você traduziu as placas certas e chegou em segurança, mas tarde demais.',
    imageSrc: STORY_IMAGES.cold,
    imageAlt:
      'Desenho animado do gato alaranjado e do sapo de óculos tristes diante de uma tigela de mingau frio na cabana.',
    ambientEffect: 'cold',
    hotspots: [
      {
        id: 'e2_cat',
        label: 'Gato desanimado',
        xPercent: 27,
        yPercent: 53,
        description:
          'O gato olha pensativo para a mesa; a volta comprida pelo Salgueiro Velho atrasou demais a chegada.',
        sound: 'cat',
      },
      {
        id: 'e2_bowl',
        label: 'Tigela de mingau frio',
        xPercent: 45,
        yPercent: 64,
        description:
          'Sem nenhum fio de vapor... o mingau já esfriou completamente depois da longa espera.',
        sound: 'water',
      },
      {
        id: 'e2_frog',
        label: 'Sapo de Óculos',
        xPercent: 75,
        yPercent: 53,
        description:
          'Croac! O Sapo de Óculos comenta que o caminho pelas pedras era seguro e muito mais rápido.',
        sound: 'frog',
      },
    ],
    paragraphs: [
      'Quando você finalmente bateu à porta da cabana, o Sapo de Óculos abriu com um sorriso aliviado e ajeitou os óculos redondos. Vocês não se perderam no pântano — todas as placas apontaram o rumo certo até ali.',
      'Mas a volta comprida pelo Salgueiro Velho levou tempo demais. Sobre a mesa iluminada pela lanterna, as tigelas de mingau já não soltavam nenhum fio de vapor. Os dois amigos se olharam suspirando diante do mingau frio.',
    ],
    summaryNote: 'Dica: o Seu Jabuti deu um conselho seguro, mas lento. Tente confiar nas placas rápidas para chegar a tempo.',
  },

  warm_porridge: {
    id: 'warm_porridge',
    badgeLabel: 'Final 3 de 3 · Melhor Desfecho',
    title: 'Mingau Quentinho com o Sapo',
    subtitle: 'Você traduziu todas as placas, evitou os enganadores e chegou na hora certa!',
    imageSrc: STORY_IMAGES.warm,
    imageAlt:
      'Desenho animado do gato alaranjado e do sapo de óculos sorrindo e comendo tigelas fumegantes de mingau ao lado da lareira.',
    ambientEffect: 'warm',
    hotspots: [
      {
        id: 'e3_hearth',
        label: 'Lareira acesa',
        xPercent: 16,
        yPercent: 57,
        description:
          'As brasas crepitam alegremente e aquecem a cabana inteira após a travessia do pântano.',
        sound: 'fire',
        action: 'toggle_lantern',
      },
      {
        id: 'e3_bowls',
        label: 'Mingau fumegante',
        xPercent: 47,
        yPercent: 68,
        description:
          'Quentinho, cremoso e adoçado com mel! Cada colherada tem sabor de vitória.',
        sound: 'porridge',
      },
      {
        id: 'e3_frog',
        label: 'Sapo de Óculos feliz',
        xPercent: 73,
        yPercent: 53,
        description:
          'Croac feliz! O Sapo de Óculos comemora sua leitura certeira das placas em código Morse.',
        sound: 'frog',
      },
    ],
    paragraphs: [
      'Seguindo cada placa em código Morse e confiando apenas nos moradores verdadeiros do pântano, você cruzou a ponte final exatamente quando o relógio da cozinha bateu a hora do jantar.',
      'O Sapo de Óculos abriu a porta dando risada, serviu duas tigelas generosas de mingau cremoso e fumegante diante da lareira acesa, e os dois amigos comeram felizes enquanto ouviam a brisa do pântano lá fora.',
    ],
    summaryNote: 'Parabéns! Você desvendou todo o pântano sem cair em armadilhas e sem atrasos.',
  },
};

export function getPorridgeStatus(elapsedMinutes: number): {
  label: string;
  percent: number;
  toneClass: string;
  barClass: string;
} {
  if (elapsedMinutes <= 30) {
    return {
      label: 'Quente e fumegante',
      percent: Math.max(68, 100 - elapsedMinutes),
      toneClass: 'text-amber-300',
      barClass: 'bg-amber-500',
    };
  }
  if (elapsedMinutes <= 50) {
    return {
      label: 'Esfriando rápido',
      percent: 42,
      toneClass: 'text-orange-300',
      barClass: 'bg-orange-500',
    };
  }
  return {
    label: 'Frio na tigela',
    percent: 16,
    toneClass: 'text-sky-300',
    barClass: 'bg-sky-400',
  };
}
