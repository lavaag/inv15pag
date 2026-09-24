import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Trophy, Sparkles, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TriviaQuestion } from '../types';

const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 1,
    pregunta: '¿Cuál es la comida favorita indiscutida de Sofía?',
    opciones: [
      'Sushi y rolls gourmet',
      'Hamburguesa con cheddar y papas fritas',
      'Asado en familia de domingo',
      'Pastas caseras con salsa bolognesa'
    ],
    respuestaCorrecta: 1,
    explicacion: '¡Exacto! Las hamburguesas con cheddar y papas son su debilidad absoluta.'
  },
  {
    id: 2,
    pregunta: '¿Qué es lo que más le gusta hacer en su tiempo libre?',
    opciones: [
      'Escuchar música y bailar con sus amigas',
      'Hacer maratón de series acostada',
      'Entrenar y hacer deportes',
      'Pintar y hacer manualidades'
    ],
    respuestaCorrecta: 0,
    explicacion: '¡Totalmente! La música y bailar con sus mejores amigas es su momento favorito.'
  },
  {
    id: 3,
    pregunta: '¿A dónde sueña viajar para celebrar sus 15?',
    opciones: [
      'Recorrer los parques de Disney en Orlando',
      'Playas de aguas turquesas del Caribe',
      'Nieve y paisajes de Bariloche',
      'Un tour por capitales europeas'
    ],
    respuestaCorrecta: 1,
    explicacion: '¡Playa, sol y mar turquesa en el Caribe es el gran sueño de Sofi!'
  },
  {
    id: 4,
    pregunta: '¿Cuál es su color favorito para vestir de fiesta?',
    opciones: [
      'Rosa pastel y lila',
      'Negro con brillos plateados y corset',
      'Rojo fuego',
      'Verde esmeralda'
    ],
    respuestaCorrecta: 1,
    explicacion: '¡Reina del estilo! El negro elegante con destellos plateados como en su book de 15.'
  },
  {
    id: 5,
    pregunta: '¿Qué no puede faltar en su noche mágica en Clahe Eventos?',
    opciones: [
      'Que nadie se quede sentado y la pista explote',
      'Fotos en todos los espejos del salón',
      'El momento del vals con su familia',
      '¡Todas las anteriores juntas!'
    ],
    respuestaCorrecta: 3,
    explicacion: '¡Obvio! ¡Una noche soñada con fotos, vals y la pista llena de energía hasta las 5 de la mañana!'
  }
];

export const TriviaSection: React.FC = () => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = TRIVIA_QUESTIONS[currentQuestionIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.respuestaCorrecta) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx + 1 < TRIVIA_QUESTIONS.length) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <section className="py-16 px-4 relative">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-xs font-semibold tracking-widest uppercase mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Juego Interactivo</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif text-white font-medium mb-3">
          ¿Cuánto conocés a Sofía?
        </h2>
        <p className="text-sm text-slate-300 max-w-md mx-auto mb-8">
          Poné a prueba tu conocimiento sobre la cumpleañera antes de la gran noche.
        </p>

        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#161438]/90 to-[#0e0e24]/90 border border-purple-400/30 shadow-2xl backdrop-blur-md relative overflow-hidden text-left">
          {isFinished ? (
            /* Result screen */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 animate-bounce">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>

              <div>
                <h3 className="text-2xl font-serif font-bold text-white mb-1">
                  {score >= 4 ? '¡Sos de su círculo íntimo! 💖' : '¡Muy buen intento! 🎉'}
                </h3>
                <p className="text-base text-amber-300 font-semibold">
                  Acertaste {score} de {TRIVIA_QUESTIONS.length} preguntas
                </p>
                <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto">
                  {score >= 4
                    ? 'Se nota que conocés a Sofi de memoria. ¡El 10 de octubre lo van a celebrar a lo grande en Clahe!'
                    : '¡El 10 de octubre vas a tener la oportunidad de conocerla aún más y disfrutar juntos!'}
                </p>
              </div>

              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#201d4a] hover:bg-[#2b2763] text-purple-200 border border-purple-400/40 text-xs font-semibold transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Jugar de nuevo</span>
              </button>
            </div>
          ) : (
            /* Question screen */
            <div className="space-y-6">
              {/* Progress bar */}
              <div className="flex items-center justify-between text-xs text-purple-300 font-medium">
                <span>Pregunta {currentQuestionIdx + 1} de {TRIVIA_QUESTIONS.length}</span>
                <span>Puntos: {score}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-amber-400 transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / TRIVIA_QUESTIONS.length) * 100}%` }}
                ></div>
              </div>

              {/* Question text */}
              <h3 className="text-lg sm:text-xl font-semibold text-white leading-relaxed">
                {currentQ.pregunta}
              </h3>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.opciones.map((opcion, idx) => {
                  let btnStyle = 'bg-[#1a1740] border-slate-700/70 hover:border-purple-400 text-slate-200';
                  if (isAnswered) {
                    if (idx === currentQ.respuestaCorrecta) {
                      btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-semibold';
                    } else if (idx === selectedOption) {
                      btnStyle = 'bg-rose-950/70 border-rose-500 text-rose-200';
                    } else {
                      btnStyle = 'bg-[#151233]/50 border-slate-800 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm text-left flex items-center justify-between transition-all duration-200 ${btnStyle}`}
                    >
                      <span>{opcion}</span>
                      {isAnswered && idx === currentQ.respuestaCorrecta && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                      )}
                      {isAnswered && idx === selectedOption && idx !== currentQ.respuestaCorrecta && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next */}
              {isAnswered && (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-300 italic">
                    {currentQ.explicacion}
                  </p>
                  <button
                    onClick={handleNext}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md shrink-0"
                  >
                    {currentQuestionIdx + 1 === TRIVIA_QUESTIONS.length ? 'Ver Resultado' : 'Siguiente'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
