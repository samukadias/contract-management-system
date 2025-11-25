import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Contracts from './pages/Contracts';
import Analysis from './pages/Analysis';
import StageControl from './pages/StageControl';
import Search from './pages/Search';
import DataManagement from './pages/DataManagement';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/stage-control" element={<StageControl />} />
        <Route path="/search" element={<Search />} />
        <Route path="/data-management" element={<DataManagement />} />
      </Routes>
    </Router>
  );
}

export default App