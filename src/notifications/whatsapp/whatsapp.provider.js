/**
 * @interface WhatsAppProvider
 * Classe de base pour les fournisseurs de services WhatsApp.
 */
class WhatsAppProvider {
    /**
     * Envoie un message via un template.
     * @param {string} to - Numéro de téléphone du destinataire (avec code pays).
     * @param {string} template - Nom du template.
     * @param {Record<string, any>} data - Données dynamiques pour le template.
     * @returns {Promise<void>}
     */
    async send(to, template, data) {
        throw new Error("La méthode 'send' doit être implémentée par le provider.");
    }
}

module.exports = WhatsAppProvider;
