import { useState, useEffect } from 'react';
import axios from 'axios';

const FilterPanel = ({ onFilterChange }) => {
    const [types, setTypes] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showFilters, setShowFilters] = useState(false);

    // Récupérer tous les types disponibles
    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        try {
            const response = await axios.get('http://localhost:3000/types');
            setTypes(response.data.types);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleTypeToggle = (type) => {
        setSelectedTypes(prev => {
            if (prev.includes(type)) {
                return prev.filter(t => t !== type);
            } else {
                return [...prev, type];
            }
        });
    };

    const applyFilters = () => {
        const filters = {};
        
        if (selectedTypes.length > 0) {
            filters.type = selectedTypes.join(',');
        }
        
        if (sortBy) {
            filters.sort = sortBy;
            filters.order = sortOrder;
        }
        
        onFilterChange(filters);
    };

    const resetFilters = () => {
        setSelectedTypes([]);
        setSortBy('');
        setSortOrder('asc');
        onFilterChange({});
    };

    return (
        <div style={{ 
            marginBottom: '30px',
            backgroundColor: '#f8f9fa',
            borderRadius: '15px',
            padding: '20px'
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: showFilters ? '20px' : '0'
            }}>
                <h3 style={{ margin: 0 }}>🔍 Filtres et Tri</h3>
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {showFilters ? '▲ Masquer' : '▼ Afficher les filtres'}
                </button>
            </div>

            {showFilters && (
                <div>
                    {/* Filtres par type */}
                    <div style={{ marginBottom: '25px' }}>
                        <h4 style={{ marginBottom: '15px' }}>Filtrer par type :</h4>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                            gap: '10px'
                        }}>
                            {types.map((type) => (
                                <label 
                                    key={type}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px',
                                        backgroundColor: selectedTypes.includes(type) ? '#667eea' : 'white',
                                        color: selectedTypes.includes(type) ? 'white' : '#333',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: selectedTypes.includes(type) ? 'bold' : 'normal',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTypes.includes(type)}
                                        onChange={() => handleTypeToggle(type)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    {type}
                                </label>
                            ))}
                        </div>
                        {selectedTypes.length > 0 && (
                            <p style={{ 
                                marginTop: '10px', 
                                color: '#667eea',
                                fontWeight: 'bold'
                            }}>
                                {selectedTypes.length} type(s) sélectionné(s) : {selectedTypes.join(', ')}
                            </p>
                        )}
                    </div>

                    {/* Tri */}
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ marginBottom: '15px' }}>Trier par :</h4>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                style={{
                                    padding: '10px 15px',
                                    borderRadius: '8px',
                                    border: '2px solid #ddd',
                                    fontSize: '1rem',
                                    flex: '1',
                                    minWidth: '200px'
                                }}
                            >
                                <option value="">-- Aucun tri --</option>
                                <option value="id">Numéro Pokédex</option>
                                <option value="HP">Points de Vie (HP)</option>
                                <option value="Attack">Attaque</option>
                                <option value="Defense">Défense</option>
                                <option value="Speed">Vitesse</option>
                                <option value="SpecialAttack">Attaque Spéciale</option>
                                <option value="SpecialDefense">Défense Spéciale</option>
                            </select>

                            {sortBy && (
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    style={{
                                        padding: '10px 15px',
                                        borderRadius: '8px',
                                        border: '2px solid #ddd',
                                        fontSize: '1rem',
                                        minWidth: '150px'
                                    }}
                                >
                                    <option value="asc">Croissant ↑</option>
                                    <option value="desc">Décroissant ↓</option>
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={resetFilters}
                            style={{
                                padding: '12px 25px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            🔄 Réinitialiser
                        </button>
                        <button
                            onClick={applyFilters}
                            style={{
                                padding: '12px 25px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            ✓ Appliquer les filtres
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterPanel;