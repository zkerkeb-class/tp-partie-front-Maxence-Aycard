import axios from 'axios';

const API_URL = 'http://localhost:3000';

// GET tous les pokémons avec pagination
export const getPokemons = async (page = 1) => {
    const response = await axios.get(`${API_URL}/pokemons?page=${page}`);
    return response.data;
};

// GET un pokémon par ID
export const getPokemonById = async (id) => {
    const response = await axios.get(`${API_URL}/pokemons/${id}`);
    return response.data;
};

// POST créer un pokémon
export const createPokemon = async (pokemonData) => {
    const response = await axios.post(`${API_URL}/pokemons`, pokemonData);
    return response.data;
};

// PUT modifier un pokémon
export const updatePokemon = async (id, pokemonData) => {
    const response = await axios.put(`${API_URL}/pokemons/${id}`, pokemonData);
    return response.data;
};

// DELETE supprimer un pokémon
export const deletePokemon = async (id) => {
    const response = await axios.delete(`${API_URL}/pokemons/${id}`);
    return response.data;
};