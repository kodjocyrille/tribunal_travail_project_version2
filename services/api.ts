
import { Affaire, Audience, PlumitifEntry, Credentials, AuthResponse, StatsReport, EnrolementRequest, ApiResponse, RenvoyerRequest } from '../types';

// =========================================================
// CONFIGURATION : CHANGER L'URL ICI POUR CONNECTER TON BACKEND
// =========================================================
const BASE_URL = 'https://tribunal-travail.runasp.net/api';

/**
 * Wrapper de requête générique (pour gérer les tokens et les erreurs)
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('SIGA_AUTH_TOKEN');

  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  });

  // --- APPEL API RÉEL ---
  console.log(`[API ${options.method || 'GET'}] ${endpoint}`);
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
      // Tentative d'extraction du message d'erreur de l'API
      const errorText = await response.text();
      let errorData: any = {};
      try {
        errorData = errorText ? JSON.parse(errorText) : {};
        console.error("API Error Details:", errorData);
      } catch (e) {
        console.warn("Could not parse error response JSON:", errorText);
      }

      // Gestion des erreurs de validation (ex: ASP.NET Core ou Custom ApiResponse)
      if (errorData.errors) {
        let validationErrorMsg = '';

        if (Array.isArray(errorData.errors)) {
          // Cas où errors est un tableau de chaînes (ex: notre ApiResponse)
          validationErrorMsg = errorData.errors.join('\n');
        } else {
          // Cas où errors est un objet (ex: ASP.NET ValidationProblemDetails standard)
          validationErrorMsg = Object.entries(errorData.errors)
            .map(([key, msgs]) => {
              const messages = Array.isArray(msgs) ? msgs.join(', ') : msgs;
              return `${key}: ${messages}`;
            })
            .join('\n');
        }

        if (validationErrorMsg) {
          throw new Error(`Erreur de validation:\n${validationErrorMsg}`);
        }
      }

      throw new Error(errorData.message || errorData.title || `Erreur ${response.status}: ${response.statusText}`);
    }

    // Gestion des réponses vides ou corps vide
    const text = await response.text();
    if (!text || response.status === 204) {
      return {} as T;
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      return {} as T;
    }
  } catch (error) {
    if (error instanceof Error) {
      // On relance l'erreur pour la gérer dans les composants
      throw error;
    }
    throw new Error('Une erreur inconnue est survenue lors de la communication avec le serveur.');
  }
}

export const ApiService = {
  // A. AUTHENTIFICATION (/auth)
  auth: {
    login: async (creds: Credentials): Promise<AuthResponse> => {
      // Le backend attend "email" et non "username"
      const { role, username, ...rest } = creds;
      const loginPayload = { ...rest, email: username };

      return request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginPayload)
      });
    }
  },

  // B. GESTION DE L'ENRÔLEMENT (/affaires)
  affaires: {
    getAll: (filters?: string) => request<ApiResponse<Affaire[]>>(`/affaires/${filters ? '?' + filters : ''}`),
    getById: (id: string) => request<ApiResponse<Affaire>>(`/affaires/${id}/`),
    create: (data: EnrolementRequest) => request<ApiResponse<Affaire>>('/affaires/enroler/', {
      method: 'POST',
      body: JSON.stringify({ request: data })
    }),
    update: (id: string, data: Partial<Affaire>) => request<ApiResponse<Affaire>>(`/affaires/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ request: data })
    }),
    renvoyer: (id: string, data: RenvoyerRequest) => request<ApiResponse<void>>(`/affaires/${id}/renvoyer/`, {
      method: 'POST',
      body: JSON.stringify({ request: data })
    }),
  },

  // C. PLANIFICATION ET RÔLES (/audiences)
  audiences: {
    getAll: () => request<Audience[]>('/audiences/'),
    getDaily: (date: string) => request<Audience[]>(`/audiences/daily/?date=${date}`),
    create: (data: Partial<Audience>) => request<Audience>('/audiences/', { method: 'POST', body: JSON.stringify({ request: data }) }),
  },

  // D. GESTION DES PLUMITIFS (/plumitifs)
  plumitifs: {
    getByAffaire: (affaireId: string) => request<PlumitifEntry[]>(`/plumitifs/?affaireId=${affaireId}`),
    create: (data: Partial<PlumitifEntry>) => request<PlumitifEntry>('/plumitifs/', { method: 'POST', body: JSON.stringify({ request: data }) }),
  },

  // E. STATISTIQUES (/stats)
  stats: {
    getDashboard: () => request<any>('/stats/dashboard/'),
    getReports: (debut: string, fin: string) => request<StatsReport>(`/stats/reports/?debut=${debut}&fin=${fin}`),
    syncToMinistry: (data: any) => request<any>('/stats/sync-db/', { method: 'POST', body: JSON.stringify({ request: data }) }),
  }
};
