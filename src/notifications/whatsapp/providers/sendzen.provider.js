const axios = require('axios');
const WhatsAppProvider = require('../whatsapp.provider');
const config = require('../../../config/config');

/**
 * Implémentation du provider WhatsApp pour SendZen.
 */
class SendZenProvider extends WhatsAppProvider {
    constructor() {
        super();
        this.apiKey = config.SENDZEN.API_KEY;
        this.apiUrl = config.SENDZEN.API_URL;
    }

    /**
     * @param {string} to 
     * @param {string} template 
     * @param {Record<string, any>} data 
     */
    async send(to, template, data) {
        if (!this.apiKey) {
            console.error("[SendZen] API Key manquante dans la configuration.");
            throw new Error("SendZen API Key missing");
        }

        const payload = {
            to: to,
            template: template,
            data: data
        };

        try {
            console.log(`[SendZen] Envoi de message à ${to} avec le template ${template}`);
            await axios.post(this.apiUrl, payload, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`[SendZen] Succès: Message envoyé à ${to}`);
        } catch (err) {
            const errorDetails = err.response?.data || err.message;
            console.error("[SendZen] Erreur de l'API:", errorDetails);
            throw new Error(`SendZen failure: ${JSON.stringify(errorDetails)}`);
        }
    }
}

module.exports = SendZenProvider;
