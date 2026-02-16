
import React, { useState, useMemo } from 'react';
import { useAppState } from '../store';
import { ETAT_LABELS, NATURE_LABELS } from '../constants';
import { Gavel, Clock, Users, MapPin, Search, Filter, CheckCircle2, AlertCircle, Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DailySession: React.FC = () => {
  const { affaires, audiences } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date du jour par défaut (pour la démo, on peut forcer une date si besoin, 
  // mais on utilise la date système par défaut)
  const today = new Date().toISOString().split('T')[0];

  // 1. Récupérer les conciliations programmées lors de l'enrôlement pour AUJOURD'HUI
  const dailyConciliations = useMemo(() => {
    return affaires.filter(a => a.dateAudienceConciliation === today);
  }, [affaires, today]);

  // 2. Récupérer les audiences programmées formellement pour AUJOURD'HUI
  const dailyPublicAudiences = useMemo(() => {
    return audiences.filter(aud => aud.date === today);
  }, [audiences, today]);

  const totalDossiers = dailyConciliations.length + dailyPublicAudiences.reduce((sum, aud) => sum + aud.affaires.length, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER DE SESSION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-600/20 text-white">
            <Gavel size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Audience du Jour</h2>
            <p className="text-gray-500 font-bold flex items-center mt-1 uppercase text-[10px] tracking-[0.2em]">
              <Calendar size={14} className="mr-2 text-blue-500" />
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 bg-white p-2 rounded-3xl border border-gray-100 shadow-sm">
          <div className="px-5 py-2 text-center border-r">
            <span className="block text-[10px] font-black text-gray-400 uppercase">Dossiers</span>
            <span className="text-xl font-black text-blue-700">{totalDossiers}</span>
          </div>
          <div className="px-5 py-2 text-center">
            <span className="block text-[10px] font-black text-gray-400 uppercase">Statut</span>
            <span className="flex items-center text-xs font-black text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              EN COURS
            </span>
          </div>
        </div>
      </div>

      {/* RECHERCHE RAPIDE DANS L'AUDIENCE */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
          <Search size={22} />
        </div>
        <input 
          type="text" 
          placeholder="Rechercher un dossier par numéro ou par nom de partie pour l'appel..." 
          className="w-full pl-16 pr-8 py-6 bg-white border-2 border-transparent shadow-xl shadow-blue-900/5 rounded-[2.5rem] focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SECTION CONCILIATIONS DU JOUR (PROGR. ENRÔLEMENT) */}
        <div className="lg:col-span-12">
          <div className="flex items-center justify-between mb-6 px-4">
            <h3 className="text-xl font-black text-gray-900 flex items-center uppercase tracking-tight">
              <Users size={24} className="mr-3 text-indigo-600" />
              Tentatives de Conciliation (Inscrits à l'enrôlement)
            </h3>
            <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
              {dailyConciliations.length} dossiers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {dailyConciliations.map((aff) => (
              <div key={aff.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/5 border border-gray-100 group hover:border-indigo-200 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform"></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <span className="bg-gray-50 text-gray-400 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border">
                    {aff.numRoleGeneral}
                  </span>
                  <div className="flex items-center text-indigo-600 font-black text-xs uppercase tracking-widest">
                    <Clock size={14} className="mr-2" />
                    08:30
                  </div>
                </div>

                <div className="space-y-4 mb-8 relative z-10">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Demandeur</h4>
                    <p className="font-black text-gray-900 truncate uppercase">{aff.parties.find(p => p.type === 'demandeur')?.nom}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="h-[1px] flex-1 bg-gray-100"></div>
                    <span className="text-[10px] font-black text-gray-300 uppercase italic">contre</span>
                    <div className="h-[1px] flex-1 bg-gray-100"></div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Défendeur</h4>
                    <p className="font-black text-gray-900 truncate uppercase">{aff.parties.find(p => p.type === 'defendeur')?.nom}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50 relative z-10">
                  <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase ${ETAT_LABELS[aff.etat].color}`}>
                    {ETAT_LABELS[aff.etat].label}
                  </span>
                  <Link to="/plumitif-conciliation" className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 hover:scale-110 active:scale-95 transition-all">
                    <MessageSquare size={18} />
                  </Link>
                </div>
              </div>
            ))}
            
            {dailyConciliations.length === 0 && (
              <div className="col-span-full bg-gray-50/50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-100">
                <Users size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Aucune conciliation programmée à l'enrôlement pour ce jour.</p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION AUDIENCES PUBLIQUES DU JOUR */}
        <div className="lg:col-span-12 mt-8">
          <div className="flex items-center justify-between mb-6 px-4">
            <h3 className="text-xl font-black text-gray-900 flex items-center uppercase tracking-tight">
              <Gavel size={24} className="mr-3 text-blue-600" />
              Audiences Publiques (Chambres Sociales)
            </h3>
            <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
              {dailyPublicAudiences.length} séances
            </span>
          </div>

          <div className="space-y-6">
            {dailyPublicAudiences.map((aud) => (
              <div key={aud.id} className="bg-white rounded-[3rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden group">
                <div className="p-8 bg-gray-50/30 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center space-x-8">
                    <div className="bg-blue-600 p-5 rounded-[2rem] text-white shadow-xl group-hover:rotate-6 transition-transform">
                      <Clock size={32} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Débats publics - {aud.salle}</h4>
                      <div className="flex items-center space-x-6 mt-2 text-xs text-gray-400 font-black uppercase tracking-[0.2em]">
                        <span className="flex items-center text-blue-500">
                          <MapPin size={16} className="mr-2" />
                          Salle d'Audience A
                        </span>
                        <span className="flex items-center">
                          <Users size={16} className="mr-2" />
                          Président: {aud.magistrats[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button className="bg-white border-2 border-gray-100 text-gray-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                      Appeler l'audience
                    </button>
                    <Link to="/plumitif-audiences" className="bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 flex items-center">
                      Ouvrir le Plumitif
                      <ArrowRight size={16} className="ml-3" />
                    </Link>
                  </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aud.affaires.map((affId, idx) => {
                    const aff = affaires.find(a => a.id === affId);
                    if (!aff) return null;
                    return (
                      <div key={aff.id} className="flex items-center justify-between p-6 bg-gray-50/30 rounded-3xl border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all group/item">
                        <div className="flex items-center space-x-6">
                          <span className="text-lg font-black text-blue-600 opacity-20 group-hover/item:opacity-100 transition-opacity">
                            {(idx + 1).toString().padStart(2, '0')}
                          </span>
                          <div className="h-10 w-[2px] bg-gray-100 group-hover/item:bg-blue-200"></div>
                          <div>
                            <p className="text-sm font-black text-gray-800 uppercase leading-tight">
                              {aff.parties.find(p => p.type === 'demandeur')?.nom}
                              <span className="text-[10px] text-gray-400 mx-2 font-black italic lowercase tracking-tight">contre</span>
                              {aff.parties.find(p => p.type === 'defendeur')?.nom}
                            </p>
                            <p className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mt-1">N° Rôle: {aff.numRoleGeneral}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-sm ${ETAT_LABELS[aff.etat].color}`}>
                          {ETAT_LABELS[aff.etat].label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {dailyPublicAudiences.length === 0 && (
              <div className="bg-gray-50/50 rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100 shadow-inner">
                <Gavel size={80} className="mx-auto text-gray-100 mb-8" />
                <h4 className="text-2xl font-black text-gray-300 uppercase tracking-widest">Aucune audience publique programmée</h4>
                <p className="text-gray-400 text-sm mt-3 font-bold uppercase tracking-tight opacity-60 italic">Les débats au fond se tiennent généralement les mardis et jeudis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
