// app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Importez votre fonction de login existante
// import { login } from "@/lib/auth-actions"; 

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Tentez de connecter l'utilisateur avec votre fonction existante
      // const result = await login(email, password); 
      
      // SIMULATION (À remplacer par votre vrai appel de login)
      const res = await fetch('/api/auth/login', { // Adaptez selon votre endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error('Identifiants invalides');
      
      const user = await res.json();

      // 2. VÉRIFICATION CRITIQUE DU RÔLE
      if (user.role !== 'ADMIN') {
        setError('Accès refusé : Vous n\'êtes pas administrateur.');
        return;
      }

      // 3. Redirection vers le dashboard si tout est bon
      router.push('/admin');
      
    } catch (err) {
      setError('Erreur de connexion.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Connexion Admin</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Se connecter
        </button>
      </form>
    </div>
  );
}   