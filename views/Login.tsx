
import React, { useState } from 'react';
import { useAppState } from '../store';
import { UserRole } from '../types';
import { ApiService } from '../services/api';
import { Scale, User, Lock, ArrowRight, Gavel, AlertCircle, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAppState();
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.GREFFIER_ACCUEIL);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Appel au service d'auth centralisé
      const response = await ApiService.auth.login({ username, password, role: selectedRole });

      // Utiliser le rôle retourné par le backend s'il est différent de celui sélectionné (source de vérité)
      // Note: Le rôle n'est plus directement dans data d'après le JSON fourni, on garde celui sélectionné pour l'instant
      // ou on devrait le décoder du token. Pour l'instant on garde selectedRole.
      // Note: Le rôle est maintenant dans un tableau "roles" (ex: ["ADMIN"]),
      // mais on continue d'utiliser selectedRole pour l'instant pour la compatibilité avec l'UI existante.
      const finalRole = selectedRole;

      const { accessToken, nomComplet, email } = response.data;

      // Si nomComplet est vide, on utilise la partie locale de l'email
      const displayNom = nomComplet && nomComplet.trim() !== ''
        ? nomComplet
        : (email ? email.split('@')[0] : 'Utilisateur');

      login(finalRole, accessToken, displayNom);
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-3xl shadow-2xl mb-8 group transition-transform hover:scale-105 duration-500">
            <Scale size={48} className="text-white group-hover:rotate-12 transition-transform" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">SIGA-TT</h1>
          <p className="text-blue-200/40 text-[10px] mt-3 font-black uppercase tracking-[0.4em]">Système de Gestion du Tribunal du Travail</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
          <div className="p-10 md:p-12">
            <h2 className="text-xl font-black text-gray-900 mb-8 text-center uppercase tracking-tight">Espace Greffier</h2>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center text-red-700 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="mr-3 flex-shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sélectionnez votre profil d'audience</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedRole(UserRole.GREFFIER_ACCUEIL)}
                    className={`p-5 rounded-[2rem] border-2 flex flex-col items-center justify-center transition-all duration-300 ${selectedRole === UserRole.GREFFIER_ACCUEIL
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-600/10'
                      : 'border-gray-50 bg-gray-50/50 text-gray-400 hover:border-gray-200'
                      }`}
                  >
                    <User size={24} className="mb-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Accueil / Enrôlement</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole(UserRole.GREFFIER_AUDIENCE)}
                    className={`p-5 rounded-[2rem] border-2 flex flex-col items-center justify-center transition-all duration-300 ${selectedRole === UserRole.GREFFIER_AUDIENCE
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-600/10'
                      : 'border-gray-50 bg-gray-50/50 text-gray-400 hover:border-gray-200'
                      }`}
                  >
                    <Gavel size={24} className="mb-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Plumitif / Jugement</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-300 group-focus-within:text-blue-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Email"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-100 rounded-2xl text-gray-900 font-bold outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-300 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="Mot de passe"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-100 rounded-2xl text-gray-900 font-bold outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Connecter la Session <ArrowRight size={18} className="ml-3 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>

              <p className="text-center text-[9px] text-gray-300 font-bold uppercase tracking-widest pt-4">
                <ShieldCheck size={12} className="inline mr-1 mb-0.5" /> Sécurisé par le Ministère de la Justice
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
