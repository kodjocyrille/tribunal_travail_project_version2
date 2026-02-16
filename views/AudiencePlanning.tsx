
import React, { useState, useEffect } from 'react';
import { useAppState } from '../store';
import { ApiService } from '../services/api';
import { TYPE_AUDIENCE_LABELS, ETAT_LABELS } from '../constants';
import { TypeAudienceConciliation, TypeAudience, Affaire, UserRole, EtatAffaire, PlumitifEntry, RenvoyerRequest } from '../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Plus,
  ListChecks,
  MessageSquare,
  Printer,
  Download,
  FileText,
  X,
  ChevronRight,
  Gavel,
  BookOpen,
  Settings2,
  FileDown,
  ArrowLeft,
  Scale,
  Loader
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConciliationDecisionModal } from '../components/ConciliationDecisionModal';

// Listes officielles pour le tribunal
const MAGISTRATS = [
  'M. AGBODJI',
  'Mme KOFI Marie',
  'M. ADOM Jean-Paul',
  'M. TCHALA Yao'
];

const GREFFIERS = [
  'Me KOUHOUE',
  'Me MENSY Koffi',
  'Me AMEDOME Aku',
  'Me LAWSON Serge'
];

const RoleDocument = ({
  date,
  type,
  affaires,
  composition,
  onClose
}: {
  date: string,
  type: 'CONCILIATION' | 'JUGEMENT',
  affaires: Affaire[],
  composition: { president: string, greffier: string },
  onClose: () => void
}) => {
  const d = new Date(date);
  const dateEnLettres = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  const dateChiffres = d.toLocaleDateString('fr-FR');
  const titleType = type === 'CONCILIATION' ? "RÔLE D'AUDIENCE DE CONCILIATION" : "RÔLE D'AUDIENCE PUBLIQUE ORDINAIRE";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/80 backdrop-blur-md flex items-start justify-center p-0 md:p-8 overflow-y-auto animate-in fade-in duration-300">
      <div className="fixed top-6 right-6 flex flex-col space-y-3 print:hidden z-[110]">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center shadow-lg hover:bg-blue-700 hover:scale-105 transition-all group"
        >
          <Printer size={20} className="mr-2 group-hover:rotate-12 transition-transform" />
          Imprimer / PDF
        </button>
        <button
          onClick={onClose}
          className="bg-white text-gray-900 px-6 py-3 rounded-lg font-bold flex items-center shadow-lg hover:bg-gray-50 hover:scale-105 transition-all"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour
        </button>
      </div>

      <div className="bg-white w-full max-w-[210mm] shadow-2xl p-[20mm] print:p-0 print:shadow-none print:w-full min-h-[297mm] my-4 md:my-0">
        <div className="text-center font-serif text-black print:text-black bg-white">
          <div className="flex justify-between items-start mb-16">
            <div className="text-left w-1/2">
              <p className="font-bold text-[16px] leading-tight mb-1 uppercase">COUR D’APPEL DE LOME</p>
              <div className="w-24 h-[2px] bg-black mb-1"></div>
              <p className="font-bold text-[16px] leading-tight uppercase">TRIBUNAL DU TRAVAIL<br />DE LOME</p>
              <div className="w-16 h-[1.5px] bg-black mt-2 ml-4"></div>
            </div>
            <div className="text-right w-1/2">
              <p className="font-bold text-[16px] mb-1 tracking-wider uppercase">REPUBLIQUE TOGOLAISE</p>
              <p className="text-[12px] italic font-bold">TRAVAIL - LIBERTE - PATRIE</p>
              <div className="w-20 h-[2px] bg-black ml-auto mt-2"></div>
            </div>
          </div>

          <div className="mb-14 px-4">
            <h1 className="text-[22px] font-bold underline uppercase leading-relaxed mb-4 decoration-2 underline-offset-8">
              {titleType}
            </h1>
            <p className="text-[18px] font-bold uppercase tracking-wide">
              DU {dateEnLettres} ({dateChiffres})
            </p>
          </div>

          <div className="mt-8 mb-14 text-left">
            <h3 className="text-[14px] font-bold underline mb-4 uppercase tracking-tighter decoration-1 underline-offset-4">Composition du tribunal</h3>
            <table className="w-full border-collapse border-[2px] border-black text-[14px]">
              <thead>
                <tr className="uppercase font-bold">
                  <th className="border-2 border-black p-4 w-1/2 bg-gray-50/50 print:bg-transparent">PRESIDENT</th>
                  <th className="border-2 border-black p-4 w-1/2 bg-gray-50/50 print:bg-transparent">GREFFIER</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-2 border-black p-5 font-bold h-20 uppercase align-middle text-center text-[16px]">
                    {composition.president}
                  </td>
                  <td className="border-2 border-black p-5 font-bold h-20 uppercase align-middle text-center text-[16px]">
                    {composition.greffier}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-left mb-6">
            <h2 className="text-[15px] font-bold underline uppercase decoration-1 underline-offset-4">
              {type === 'CONCILIATION' ? 'AUDIENCE DE CONCILIATION' : 'AUDIENCE PUBLIQUE'} - {affaires.length} DOSSIER(S)
            </h2>
          </div>

          <table className="w-full border-collapse border-[2px] border-black text-[13px]">
            <thead>
              <tr className="uppercase font-bold bg-gray-100 print:bg-transparent">
                <th className="border-2 border-black p-4 w-[70px] text-center">N° ORDRE</th>
                <th className="border-2 border-black p-4 w-[30%] text-left">DEMANDEURS</th>
                <th className="border-2 border-black p-4 w-[30%] text-left">DÉFENDEURS</th>
                <th className="border-2 border-black p-4 text-left">DÉCISIONS</th>
              </tr>
            </thead>
            <tbody>
              {affaires.map((aff, idx) => (
                <tr key={aff.id}>
                  <td className="border-2 border-black p-4 text-center align-top font-bold text-[16px]">{idx + 1}-</td>
                  <td className="border-2 border-black p-4 text-left align-top uppercase font-bold leading-tight">
                    {aff.parties.find(p => p.type === 'demandeur')?.nom}
                  </td>
                  <td className="border-2 border-black p-4 text-left align-top uppercase font-bold leading-tight">
                    {aff.parties.find(p => p.type === 'defendeur')?.nom}
                  </td>
                  <td className="border-2 border-black p-4 text-left align-top min-h-[100px]">
                    <div className="h-24"></div>
                  </td>
                </tr>
              ))}
              {affaires.length < 5 && Array.from({ length: 5 - affaires.length }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className="border-2 border-black p-4 h-24"></td>
                  <td className="border-2 border-black p-4 h-24"></td>
                  <td className="border-2 border-black p-4 h-24"></td>
                  <td className="border-2 border-black p-4 h-24"></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-20 flex justify-end">
            <div className="text-right mr-10 text-[13px] italic space-y-1">
              <p className="mb-4">Fait à Lomé, le {new Date().toLocaleDateString('fr-FR')}</p>
              <p className="font-bold uppercase underline underline-offset-8 decoration-2 text-[14px]">Le Greffier Audiencier</p>
              <div className="h-32"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export const AudiencePlanning: React.FC = () => {
  const { currentUserRole, addPlumitifEntry, updateAffaire } = useAppState(); // removed affaires from store
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [decisionModalAffaire, setDecisionModalAffaire] = useState<Affaire | null>(null);

  const handleSaveDecision = async (entry: PlumitifEntry, updates: any, renvoiPayload?: RenvoyerRequest) => {
    addPlumitifEntry(entry);

    if (renvoiPayload && decisionModalAffaire) {
      try {
        await ApiService.affaires.renvoyer(decisionModalAffaire.id, renvoiPayload);
        console.log("Renvoi enregistré via API (Planning)");
      } catch (error) {
        console.error("Erreur lors du renvoi via API (Planning):", error);
      }
    }

    if (decisionModalAffaire) {
      updateAffaire(decisionModalAffaire.id, updates);
    }
  };

  const [apiAffaires, setApiAffaires] = useState<Affaire[]>([]);
  const [loading, setLoading] = useState(true);

  // State pour le calendrier
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return {
        day: i + 1,
        dateStr: d.toISOString().split('T')[0],
        isToday: new Date().toISOString().split('T')[0] === d.toISOString().split('T')[0]
      };
    });
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthLabel = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const calendarDays = getDaysInMonth(currentMonth);
  // Calculer le décalage du premier jour (0 = Dimanche, 1 = Lundi, etc.)
  // On veut Lundi en premier (1). Si Dimanche (0) -> on décale de 6 cases. Si Lundi (1) -> 0 décalage.
  const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1; /* Lundi = 1, donc offset = 1-1=0. Dimanche = 0, offset = 6 */

  useEffect(() => {
    const fetchAffaires = async () => {
      try {
        setLoading(true);
        const response: any = await ApiService.affaires.getAll();

        let rawData: any[] = [];
        if (response?.data?.items && Array.isArray(response.data.items)) {
          rawData = response.data.items;
        } else if (Array.isArray(response)) {
          rawData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          rawData = response.data;
        }

        const mappedData: Affaire[] = rawData.map(item => ({
          ...item,
          id: item.id,
          numRoleGeneral: item.numeroRole || item.numRoleGeneral || 'N/A',
          nature: item.natureLitige || item.nature || 'AUTRE',
          etat: (() => {
            const rawEtat = (item.etatAffaire || item.etat || 'ENR').toUpperCase();
            const map: Record<string, EtatAffaire> = {
              'ENROLEE': EtatAffaire.ENR,
              'EN_CONCILIATION': EtatAffaire.EN_CONCIL,
              'CONCILIATION': EtatAffaire.EN_CONCIL,
              'CONCILIATION_REUSSIE': EtatAffaire.CONC_REUSSIE,
              'CONCILIATION_ECHOUEE': EtatAffaire.CONC_ECHOUEE,
              'EN_JUGEMENT': EtatAffaire.EN_JUG,
              'JUGEMENT': EtatAffaire.EN_JUG,
              'RENVOYEE': EtatAffaire.RENVOYEE,
              'EN_DELIBERE': EtatAffaire.EN_DELIBERE,
              'JUGEE': EtatAffaire.JUGEE_1R, // Default to 1R if just JUGEE
              'JUGEE_1R': EtatAffaire.JUGEE_1R,
              'JUGEE_DEF': EtatAffaire.JUGEE_DEF,
              'RADIEE': EtatAffaire.RADIEE,
              'CLOTUREE': EtatAffaire.CLOTUREE,
              'EXECUTEE': EtatAffaire.EXECUTEE,
              'DESISTEMENT': EtatAffaire.DESISTEMENT,
              'ENR': EtatAffaire.ENR
            };
            // Si le mapping échoue, vérifier si c'est déjà une clé valide de EtatAffaire
            if (Object.values(EtatAffaire).includes(rawEtat as EtatAffaire)) {
              return rawEtat as EtatAffaire;
            }
            return map[rawEtat] || EtatAffaire.ENR;
          })(),

          // Dates importants pour le calendrier
          dateAudienceConciliation: item.dateAudienceConciliation ? item.dateAudienceConciliation.split('T')[0] :
            (item.dateEnrolement ? item.dateEnrolement.split('T')[0] : ''), // Fallback provisoire
          natureAudienceConciliation: item.typeAudience || 'NORMAL',

          parties: (() => {
            if (typeof item.parties === 'string') {
              const cleanParties = item.parties.replace(/\^/g, ' ').replace(/\s+/g, ' ');
              const parts = cleanParties.split(/ vs /i);
              const result = [];
              if (parts[0]) result.push({ id: 'dem_' + item.id, nom: parts[0].trim(), type: 'demandeur', qualite: 'Demandeur', adresse: '' });
              if (parts[1]) result.push({ id: 'def_' + item.id, nom: parts[1].trim(), type: 'defendeur', qualite: 'Défendeur', adresse: '' });
              return result;
            }
            return (Array.isArray(item.parties) ? item.parties : []).map((p: any) => ({
              ...p,
              nom: p.nom || p.nomComplet || 'Inconnu',
              type: (p.type || p.typePartie || '').toLowerCase().includes('demandeur') ? 'demandeur' : 'defendeur',
            }));
          })()
        }));

        setApiAffaires(mappedData);
      } catch (error) {
        console.error("Erreur chargement planning:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAffaires();
  }, []);

  // Filtrer les affaires pour le jour sélectionné
  const dailyCases = apiAffaires.filter(a => {
    // On vérifie si la date d'audience correspond à la date sélectionnée
    if (!a.dateAudienceConciliation) return false;
    return a.dateAudienceConciliation.startsWith(selectedDate);
  });

  const affaires = apiAffaires; // Alias pour compatibilité avec le reste du code

  const isAudiencier = currentUserRole === UserRole.GREFFIER_AUDIENCE;

  // États pour le générateur de rôle
  const [showConfig, setShowConfig] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [roleType, setRoleType] = useState<'CONCILIATION' | 'JUGEMENT'>('CONCILIATION');
  const [roleDate, setRoleDate] = useState(new Date().toISOString().split('T')[0]);
  const [president, setPresident] = useState(MAGISTRATS[0]);
  const [greffier, setGreffier] = useState(GREFFIERS[0]);

  // Filtrage des dossiers pour la génération du document (basé sur roleDate et roleType)
  const roleAffairesList = affaires.filter(a => {
    // const sameDate = a.dateAudienceConciliation === roleDate; // Simplification
    const sameDate = a.dateAudienceConciliation && a.dateAudienceConciliation.startsWith(roleDate);

    if (roleType === 'CONCILIATION') {
      return sameDate && (a.etat === EtatAffaire.ENR || a.etat === EtatAffaire.EN_CONCIL);
    } else {
      return sameDate && (a.etat === EtatAffaire.EN_JUG || a.etat === EtatAffaire.RENVOYEE || a.etat === EtatAffaire.EN_DELIBERE || a.etat === EtatAffaire.CONC_ECHOUEE);
    }
  });

  // Groupement des dossiers par type pour l'affichage
  const groupedCases = dailyCases.reduce((acc, current) => {
    const key = current.natureAudienceConciliation;
    if (!acc[key]) acc[key] = [];
    acc[key].push(current);
    return acc;
  }, {} as Record<string, Affaire[]>);



  const getBadgeColor = (nature: TypeAudienceConciliation) => {
    switch (nature) {
      case TypeAudienceConciliation.REFERE: return 'bg-orange-100 text-orange-700 border-orange-200';
      case TypeAudienceConciliation.URGENCE: return 'bg-red-100 text-red-700 border-red-200';
      case TypeAudienceConciliation.CONCILIATION_ACCELEREE: return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Planification & Rôles</h2>
          <p className="text-gray-500 text-sm mt-1">Gérez l'ordre de passage des dossiers pour une date précise.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setRoleDate(selectedDate);
              setShowConfig(true);
            }}
            className="bg-white border border-gray-300 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-sm hover:bg-blue-50 transition-all active:scale-95"
          >
            <Printer size={18} className="mr-2" /> Extraire le Rôle du Jour
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 uppercase tracking-tight">Calendrier Judiciaire</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Filtrer les audiences par date</p>
          </div>
        </div>

        <div className="flex items-center bg-gray-50 p-1.5 rounded-lg border border-gray-200">
          <input
            type="date"
            className="bg-transparent text-gray-800 font-bold outline-none px-3 text-sm cursor-pointer"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <div className="h-5 w-[1px] bg-gray-300 mx-2"></div>
          <button className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm active:scale-95">
            Actualiser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24">
            <div className="mb-6 flex items-center justify-between px-1">
              <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs first-letter:uppercase">{monthLabel}</h3>
              <div className="flex space-x-1">
                <button onClick={prevMonth} className="p-1.5 border rounded-md hover:bg-gray-50 text-gray-500">‹</button>
                <button onClick={nextMonth} className="p-1.5 border rounded-md hover:bg-gray-50 text-gray-500">›</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-4">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <div key={i} className="font-bold text-gray-400 py-1">{d}</div>)}

              {/* Offset for first day of month */}
              {Array.from({ length: offset }).map((_, i) => <div key={`empty-${i}`} className="h-9 w-9"></div>)}

              {calendarDays.map((dayObj) => {
                const isSelected = selectedDate === dayObj.dateStr;
                const hasCases = affaires.some(a => a.dateAudienceConciliation === dayObj.dateStr);
                const isToday = dayObj.isToday;

                return (
                  <div
                    key={dayObj.dateStr}
                    onClick={() => setSelectedDate(dayObj.dateStr)}
                    className={`p-2 rounded-md cursor-pointer transition-all relative text-sm font-bold flex items-center justify-center h-9 w-9 mx-auto
                     ${isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 z-10'
                        : (isToday ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'hover:bg-gray-50 text-gray-700')
                      }
                   `}>
                    {dayObj.day}
                    {hasCases && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"></span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Légende</h4>
              {[
                { color: 'bg-blue-500', label: 'Conciliation Normale' },
                { color: 'bg-orange-500', label: 'Conciliation Référé' },
                { color: 'bg-red-500', label: 'Urgence' },
                { color: 'bg-indigo-700', label: 'Jugement / Fond' }
              ].map(item => (
                <div key={item.label} className="flex items-center space-x-3 text-xs font-medium text-gray-600">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-gray-900 flex items-center text-lg uppercase tracking-tight">
              <ListChecks size={24} className="mr-3 text-blue-600" />
              Dossiers du jour
            </h3>
            <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest border border-blue-100">
              {dailyCases.length} Dossier(s)
            </span>
          </div>

          {(Object.entries(groupedCases) as [string, Affaire[]][]).map(([nature, cases]) => (
            <div key={nature} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:border-blue-200 transition-all duration-300">
              <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg bg-white shadow-sm border border-gray-100`}>
                    <Clock size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg uppercase tracking-tight">Audience {nature}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Début : 08:30 GMT</p>
                  </div>
                </div>
                <span className={`text-[10px] px-3 py-1 rounded-md border font-bold uppercase tracking-wider ${getBadgeColor(nature as TypeAudienceConciliation)}`}>
                  {nature}
                </span>
              </div>

              <div className="p-6 space-y-3">
                {cases.map(aff => (
                  <div key={aff.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-white hover:bg-gray-50 rounded-lg transition-all border border-gray-200 hover:border-blue-200 group/item gap-4">
                    <div className="flex items-center space-x-6 flex-1 w-full">
                      <div className="w-20 shrink-0">
                        <span className="text-xs font-bold text-blue-800 tracking-tight bg-blue-50 px-2 py-1 rounded bg-opacity-50">
                          {aff.numRoleGeneral}
                        </span>
                      </div>
                      <div className="h-8 w-[1px] bg-gray-200 hidden md:block"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 uppercase">
                          <span className="truncate">{aff.parties.find(p => p.type === 'demandeur')?.nom}</span>
                          <span className="text-[10px] text-gray-400 mx-2 font-bold italic lowercase">c/</span>
                          <span className="truncate">{aff.parties.find(p => p.type === 'defendeur')?.nom}</span>
                        </div>
                        <div className="mt-1.5 flex items-center space-x-4">
                          {(() => {
                            const etatInfo = ETAT_LABELS[aff.etat] || { label: aff.etat, color: 'bg-gray-100 text-gray-800' };
                            return (
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${etatInfo.color.replace('shadow-sm', '').replace('rounded-2xl', '')} border-transparent bg-opacity-10`}>
                                {etatInfo.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* BOUTON DÉCISION / PLUMITIF */}
                    {isAudiencier && (
                      <button
                        onClick={() => {
                          const isJugement = (aff.natureAudienceConciliation as any) === 'JUG' || aff.etat === EtatAffaire.EN_JUG || aff.etat === EtatAffaire.EN_DELIBERE;

                          if (isJugement) {
                            navigate('/plumitif-audiences');
                          } else {
                            setDecisionModalAffaire(aff);
                          }
                        }}
                        className="bg-white border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-50 transition-all shadow-sm active:scale-95 flex items-center whitespace-nowrap"
                      >
                        <Scale size={14} className="mr-2" />
                        Décision
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {dailyCases.length === 0 && (
            <div className="bg-white p-16 rounded-lg border border-dashed border-gray-300 text-center flex flex-col items-center">
              <CalendarIcon size={48} className="text-gray-200 mb-4" />
              <h4 className="text-lg font-bold text-gray-400 uppercase tracking-wider">Aucune séance prévue</h4>
            </div>
          )}
        </div>
      </div>

      {showConfig && (
        <div className="fixed inset-0 z-[110] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-gray-200">
            <button onClick={() => setShowConfig(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-all hover:bg-gray-100">
              <X size={20} />
            </button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-blue-600/20">
                <Settings2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight uppercase">Configuration du Rôle</h3>
              <p className="text-gray-500 text-xs font-medium mt-1 uppercase tracking-wider">Certification des informations officielles</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Nature du document</label>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setRoleType('CONCILIATION')} className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${roleType === 'CONCILIATION' ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                    <BookOpen size={20} className="mb-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Conciliation</span>
                  </button>
                  <button onClick={() => setRoleType('JUGEMENT')} className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${roleType === 'JUGEMENT' ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                    <Gavel size={20} className="mb-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Jugement</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Président de séance</label>
                  <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg font-medium text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" value={president} onChange={(e) => setPresident(e.target.value)}>
                    {MAGISTRATS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Greffier de service</label>
                  <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg font-medium text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" value={greffier} onChange={(e) => setGreffier(e.target.value)}>
                    {GREFFIERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <button
                onClick={() => { setShowConfig(false); setShowPreview(true); }}
                disabled={roleAffairesList.length === 0}
                className={`w-full py-4 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all shadow-sm active:scale-95 ${roleAffairesList.length > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                Générer l'Aperçu Officiel
                <ChevronRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <RoleDocument date={roleDate} type={roleType} affaires={roleAffairesList} composition={{ president, greffier }} onClose={() => setShowPreview(false)} />
      )}

      {decisionModalAffaire && (
        <ConciliationDecisionModal
          isOpen={!!decisionModalAffaire}
          onClose={() => setDecisionModalAffaire(null)}
          affaire={decisionModalAffaire}
          onSave={handleSaveDecision}
        />
      )}
    </div>
  );
};
