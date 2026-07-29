# Résumé des Corrections Apportées

Ce document résume toutes les modifications de sécurité et de fonctionnalité apportées au projet **Ny Herin'ny Boky**, en préservant votre logique métier.

## 1. Synchronisation de la Base de Données
- **`prisma/schema.prisma`** : Le schéma a été entièrement réécrit pour correspondre exactement à la migration SQL réelle. J'ai ajouté les relations manquantes (`items` dans `Order`), les champs `mvolaStatus`, `clientTrxRef`, `platformFee`, etc., et le modèle `OrderItem`.

## 2. Corrections de Sécurité Critiques
- **`app/api/auth/login/route.ts`** : Suppression de la comparaison de mot de passe en clair. Le système utilise désormais toujours `bcrypt.compare`.
- **`app/api/users/route.ts`** : Sécurisation de l'endpoint. Un utilisateur doit être connecté pour créer un compte. Il est maintenant impossible de créer un compte avec le rôle `ADMIN` via cette API. Les mots de passe sont systématiquement hashés.
- **`app/api/orders/route.ts`** : Sécurisation de la création de commande. L'endpoint exige une session utilisateur valide et crée les commandes avec le statut `PENDING` au lieu de les marquer directement comme `COMPLETED`.

## 3. Corrections du Flux MVola Manuel et Paiements
- **`app/actions/orders.ts`** : Suppression de la fonction `confirmMobilePaymentAction` qui permettait aux clients de marquer eux-mêmes leurs commandes comme payées. Le flux redirige désormais obligatoirement vers la page de soumission de preuve MVola (`/client/paiement-mvola/[orderId]`). Harmonisation du calcul des commissions (8%, 7%, 5%).
- **`app/client/commande/[id]/page.tsx`** : Modification de l'interface. Le bouton "Nanome vola aho" redirige maintenant vers la page de saisie de la référence MVola au lieu de valider le paiement.
- **`app/api/orders/receive/route.ts`** : Ajout d'une vérification : un client ne peut marquer une commande comme "reçue" que si son statut de paiement est déjà `COMPLETED` (validé par l'admin).
- **`app/api/mvola/receive/route.ts`** : Utilisation du singleton Prisma au lieu d'instancier un nouveau client à chaque requête.

## 4. Corrections de Bugs Fonctionnels et UI
- **`app/client/page.tsx`** : Correction de la barre de recherche. Le champ `name` (inexistant) a été remplacé par `title`.
- **`app/api/admin/orders/route.ts`** : Utilisation du singleton Prisma pour éviter les fuites de mémoire/connexions.
- **`app/api/admin/validate-payment/route.ts`** : Ajout d'une vérification d'idempotence pour éviter de recalculer ou de modifier une commande déjà validée.
- **`components/books/PaymentModal.tsx`** : L'option de paiement `ON_SITE` a été correctement intégrée au flux MVola manuel via le backend, sans casser le formulaire.
- **`app/admin/page.tsx`** : Correction d'une boucle infinie de `useEffect` et du `fetch` qui surchargeait le serveur. Ajout d'un bouton d'actualisation manuel.
- **`app/connexion/page.tsx`** : La page de connexion gère maintenant correctement les trois rôles : `ADMIN`, `VENDOR`, et `CLIENT`, en redirigeant vers le bon dashboard.

---

### Étapes suivantes pour vous :
1. Exécutez `npx prisma generate` pour régénérer le client Prisma avec le nouveau schéma.
2. Lancez votre application en développement (`npm run dev`) pour vérifier que tout fonctionne.
3. Si vous n'avez pas d'administrateur en base de données, exécutez le script de seed : `npx tsx scripts/seed-admin.ts` (Email: `admin@marketbook.com`, Mot de passe: `1610422010`).
