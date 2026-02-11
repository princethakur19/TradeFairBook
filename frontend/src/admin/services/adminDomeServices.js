import axios from 'axios';

const API_URL = "http://localhost:5000/api/domes"; // Replace with your actual API URL

export const createDome = async (domeData) => {
    try {
        const response = await axios.post(`${API_URL}/add`, domeData);
        return response.data;
    } catch (error) {
        console.error("Error adding dome:", error);
        throw error;
    }
};