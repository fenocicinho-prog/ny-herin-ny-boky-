# Rapport d'audit : Failles de sécurité, bugs et analyse des fonctionnalités (Admin & MVola)

**Projet :** Ny Herin'ny Boky
**Date :** 29 Juillet 2026
**Auteur :** Manus AI

Ce rapport détaille l'analyse de sécurité, les bugs identifiés dans le code, ainsi que l'état de fonctionnement des fonctionnalités d'administration et de paiement MVola manuel.

---

## 1. Failles de Sécurité Identifiées

Plusieurs failles de sécurité critiques ont été détectées dans le code actuel, pouvant compromettre l'intégrité des données et des paiements.

### 1.1. Acceptation des mots de passe en clair (Faille Critique)
Le système d'authentification possède une faille majeure dans la route de connexion (`/api/auth/login/route.ts`). Il vérifie d'abord si le mot de passe commence par `$2a` (format bcrypt), mais sinon, il accepte une comparaison en clair (`password === user.password`).

```typescript
const isValid = user.password.startsWith('$2a') 
  ? await bcrypt.compare(password, user.password)
  : password === user.password;
```
**Risque :** Un utilisateur malveillant peut créer un compte avec un mot de passe en clair (si la validation bcrypt n'est pas forcée à l'inscription) et le système l'acceptera. De plus, si la base de données est compromise, les mots de passe en clair sont immédiatement exploitables.

### 1.2. Endpoint de création de commande non sécurisé
La route `/api/orders/route.ts` permet la création de commandes Stripe marquées comme `COMPLETED` sans aucune vérification de session utilisateur ni validation de paiement.

```typescript
export async function POST(request: Request) {
  const body = await request.json()
  const userId = body.userId || body.buyerId // Accepte n'importe quel ID
  // ...
  const order = await prisma.order.create({
    data: { 
      userId, 
      // ...
      paymentStatus: 'COMPLETED', // Marque directement comme payé !
      // ...
    }
  })
}
```
**Risque :** N'importe qui peut envoyer une requête POST à cet endpoint pour créer de fausses commandes, simuler des paiements et marquer des livres comme achetés.

### 1.3. Endpoint de création d'utilisateurs non protégé
La route `/api/users/route.ts` permet la création de nouveaux utilisateurs avec n'importe quel rôle, y compris `ADMIN`, sans vérification d'authentification.

**Risque :** Un attaquant peut créer un compte administrateur simplement en envoyant une requête POST avec `role: "ADMIN"`.

### 1.4. Fuite d'informations sensibles
Dans la page de paiement MVola (`/client/paiement-mvola/[orderId]/page.tsx`), le numéro de téléphone du vendeur (ou de la plateforme) est affiché en clair dans l'interface utilisateur. Bien que ce soit nécessaire pour le paiement manuel, il est crucial de s'assurer que ce numéro n'est pas modifiable par l'utilisateur et qu'il correspond bien à la configuration serveur.

---

## 2. Bugs Fonctionnels Identifiés

Plusieurs incohérences ont été relevées entre le schéma de base de données, les migrations et le code applicatif.

### 2.1. Incohérence du Schéma Prisma vs Migration
Le fichier `schema.prisma` actuel ne reflète pas la structure complète de la base de données utilisée par le code. La migration `20260728115618_init/migration.sql` montre que la table `Order` contient des champs comme `mvolaStatus`, `clientTrxRef`, `platformFee`, `vendorPaymentAmount`, et qu'il existe une table `OrderItem` liée.
Cependant, le `schema.prisma` actuel ne définit pas la relation `items` sur le modèle `Order`, ni les champs `mvolaStatus` et `clientTrxRef`. Cela provoquera des erreurs TypeScript et d'exécution lors de la compilation.

### 2.2. Erreur de requête de recherche (Client Dashboard)
Dans le fichier `app/client/page.tsx`, la recherche de livres utilise le champ `name` au lieu de `title` :
```typescript
where.OR = [
  { name: { contains: query } }, // Devrait être 'title'
  { description: { contains: query } },
];
```
**Impact :** La barre de recherche sur le tableau de bord client ne fonctionnera pas et générera une erreur Prisma.

### 2.3. Gestion des rôles incomplète à l'inscription
Le système permet de créer des rôles `CLIENT` et `VENDOR` via l'UI, mais il n'existe aucun flux d'inscription pour le rôle `ADMIN`. Un administrateur ne peut être créé que manuellement via le script `scripts/seed-admin.ts` ou en injectant directement les données en base.

---

## 3. Analyse de la Fonctionnalité Admin

