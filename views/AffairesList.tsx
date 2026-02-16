
import React, { useState, useMemo, useEffect } from 'react';
import { useAppState } from '../store';
import { ApiService } from '../services/api';
import { NATURE_LABELS, ETAT_LABELS } from '../constants';
import { Search, Eye, Filter, Download, Hash, History, X, Clock, User, Gavel, BookOpen, Calendar, MapPin, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EtatAffaire, PlumitifEntry, Affaire } from '../types';

const DossierHistoryModal = ({
  affaire,
  onClose
}: {
  affaire: Affaire,
  onClose: () => void
}) => {
  const { plumitifs } = useAppState();

  const history = useMemo(() =>
    plumitifs
      .filter(p => p.affaireId === affaire.id)
      .sort((a, b) => new Date(b.dateSeance).getTime() - new Date(a.dateSeance).getTime()),
    [affaire.id, plumitifs]
  );

  return (
    <div className="fixed inset-0 z-[150] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <History size={24} className="text-blue-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Parcours Judiciaire</h3>
              <p className="text-gray-500 text-sm">
                Dossier N° {affaire.numRoleGeneral} • {NATURE_LABELS[affaire.nature]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info Panel */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b pb-2">Informations Générales</h4>
                <div className="space-y-3">
                  <div>
                    <span className="block text-xs text-gray-500 mb-0.5">Demandeur</span>
                    <p className="text-sm font-semibold text-gray-900">{affaire.parties.find(p => p.type === 'demandeur')?.nom}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-0.5">Défendeur</span>
                    <p className="text-sm font-semibold text-gray-900">{affaire.parties.find(p => p.type === 'defendeur')?.nom}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Statut Actuel</span>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium uppercase inline-block border ${ETAT_LABELS[affaire.etat].color.replace('bg-', 'bg-opacity-10 bg-').replace('text-', 'text-').replace('shadow-sm', '')} border-transparent`}>
                      {ETAT_LABELS[affaire.etat].label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Dates Clés</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-700">Enrôlement : <span className="font-medium text-gray-900">{new Date(affaire.dateCreation).toLocaleDateString('fr-FR')}</span></span>
                  </div>
                  {affaire.dateAudienceConciliation && (
                    <div className="flex items-center space-x-3 text-sm">
                      <BookOpen size={16} className="text-gray-400" />
                      <span className="text-gray-700">1ère Conciliation : <span className="font-medium text-gray-900">{new Date(affaire.dateAudienceConciliation).toLocaleDateString('fr-FR')}</span></span>
                    </div>
                  )}
                  {affaire.dateAudienceJugement && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Gavel size={16} className="text-gray-400" />
                      <span className="text-gray-700">1er Jugement : <span className="font-medium text-gray-900">{new Date(affaire.dateAudienceJugement).toLocaleDateString('fr-FR')}</span></span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="lg:col-span-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 flex items-center">
                <Clock size={14} className="mr-2" /> Chronologie des actes 
              </h4>

              <div className="relative space-y-6 pl-6 border-l-2 border-gray-200">
                {history.map((entry, idx) => (
                  <div key={entry.id} className="relative animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${entry.type === 'CONCILIATION' ? 'bg-indigo-500' : 'bg-purple-500'}`}></div>

                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-900">
                          {new Date(entry.dateSeance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${entry.type === 'CONCILIATION' ? 'text-indigo-700 bg-indigo-50 border-indigo-100' : 'text-purple-700 bg-purple-50 border-purple-100'}`}>
                          {entry.type === 'CONCILIATION' ? 'Conciliation' : 'Jugement'}
                        </span>
                      </div>
                      <h5 className="text-sm font-medium text-gray-800 mb-1">{entry.evenement}</h5>
                      <p className="text-sm text-gray-500 italic mb-3">"{entry.observations}"</p>

                      <div className="flex gap-4 pt-3 border-t border-gray-100 mt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <User size={12} className="mr-1.5" />
                          {entry.magistrat}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <User size={12} className="mr-1.5" />
                          {entry.greffier}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Point d'entrée initial */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                  <div className="text-xs font-medium text-gray-500 py-1">
                    Dossier enrôlé le {new Date(affaire.dateCreation).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              {history.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-400 italic">Aucun acte consigné à ce jour</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export const AffairesList: React.FC = () => {
  // On n'utilise plus le store pour les affaires, mais l'API directement
  const [apiAffaires, setApiAffaires] = useState<Affaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  /* State changed from ID to Object */
  const [selectedAffaire, setSelectedAffaire] = useState<Affaire | null>(null);

  useEffect(() => {
    const fetchAffaires = async () => {
      try {
        setLoading(true);
        const response: any = await ApiService.affaires.getAll(); /* state update continues below */

        console.log("Affaires API response:", response);

        let rawData: any[] = [];
        // Gestion de la pagination (response.data.items)
        if (response?.data?.items && Array.isArray(response.data.items)) {
          rawData = response.data.items;
        } else if (Array.isArray(response)) {
          rawData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          rawData = response.data;
        } else if (response?.isSuccess && Array.isArray(response.value)) {
          rawData = response.value;
        }

        // Mapping des données API vers le modèle Frontend
        const mappedData: Affaire[] = rawData.map(item => {
          // Normalisation de l'état
          const rawEtat = (item.etatAffaire || item.etat || 'ENR').toUpperCase();
          const etatMap: Record<string, EtatAffaire> = {
            'ENROLEE': EtatAffaire.ENR,
            'EN_CONCILIATION': EtatAffaire.EN_CONCIL,
            'CONCILIATION': EtatAffaire.EN_CONCIL,
            'CONCILIATION_REUSSIE': EtatAffaire.CONC_REUSSIE,
            'CONCILIATION_ECHOUEE': EtatAffaire.CONC_ECHOUEE,
            'EN_JUGEMENT': EtatAffaire.EN_JUG,
            'JUGEMENT': EtatAffaire.EN_JUG,
            'RENVOYEE': EtatAffaire.RENVOYEE,
            'EN_DELIBERE': EtatAffaire.EN_DELIBERE,
            'JUGEE': EtatAffaire.JUGEE_1R,
            'JUGEE_1R': EtatAffaire.JUGEE_1R,
            'JUGEE_DEF': EtatAffaire.JUGEE_DEF,
            'RADIEE': EtatAffaire.RADIEE,
            'CLOTUREE': EtatAffaire.CLOTUREE,
            'EXECUTEE': EtatAffaire.EXECUTEE,
            'DESISTEMENT': EtatAffaire.DESISTEMENT,
            'ENR': EtatAffaire.ENR
          };
          const etat = Object.values(EtatAffaire).includes(rawEtat as EtatAffaire)
            ? rawEtat as EtatAffaire
            : (etatMap[rawEtat] || EtatAffaire.ENR);

          // Normalisation de la nature
          const rawNature = (item.natureLitige || item.nature || 'AUTRE').toUpperCase();
          const natureMap: Record<string, any> = {
            'HARCELEMENT': 'HAR',
            'LICENCIEMENT': 'LIC',
            'SALAIRE': 'SAL',
            'ACCIDENT': 'ACC',
            'AUTRE': 'AUT'
          };
          const nature = Object.keys(NATURE_LABELS).includes(rawNature)
            ? rawNature
            : (natureMap[rawNature] || 'AUTRE');

          return {
            ...item,
            id: item.id,
            numRoleGeneral: item.numeroRole || item.numRoleGeneral || 'N/A',
            nature: nature,
            etat: etat,
            dateCreation: item.dateEnrolement || item.dateCreation,
            dateAudienceConciliation: item.dateAudienceConciliation,
            dateAudienceJugement: item.dateAudienceJugement,
            natureAudienceConciliation: item.typeAudience || 'NORMAL',
            // Sécurisation et mapping des parties
            parties: (() => {
              if (typeof item.parties === 'string') {
                // Nettoyage de la chaîne parties
                // Ex: "erriopp^^prrrttfdddd vs dazertyuiop^llkhgdsqwxcvbn,iytrt"
                // On remplace les ^ par des espaces, on trim
                const cleanParties = item.parties.replace(/\^/g, ' ').replace(/\s+/g, ' ');
                const parts = cleanParties.split(/ vs /i);

                const result = [];
                if (parts[0]) {
                  result.push({
                    id: 'dem_' + item.id,
                    nom: parts[0].trim(),
                    type: 'demandeur',
                    qualite: 'Demandeur',
                    adresse: ''
                  });
                }
                if (parts[1]) {
                  result.push({
                    id: 'def_' + item.id,
                    nom: parts[1].trim(),
                    type: 'defendeur',
                    qualite: 'Défendeur',
                    adresse: ''
                  });
                }
                // Si pas de résultat (pas de 'vs'), on met tout dans demandeur par défaut ou on gère autrement
                if (result.length === 0 && cleanParties) {
                  result.push({
                    id: 'dem_' + item.id,
                    nom: cleanParties.trim(),
                    type: 'demandeur',
                    qualite: 'Partie',
                    adresse: ''
                  });
                }
                return result;
              }
              return (Array.isArray(item.parties) ? item.parties : []).map((p: any) => ({
                ...p,
                id: p.id || Math.random().toString(36),
                nom: p.nom || p.nomComplet || 'Nom inconnu',
                type: (p.type || p.typePartie || '').toLowerCase().includes('demandeur') ? 'demandeur' : 'defendeur',
                qualite: p.qualite || 'Qualité inconnue'
              }));
            })()
          };
        });

        setApiAffaires(mappedData);
      } catch (error) {
        console.error("Erreur lors du chargement des affaires:", error);
        setApiAffaires([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAffaires();
  }, []);

  const safeAffaires = Array.isArray(apiAffaires) ? apiAffaires : [];
  const filteredAffaires = safeAffaires.filter(a =>
    (a.numRoleGeneral || '').includes(searchTerm) ||
    (a.parties || []).some(p => (p.nom || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader size={48} className="animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium animate-pulse">Chargement du Rôle Général...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">Rôle Général des Affaires</h2>
          <p className="text-gray-500 text-sm mt-1">Registre central de tous les dossiers enrôlés au tribunal.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
            <Download size={16} />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[320px] relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Rechercher par N° rôle, nom de partie..."
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-md focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-medium text-gray-900"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <Filter size={16} />
            <span className="uppercase tracking-wider">Filtrer</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1100px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">N° Rôle G.</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Date Enr.</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Parties (Dem. / Déf.)</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nature</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Prochaine Audience</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">État actuel</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAffaires.map(a => {
                const demandeur = a.parties.find(p => p.type === 'demandeur' || p.type === 'DEMANDEUR')?.nom || 'Inconnu';
                const defendeur = a.parties.find(p => p.type === 'defendeur' || p.type === 'DEFENDEUR')?.nom || 'Inconnu';
                // Fallback pour l'état si l'API renvoie quelque chose de non mappé
                const etat = ETAT_LABELS[a.etat] || { label: a.etat, color: 'bg-gray-100 text-gray-800' };

                return (
                  <tr key={a.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 font-mono font-medium text-blue-700 text-sm whitespace-nowrap">{a.numRoleGeneral}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {a.dateCreation ? new Date(a.dateCreation).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col max-w-[250px]">
                        <span className="text-sm font-semibold text-gray-900 truncate" title={demandeur}>{demandeur}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-medium my-0.5">contre</span>
                        <span className="text-sm font-medium text-gray-600 truncate" title={defendeur}>{defendeur}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-600 font-bold uppercase border border-gray-200 tracking-tight whitespace-nowrap">
                        {NATURE_LABELS[a.nature] || a.nature}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-semibold text-gray-900">
                          {a.etat === EtatAffaire.EN_JUG || a.etat === EtatAffaire.RENVOYEE || a.etat === EtatAffaire.EN_DELIBERE || a.etat === EtatAffaire.CONC_ECHOUEE
                            ? (a.dateAudienceJugement ? new Date(a.dateAudienceJugement).toLocaleDateString('fr-FR') : '-')
                            : (a.dateAudienceConciliation ? new Date(a.dateAudienceConciliation).toLocaleDateString('fr-FR') : '-')
                          }
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                          {a.etat === EtatAffaire.EN_JUG || a.etat === EtatAffaire.CONC_ECHOUEE ? 'Jugement' : 'Conciliation'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase shadow-sm border ${etat.color}`}>
                        {etat.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedAffaire(a)}
                          className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors border border-transparent hover:border-blue-100"
                          title="Historique"
                        >
                          <History size={16} />
                        </button>
                        <Link
                          to={`/affaires/${a.id}`}
                          className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors border border-transparent hover:border-blue-100"
                          title="Détails"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredAffaires.length === 0 && (
          <div className="p-16 text-center text-gray-400 bg-gray-50/30 flex flex-col items-center border-t border-gray-100">
            <Search size={32} className="mb-3 opacity-20" />
            <p className="text-sm font-medium">Aucun dossier trouvé.</p>
          </div>
        )}
      </div>

      {selectedAffaire && (
        <DossierHistoryModal
          affaire={selectedAffaire}
          onClose={() => setSelectedAffaire(null)}
        />
      )}
    </div>
  );
};
