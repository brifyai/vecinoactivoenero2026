import React from 'react';
import { Search, MessageCircle, Bell, Heart, ChevronLeft, ChevronRight, Star, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingDesignLab = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden selection:bg-[#F8E158] selection:text-black">
      {/* --- HEADER --- */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-4 h-4 border-[2.5px] border-white rotate-45"></div>
          </div>
          <span className="text-xl font-black tracking-tighter">Vecino Activo</span>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide cursor-pointer hover:opacity-70 transition-opacity">
            <img src="https://flagcdn.com/w20/cl.png" className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm" alt="es" />
            <span>Español</span>
            <ChevronRight size={14} className="rotate-90 text-gray-400" />
          </div>
          
          <div className="flex items-center gap-6 text-gray-400">
            <Search size={20} className="cursor-pointer hover:text-black hover:scale-110 transition-all" />
            
            <div className="relative group cursor-pointer">
              <MessageCircle size={20} className="group-hover:text-black group-hover:scale-110 transition-all" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF4F4F] rounded-full border-2 border-white"></span>
            </div>
            
            <Heart size={20} className="cursor-pointer hover:text-black hover:scale-110 transition-all" />
            
            <div className="relative group cursor-pointer">
              <Bell size={20} className="group-hover:text-black group-hover:scale-110 transition-all" />
              <span className="absolute -top-2 -right-1.5 bg-[#FF4F4F] text-[9px] text-white px-1 h-4 min-w-[16px] flex items-center justify-center rounded-full border-2 border-white font-bold shadow-sm">1</span>
            </div>
            
            <div className="flex items-center gap-3 border-l-2 border-gray-100 pl-6 cursor-pointer group">
              <div className="w-9 h-9 bg-[#F2F4F7] rounded-full overflow-hidden border-2 border-white ring-1 ring-gray-100 group-hover:ring-black transition-all">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Eveline&mouth=smile&top=longHair&hairColor=2c1b18" alt="Avatar" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-black group-hover:text-black transition-colors">Eveline</span>
                <ChevronRight size={14} className="rotate-90 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-6 py-16">
        {/* --- HERO --- */}
        <section className="mb-24">
          <h1 className="text-[5.5rem] font-black leading-[0.92] tracking-[-0.04em] max-w-4xl mb-16 text-gray-900">
            Únete a la Comunidad de Vecinos 
            <span className="inline-flex items-center justify-center border-[2.5px] border-black rounded-full px-8 py-1 h-[0.8em] align-middle -translate-y-3 mx-2 text-[0.4em] font-black uppercase tracking-widest bg-white">
              más
            </span>
            Activa de Chile
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <StatCard color="bg-[#F8E158]" number="39K+" label="vecinos" icon="arrow" />
            <StatCard color="bg-[#F59ABC]" number="230+" label="grupos" icon="arrow" />
            <StatCard color="bg-[#A798C5]" number="50+" label="eventos" icon="arrow" />
            <StatCard color="bg-white" number="4.9" label="320+ valoraciones" icon="star" border isRating />
          </div>
        </section>

        {/* --- POPULAR GROUPS --- */}
        <SectionHeader title="Grupos Populares" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-28">
          <GroupCard 
            title="Deportes" 
            active="hace 2 días" 
            members="10K Miembros" 
            type="GRUPO PRIVADO" 
            illustration={<IllustrationMobileApps />}
          />
          <GroupCard 
            title="Cultura" 
            active="hace 15 días" 
            members="872 Miembros" 
            type="GRUPO PRIVADO" 
            illustration={<IllustrationReadymag />}
          />
          <GroupCard 
            title="Seguridad" 
            active="hace 1 mes" 
            members="300 Miembros" 
            type="GRUPO PÚBLICO" 
            illustration={<IllustrationUXResearch />}
          />
        </div>

        {/* --- CTA SECTION --- */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-20 mb-28">
          <div className="flex-1 max-w-2xl">
            <h2 className="text-[4.5rem] font-black leading-[0.95] mb-10 tracking-[-0.03em]">
              Eleva tu Experiencia Vecinal 
              <span className="text-gray-200">y</span> 
              <span className="text-[#6B8E7E]"> Conecta con Vecinos que Comparten tus Intereses</span> 
              en Vecino Activo
            </h2>
            <button 
              onClick={() => navigate('/register')}
              className="group bg-[#6B8E7E] text-white pl-8 pr-2 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_-10px_rgba(107,142,126,0.5)] hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-6"
            >
              Buscar Vecinos
              <span className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-[#6B8E7E] transition-colors">
                <ChevronRight size={18} />
              </span>
            </button>
          </div>
          
          <div className="relative w-full md:w-[500px] h-[400px] flex items-center justify-center">
            <div className="absolute top-0 right-16 animate-float-slow">
              <ProfessionalAvatar seed="Aneka" color="border-[#F59ABC]" />
            </div>
            <div className="absolute top-28 left-8 animate-float-medium">
              <ProfessionalAvatar seed="Felix" color="border-[#F8E158]" />
            </div>
            <div className="absolute bottom-16 left-12 animate-float-fast">
              <ProfessionalAvatar seed="George" color="border-[#A798C5]" />
            </div>
            <div className="absolute bottom-6 right-24 animate-float-slow">
              <ProfessionalAvatar seed="S" color="border-gray-200" />
            </div>
            
            <div className="w-64 h-64 rounded-full bg-[#F8E158] flex flex-col items-center justify-center text-center shadow-[0_20px_50px_-12px_rgba(248,225,88,0.5)] z-10 border-[8px] border-white relative">
              <span className="text-[3.5rem] font-black leading-none mb-1">17K+</span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">vecinos activos</span>
              <Star size={24} fill="black" stroke="none" className="absolute -top-2 right-10 rotate-12" />
              <Star size={16} fill="black" stroke="none" className="absolute bottom-8 left-6 -rotate-12" />
            </div>
          </div>
        </section>

        {/* --- NEW COURSES --- */}
        <SectionHeader title="Nuevos Eventos" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-28">
          <CourseCard 
            badge="DEPORTES"
            badgeColor="bg-[#F59ABC]"
            title="Torneo de Fútbol Vecinal"
            author="Carlos Mendoza"
            price="Gratis"
            illustration={<IllustrationCourseFigma />}
          />
          <CourseCard 
            badge="CULTURA"
            badgeColor="bg-[#F8E158]"
            title="Taller de Pintura Comunitaria"
            author="María González"
            price="$5.000"
            illustration={<IllustrationCourseCreative />}
          />
        </div>

        {/* --- CONFERENCE BANNER --- */}
        <div className="bg-white border-[2px] border-gray-100 rounded-[48px] p-14 mb-28 shadow-sm flex flex-col md:flex-row items-center gap-20 overflow-hidden relative group hover:border-gray-200 transition-colors">
          <div className="flex-1 z-10 relative">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-[#6B8E7E] rounded-full animate-pulse"></div>
              <p className="text-[#6B8E7E] font-black text-xs uppercase tracking-[0.2em]">Feb 27 - Mar 2, 2026</p>
            </div>
            <h2 className="text-[3.8rem] font-black mb-8 tracking-tighter leading-[0.95]">
              Gran Encuentro Vecinal '26
            </h2>
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-[11px] text-gray-400 font-black uppercase tracking-widest mb-12">
              <span className="border-b-2 border-dotted border-gray-200 pb-1 hover:text-black hover:border-black transition-colors cursor-pointer">
                Santiago, Chile
              </span>
              <span className="border-b-2 border-dotted border-gray-200 pb-1 hover:text-black hover:border-black transition-colors cursor-pointer">
                Centro Comunitario
              </span>
            </div>
            <button 
              onClick={() => navigate('/register')}
              className="bg-[#6B8E7E] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#6B8E7E]/20 hover:bg-black transition-colors hover:-translate-y-1 transform"
            >
              Registrarse
            </button>
          </div>
          <div className="w-full md:w-1/2 flex justify-center scale-[1.35] translate-y-10 translate-x-4">
            <IllustrationConference />
          </div>
        </div>

        {/* --- LATEST NEWS --- */}
        <SectionHeader title="Últimas Noticias" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <NewsCard 
            tag="TECNOLOGÍA"
            title="Cómo Usar la App Vecino Activo al Máximo"
            desc="Descubre todas las funcionalidades de nuestra plataforma y conecta mejor con tu comunidad. Aprende tips y trucos para sacar el máximo provecho..."
            date="27 de Abril, 2026"
            comments="18 Comentarios"
            author="Timothy Stuart"
            illustration={<IllustrationNewsLMS />}
          />
          <NewsCard 
            tag="COMUNIDAD"
            title="Historias de Éxito: Vecinos que Transformaron su Barrio"
            desc="Conoce las inspiradoras historias de vecinos que lograron mejorar su comunidad a través de la colaboración y el trabajo en equipo..."
            date="13 de Enero, 2026"
            comments="5 Comentarios"
            author="Anthony Clark"
            illustration={<IllustrationNewsPortfolio />}
          />
        </div>
      </main>

      <footer className="py-16 px-6 text-center border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-center gap-2 mb-6 opacity-40 grayscale">
          <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-white rotate-45"></div>
          </div>
          <span className="text-lg font-black tracking-tighter">Vecino Activo</span>
        </div>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">
          Vecino Activo © 2026. Todos los derechos reservados.
        </p>
      </footer>

      <style>{`
        @keyframes float-slow { 
          0%, 100% { transform: translateY(0); } 
          50% { transform: translateY(-10px); } 
        }
        @keyframes float-medium { 
          0%, 100% { transform: translateY(0); } 
          50% { transform: translateY(-15px); } 
        }
        @keyframes float-fast { 
          0%, 100% { transform: translateY(0); } 
          50% { transform: translateY(-8px); } 
        }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

/* --- UI COMPONENTS --- */
const StatCard = ({ color, number, label, icon, border, isRating }) => (
  <div className={`${color} p-8 rounded-[40px] ${border ? 'border-[2px] border-gray-100' : ''} shadow-sm flex flex-col justify-between h-[280px] group hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden`}>
    <div className="flex justify-end relative z-10">
      <div className={`w-11 h-11 ${icon === 'star' ? 'bg-black' : 'bg-black'} rounded-2xl flex items-center justify-center text-white transition-transform group-hover:rotate-45 duration-300 shadow-sm`}>
        {icon === 'arrow' && <ChevronRight size={20} className="-rotate-45" strokeWidth={3} />}
        {icon === 'star' && <Star size={18} fill="white" stroke="white" />}
      </div>
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[4rem] font-black tracking-tighter leading-none">{number}</span>
        {isRating && <Star size={28} fill="#F8E158" stroke="#F8E158" className="animate-pulse" />}
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60">{label}</p>
    </div>
    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
  </div>
);

const SectionHeader = ({ title }) => (
  <div className="flex items-center justify-between mb-10">
    <h3 className="text-[2.8rem] font-black tracking-tighter">{title}</h3>
    <div className="flex gap-3">
      <button className="w-12 h-12 rounded-full border-[2px] border-gray-100 flex items-center justify-center text-gray-300 hover:text-black hover:border-black transition-all">
        <ChevronLeft size={24} strokeWidth={3} />
      </button>
      <button className="w-12 h-12 rounded-full border-[2px] border-gray-100 flex items-center justify-center text-black bg-white shadow-sm hover:scale-105 transition-transform">
        <ChevronRight size={24} strokeWidth={3} />
      </button>
    </div>
  </div>
);

const GroupCard = ({ title, active, members, type, illustration }) => (
  <div className="bg-white border-[2px] border-gray-100 rounded-[48px] p-8 shadow-sm flex flex-col h-full group hover:shadow-xl hover:border-gray-200 transition-all duration-300">
    <div className="flex justify-between items-start mb-8">
      <div>
        <span className="text-[10px] font-black text-[#6B8E7E] bg-[#E8F1EC] px-4 py-2 rounded-full uppercase tracking-widest">
          {type}
        </span>
        <h4 className="text-[2rem] font-black mt-5 tracking-tight leading-none group-hover:text-[#6B8E7E] transition-colors">
          {title}
        </h4>
        <p className="text-[10px] font-black text-gray-300 mt-3 uppercase tracking-widest">
          Activo {active} • {members}
        </p>
      </div>
      <button className="text-gray-300 hover:text-black transition-colors p-2 hover:bg-gray-50 rounded-full">
        <MoreVertical size={24} />
      </button>
    </div>
    <div className="bg-[#F8F9FB] rounded-[36px] flex-1 min-h-[240px] flex items-center justify-center p-6 border border-gray-50 group-hover:scale-[1.02] transition-transform duration-500 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      {illustration}
    </div>
  </div>
);

const CourseCard = ({ badge, badgeColor, title, author, price, illustration }) => (
  <div className="bg-[#F8F9FB] rounded-[56px] p-12 flex flex-col h-full group hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-gray-100 relative overflow-hidden">
    <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex justify-between mb-8">
        <span className={`${badgeColor} text-[10px] font-black px-6 py-2.5 rounded-full uppercase tracking-widest shadow-sm`}>
          {badge}
        </span>
      </div>
      <h4 className="text-[2.5rem] font-black mb-4 tracking-tighter leading-[1]">{title}</h4>
      <div className="flex items-center gap-4 text-[11px] font-black text-gray-300 mb-12 uppercase tracking-widest">
        <span className="flex items-center gap-1.5 text-black bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-100">
          4.5 <Star size={12} fill="#F8E158" stroke="#F8E158" />
        </span>
        <span>• 6 Sesiones</span>
        <span>• 21 Participantes</span>
      </div>
      <div className="bg-white rounded-[40px] flex-1 min-h-[300px] mb-10 flex items-center justify-center shadow-sm border border-gray-100 overflow-hidden group-hover:scale-[1.01] transition-transform">
        {illustration}
      </div>
      <div className="flex items-center justify-between">
        <button className="bg-black text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#6B8E7E] transition-colors shadow-lg shadow-black/10">
          {price}
        </button>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Por {author}</span>
          <div className="w-14 h-14 bg-white rounded-full overflow-hidden border-[3px] border-white shadow-md">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${author}&mouth=smile&top=shortHair`} alt="author" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProfessionalAvatar = ({ seed, color }) => (
  <div className={`w-16 h-16 rounded-full border-[3px] border-dashed ${color} p-1 bg-white shadow-lg`}>
    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&mouth=smile&top=shortHair`} className="rounded-full bg-gray-50" alt="pro" />
  </div>
);

const NewsCard = ({ tag, title, desc, date, comments, author, illustration }) => (
  <div className="bg-[#F8F9FB] rounded-[56px] p-12 flex flex-col h-full group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-gray-100">
    <div className="bg-white rounded-[40px] h-[340px] mb-12 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm relative group-hover:scale-[1.01] transition-transform">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="black" strokeWidth="2" fill="none" strokeDasharray="5,5"/>
        </svg>
      </div>
      {illustration}
    </div>
    <span className="text-[#A798C5] text-[11px] font-black mb-6 uppercase tracking-[0.3em] px-2">{tag}</span>
    <h4 className="text-[2.5rem] font-black mb-6 tracking-tighter leading-[1.05] group-hover:text-[#A798C5] transition-colors px-2">
      {title}
    </h4>
    <p className="text-sm text-gray-400 font-bold mb-14 leading-relaxed uppercase tracking-wide px-2 max-w-lg">
      {desc}
    </p>
    <div className="mt-auto pt-10 border-t border-gray-200 flex items-center justify-between text-[11px] font-black text-gray-300 uppercase tracking-widest px-2">
      <div className="flex gap-8">
        <span>{date}</span>
        <span className="flex items-center gap-2">
          <MessageCircle size={14} className="mb-0.5" /> {comments}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span>Por {author}</span>
        <div className="w-10 h-10 bg-white rounded-full overflow-hidden border-2 border-white shadow-md">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${author}&mouth=smile`} alt="author" />
        </div>
      </div>
    </div>
  </div>
);

/* --- ILUSTRACIONES --- */
const DoodleFace = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <circle cx="-6" cy="-2" r={2.5} fill="black" />
    <circle cx="6" cy="-2" r={2.5} fill="black" />
    <path d="M -8 6 Q 0 14 8 6" fill="none" stroke="black" strokeWidth={3.5} strokeLinecap="round" />
    <ellipse cx="-12" cy="4" rx="3.5" ry="2.5" fill="#FFC1CC" opacity="0.6" />
    <ellipse cx="12" cy="4" rx="3.5" ry="2.5" fill="#FFC1CC" opacity="0.6" />
  </g>
);

const MiniDoodleFace = ({ x, y, color = "black" }) => (
  <g transform={`translate(${x}, ${y})`}>
    <circle cx="-3.5" cy="-1.5" r="2" fill={color} />
    <circle cx="3.5" cy="-1.5" r="2" fill={color} />
    <path d="M -4.5 3 Q 0 6 4.5 3" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </g>
);

const IllustrationMobileApps = () => (
  <svg width="220" height="220" viewBox="0 0 200 200">
    <path d="M 30 180 Q 100 188 170 180" fill="none" stroke="#e5e5e5" strokeWidth="3" strokeLinecap="round" />
    <path d="M 60 160 Q 30 140 50 125 L 90 125" fill="white" stroke="black" strokeWidth="3.5" strokeLinejoin="round" />
    <path d="M 140 160 Q 170 140 150 125 L 110 125" fill="white" stroke="black" strokeWidth="3.5" strokeLinejoin="round" />
    <path d="M 50 125 Q 100 135 150 125" fill="white" stroke="black" strokeWidth="3.5" />
    <path d="M 75 125 L 80 80 Q 82 70 118 70 Q 120 80 125 125" fill="white" stroke="black" strokeWidth="3.5" strokeLinejoin="round" />
    <circle cx="100" cy="60" r="26" fill="white" stroke="black" strokeWidth="3.5" />
    <path d="M 75 60 Q 75 30 100 30 Q 125 30 125 60" fill="black" stroke="black" strokeWidth="1" />
    <path d="M 90 28 Q 85 8 100 8 Q 115 8 110 28" fill="black" />
    <DoodleFace x={100} y={62} />
    <g transform="translate(65, 110)">
      <path d="M 0 0 L 70 0 L 80 15 L -10 15 Z" fill="white" stroke="black" strokeWidth="3" strokeLinejoin="round" />
      <path d="M 0 0 L 0 -35 L 70 -35 L 70 0" fill="white" stroke="black" strokeWidth="3" strokeLinejoin="round" />
      <path d="M 20 -20 H 50 M 20 -10 H 40" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </g>
    <circle cx="40" cy="50" r="12" fill="#F8E158" stroke="black" strokeWidth="2.5" />
    <MiniDoodleFace x={40} y={50} color="black" />
    <rect x="150" y="50" width="15" height="15" rx="2" fill="none" stroke="black" strokeWidth="2.5" transform="rotate(15)" />
  </svg>
);

const IllustrationReadymag = () => (
  <svg width="220" height="220" viewBox="0 0 200 200">
    <path d="M 90 180 L 90 140" stroke="black" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M 120 180 L 120 140" stroke="black" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M 80 140 L 85 90 Q 86 80 105 80 Q 124 80 125 90 L 130 140 H 80 Z" fill="white" stroke="black" strokeWidth="3.5" strokeLinejoin="round" />
    <circle cx="105" cy="65" r="24" fill="white" stroke="black" strokeWidth="3.5" />
    <path d="M 81 65 Q 81 38 105 38 Q 129 38 129 65 L 129 78 L 81 78 Z" fill="black" />
    <path d="M 85 52 Q 105 45 125 52" stroke="white" strokeWidth="2.5" fill="none" />
    <DoodleFace x={105} y={68} />
    <g transform="translate(105, 115) rotate(-8)">
      <rect x="-40" y="-25" width="80" height="50" rx="4" fill="#F8E158" stroke="black" strokeWidth="3.5" />
      <path d="M -40 -25 L 0 5 L 40 -25" fill="none" stroke="black" strokeWidth="2.5" />
      <path d="M -40 25 L 0 -5 L 40 25" fill="none" stroke="black" strokeWidth="2.5" />
    </g>
    <circle cx="40" cy="50" r="12" fill="#F59ABC" stroke="black" strokeWidth="2.5" />
    <MiniDoodleFace x={40} y={50} color="black" />
    <circle cx="70" cy="115" r="6" fill="white" stroke="black" strokeWidth="2.5" />
    <circle cx="140" cy="105" r="6" fill="white" stroke="black" strokeWidth="2.5" />
  </svg>
);

const IllustrationUXResearch = () => (
  <svg width="220" height="220" viewBox="0 0 200 200">
    <rect x="30" y="90" width="140" height="90" rx="6" fill="white" stroke="black" strokeWidth="3.5" />
    <path d="M 30 115 H 170" stroke="black" strokeWidth="2.5" />
    <circle cx="45" cy="102" r="3" fill="black" />
    <circle cx="55" cy="102" r="3" fill="black" />
    <circle cx="65" cy="102" r="3" fill="black" />
    <g transform="translate(0, -8)">
      <path d="M 60 95 Q 50 115 40 120" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M 140 95 Q 150 115 160 120" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="100" cy="70" r="28" fill="white" stroke="black" strokeWidth="3.5" />
      <path d="M 72 70 Q 72 32 100 32 Q 128 32 128 70" fill="black" />
      <path d="M 72 65 Q 60 70 65 85 Q 70 90 78 80" fill="black" />
      <path d="M 128 65 Q 140 70 135 85 Q 130 90 122 80" fill="black" />
      <DoodleFace x={100} y={72} />
      <ellipse cx="65" cy="98" rx="7" ry="5" fill="white" stroke="black" strokeWidth="2.5" />
      <ellipse cx="135" cy="98" rx="7" ry="5" fill="white" stroke="black" strokeWidth="2.5" />
    </g>
    <circle cx="170" cy="50" r="12" fill="#A798C5" stroke="black" strokeWidth="2.5" />
    <MiniDoodleFace x={170} y={50} color="black" />
  </svg>
);

const IllustrationCourseFigma = () => (
  <svg width="300" height="300" viewBox="0 0 200 200">
    <path d="M 70 180 Q 70 110 100 110 Q 130 110 130 180" fill="white" stroke="black" strokeWidth="3.5" />
    <circle cx="100" cy="80" r="30" fill="white" stroke="black" strokeWidth="3.5" />
    <circle cx="100" cy="40" r="16" fill="black" />
    <path d="M 70 68 Q 100 48 130 68 L 130 80 Q 100 60 70 80 Z" fill="black" />
    <DoodleFace x={100} y={85} />
    <g transform="translate(45, 100) rotate(-20)">
      <path d="M 15 0 Q 35 0 35 20 Q 35 30 20 35 L 20 42" fill="none" stroke="black" strokeWidth="2.5" />
      <path d="M 15 0 Q -5 0 -5 20 Q -5 30 10 35 L 10 42" fill="none" stroke="black" strokeWidth="2.5" />
      <circle cx="15" cy="20" r="12" fill="#F8E158" opacity="0.5" stroke="none" />
      <MiniDoodleFace x={15} y={20} color="black" />
      <path d="M 10 42 H 20 M 10 46 H 20 M 12 50 H 18" stroke="black" strokeWidth="2.5" />
      <path d="M 15 -5 L 15 -12 M 35 5 L 42 0 M -5 5 L -12 0" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </g>
    <rect x="145" y="130" width="28" height="28" rx="6" fill="black" transform="rotate(12)" />
  </svg>
);

const IllustrationCourseCreative = () => (
  <svg width="300" height="300" viewBox="0 0 200 200">
    <path d="M 65 180 Q 65 120 100 120 Q 135 120 135 180" fill="white" stroke="black" strokeWidth="3.5" />
    <circle cx="100" cy="90" r="28" fill="white" stroke="black" strokeWidth="3.5" />
    <path d="M 65 85 L 135 85 L 135 75 Q 100 60 65 75 Z" fill="black" />
    <path d="M 135 85 L 150 88 L 135 92 Z" fill="black" />
    <DoodleFace x={100} y={95} />
    <g transform="translate(130, 120) rotate(-10)">
      <rect x="0" y="0" width="50" height="40" rx="4" fill="white" stroke="black" strokeWidth="3" />
      <path d="M 5 30 L 15 20 L 25 25 L 45 10" stroke="#F59ABC" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <circle cx="40" cy="140" r="12" fill="#F8E158" stroke="black" strokeWidth="2.5" opacity="0.8" />
    <MiniDoodleFace x={40} y={140} color="black" />
  </svg>
);

const IllustrationConference = () => (
  <svg width="450" height="350" viewBox="0 0 400 250">
    <g transform="rotate(-4, 200, 125)">
      <rect x="170" y="50" width="190" height="130" rx="10" fill="white" stroke="black" strokeWidth="3.5" />
      <path d="M 170 80 H 360" stroke="black" strokeWidth="2.5" />
      <path d="M 208 80 V 180 M 246 80 V 180 M 284 80 V 180 M 322 80 V 180" stroke="#eee" strokeWidth="2" />
      <circle cx="227" cy="110" r="14" fill="#6B8E7E" />
      <MiniDoodleFace x={227} y={110} color="white" />
      <path d="M 330 140 L 350 160 M 350 140 L 330 160" stroke="black" strokeWidth="3" strokeLinecap="round" />
    </g>
    <path d="M 40 220 Q 80 120 120 220" fill="white" stroke="black" strokeWidth="4" />
    <circle cx="80" cy="100" r="35" fill="white" stroke="black" strokeWidth="4" />
    <path d="M 45 100 Q 45 60 80 60 Q 115 60 115 100 L 115 110 Q 80 90 45 110 Z" fill="black" />
    <path d="M 48 72 Q 80 66 112 72" fill="none" stroke="white" strokeWidth="3" />
    <DoodleFace x={80} y={105} />
    <g transform="translate(130, 150) rotate(15)">
      <rect x="0" y="0" width="22" height="140" fill="#F8E158" stroke="black" strokeWidth="3.5" />
      <path d="M 0 0 L 11 -25 L 22 0 Z" fill="white" stroke="black" strokeWidth="3.5" />
      <path d="M 7 -10 L 11 -25 L 15 -10 Z" fill="black" />
      <rect x="0" y="120" width="22" height="20" fill="#F59ABC" stroke="black" strokeWidth="3.5" />
      <path d="M -5 70 Q 11 80 27 70" fill="none" stroke="black" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  </svg>
);

const IllustrationNewsLMS = () => (
  <svg width="350" height="300" viewBox="0 0 300 200">
    <circle cx="150" cy="100" r="60" stroke="#e5e5e5" strokeWidth="2" fill="none" />
    <circle cx="150" cy="100" r="40" stroke="#F8E158" strokeWidth="8" fill="none" opacity="0.4" />
    <circle cx="150" cy="100" r="14" fill="black" />
    <MiniDoodleFace x={150} y={100} color="white" />
    <g transform="translate(80, 160)">
      <path d="M -25 40 Q 0 5 25 40" fill="white" stroke="black" strokeWidth="3.5" />
      <circle cx="0" cy="-5" r="22" fill="white" stroke="black" strokeWidth="3.5" />
      <path d="M -22 -15 Q 0 -30 22 -15" fill="black" />
      <DoodleFace x={0} y={0} />
    </g>
    <g transform="translate(220, 160)">
      <path d="M -25 40 Q 0 5 25 40" fill="white" stroke="black" strokeWidth="3.5" />
      <circle cx="0" cy="-5" r="22" fill="white" stroke="black" strokeWidth="3.5" />
      <path d="M -22 -18 H 22 L 22 -5 L -22 -5 Z" fill="black" />
      <DoodleFace x={0} y={0} />
    </g>
    <g transform="translate(150, 180)">
      <path d="M -20 20 Q 0 0 20 20" fill="white" stroke="black" strokeWidth="3.5" />
      <circle cx="0" cy="-10" r="18" fill="white" stroke="black" strokeWidth="3.5" />
      <path d="M -18 -20 Q 0 -30 18 -20" fill="black" />
      <DoodleFace x={0} y={-8} />
    </g>
  </svg>
);

const IllustrationNewsPortfolio = () => (
  <svg width="350" height="300" viewBox="0 0 300 200">
    <path d="M 120 180 L 130 100 L 170 100 L 180 180" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 130 180 L 125 200 M 170 180 L 175 200" stroke="black" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M 130 180 Q 150 80 170 180" fill="white" stroke="black" strokeWidth="3.5" />
    <circle cx="150" cy="70" r="25" fill="white" stroke="black" strokeWidth="3.5" />
    <path d="M 125 70 Q 150 40 175 70 L 170 80 Q 150 60 130 80 Z" fill="black" />
    <DoodleFace x={150} y={75} />
    <g transform="translate(200, 130)">
      <rect x="0" y="0" width="30" height="40" fill="none" stroke="black" strokeWidth="2.5" strokeDasharray="4" />
      <rect x="5" y="5" width="20" height="30" fill="#A798C5" opacity="0.3" stroke="none" />
    </g>
    <circle cx="100" cy="50" r="12" fill="#F59ABC" stroke="black" strokeWidth="2.5" opacity="0.7" />
    <MiniDoodleFace x={100} y={50} color="black" />
  </svg>
);

export default LandingDesignLab;
