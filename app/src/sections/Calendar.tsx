import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { GlitchCard } from '../components/GlitchCard';
import { supabase, type Stage as DBStage } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

interface Stage {
  day: string;
  month: string;
  name: string;
  location: string;
  active: boolean;
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function Calendar() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Fetch stages from Supabase
  useEffect(() => {
    const fetchStages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .order('stage_number');

      if (error) {
        console.error('Error fetching stages:', error);
      } else if (data) {
        setStages(data.map((s: DBStage) => {
          const date = new Date(s.date);
          return {
            day: date.getDate().toString().padStart(2, '0'),
            month: MONTHS[date.getMonth()],
            name: s.name,
            location: s.location,
            active: s.is_active
          };
        }));
      }
      setLoading(false);
    };
    fetchStages();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, x: -80 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            once: true
          }
        }
      );

      // Cards stagger animation
      const cards = cardsContainerRef.current?.querySelectorAll('.stage-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 60, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: cardsContainerRef.current,
              start: 'top 80%',
              once: true
            }
          }
        );
      }

      // Racing stripe animation
      gsap.to('.racing-stripe-calendar', {
        backgroundPosition: '200% 0',
        duration: 3,
        repeat: -1,
        ease: 'none'
      });

    }, section);

    return () => ctx.revert();
  }, []);

  const scrollCards = (direction: 'left' | 'right') => {
    const container = cardsContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <section
      ref={sectionRef}
      id="calendar"
      className="py-16 md:py-24 bg-gray-50 dark:bg-[#1a1a1a] relative overflow-hidden"
    >
      {/* Racing stripe decoration */}
      <div
        className="racing-stripe-calendar absolute top-0 left-0 right-0 h-2"
        style={{
          background: 'linear-gradient(90deg, #ff4422 0%, #ff4422 25%, white 25%, white 30%, #ff4422 30%, #ff4422 35%, white 35%, white 40%, #ff4422 40%, #ff4422 100%)',
          backgroundSize: '200% 100%'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="relative">
            <h2
              ref={titleRef}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-bold uppercase italic text-[#303285] dark:text-white flex items-center leading-none tracking-tighter"
              style={{ fontFamily: 'Teko, sans-serif' }}
            >
              <span className="w-3 h-12 md:h-16 bg-[#ff4422] mr-4 inline-block transform -skew-x-12 shadow-[0_0_15px_rgba(255,68,34,0.5)]" />
              Etapas 2026
            </h2>
            <div className="h-1 w-full bg-gradient-to-r from-[#ff4422] to-transparent mt-2 opacity-50" />
          </div>

          {/* Navigation arrows - RACING STYLE */}
          <div className="flex space-x-4 self-end md:self-auto">
            <button
              onClick={() => scrollCards('left')}
              className="group p-4 bg-white/5 dark:bg-white/10 backdrop-blur-md text-[#303285] dark:text-white rounded-xl 
                         border border-white/20 shadow-xl
                         hover:bg-[#ff4422] hover:text-white hover:border-[#ff4422] hover:shadow-[#ff4422]/40
                         active:scale-90
                         transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              aria-label="Etapa anterior"
            >
              <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollCards('right')}
              className="group p-4 bg-white/5 dark:bg-white/10 backdrop-blur-md text-[#303285] dark:text-white rounded-xl 
                         border border-white/20 shadow-xl
                         hover:bg-[#ff4422] hover:text-white hover:border-[#ff4422] hover:shadow-[#ff4422]/40
                         active:scale-90
                         transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              aria-label="Próxima etapa"
            >
              <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Cards container */}
        <div
          ref={cardsContainerRef}
          className="flex overflow-x-auto space-x-8 pb-12 px-4 scrollbar-hide snap-x snap-mandatory mask-fade-edges"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {stages.map((stage, index) => (
            <GlitchCard
              key={index}
              className="stage-card snap-start flex-shrink-0"
              intensity={stage.active ? 'high' : 'low'}
            >
              <div
                className={`
                  relative group/card
                  bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden
                  border border-white/20 dark:border-white/10
                  w-64 h-80
                  flex flex-col
                  shadow-[0_8px_32px_rgba(0,0,0,0.12)]
                  transition-all duration-500 cubic-bezier(0.34,1.56,0.64,1)
                  hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]
                  ${stage.active ? 'ring-2 ring-[#ff4422] ring-offset-4 ring-offset-gray-50 dark:ring-offset-[#1a1a1a] scale-105 z-10' : 'opacity-80 hover:opacity-100'}
                `}
              >
                {/* Visual Accent for Active Stage */}
                {stage.active && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ff4422]/10 to-transparent pointer-events-none" />
                )}

                {/* Top decorative bar */}
                <div
                  className={`h-1.5 flex-shrink-0 ${stage.active ? 'bg-[#ff4422] shadow-[0_0_10px_#ff4422]' : 'bg-gray-200 dark:bg-gray-800'}`}
                />

                {/* Card Content */}
                <div className="p-6 text-center flex flex-col flex-grow items-center">
                  {/* Date Section */}
                  <div className="relative mb-4">
                    <div className="flex items-baseline justify-center">
                      <span
                        className={`font-display font-bold text-7xl leading-none tracking-tighter ${stage.active ? 'text-[#ff4422] drop-shadow-[0_0_10px_rgba(255,68,34,0.3)]' : 'text-[#303285] dark:text-gray-300'
                          }`}
                        style={{ fontFamily: 'Teko, sans-serif' }}
                      >
                        {stage.day}
                      </span>
                    </div>
                    <div
                      className={`text-sm font-bold uppercase tracking-[0.2em] -mt-1 ${stage.active ? 'text-[#ff4422]' : 'text-gray-500'}`}
                    >
                      {stage.month}
                    </div>
                  </div>

                  {/* Separator with dynamic width */}
                  <div className={`h-[1px] w-1/2 mx-auto transition-all duration-500 group-hover/card:w-full ${stage.active ? 'bg-[#ff4422]/40' : 'bg-gray-200 dark:bg-gray-800'} my-4`} />

                  {/* Stage Info */}
                  <div className="flex-grow flex flex-col justify-center w-full">
                    <h3 className="text-lg font-black text-[#303285] dark:text-white uppercase line-clamp-2 leading-tight mb-2 flex items-center justify-center gap-2">
                      <CalendarIcon className={`${stage.active ? 'text-[#ff4422]' : 'text-[#303285]/60'} flex-shrink-0 size-4`} />
                      {stage.name}
                    </h3>
                    <div
                      className={`font-display text-xl uppercase italic flex items-center justify-center gap-2 ${stage.active ? 'text-[#ff4422]' : 'text-gray-600 dark:text-gray-400'
                        }`}
                      style={{ fontFamily: 'Teko, sans-serif' }}
                    >
                      <MapPin size={16} className="text-[#ff4422]" />
                      {stage.location}
                    </div>
                  </div>

                  {/* Action Button / Badge */}
                  <div className="mt-4 w-full h-12 flex items-center justify-center">
                    {stage.active ? (
                      <button
                        className="w-full py-2.5 
                                   bg-[#ff4422] text-white rounded-lg text-lg font-bold uppercase italic
                                   shadow-[0_4px_15px_rgba(255,68,34,0.4)]
                                   hover:bg-[#ff5533] hover:shadow-[0_8px_25px_rgba(255,68,34,0.5)]
                                   transition-all duration-300 transform active:scale-95
                                   flex items-center justify-center gap-2"
                        style={{ fontFamily: 'Teko, sans-serif', letterSpacing: '0.05em' }}
                      >
                        <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                        PRÓXIMA ETAPA
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                        ETAPA CONCLUÍDA
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </GlitchCard>
          ))}
        </div>

        {/* Improved Progress Dots */}
        <div className="flex justify-center mt-4 gap-3">
          {stages.map((stage, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all duration-500 
                ${stage.active 
                  ? 'bg-[#ff4422] w-12 shadow-[0_0_10px_#ff4422]' 
                  : 'bg-gray-300 dark:bg-gray-700 w-3 hover:bg-[#ff4422]/30'
                }`}
              onClick={() => {
                cardsContainerRef.current?.children[index].scrollIntoView({ behavior: 'smooth', inline: 'center' });
              }}
            />
          ))}
        </div>
      </div>


      {/* Background decoration */}
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-[#ff4422]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-[#303285]/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
}

export default Calendar;
