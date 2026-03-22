import { useState } from 'react';

const SearchBar = ({ onSearch, onClear }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            onSearch(searchTerm);
        }
    };

    const handleClear = () => {
        setSearchTerm('');
        onClear();
    };

    return (
        <div style={{ 
            marginBottom: '30px',
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flex: '1', maxWidth: '600px' }}>
                <input
                    type="text"
                    placeholder="🔍 Rechercher un pokémon par nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: '1',
                        padding: '12px 20px',
                        border: '2px solid #ddd',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
                <button 
                    type="submit"
                    style={{
                        padding: '12px 25px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
                >
                    🔍 Rechercher
                </button>
                {searchTerm && (
                    <button 
                        type="button"
                        onClick={handleClear}
                        style={{
                            padding: '12px 20px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                        }}
                    >
                        ✕ Effacer
                    </button>
                )}
            </form>
        </div>
    );
};

export default SearchBar;