import { useState, useEffect } from "react";
import { getPokemons } from "../../utils/api";
import PokeCard from "../pokeCard";
import FilterPanel from "../FilterPanel";
import axios from 'axios';

const PokeList = () => {
    const [pokemons, setPokemons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({});

    useEffect(() => {
        fetchPokemons(currentPage, filters);
    }, [currentPage, filters]);

    const fetchPokemons = async (page, appliedFilters = {}) => {
        setLoading(true);
        try {
            // Construire les paramètres avec les filtres
            const params = {
                page,
                ...appliedFilters
            };

            const response = await axios.get('http://localhost:3000/pokemons', { params });
            setPokemons(response.data.pokemons);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Erreur lors du chargement:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1); // Retour à la page 1 quand on filtre
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) {
        return <p style={{ textAlign: 'center', fontSize: '1.3rem', marginTop: '50px' }}>⏳ Chargement...</p>;
    }

    return (
        <div style={{ padding: '0 20px' }}>
            {/* Panel de filtres */}
            <FilterPanel onFilterChange={handleFilterChange} />

            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
                Liste des Pokémon
                {Object.keys(filters).length > 0 && (
                    <span style={{ 
                        fontSize: '0.8em', 
                        color: '#667eea',
                        marginLeft: '15px'
                    }}>
                        ({pokemons.length} résultat{pokemons.length > 1 ? 's' : ''})
                    </span>
                )}
            </h2>

            {pokemons.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '60px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '15px'
                }}>
                    <p style={{ fontSize: '1.5rem', color: '#666' }}>
                        😔 Aucun pokémon ne correspond à ces critères
                    </p>
                    <button
                        onClick={() => handleFilterChange({})}
                        style={{
                            marginTop: '20px',
                            padding: '12px 25px',
                            backgroundColor: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Réinitialiser les filtres
                    </button>
                </div>
            ) : (
                <>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                        gap: '20px',
                        marginBottom: '30px'
                    }}>
                        {pokemons.map((pokemon) => (
                            <PokeCard key={pokemon.id} pokemon={pokemon} />
                        ))}
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div style={{ 
                            marginTop: '40px', 
                            marginBottom: '20px',
                            display: 'flex', 
                            gap: '15px', 
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '25px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '15px'
                        }}>
                            <button 
                                onClick={handlePrevPage} 
                                disabled={currentPage === 1}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: currentPage === 1 ? '#ccc' : '#667eea',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s'
                                }}
                            >
                                ← Précédent
                            </button>
                            
                            <span style={{ 
                                fontSize: '1.2rem', 
                                fontWeight: 'bold',
                                padding: '0 20px',
                                color: '#333'
                            }}>
                                Page {currentPage} / {totalPages}
                            </span>
                            
                            <button 
                                onClick={handleNextPage} 
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: currentPage === totalPages ? '#ccc' : '#667eea',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s'
                                }}
                            >
                                Suivant →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PokeList;