// js/api.js
const API_BASE_URL = '/api';

const api = {
    async get(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        return this.handleResponse(response);
    },

    async post(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        return this.handleResponse(response);
    },

    async handleResponse(response) {
        if (!response.ok) {
            let errorMessage = 'An error occurred';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Ignore JSON parse error if response is not JSON
            }
            throw new Error(errorMessage);
        }
        
        // If response has no content (e.g. 204 No Content for logout)
        if (response.status === 204) {
            return null;
        }

        return response.json();
    }
};
