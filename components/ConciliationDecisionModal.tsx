import React, { useState } from 'react';
import { X, ClipboardList, Check, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { Affaire, EtatAffaire, PlumitifEntry, RenvoyerRequest } from '../types';
import { ApiService } from '../services/api';

const DECISIONS_CONCILIATION = [
    { label: 'PV de Conciliation Totale', nextEtat: EtatAffaire.CONC_REUSSIE },
    { label: 'PV de Non-Conciliation (Transfert)', nextEtat: EtatAffaire.EN_JUG },
    { label: 'PV de Conciliation Partielle (Transfert)', nextEtat: EtatAffaire.EN_JUG },
    { label: 'Renvoi (Procédure)', nextEtat: EtatAffaire.RENVOYEE },
    { label: 'Radiation', nextEtat: EtatAffaire.RADIEE }
];

const MESURES_INTERMEDIAIRES = [
    'ADD : Enquête',
    'ADD : Expertise',
    'ADD : Production de pièces',
    'ADD : Transport sur les lieux'
];

const MOTIFS_RENVOI = [
    { label: 'Non comparution', value: 'NON_COMPARUTION' },
    { label: 'Défaut de conseil', value: 'DEFAUT_CONSEIL' },
    { label: 'Dossier non prêt', value: 'NON_PRET' },
    { label: 'Demande des parties', value: 'DEMANDE_PARTIES' },
    { label: 'Autre motif', value: 'AUTRE' }
];

interface ConciliationDecisionModalProps {
    isOpen: boolean;
    onClose: () => void;
    affaire: Affaire | null;
    onSave: (entry: PlumitifEntry, updates: any, renvoiPayload?: RenvoyerRequest) => void;
    defaultMagistrat?: string;
    defaultGreffier?: string;
}

export const ConciliationDecisionModal: React.FC<ConciliationDecisionModalProps> = ({
    isOpen,
    onClose,
    affaire,
    onSave,
    defaultMagistrat = 'M. ADOM Jean-Paul',
    defaultGreffier = 'Me MENSY Koffi'
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        magistrat: defaultMagistrat,
        greffier: defaultGreffier,
        decisionPrincipale: DECISIONS_CONCILIATION[0].label,
        mesuresSelectionnees: [] as string[],
        observations: '',
        nouvelEtat: DECISIONS_CONCILIATION[0].nextEtat,
        nouvelleDate: '',
        motif: 'NON_COMPARUTION' as string
    });

    if (!isOpen || !affaire) return null;

    const toggleMesure = (mesure: string) => {
        setFormData(prev => ({
            ...prev,
            mesuresSelectionnees: prev.mesuresSelectionnees.includes(mesure)
                ? prev.mesuresSelectionnees.filter(m => m !== mesure)
                : [...prev.mesuresSelectionnees, mesure]
        }));
    };

    const isTransfert = formData.decisionPrincipale.includes('Transfert');
    const isRenvoi = formData.decisionPrincipale.includes('Renvoi');
    const hasMesures = formData.mesuresSelectionnees.length > 0;
    const needsNextDate = isTransfert || hasMesures || isRenvoi;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (needsNextDate && !formData.nouvelleDate) {
            alert(`La date de la prochaine audience est obligatoire.`);
            return;
        }

        setIsSubmitting(true);

        try {
            const evenementFinal = formData.mesuresSelectionnees.length > 0
                ? `${formData.decisionPrincipale} (${formData.mesuresSelectionnees.join(', ')})`
                : formData.decisionPrincipale;

            const newEntry: PlumitifEntry = {
                id: Math.random().toString(36).substring(7),
                affaireId: affaire.id,
                dateSeance: new Date().toISOString().split('T')[0],
                dateActe: new Date().toISOString().split('T')[0], // Ajout pour backend
                type: 'CONCILIATION',
                magistrat: formData.magistrat,
                greffier: formData.greffier,
                evenement: evenementFinal,
                observations: formData.observations + (formData.nouvelleDate ? ` [Date suivante: ${new Date(formData.nouvelleDate).toLocaleDateString('fr-FR')}]` : '')
            };

            let etatUpdate = formData.nouvelEtat;

            // Calcul des mises à jour d'état local
            const updates: any = { etat: etatUpdate };
            if (formData.nouvelleDate) {
                if (formData.decisionPrincipale.includes('Transfert')) updates.dateAudienceJugement = formData.nouvelleDate;
                else updates.dateAudienceConciliation = formData.nouvelleDate;
            }

            // Préparation du payload API si Renvoi
            let renvoiPayload: RenvoyerRequest | undefined;
            if (isRenvoi) {
                // LOGIQUE DEMANDÉE : Faire un GET pour avoir l'id de l'audience
                const response = await ApiService.affaires.getById(affaire.id);
                const latestAffaire = response.data;

                if (latestAffaire && latestAffaire.audiences && latestAffaire.audiences.length > 0) {
                    console.log("[DEBUG] Toutes les audiences:", latestAffaire.audiences);

                    // Filtrer les audiences qui ont un ID valide (pas de GUID vide)
                    const validAudiences = latestAffaire.audiences.filter(aud =>
                        aud.audienceId && aud.audienceId !== '00000000-0000-0000-0000-000000000000'
                    );

                    if (validAudiences.length === 0) {
                        console.error("[ERREUR] Aucune audience avec un ID valide trouvée.", latestAffaire.audiences);
                        throw new Error("L'affaire n'a pas d'ID d'audience valide. Veuillez vérifier si l'audience a été correctement créée.");
                    }

                    // Trier par date pour avoir la plus récente (celle en cours)
                    const sortedAudiences = [...validAudiences].sort((a, b) =>
                        new Date(b.dateAudience).getTime() - new Date(a.dateAudience).getTime()
                    );

                    const audienceActuelleId = sortedAudiences[0]?.audienceId;

                    if (audienceActuelleId) {
                        console.log("[DEBUG] Audience sélectionnée id:", audienceActuelleId);
                        renvoiPayload = {
                            audienceActuelleId: audienceActuelleId,
                            dateRenvoi: new Date(formData.nouvelleDate).toISOString(),
                            decision: 'RENVOI',
                            mesureInstruction: formData.mesuresSelectionnees.length > 0 ? formData.mesuresSelectionnees.join(', ') : '',
                            motif: formData.motif,
                            observations: formData.observations || 'R.A.S'
                        };
                    } else {
                        throw new Error("Impossible de déterminer l'ID de l'audience actuelle.");
                    }
                } else {
                    throw new Error("Aucune audience n'est associée à cette affaire sur le serveur.");
                }
            }

            onSave(newEntry, updates, renvoiPayload);

            setFormData({
                magistrat: defaultMagistrat,
                greffier: defaultGreffier,
                decisionPrincipale: DECISIONS_CONCILIATION[0].label,
                mesuresSelectionnees: [],
                observations: '',
                nouvelEtat: DECISIONS_CONCILIATION[0].nextEtat,
                nouvelleDate: '',
                motif: 'NON_COMPARUTION'
            });
            onClose();
        } catch (error: any) {
            console.error("Erreur lors de la préparation du renvoi:", error);
            alert(error.message || "Une erreur est survenue lors de la communication avec le serveur.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Nouvelle Décision</h3>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mt-0.5">Dossier N° {affaire.numRoleGeneral}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-all"><X size={20} /></button>
                </div>

                <div className="overflow-y-auto p-6">
                    <form id="entryForm" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Décision de Séance</label>
                                    <select className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" value={formData.decisionPrincipale} onChange={e => {
                                        const dec = DECISIONS_CONCILIATION.find(d => d.label === e.target.value);
                                        if (dec) setFormData({ ...formData, decisionPrincipale: dec.label, nouvelEtat: dec.nextEtat });
                                    }}>{DECISIONS_CONCILIATION.map(d => <option key={d.label} value={d.label}>{d.label}</option>)}</select>
                                </div>
                                {needsNextDate && (
                                    <div className="space-y-3 animate-in slide-in-from-top-2">
                                        <div className="space-y-1.5">
                                            <label className={`text-[11px] font-bold uppercase tracking-wider ${isTransfert ? 'text-orange-600' : 'text-indigo-600'}`}>
                                                {isTransfert ? "Date Audience Jugement" : "Date de Renvoi"}
                                            </label>
                                            <input type="date" required className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.nouvelleDate} onChange={e => setFormData({ ...formData, nouvelleDate: e.target.value })} />
                                        </div>

                                        {isRenvoi && (
                                            <div className="space-y-1.5 animate-in slide-in-from-top-2">
                                                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Motif du Renvoi</label>
                                                <select className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.motif} onChange={e => setFormData({ ...formData, motif: e.target.value })}>
                                                    {MOTIFS_RENVOI.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Mesures d'Instruction (ADD)</label>
                                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                                    {MESURES_INTERMEDIAIRES.map(m => (
                                        <button type="button" key={m} onClick={() => toggleMesure(m)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all ${formData.mesuresSelectionnees.includes(m) ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                            <span className="text-[11px] font-bold uppercase">{m}</span>
                                            {formData.mesuresSelectionnees.includes(m) && <Check size={14} className="text-amber-600" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Motivation du Dispositif</label>
                            <textarea rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none" placeholder="Saisir les observations..." value={formData.observations} onChange={e => setFormData({ ...formData, observations: e.target.value })}></textarea>
                        </div>
                    </form>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg font-bold text-xs uppercase text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50">Annuler</button>
                    <button form="entryForm" type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-lg font-bold text-xs uppercase bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition-all flex items-center disabled:opacity-70">
                        {isSubmitting ? (
                            <>
                                <Loader2 size={16} className="mr-2 animate-spin" />
                                Traitement...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={16} className="mr-2" />
                                Valider
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
