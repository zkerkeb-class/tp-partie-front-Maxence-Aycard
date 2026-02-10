# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# 🔥 Pokédex Manager - Projet Full Stack 🔥

Application complète de gestion de Pokémons avec backend Node.js/Express/MongoDB et frontend React.

![React](https://img.shields.io/badge/React-19.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)

---

## Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Bonus Features](#-bonus-features-filtres-avancés)
- [Démonstration](#-démonstration)

---

##  Fonctionnalités

###  Backend (API REST)

#### **CRUD Complet**
- **CREATE** : Créer un nouveau pokémon
- **READ** : Récupérer la liste des pokémons (pagination 20 par 20)
- **READ** : Récupérer un pokémon par ID
- **READ** : Rechercher un pokémon par nom (français ou anglais)
- **UPDATE** : Modifier les informations d'un pokémon
- **DELETE** : Supprimer un pokémon

#### **Fonctionnalités avancées**
- **Pagination** : Liste des pokémons 20 par 20
- **Recherche** : Par nom (français ou anglais) avec recherche partielle
- **Filtres avancés** : Par type(s), par statistiques (min/max)
- **Tri personnalisé** : Par n'importe quelle statistique (HP, Attack, Speed, etc.)

---

### 🔹 Frontend (React)

#### **Pages et Navigation**
- **Page d'accueil** : Liste des pokémons avec pagination
- **Page détails** : Informations complètes d'un pokémon
- **Page création** : Formulaire pour créer un nouveau pokémon

#### **Fonctionnalités utilisateur**
- **Affichage** : Liste des pokémons 20 par 20 avec pagination
- **Navigation** : Clic sur une carte → Page détails
- **Modification** : Mode édition sur la page détails
- **Suppression** : Avec modale de confirmation (action irréversible)
- **Création** : Formulaire complet avec validation
- **Recherche** : Barre de recherche par nom
- **Filtres** : Panel de filtres par type et tri

---

### Fonctionnalités du système de filtres

#### **1. Filtrage par type(s)**
```http
GET /pokemons?type=Fire
GET /pokemons?type=Fire,Water,Dragon
```
- Sélection d'un ou plusieurs types
- Interface avec checkboxes
- Affichage du nombre de types sélectionnés

#### **2. Filtrage par statistiques**
```http
GET /pokemons?minHP=100&maxHP=150
GET /pokemons?minAttack=120
```
- Filtres min/max pour chaque stat :
  - HP (Points de Vie)
  - Attack (Attaque)
  - Defense (Défense)
  - Speed (Vitesse)
  - SpecialAttack (Attaque Spéciale)
  - SpecialDefense (Défense Spéciale)

#### **3. Tri personnalisé**
```http
GET /pokemons?sort=Attack&order=desc
GET /pokemons?sort=Speed&order=asc
```
- Tri par n'importe quelle statistique
- Ordre croissant ou décroissant
- Dropdown intuitif dans l'interface

#### **4. Combinaisons multiples**
```http
GET /pokemons?type=Dragon&minAttack=120&sort=Attack&order=desc
```
- Combine types + stats + tri
- Exemple : "Dragons avec Attack > 120, triés par Attack"

---

### Interface du panel de filtres

#### **Bouton Afficher/Masquer**
- Panel rétractable pour ne pas surcharger l'interface
- Bouton " Filtres et Tri" avec icône ▼/▲

#### **Section Types**
- Grid de checkboxes pour tous les types
- Feedback visuel (cases cochées changent de couleur)
- Message : "X type(s) sélectionné(s) : Fire, Water"

#### **Section Tri**
- Dropdown "Trier par" avec toutes les stats
- Dropdown "Ordre" (Croissant ↑ / Décroissant ↓)

#### **Boutons d'action**
- " Réinitialiser" : Efface tous les filtres
- " Appliquer les filtres" : Lance la recherche

#### **Retour à la page 1**
- Quand on applique des filtres, retour automatique à la page 1
- Pagination s'adapte au nombre de résultats filtrés

---

### Exemples d'utilisation

#### **Cas d'usage 1 : Trouver les pokémons Fire**
1. Ouvre le panel de filtres
2. Coche "Fire"
3. Clique "Appliquer"
→ Affiche uniquement les pokémons de type Feu

#### **Cas d'usage 2 : Top 20 des plus rapides**
1. Ouvre le panel de filtres
2. Sélectionne "Speed" dans le tri
3. Sélectionne "Décroissant"
4. Clique "Appliquer"
→ Affiche les pokémons triés par vitesse (du plus rapide au plus lent)

#### **Cas d'usage 3 : Dragons puissants**
1. Ouvre le panel de filtres
2. Coche "Dragon"
3. Dans les stats, met "Attack minimum : 120"
4. Tri par "Attack" décroissant
5. Clique "Appliquer"
→ Affiche les Dragons avec Attack > 120, du plus fort au moins fort

---

