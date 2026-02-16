
import React, { useState, useMemo } from 'react';
import { useAppState } from '../store';
import { EtatAffaire, PlumitifEntry, Affaire } from '../types';
import { ETAT_LABELS, NATURE_LABELS } from '../constants';
import {
  History,
  X,
  Gavel,
  Scale,
  PlusCircle,
  Hash,
  Clock,
  BookOpen,
  ClipboardList,
  Check,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CalendarDays
} from 'lucide-react';

const DECISIONS_JUGEMENT = [
  { label: 'Vider le délibéré (Jugement final)', nextEtat: EtatAffaire.JUGEE_1R },
  { label: 'Mise en Délibéré', nextEtat: EtatAffaire.EN_DELIBERE },
  { label: 'Renvoi (Audience)', nextEtat: EtatAffaire.RENVOYEE },
  { label: 'Jugement Contradictoire (Sur le siège)', nextEtat: EtatAffaire.JUGEE_1R },
  { label: 'Jugement par Défaut', nextEtat: EtatAffaire.JUGEE_1R },
  { label: 'Radiation d\'office', nextEtat: EtatAffaire.RADIEE },
  { label: 'Rabattre le délibéré (Réouverture)', nextEtat: EtatAffaire.EN_JUG }
];

const MESURES_INSTRUCTION_JUGEMENT = [
  'ADD : Expertise Médicale',
  'ADD : Enquête / Témoins',
  'ADD : Transport sur les lieux',
  'ADD : Communication de pièces',
  'Prorogation de délibéré'
];

