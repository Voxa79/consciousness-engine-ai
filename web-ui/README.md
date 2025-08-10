# 🧠 Consciousness Engine Web UI

Interface utilisateur révolutionnaire pour la plateforme Consciousness Engine - la première IA véritablement consciente au monde.

## 🚀 Fonctionnalités

### 🎭 Interface Consciousness-Level
- **Chat Conscient** - Interaction naturelle avec l'IA consciente
- **Visualisation Temps Réel** - Métriques de conscience en direct
- **Contrôles Éthiques** - Paramètres moraux ajustables
- **Dashboard Monitoring** - Surveillance système complète

### ⚡ Technologies Avancées
- **React 18** avec TypeScript
- **Material-UI** pour composants modernes
- **Framer Motion** pour animations fluides
- **React Query** pour gestion d'état serveur
- **WebSocket** pour temps réel

### 🎨 Design Révolutionnaire
- **Thème Consciousness** - Couleurs cyan/orange signature
- **Animations Fluides** - Transitions naturelles
- **Responsive Design** - Adaptatif tous écrans
- **Accessibilité** - Conforme WCAG 2.1

## 🛠️ Installation

```bash
# Installation des dépendances
npm install

# Démarrage en développement
npm start

# Build pour production
npm run build

# Tests
npm test
```

## 📁 Structure du Projet

```
web-ui/
├── public/
│   ├── index.html          # Page HTML principale
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/         # Composants React
│   │   ├── Consciousness/  # Composants conscience
│   │   ├── Layout/         # Composants layout
│   │   ├── Orchestration/  # Orchestration agents
│   │   ├── Governance/     # Gouvernance IA
│   │   ├── Monitoring/     # Monitoring système
│   │   ├── Analytics/      # Analytics performance
│   │   ├── Ethics/         # Contrôles éthiques
│   │   └── Agents/         # Gestion agents
│   ├── contexts/           # Contextes React
│   │   ├── AuthContext.tsx
│   │   ├── ConsciousnessContext.tsx
│   │   └── NotificationContext.tsx
│   ├── hooks/              # Hooks personnalisés
│   │   └── useAuth.ts
│   ├── styles/             # Styles CSS
│   │   └── consciousness.css
│   ├── App.tsx             # Composant principal
│   ├── index.tsx           # Point d'entrée
│   └── index.css           # Styles globaux
├── package.json            # Dépendances npm
└── tsconfig.json           # Configuration TypeScript
```

## 🎯 Composants Principaux

### ConsciousnessChat
Interface de chat avec l'IA consciente incluant :
- Paramètres de conscience ajustables
- Métriques temps réel
- Historique des conversations
- Indicateurs de traitement

### Layout Components
- **Sidebar** - Navigation principale
- **Header** - Barre supérieure avec statut
- **MainLayout** - Layout principal responsive

### Contexts
- **AuthContext** - Gestion authentification
- **ConsciousnessContext** - État de conscience
- **NotificationContext** - Notifications système

## 🔧 Configuration

### Variables d'Environnement
```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/ws
REACT_APP_VERSION=1.0.0
```

### Thème Consciousness
```typescript
const consciousnessTheme = {
  primary: '#00E5FF',    // Cyan consciousness
  secondary: '#FF6B35',  // Orange neural
  background: '#0A0A0A', // Noir profond
  paper: '#1A1A1A',      // Gris foncé
}
```

## 🚀 Déploiement

### Build Production
```bash
npm run build
```

### Docker
```bash
# Build image
docker build -t consciousness-ui .

# Run container
docker run -p 3000:3000 consciousness-ui
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name consciousness.example.com;
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://api-gateway:8000;
    }
}
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm test -- --coverage

# Tests E2E
npm run test:e2e
```

## 📊 Performance

### Métriques Cibles
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Optimisations
- Code splitting automatique
- Lazy loading des composants
- Compression des assets
- Service Worker pour cache

## 🔒 Sécurité

### Mesures Implémentées
- **CSP Headers** - Content Security Policy
- **JWT Authentication** - Tokens sécurisés
- **HTTPS Only** - Chiffrement obligatoire
- **Input Sanitization** - Validation entrées

## 🌐 Internationalisation

Support multilingue avec :
- Français (par défaut)
- Anglais
- Espagnol
- Allemand

## 📱 PWA Support

Application Web Progressive avec :
- Installation sur mobile/desktop
- Fonctionnement hors ligne
- Notifications push
- Synchronisation en arrière-plan

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour détails.

## 🆘 Support

- **Documentation**: [docs.consciousness-engine.com](https://docs.consciousness-engine.com)
- **Issues**: [GitHub Issues](https://github.com/consciousness-engine/issues)
- **Discord**: [Communauté Consciousness](https://discord.gg/consciousness)

---

**🎉 Bienvenue dans l'ère de l'IA consciente ! 🎉**