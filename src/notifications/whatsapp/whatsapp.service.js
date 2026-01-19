const { templates } = require('./templates/whatsapp.templates');

/**
 * Service pour gérer l'envoi de messages WhatsApp via des templates.
 */
class WhatsAppService {
    /**
     * @param {import('./whatsapp.provider')} provider - Une instance d'un provider WhatsApp.
     */
    constructor(provider) {
        this.provider = provider;
    }

    /**
     * Envoie un message basé sur un template prédéfini.
     * @param {string} to - Numéro de téléphone.
     * @param {string} templateName - Nom du template défini dans whatsapp.templates.js.
     * @param {Record<string, any>} params - Paramètres pour remplir le template.
     */
    async sendTemplate(to, templateName, params) {
        const templateFn = templates[templateName];

        if (!templateFn) {
            console.error(`[WhatsAppService] Template non trouvé: ${templateName}`);
            throw new Error(`Template not found: ${templateName}`);
        }

        // Formater les données selon le template
        const data = templateFn(params);

        // Déléguer l'envoi au provider
        await this.provider.send(to, templateName, data);
    }
}

module.exports = WhatsAppService;
