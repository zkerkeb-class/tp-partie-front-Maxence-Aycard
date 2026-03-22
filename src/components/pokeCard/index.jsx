import { useNavigate } from 'react-router-dom';

const PokeCard = ({ pokemon }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/pokemon/${pokemon.id}`);
    };

    // Utilise l'API PokeAPI pour les images au lieu de l'URL cassée
    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

    return (
        <div 
            onClick={handleClick}
            style={{
                border: '2px solid #ddd',
                borderRadius: '10px',
                padding: '15px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                backgroundColor: '#f9f9f9'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
            <img 
                src={imageUrl}
                alt={pokemon.name.french}
                style={{ width: '150px', height: '150px', objectFit: 'contain' }}
            />
            <h3>{pokemon.name.french}</h3>
            <p style={{ color: '#666', fontSize: '0.9em' }}>{pokemon.name.english}</p>
            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
                {pokemon.type && pokemon.type.map((type, index) => (
                    <span 
                        key={index}
                        style={{
                            padding: '5px 10px',
                            borderRadius: '15px',
                            backgroundColor: '#667eea',
                            color: 'white',
                            fontSize: '0.8em',
                            fontWeight: 'bold'
                        }}
                    >
                        {type}
                    </span>
                ))}
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.85em', color: '#555' }}>
                <div>HP: {pokemon.base?.HP || 0}</div>
                <div>Attack: {pokemon.base?.Attack || 0}</div>
            </div>
        </div>
    );
};

export default PokeCard;
