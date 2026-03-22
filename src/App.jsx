import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import Counter from './components/counter';
import PokeList from './components/pokelist';
import PokemonDetail from './pages/PokemonDetail';
import AddPokemon from './pages/AddPokemon';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          {/* Page d'accueil avec la liste */}
          <Route path="/" element={
            <div>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <h1>🔥 Pokédex Manager 🔥</h1>
                <Link to="/add">
                  <button style={{ 
                    padding: '15px 30px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '1.1em',
                    marginBottom: '20px'
                  }}>
                    ➕ Ajouter un Pokémon
                  </button>
                </Link>
              </div>
              
              {/* Tu peux garder le Counter si tu veux */}
              {/* <Counter/> */}
              
              <PokeList/>
            </div>
          } />

          {/* Page détails d'un pokémon */}
          <Route path="/pokemon/:id" element={<PokemonDetail />} />

          {/* Page ajout d'un pokémon */}
          <Route path="/add" element={<AddPokemon />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
