import { useState } from 'react';
import { CircuitSimulator } from './features/circuitSimulator/CircuitSimulator';
import { LoadCalculator } from './features/loadCalculator/LoadCalculator';

type Tool = 'loadCalculator' | 'circuitSimulator';

function App() {
  const [tool, setTool] = useState<Tool>('circuitSimulator');

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">أكاديمية الكهرباء</h1>
      </header>

      <nav className="app__tabs">
        <button
          className={tool === 'circuitSimulator' ? 'app__tab is-active' : 'app__tab'}
          onClick={() => setTool('circuitSimulator')}
        >
          سيموليتور الدوائر
        </button>
        <button
          className={tool === 'loadCalculator' ? 'app__tab is-active' : 'app__tab'}
          onClick={() => setTool('loadCalculator')}
        >
          حاسبة الأحمال
        </button>
      </nav>

      <main className="app__body">
        {tool === 'circuitSimulator' ? <CircuitSimulator /> : <LoadCalculator />}
      </main>
    </div>
  );
}

export default App;
