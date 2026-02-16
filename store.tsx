
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Affaire, Audience, PlumitifEntry, UserRole, PersonnelStat, NatureAffaire, EtatAffaire, TypeAudience, TypeAudienceConciliation } from './types';
import { ApiService } from './services/api';
import { NATURE_LABELS } from './constants';

const INITIAL_AFFAIRES: Affaire[] = [
  {
    id: '1',
    numOrdre: '2026-001',
    numRoleGeneral: '001/2026',
    dateRequete: '2026-01-10',
    dateArrivee: '2026-01-12',
    nature: NatureAffaire.LIC,
    typeDossier: 'individuel',
    resume: 'Licenciement abusif sans préavis',
    etat: EtatAffaire.EN_CONCIL,
    parties: [
      { id: 'p1', type: 'demandeur', qualite: 'Salarié', nom: 'KOFFI Mensah', adresse: 'Lomé, Quartier Adidogomé' },
      { id: 'p2', type: 'defendeur', qualite: 'Employeur', nom: 'SOCIETE TOUGAN SA', adresse: 'Zone Industrielle' }
    ],
    dateCreation: '2026-01-12T10:00:00Z',
    natureAudienceConciliation: TypeAudienceConciliation.NORMAL,
    dateAudienceConciliation: new Date().toISOString().split('T')[0],
    audiences: [],
    historiqueRenvois: []
  }
];

