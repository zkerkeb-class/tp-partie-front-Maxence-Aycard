import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPokemon } from '../utils/api';

const AddPokemon = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: {
            english: '',
            french: '',
            japanese: '',
            chinese: ''
        },
        type: [],
        base: {
            HP: 50,
            Attack: 50,
            Defense: 50,
            SpecialAttack: 50,
            SpecialDefense: 50,
            Speed: 50
        },
        image: ''
    });

    const typeOptions = [
        'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
        'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic',
        'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.french || !formData.name.english) {
            alert('Les noms français et anglais sont obligatoires');
            return;
        }

        if (formData.type.length === 0) {
            alert('Sélectionnez au moins un type');
            return;
        }

        try {
            const newPokemon = await createPokemon(formData);
            alert('Pokémon créé avec succès !');
            navigate(`/pokemon/${newPokemon.id}`);
        } catch (error) {
            alert('Erreur lors de la création');
        }
    };

    const handleTypeToggle = (type) => {
        setFormData(prev => ({
            ...prev,
            type: prev.type.includes(type)
                ? prev.type.filter(t => t !== type)
                : [...prev.type, type]
        }));
    };

    const handleNameChange = (lang, value) => {
        setFormData(prev => ({
            ...prev,
            name: { ...prev.name, [lang]: value }
        }));
    };

    const handleStatChange = (stat, value) => {
        setFormData(prev => ({
            ...prev,
            base: { ...prev.base, [stat]: parseInt(value) || 0 }
        }));
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
                ← Retour
            </button>

            <h1>➕ Créer un nouveau Pokémon</h1>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <h3>Noms</h3>
                    <input
                        type="text"
                        placeholder="Nom Français *"
                        value={formData.name.french}
                        onChange={(e) => handleNameChange('french', e.target.value)}
                        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Nom Anglais *"
                        value={formData.name.english}
                        onChange={(e) => handleNameChange('english', e.target.value)}
                        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Nom Japonais"
                        value={formData.name.japanese}
                        onChange={(e) => handleNameChange('japanese', e.target.value)}
                        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    />
                    <input
                        type="text"
                        placeholder="Nom Chinois"
                        value={formData.name.chinese}
                        onChange={(e) => handleNameChange('chinese', e.target.value)}
                        style={{ width: '100%', padding: '10px' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3>Types *</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                        {typeOptions.map((type) => (
                            <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.type.includes(type)}
                                    onChange={() => handleTypeToggle(type)}
                                />
                                {type}
                            </label>
                        ))}
                    </div>
                    {formData.type.length > 0 && (
                        <p style={{ marginTop: '10px', color: '#666' }}>
                            Sélectionnés: {formData.type.join(', ')}
                        </p>
                    )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3>Statistiques</h3>
                    {Object.entries(formData.base).map(([stat, value]) => (
                        <div key={stat} style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>
                                <strong>{stat}:</strong> {value}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="255"
                                value={value}
                                onChange={(e) => handleStatChange(stat, e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                    ))}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3>Image</h3>
                    <input
                        type="text"
                        placeholder="URL de l'image (optionnel)"
                        value={formData.image}
                        onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                        style={{ width: '100%', padding: '10px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        type="submit"
                        style={{ 
                            padding: '15px 30px',
                            backgroundColor: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1.1em'
                        }}
                    >
                        ✨ Créer le Pokémon
                    </button>
                    <button 
                        type="button"
                        onClick={() => navigate('/')}
                        style={{ padding: '15px 30px' }}
                    >
                        ❌ Annuler
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddPokemon;
