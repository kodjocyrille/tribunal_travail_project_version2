import React, { useState, useEffect, useMemo } from 'react';
import { useAppState } from '../store';
import { ApiService } from '../services/api';
import { TypeAudienceConciliation, EtatAffaire, PlumitifEntry, Affaire, RenvoyerRequest } from '../types';
import { ETAT_LABELS, NATURE_LABELS } from '../constants';
import { ConciliationDecisionModal } from '../components/ConciliationDecisionModal';
import {
  BookOpen,
  Search,
  Printer,
  X,
  History,
  Scale,
  Calendar,
  Hash,
  PlusCircle,
  Clock,
  CheckCircle2,
  Archive,
  ClipboardList,
  Check,
  ShieldCheck,
  Loader
} from 'lucide-react';

const DossierHistoryModal = ({ affaire, plumitifs, onClose }: { affaire: Affaire, plumitifs: PlumitifEntry[], onClose: () => void }) => {
  const history = useMemo(() =>
    plumitifs
      .filter(p => p.affaireId === affaire.id)
      .sort((a, b) => new Date(b.dateSeance).getTime() - new Date(a.dateSeance).getTime()),
    [affaire.id, plumitifs]
  );

  return (
    <div className="fixed inset-0 z-[200] bg-gray-900/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] border border-gray-200">
        <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-50 p-3 rounded-lg"><History size={24} className="text-indigo-600" /></div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Historique Judiciaire</h3>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mt-0.5">N° {affaire.numRoleGeneral}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="relative space-y-6 pl-6 border-l-2 border-indigo-100">
            {history.map((entry) => (
              <div key={entry.id} className="relative">
                <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 flex items-center justify-center shadow-sm ${entry.type === 'CONCILIATION' ? 'border-indigo-600' : 'border-purple-600'}`}>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-indigo-700">{new Date(entry.dateSeance).toLocaleDateString('fr-FR')}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-50 text-gray-500 uppercase border tracking-wider">{entry.type}</span>
                  </div>
                  <h5 className="text-sm font-bold text-gray-900 uppercase mb-1">{entry.evenement}</h5>
                  <p className="text-xs text-gray-600 italic">"{entry.observations}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PlumitifConciliation: React.FC = () => {
  const { plumitifs, affaires, addPlumitifEntry, updateAffaire } = useAppState();

  // const [loading, setLoading] = useState(true); // Removed as we use store data
  const [searchTerm, setSearchTerm] = useState('');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedAffaireId, setSelectedAffaireId] = useState<string | null>(null);

  // Use affaires directly from store, no mapping needed as store data is already formatted
  const safeAffaires = affaires || [];

  const activeCases = safeAffaires.filter(a => {
    // Show all cases that are NOT fully closed/archived
    // This ensures newly created cases (ENR, EN_CONCIL) appear regardless of specific audience type nuances
    const isArchived = [
      EtatAffaire.CLOTUREE,
      EtatAffaire.JUGEE_DEF,
      EtatAffaire.EXECUTEE,
      EtatAffaire.RADIEE,
      'CLOTUREE', 'JUGEE_DEF', 'EXECUTEE', 'RADIEE'
    ].includes(a.etat as any);

    // Filtre de recherche textuelle
    const matchesSearch =
      (a.numRoleGeneral || '').includes(searchTerm) ||
      (a.parties || []).some(p => (p.nom || '').toLowerCase().includes(searchTerm.toLowerCase()));

    return !isArchived && matchesSearch;
  });

  const historyRegistry = useMemo(() => {
    const conciliatedIds = new Set(plumitifs.filter(p => p.type === 'CONCILIATION').map(p => p.affaireId));
    return safeAffaires
      .filter(a => conciliatedIds.has(a.id))
      .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
  }, [plumitifs, safeAffaires]);

  const handleSaveDecision = async (entry: PlumitifEntry, updates: any, renvoiPayload?: RenvoyerRequest) => { // Added async and renvoiPayload type
    addPlumitifEntry(entry);

    // Si c'est un renvoi et qu'on a le payload, on appelle l'API
    if (renvoiPayload && selectedAffaireId) {
      try {
        await ApiService.affaires.renvoyer(selectedAffaireId, renvoiPayload);
        // On pourrait afficher un toast de succès ici
        console.log("Renvoi enregistré via API");
      } catch (error) {
        console.error("Erreur lors du renvoi via API:", error);
        alert("Erreur lors de l'enregistrement du renvoi sur le serveur.");
      }
    }

    if (selectedAffaireId) {
      updateAffaire(selectedAffaireId, updates);
    }
    setShowEntryModal(false);
    setSelectedAffaireId(null);
  };

  const selectedAffaire = safeAffaires.find(a => a.id === selectedAffaireId) || null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">Plumitif de Conciliation</h2>
          <p className="text-gray-500 text-sm mt-1">Registre des actes de conciliation et mesures d'instruction.</p>
        </div>
        <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm hover:bg-gray-50 transition-all">
          <Printer size={16} className="mr-2" /> Rapport de Registre
        </button>
      </div>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center px-1">
          <Clock size={16} className="mr-2" /> Dossiers à l'appel de séance
        </h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">N° Rôle G.</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Parties</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Audience</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeCases.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition-all group">
                  <td className="px-6 py-4 font-mono font-medium text-indigo-700 text-sm">{a.numRoleGeneral}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900 uppercase leading-snug">
                      {a.parties.find(p => p.type === 'demandeur')?.nom} <span className="text-[10px] text-gray-400 mx-1 font-normal lowercase">c/</span> {a.parties.find(p => p.type === 'defendeur')?.nom}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-medium text-gray-900">{a.dateAudienceConciliation ? new Date(a.dateAudienceConciliation).toLocaleDateString('fr-FR') : '-'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => { setSelectedAffaireId(a.id); setShowHistoryModal(true); }} className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all" title="Historique"><History size={18} /></button>
                      <button onClick={() => { setSelectedAffaireId(a.id); setShowEntryModal(true); }} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-indigo-700 transition-all shadow-sm">
                        <PlusCircle size={14} /><span>Décision</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {activeCases.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">Aucun dossier en attente pour cette audience.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center px-1">
          <Archive size={16} className="mr-2" /> Registre Permanent (Historique)
        </h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-bold text-gray-500 uppercase tracking-wider">Dernier Acte</th>
                <th className="px-6 py-3 font-bold text-gray-500 uppercase tracking-wider">Dossier</th>
                <th className="px-6 py-3 font-bold text-gray-500 uppercase tracking-wider">Décision (Mesures ADD)</th>
                <th className="px-6 py-3 font-bold text-gray-500 uppercase tracking-wider">État Actuel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {historyRegistry.map(a => {
                const latest = plumitifs.filter(p => p.affaireId === a.id && p.type === 'CONCILIATION').pop();
                const isADD = latest?.evenement.includes('ADD');
                return (
                  <tr key={a.id} className="hover:bg-gray-50 transition-all">
                    <td className="px-6 py-3 font-medium text-gray-600">{latest ? new Date(latest.dateSeance).toLocaleDateString('fr-FR') : '-'}</td>
                    <td className="px-6 py-3 font-mono font-medium text-gray-600">{a.numRoleGeneral}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${latest?.evenement.includes('Transfert') ? 'bg-orange-50 text-orange-700 border-orange-100' :
                        isADD ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-green-50 text-green-700 border-green-100'
                        }`}>
                        {latest?.evenement}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ETAT_LABELS[a.etat].color}`}>
                        {ETAT_LABELS[a.etat].label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {showHistoryModal && selectedAffaireId && (
        <DossierHistoryModal affaire={safeAffaires.find(a => a.id === selectedAffaireId)!} plumitifs={plumitifs} onClose={() => setShowHistoryModal(false)} />
      )}

      {showEntryModal && selectedAffaire && (
        <ConciliationDecisionModal
          isOpen={showEntryModal}
          onClose={() => { setShowEntryModal(false); setSelectedAffaireId(null); }}
          affaire={selectedAffaire}
          onSave={handleSaveDecision}
          defaultMagistrat="M. ADOM Jean-Paul"
          defaultGreffier="Me MENSY Koffi"
        />
      )}
    </div>
  );
};