interface AppState {
  affaires: Affaire[];
  audiences: Audience[];
  plumitifs: PlumitifEntry[];
  personnel: PersonnelStat[];
  currentUserRole: UserRole | null;
  userFullName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole, token: string, fullName?: string) => void;
  logout: () => void;
  refreshData: () => Promise<void>;
  addAffaire: (affaire: Partial<Affaire>) => Promise<Affaire>;
  updateAffaire: (id: string, updates: Partial<Affaire>) => Promise<void>;
  addPlumitifEntry: (entry: Partial<PlumitifEntry>) => Promise<void>;
  getAffaireById: (id: string) => Affaire | undefined;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('SIGA_AUTH_TOKEN'));
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(
    localStorage.getItem('SIGA_USER_ROLE') as UserRole || null
  );

  const [userFullName, setUserFullName] = useState<string | null>(
    localStorage.getItem('SIGA_USER_FULLNAME') || null
  );

  const [affaires, setAffaires] = useState<Affaire[]>([]);

  const mapApiDataToAffaires = (data: any[]): Affaire[] => {
    return data.map(item => {
      const rawEtat = (item.etatAffaire || item.etat || 'ENR').toUpperCase();
      const etat = Object.values(EtatAffaire).includes(rawEtat as EtatAffaire)
        ? rawEtat as EtatAffaire
        : (
          // Mapping fallback for known backend status variances
          rawEtat === 'ENROLEE' ? EtatAffaire.ENR :
            rawEtat === 'EN_CONCILIATION' ? EtatAffaire.EN_CONCIL :
              rawEtat === 'CONCILIATION' ? EtatAffaire.EN_CONCIL :
                rawEtat === 'CONCILIATION_REUSSIE' ? EtatAffaire.CONC_REUSSIE :
                  rawEtat === 'CONCILIATION_ECHOUEE' ? EtatAffaire.CONC_ECHOUEE :
                    rawEtat === 'EN_JUGEMENT' ? EtatAffaire.EN_JUG :
                      rawEtat === 'JUGEMENT' ? EtatAffaire.EN_JUG :
                        rawEtat === 'RENVOYEE' ? EtatAffaire.RENVOYEE :
                          rawEtat === 'EN_DELIBERE' ? EtatAffaire.EN_DELIBERE :
                            rawEtat === 'JUGEE' ? EtatAffaire.JUGEE_1R :
                              EtatAffaire.ENR
        );

      const rawNature = (item.natureLitige || item.nature || 'AUTRE').toUpperCase();
      const nature = Object.keys(NATURE_LABELS).includes(rawNature) ? rawNature as NatureAffaire : NatureAffaire.AUT;

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
        parties: (() => {
          if (typeof item.parties === 'string') {
            const cleanParties = item.parties.replace(/\^/g, ' ').replace(/\s+/g, ' ');
            const parts = cleanParties.split(/ vs /i);
            const result = [];
            if (parts[0]) result.push({ id: 'dem_' + item.id, nom: parts[0].trim(), type: 'demandeur', qualite: 'Demandeur', adresse: '' });
            if (parts[1]) result.push({ id: 'def_' + item.id, nom: parts[1].trim(), type: 'defendeur', qualite: 'Défendeur', adresse: '' });
            if (result.length === 0 && cleanParties) {
              result.push({ id: 'dem_' + item.id, nom: cleanParties.trim(), type: 'demandeur', qualite: 'Partie', adresse: '' });
            }
            return result;
          }
          return (Array.isArray(item.parties) ? item.parties : []).map((p: any) => ({
            ...p,
            nom: p.nom || p.nomComplet || 'Inconnu',
            type: (p.type || p.typePartie || '').toLowerCase().includes('demandeur') ? 'demandeur' : 'defendeur',
          }));
        })()
      };
    });
  };

  useEffect(() => {
    const fetchAffaires = async () => {
      try {
        const response: any = await ApiService.affaires.getAll();
        let rawData: any[] = [];
        if (response?.data?.items && Array.isArray(response.data.items)) rawData = response.data.items;
        else if (Array.isArray(response)) rawData = response;
        else if (response?.data && Array.isArray(response.data)) rawData = response.data;
        else if (response?.isSuccess && Array.isArray(response.value)) rawData = response.value;

        setAffaires(mapApiDataToAffaires(rawData));
      } catch (error) {
        console.error("Failed to fetch initial affaires:", error);
      }
    };
    fetchAffaires();
  }, []);

  const [plumitifs, setPlumitifs] = useState<PlumitifEntry[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [personnel, setPersonnel] = useState<PersonnelStat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (affaires.length > 0) {
      localStorage.setItem('SIGA_AFFAIRES', JSON.stringify(affaires));
    }
  }, [affaires]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const response: any = await ApiService.affaires.getAll();
      // ... (reuse fetching logic if possible or extract to helper)
      let rawData: any[] = [];
      if (response?.data?.items && Array.isArray(response.data.items)) rawData = response.data.items;
      else if (Array.isArray(response)) rawData = response;
      else if (response?.data && Array.isArray(response.data)) rawData = response.data;
      else if (response?.isSuccess && Array.isArray(response.value)) rawData = response.value;

      setAffaires(mapApiDataToAffaires(rawData));
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const login = (role: UserRole, token: string, fullName?: string) => {
    localStorage.setItem('SIGA_AUTH_TOKEN', token);
    localStorage.setItem('SIGA_USER_ROLE', role);
    if (fullName) {
      localStorage.setItem('SIGA_USER_FULLNAME', fullName);
      setUserFullName(fullName);
    }
    setCurrentUserRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('SIGA_AUTH_TOKEN');
    localStorage.removeItem('SIGA_USER_ROLE');
    localStorage.removeItem('SIGA_USER_FULLNAME');
    setIsAuthenticated(false);
    setCurrentUserRole(null);
    setUserFullName(null);
  };

  const addAffaire = async (data: Partial<Affaire>) => {
    // Appel au service (simulé pour l'instant)
    // const newAffaire = await ApiService.affaires.create(data as any); // Commented out to avoid type mismatch with EnrolementRequest

    // Fallback local pour que l'UI réagisse tout de suite
    const localNew = { ...data, id: Math.random().toString(36).substring(7), dateCreation: new Date().toISOString(), audiences: [], historiqueRenvois: [] } as Affaire;
    setAffaires(prev => [...prev, localNew]);
    return localNew;
  };

  const updateAffaire = async (id: string, updates: Partial<Affaire>) => {
    await ApiService.affaires.update(id, updates);
    setAffaires(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const addPlumitifEntry = async (entry: Partial<PlumitifEntry>) => {
    await ApiService.plumitifs.create(entry);
    const newEntry = { ...entry, id: Math.random().toString(36).substring(7) } as PlumitifEntry;
    setPlumitifs(prev => [...prev, newEntry]);
  };

  const getAffaireById = (id: string) => affaires.find(a => a.id === id);

  return (
    <AppContext.Provider value={{
      affaires, audiences, plumitifs, personnel, currentUserRole, userFullName, isAuthenticated, isLoading,
      login, logout, refreshData,
      addAffaire, updateAffaire, addPlumitifEntry, getAffaireById
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used within AppProvider');
  return context;
};