La fonctionnalité d'administration existe et tente de gérer la validation des paiements MVola, mais elle souffre de désynchronisation avec le reste de l'application.

### État actuel :
- **Dashboard Admin :** Le composant `app/admin/page.tsx` appelle `/api/admin/orders` pour récupérer les commandes en attente de vérification (`mvolaStatus: "EN_ATTENTE_VERIFICATION"`).
- **Validation :** Lorsqu'un administrateur clique sur "Confirmer", l'endpoint `/api/admin/validate-payment` met à jour le statut en `TERMINE` et `COMPLETED`.

### Problèmes identifiés :
1. **Instance Prisma unique :** Dans `app/api/admin/orders/route.ts`, une nouvelle instance `const prisma = new PrismaClient()` est créée à chaque requête, ce qui peut épuiser les connexions à la base de données en production. Il faut utiliser l'instance singleton du fichier `lib/prisma.ts`.
2. **Accès Admin :** Comme mentionné plus haut, l'accès au dashboard admin n'est protégé que par une vérification de cookie côté serveur. Si le fichier de cookie est volé, l'accès est compromis.
3. **Incohérence de modèle :** Le dashboard admin s'attend à recevoir des données via la relation `items`, mais le schéma Prisma principal ne contient pas cette relation correctement définie pour toutes les requêtes.

---

## 4. Analyse de la Fonctionnalité Paiement MVola Manuel

Le flux de paiement MVola manuel est divisé en plusieurs étapes, mais il présente des failles critiques dans la chaîne de confiance.

### Flux actuel :
1. Le client clique sur "Payer" et choisit Mobile Money.
2. Une commande est créée avec `paymentStatus: "PENDING"` et `mvolaStatus: "EN_ATTENTE_CLIENT"`.
3. Le client est redirigé vers `/client/paiement-mvola/[orderId]` où il voit le numéro à payer et doit saisir une référence de transaction (`clientTrxRef`).
4. Le client soumet le formulaire, la référence est enregistrée et le statut passe à `EN_ATTENTE_VERIFICATION`.
5. L'administrateur vérifie la réception de l'argent et valide la commande.

### Problèmes identifiés :
1. **Faille de confirmation client :** Il existe une action serveur `confirmMobilePaymentAction` (utilisée dans `app/client/commande/[id]/page.tsx`) qui permet au client de marquer lui-même sa commande comme `COMPLETED` sans preuve de paiement :
   ```typescript
   await prisma.order.update({
     where: { id: orderId },
     data: { paymentStatus: "COMPLETED" },
   });
   ```
   **Risque critique :** Un client malhonnête peut utiliser ce bouton "Nanome vola aho — Manamarina" (J'ai envoyé l'argent - Confirmer) pour valider sa commande sans que l'administrateur n'ait réellement reçu les fonds. Cette fonctionnalité doit être retirée ou strictement encadrée par la validation admin.

2. **Webhook MVola :** Un webhook `/api/mvola/receive/route.ts` existe, ce qui est excellent. Cependant, le champ `mvolaStatus: "PAYE"` est mis à jour, mais le schéma Prisma ne reconnaît pas ce champ, ce qui provoquera une erreur lors de l'exécution.

3. **Incohérence des calculs de commission :** La route `/api/orders/create/route.ts` utilise une fonction de commission basée sur des tranches (8%, 7%, 5%), tandis que `app/actions/orders.ts` utilise un calcul fixe de 10%. Cette divergence peut causer des erreurs financières.

---

## Recommandations

1. **Sécuriser l'authentification :** Retirer la comparaison en clair des mots de passe dans la route de login et forcer le hachage bcrypt.
2. **Supprimer les endpoints vulnérables :** Supprimer ou sécuriser immédiatement `/api/orders/route.ts` et `/api/users/route.ts`.
3. **Synchroniser le Schéma Prisma :** Mettre à jour le fichier `schema.prisma` pour qu'il corresponde exactement à la migration `20260728115618_init/migration.sql`, puis exécuter `npx prisma generate`.
4. **Réparer la recherche client :** Changer `name` en `title` dans la requête Prisma du dashboard client.
5. **Supprimer l'auto-confirmation client :** Retirer la possibilité pour le client de marquer lui-même sa commande comme payée. Le statut ne doit passer à `COMPLETED` que suite à la validation de l'administrateur ou via le webhook officiel MVola.
6. **Corriger les instances Prisma :** Remplacer `new PrismaClient()` par l'importation du singleton `import { prisma } from '@/lib/prisma'` dans tous les fichiers API.