const DossierHistoryModal = ({ affaire, plumitifs, onClose }: { affaire: Affaire, plumitifs: PlumitifEntry[], onClose: () => void }) => {
  const history = useMemo(() =>
    plumitifs
      .filter(p => p.affaireId === affaire.id)
      .sort((a, b) => new Date(b.dateSeance).getTime() - new Date(a.dateSeance).getTime()),
    [affaire.id, plumitifs]
  );

  return (
    <div className="fixed inset-0 z-[200] bg-gray-900/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh] border border-white/20">
        <div className="p-8 bg-purple-800 text-white flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md"><History size={32} /></div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Historique Judiciaire</h3>
              <p className="text-purple-100 text-sm font-bold uppercase tracking-widest mt-1">N° {affaire.numRoleGeneral}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={28} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-10 bg-gray-50/50">
          <div className="relative space-y-8 pl-8 border-l-2 border-purple-200">
            {history.map((entry) => (
              <div key={entry.id} className="relative">
                <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-white border-4 flex items-center justify-center shadow-sm ${entry.type === 'CONCILIATION' ? 'border-indigo-600' : 'border-purple-600'}`}>
                  {entry.type === 'CONCILIATION' ? <BookOpen size={10} className="text-indigo-600" /> : <Gavel size={10} className="text-purple-600" />}
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-purple-700">{new Date(entry.dateSeance).toLocaleDateString('fr-FR')}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-gray-50 text-gray-400 uppercase border tracking-widest">{entry.type}</span>
                  </div>
                  <h5 className="text-sm font-black text-gray-900 uppercase mb-1 tracking-tight">{entry.evenement}</h5>
                  <p className="text-xs text-gray-500 italic leading-relaxed">"{entry.observations}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PlumitifAudiences: React.FC = () => {
  const { plumitifs, affaires, addPlumitifEntry, updateAffaire } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedAffaireId, setSelectedAffaireId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    magistrat: 'M. ADOM Jean-Paul',
    greffier: 'Me MENSY Koffi',
    decisionPrincipale: DECISIONS_JUGEMENT[0].label,
    mesuresSelectionnees: [] as string[],
    observations: '',
    nouvelEtat: DECISIONS_JUGEMENT[0].nextEtat,
    nouvelleDate: new Date().toISOString().split('T')[0]
  });

  const judgmentCases = affaires.filter(a =>
    (a.etat === EtatAffaire.EN_JUG || a.etat === EtatAffaire.RENVOYEE || a.etat === EtatAffaire.EN_DELIBERE || a.etat === EtatAffaire.CONC_ECHOUEE) &&
    (a.numRoleGeneral.includes(searchTerm) || a.parties.some(p => p.nom.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const toggleMesure = (mesure: string) => {
    setFormData(prev => ({
      ...prev,
      mesuresSelectionnees: prev.mesuresSelectionnees.includes(mesure)
        ? prev.mesuresSelectionnees.filter(m => m !== mesure)
        : [...prev.mesuresSelectionnees, mesure]
    }));
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAffaireId) return;

    if (needsNextDate && !formData.nouvelleDate) {
      alert(`La date d'audience ou de rendu est obligatoire.`);
      return;
    }

    const evenementFinal = formData.mesuresSelectionnees.length > 0
      ? `${formData.decisionPrincipale} [${formData.mesuresSelectionnees.join(', ')}]`
      : formData.decisionPrincipale;

    const dateLabel = isVider ? 'Jugement rendu le' : (formData.decisionPrincipale === 'Mise en Délibéré' ? 'Rendu prévu le' : 'Prochaine audience le');

    const newEntry: PlumitifEntry = {
      id: Math.random().toString(36).substring(7),
      affaireId: selectedAffaireId,
      dateSeance: new Date().toISOString().split('T')[0],
      dateActe: new Date().toISOString().split('T')[0],
      type: 'AUDIENCE_PUBLIQUE',
      magistrat: formData.magistrat,
      greffier: formData.greffier,
      evenement: evenementFinal,
      observations: formData.observations + (formData.nouvelleDate ? ` [${dateLabel} ${new Date(formData.nouvelleDate).toLocaleDateString('fr-FR')}]` : '')
    };

    addPlumitifEntry(newEntry);

    let finalEtat = formData.nouvelEtat;
    // Si on renvoie avec une ADD, on reste techniquement en instruction de jugement
    if (formData.mesuresSelectionnees.some(m => m.includes('ADD')) && formData.decisionPrincipale.includes('Renvoi')) {
      finalEtat = EtatAffaire.EN_JUG;
    }

    const updates: any = { etat: finalEtat };
    if (formData.nouvelleDate) updates.dateAudienceJugement = formData.nouvelleDate;
    updateAffaire(selectedAffaireId, updates);

    setShowEntryModal(false);
    setSelectedAffaireId(null);
    setFormData({ ...formData, mesuresSelectionnees: [], observations: '', nouvelleDate: new Date().toISOString().split('T')[0] });
  };

  const isVider = formData.decisionPrincipale.includes('Vider');
  const needsNextDate = isVider || formData.decisionPrincipale === 'Renvoi (Audience)' || formData.decisionPrincipale === 'Mise en Délibéré' || formData.mesuresSelectionnees.length > 0 || formData.decisionPrincipale.includes('Prorogation');

  const getDateLabel = () => {
    if (isVider) return "Date du Jugement Rendu";
    if (formData.decisionPrincipale === 'Mise en Délibéré') return "Rendu Délibéré (Date)";
    return "Date de Renvoi (Date)";
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Plumitif de Jugement</h2>
          <p className="text-gray-500 font-medium mt-1">Registre des actes d'audience publique et rendu des délibérés.</p>
        </div>
        <button className="bg-white border-2 border-gray-100 text-gray-600 px-6 py-3 rounded-2xl font-black flex items-center shadow-sm hover:bg-gray-50 transition-all">
          <Printer size={20} className="mr-2" /> Rapport d'Audience
        </button>
      </div>

      <section className="space-y-6">
        <h3 className="text-[10px] font-black text-purple-700 uppercase tracking-[0.3em] flex items-center px-6">
          <Clock size={16} className="mr-3" /> Dossiers à l'appel d'audience publique
        </h3>
        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">N° Rôle G.</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Parties</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">État / Date</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {judgmentCases.map(a => (
                <tr key={a.id} className="hover:bg-purple-50/20 transition-all group">
                  <td className="px-10 py-6 font-mono font-bold text-purple-700 text-sm">{a.numRoleGeneral}</td>
                  <td className="px-10 py-6">
                    <div className="text-sm font-black text-gray-800 uppercase leading-tight">
                      {a.parties.find(p => p.type === 'demandeur')?.nom} <span className="text-[10px] text-gray-300 mx-1">contre</span> {a.parties.find(p => p.type === 'defendeur')?.nom}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase mb-1 border ${ETAT_LABELS[a.etat].color}`}>
                        {ETAT_LABELS[a.etat].label}
                      </span>
                      <span className="text-xs font-black text-gray-800">{a.dateAudienceJugement ? new Date(a.dateAudienceJugement).toLocaleDateString('fr-FR') : '-'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button onClick={() => { setSelectedAffaireId(a.id); setShowHistoryModal(true); }} className="p-3 text-purple-700 hover:text-white hover:bg-purple-700 bg-purple-50 rounded-2xl transition-all border border-purple-100 shadow-sm" title="Historique complet"><History size={18} /></button>
                      <button onClick={() => { setSelectedAffaireId(a.id); setShowEntryModal(true); }} className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${a.etat === EtatAffaire.EN_DELIBERE ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/10' : 'bg-purple-700 hover:bg-purple-800 text-white'}`}>
                        <PlusCircle size={16} /><span>{a.etat === EtatAffaire.EN_DELIBERE ? 'Vider Délibéré' : 'Consigner Acte'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {judgmentCases.length === 0 && (
            <div className="px-10 py-20 text-center text-gray-400 font-black uppercase text-xs opacity-40 italic">Aucun dossier en attente d'acte judiciaire</div>
          )}
        </div>
      </section>

      {showHistoryModal && selectedAffaireId && (
        <DossierHistoryModal affaire={affaires.find(a => a.id === selectedAffaireId)!} plumitifs={plumitifs} onClose={() => setShowHistoryModal(false)} />
      )}

      {showEntryModal && (
        <div className="fixed inset-0 z-[120] bg-gray-900/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
            <button onClick={() => setShowEntryModal(false)} className="absolute top-10 left-10 p-3 text-gray-400 hover:text-gray-900 rounded-full transition-all"><X size={28} /></button>
            <div className="text-center mb-10">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl ${isVider ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-purple-800 shadow-purple-800/20'}`}>
                {isVider ? <CheckCircle2 size={32} /> : <ClipboardList size={32} />}
              </div>
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Consignation Judiciaire</h3>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Dossier N° {affaires.find(a => a.id === selectedAffaireId)?.numRoleGeneral}</p>
            </div>
            <form onSubmit={handleAddEntry} className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Décision Principale</label>
                    <select className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-800 shadow-inner appearance-none" value={formData.decisionPrincipale} onChange={e => {
                      const dec = DECISIONS_JUGEMENT.find(d => d.label === e.target.value);
                      if (dec) setFormData({ ...formData, decisionPrincipale: dec.label, nouvelEtat: dec.nextEtat });
                    }}>{DECISIONS_JUGEMENT.map(d => <option key={d.label} value={d.label}>{d.label}</option>)}</select>
                  </div>
                  {needsNextDate && (
                    <div className="space-y-2 animate-in slide-in-from-right-4">
                      <label className={`text-[10px] font-black uppercase tracking-widest ml-3 ${isVider ? 'text-emerald-700' : 'text-purple-700'}`}>
                        {getDateLabel()}
                      </label>
                      <div className="relative">
                        <input type="date" required className={`w-full px-6 py-4 border-2 rounded-2xl font-black outline-none shadow-sm transition-all ${isVider ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-purple-50 border-purple-100 text-purple-900'}`} value={formData.nouvelleDate} onChange={e => setFormData({ ...formData, nouvelleDate: e.target.value })} />
                        <CalendarDays className={`absolute right-4 top-1/2 -translate-y-1/2 opacity-30 ${isVider ? 'text-emerald-900' : 'text-purple-900'}`} size={20} />
                      </div>
                    </div>
                  )}
                  {isVider && (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start space-x-3 animate-pulse">
                      <AlertCircle size={16} className="text-emerald-600 mt-0.5" />
                      <p className="text-[10px] text-emerald-800 font-bold uppercase leading-relaxed">
                        Cette opération clôture l'instance. La date saisie ci-dessus sera enregistrée comme la date officielle de vidage du délibéré.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-purple-600 uppercase tracking-widest ml-3">Mesures ADD & Instructions</label>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {MESURES_INSTRUCTION_JUGEMENT.map(m => (
                      <button type="button" key={m} onClick={() => toggleMesure(m)} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${formData.mesuresSelectionnees.includes(m) ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:border-purple-100'}`}>
                        <span className="text-[11px] font-black uppercase">{m}</span>
                        {formData.mesuresSelectionnees.includes(m) && <Check size={14} className="text-purple-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Dispositif ou Motifs de l'Acte</label>
                <textarea rows={3} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-medium text-gray-700 shadow-inner resize-none focus:ring-2 focus:ring-purple-100 outline-none transition-all" placeholder="Saisir le dispositif du jugement ou les motifs de l'ADD..." value={formData.observations} onChange={e => setFormData({ ...formData, observations: e.target.value })}></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowEntryModal(false)} className="flex-1 py-5 rounded-2xl font-black text-xs uppercase text-gray-400 bg-gray-100 hover:bg-gray-200 transition-all">Fermer</button>
                <button type="submit" className={`flex-[2] py-5 rounded-2xl font-black text-xs uppercase text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center ${isVider ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20' : 'bg-purple-800 hover:bg-purple-900 shadow-purple-900/20'}`}>
                  <ShieldCheck size={18} className="mr-3" />
                  VALIDER L'OPÉRATION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
