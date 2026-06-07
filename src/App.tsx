import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Clues from "@/pages/Clues";
import Visits from "@/pages/Visits";
import Mediation from "@/pages/Mediation";
import KeyPersons from "@/pages/KeyPersons";
import Statistics from "@/pages/Statistics";
import Messages from "@/pages/Messages";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clues" element={<Clues />} />
          <Route path="/visits" element={<Visits />} />
          <Route path="/mediation" element={<Mediation />} />
          <Route path="/key-persons" element={<KeyPersons />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </Layout>
    </Router>
  );
}
