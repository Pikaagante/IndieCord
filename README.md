# Bot Discord — IndieCord

Bot Discord développé en Node.js pour le serveur Le Coin Indé, un serveur communautaire dédié principalement aux jeux indépendants.

Le bot propose plusieurs systèmes : quiz, collection de personnages, captures, raretés, shiny, échanges, économie, classement et événements.

---

## Fonctionnalités

### Système de capture

Le bot possède un système de collection inspiré du bot Pokecord.

Lorsque les membres discutent sur le serveur, des personnages issus de jeux vidéo peuvent apparaître aléatoirement.

Le fonctionnement général est le suivant :

* Un personnage peut apparaître après un certain nombre de messages.
* À partir de 15 messages, un spawn peut apparaître.
* Si aucun personnage n'est apparu après 100 messages, un spawn forcé est déclenché.
* Les personnages possèdent différentes raretés :
  * Commun
  * Rare
  * Épique
  * Légendaire

* Certains personnages peuvent également être Shiny.
* Les membres peuvent collectionner les personnages et compléter leur Indiedex.
* Les doublons peuvent être vendus ou échangés.
* Un système d'économie permet d'acheter des box.

---

# 📋 Commandes

## `/help`

Affiche la liste des commandes disponibles ainsi que leur utilité.

---

## `/ajoutjeux`

Ajoute un jeu dans la liste des jeux utilisés pour les quiz dans `jeux.json`.
Cette liste permet notamment d'éviter de proposer plusieurs fois le même jeu dans les quiz.

---

## `/recherchejeux`

Recherche un jeu dans la liste des jeux enregistrés dans `jeux.json`.

---

## `/reponse`

Permet de répondre au quiz en cours.
La réponse est envoyée dans un salon réservé aux modérateurs afin qu'ils puissent vérifier la réponse et confirmer ou non sa validité.

---

## `/profil`

Affiche les informations du profil du joueur.

Le profil contient notamment :
* Argent disponible
* Taux de complétion de l'Indiedex
* Nombre total de personnages
* Nombre de doublons
* Nombre de Shiny
* Nombre de personnages communs
* Nombre de personnages rares
* Nombre de personnages épiques
* Nombre de personnages légendaires

---

## `/buy`

Permet d'utiliser son argent pour acheter une box contenant un personnage aléatoire.

---

## `/shop`

Affiche les box disponibles à l'achat.

---

## `/classement`

Affiche différents classements entre les membres du serveur.
Les classements peuvent notamment être basés sur :
* La rareté des personnages obtenus
* Le nombre de personnages uniques
* Le nombre total de personnages
* Le nombre de Shiny
* Et différentes statistiques de collection

---

## `/echange`

Permet de proposer un échange à un autre joueur.
Le joueur choisit :
* Le personnage qu'il souhaite donner
* Le personnage qu'il souhaite recevoir

L'autre joueur reçoit ensuite une demande et doit confirmer l'échange avant qu'il soit effectué.

---

## `/indiedex`

Affiche la collection du joueur.

L'Indiedex peut être filtré selon plusieurs critères.

### Filtres disponibles

* Personnage
* Licence
* Personnages débloqués
* Personnages non débloqués
* Les deux
* Rareté
* Shiny

Les filtres peuvent être combinés pour faire des recherches plus précises dans la collection.

---

## `/sell`

Permet de vendre des personnages contre de l'argent.
Plusieurs filtres sont disponibles :
* Personnage
* Rareté
* Quantité à vendre

Il est notamment possible de vendre plusieurs doublons en une seule fois.

---

# BDD

Le bot utilise actuellement des fichiers JSON comme système de stockage.
Ce choix a été fait principalement pour faciliter le développement et l'installation en local. 
Le serveur n'ayant pas besoin de gérer un très grand nombre d'utilisateurs, une base de données complète n'était pas nécessaire pour le moment.

---

## `argent.json`

Stocke l'argent des différents utilisateurs.

Exemple :

```json
{
    "123456789": 1500,
    "987654321": 750
}
```

---

## Raretés

Les personnages à capturer sont répartis dans plusieurs fichiers :

```text
common.json
rare.json
epic.json
legendary.json
```

Chaque personnage contient notamment :

* Son nom interne
* Son nom français
* Son nom anglais
* Son image
* Le jeu dont il provient

Exemple :

```json
"Froggit": {
    "names": {
        "fr": "Croapaud",
        "en": "Froggit"
    },
    "img": "9.png",
    "hint": "Undertale"
}
```

---

## `jeux.json`

Contient la liste des jeux déjà utilisés pour les quiz.
Cette liste permet notamment d'éviter les doublons lors des quiz.

---

## `special.json`

Contient les personnages utilisés pour les événements spéciaux.
Il peut notamment être utilisé pour des événements comme Noël.
Le système de spawn peut temporairement augmenter les chances de faire apparaître ces personnages.

---

## `special_nonuse.json`

Stocke les personnages prévus pour les événements mais qui n'ont pas encore été utilisés.

---

# Systèmes

Les systèmes internes du bot sont regroupés dans le dossier :
systems/


---

## `spawnsystem.js`

Gère la logique principale des apparitions de personnages. (code à refaire)

Le système s'occupe notamment :

* Du compteur de messages
* Des conditions permettant de déclencher un spawn
* Des probabilités d'apparition
* De la sélection d'un personnage
* Des raretés
* Des Shiny
* Des spawns forcés
* Des événements spéciaux

### Spawns

Un personnage peut apparaître après 15 messages.
Si aucun spawn n'a lieu après 100 messages, on déclenche automatiquement un spawn forcé.
Le système possède également une gestion des événements.

Un boolean permet d'activer ou de désactiver facilement la possibilité de faire apparaître des personnages provenant de `special.json`.

---

## `backup.js`

Système de sauvegarde automatique des fichiers JSON importants.
Chaque jour à 20h, le bot effectue une sauvegarde des données importantes afin de conserver une trace.

---

# 🚀 Installation

## Prérequis

Le bot nécessite :

* Node.js
* npm
* Un bot Discord créé sur le Discord Developer Portal

---

## Installation des dépendances

Les dépendances :

```bash
npm install
npm install discord.js@latest
```

---

# Configuration

Le fichier :

```text
config.js
```

n'est volontairement pas présent sur GitHub.
Il contient des informations sensibles nécessaires au fonctionnement du bot, notamment le token du bot Discord.
