// PROXY DÉSACTIVÉ EN MODE FINAL STABLE - CTO NEXT GEN
// Évite les conflits et boucles de rafraîchissement

module.exports = function (app) {
  // Mode final stable - aucun proxy actif
  console.log('🎯 Proxy désactivé - Mode Final Stable CTO');

  // Désactivation complète du proxy pour éviter les conflits
  if (process.env.REACT_APP_DISABLE_PROXY === 'true') {
    console.log('✅ Proxy complètement désactivé');
    return;
  }

  // Fallback - proxy minimal si nécessaire (non utilisé en mode final)
  console.log('⚠️ Proxy en mode minimal');
};
