import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPokemonById, updatePokemon, deletePokemon } from '../utils/api';
import Modal from '../components/Modal';

const PokemonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [pokemon, setPokemon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});

    // Utilise l'API PokeAPI pour les images
    const imageUrl = pokemon ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png` : '';

    useEffect(() => {
        fetchPokemon();
    }, [id]);

    const fetchPokemon = async () => {
        try {
            const data = await getPokemonById(id);
            setPokemon(data);
            setFormData(data);
            setLoading(false);
        } catch (error) {
            console.error('Erreur:', error);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await updatePokemon(id, formData);
            setPokemon(formData);
            setIsEditing(false);
            alert('Pokémon modifié avec succès !');
        } catch (error) {
            alert('Erreur lors de la modification');
        }
    };

    const handleDelete = async () => {
        try {
            await deletePokemon(id);
            alert('Pokémon supprimé !');
            navigate('/');
        } catch (error) {
            alert('Erreur lors de la suppression');
        }
    };

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Chargement...</p>;
    if (!pokemon) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Pokémon introuvable</p>;

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <button 
                onClick={() => navigate('/')} 
                style={{ 
                    marginBottom: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                }}
            >
                ← Retour
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px', alignItems: 'start' }}>
                <div style={{ textAlign: 'center', position: 'sticky', top: '20px' }}>
                    <img 
                        src={imageUrl}
                        alt={pokemon.name.french}
                        style={{ 
                            width: '100%', 
                            maxWidth: '250px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '15px',
                            padding: '20px'
                        }}
                    />
                    <p style={{ 
                        marginTop: '15px', 
                        fontSize: '1.1rem', 
                        fontWeight: 'bold',
                        color: '#666'
                    }}>
                        #{pokemon.id.toString().padStart(3, '0')}
                    </p>
                </div>

                <div>
                    {isEditing ? (
                        <div>
                            <input
                                type="text"
                                value={formData.name.french}
                                onChange={(e) => handleInputChange('name.french', e.target.value)}
                                style={{ 
                                    fontSize: '2.5em', 
                                    width: '100%', 
                                    marginBottom: '10px',
                                    padding: '10px',
                                    border: '2px solid #ddd',
                                    borderRadius: '8px'
                                }}
                            />
                            <input
                                type="text"
                                value={formData.name.english}
                                onChange={(e) => handleInputChange('name.english', e.target.value)}
                                style={{ 
                                    fontSize: '1.3em', 
                                    width: '100%',
                                    padding: '8px',
                                    border: '2px solid #ddd',
                                    borderRadius: '8px',
                                    color: '#666'
                                }}
                            />
                        </div>
                    ) : (
                        <>
                            <h1 style={{ fontSize: '2.5em', marginBottom: '5px' }}>{pokemon.name.french}</h1>
                            <p style={{ fontSize: '1.3em', color: '#666', marginBottom: '20px' }}>
                                {pokemon.name.english}
                            </p>
                        </>
                    )}

                    <div style={{ marginTop: '25px' }}>
                        <h3 style={{ fontSize: '1.3em', marginBottom: '15px' }}>Types</h3>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {pokemon.type.map((type, index) => (
                                <span 
                                    key={index}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '25px',
                                        backgroundColor: '#667eea',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '0.95em'
                                    }}
                                >
                                    {type}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '30px' }}>
                        <h3 style={{ fontSize: '1.3em', marginBottom: '20px' }}>Statistiques</h3>
                        {Object.entries(isEditing ? formData.base : pokemon.base).map(([stat, value]) => (
                            <div key={stat} style={{ marginBottom: '15px' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '5px'
                                }}>
                                    <strong style={{ fontSize: '1em' }}>{stat}:</strong>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={value}
                                            onChange={(e) => handleInputChange(`base.${stat}`, parseInt(e.target.value))}
                                            style={{ 
                                                width: '100px', 
                                                padding: '5px 10px',
                                                border: '2px solid #ddd',
                                                borderRadius: '5px',
                                                fontSize: '1em'
                                            }}
                                            min="0"
                                            max="255"
                                        />
                                    ) : (
                                        <span style={{ 
                                            fontWeight: 'bold',
                                            fontSize: '1.1em',
                                            color: '#667eea'
                                        }}>
                                            {value}
                                        </span>
                                    )}
                                </div>
                                {!isEditing && (
                                    <div style={{ 
                                        width: '100%', 
                                        height: '8px', 
                                        backgroundColor: '#e0e0e0',
                                        borderRadius: '10px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{ 
                                            width: `${(value / 255) * 100}%`,
                                            height: '100%',
                                            backgroundColor: '#667eea',
                                            transition: 'width 0.3s'
                                        }}></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ 
                        marginTop: '40px', 
                        display: 'flex', 
                        gap: '15px',
                        paddingTop: '30px',
                        borderTop: '2px solid #f0f0f0'
                    }}>
                        {isEditing ? (
                            <>
                                <button 
                                    onClick={handleSave}
                                    style={{ 
                                        padding: '12px 30px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '1.05em',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    💾 Enregistrer
                                </button>
                                <button 
                                    onClick={() => {
                                        setFormData(pokemon);
                                        setIsEditing(false);
                                    }}
                                    style={{ 
                                        padding: '12px 30px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '1.05em'
                                    }}
                                >
                                    ❌ Annuler
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    style={{ 
                                        padding: '12px 30px',
                                        backgroundColor: '#ffc107',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '1.05em',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    ✏️ Modifier
                                </button>
                                <button 
                                    onClick={() => setIsModalOpen(true)}
                                    style={{ 
                                        padding: '12px 30px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '1.05em',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    🗑️ Supprimer
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
                title="Supprimer ce Pokémon ?"
                message={`Voulez-vous vraiment supprimer ${pokemon.name.french} ?`}
                pokemon={{ ...pokemon, image: imageUrl }}
            />
        </div>
    );
};

export default PokemonDetail;