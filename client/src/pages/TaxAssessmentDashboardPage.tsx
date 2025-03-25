/**
 * TaxAssessmentDashboardPage
 * 
 * Main page for the tax assessment dashboard
 */
import { TaxAssessmentDashboard } from '../components/dashboard/TaxAssessmentDashboard';
import { AppProvider } from '../context/AppContext';

export default function TaxAssessmentDashboardPage() {
  return (
    <AppProvider>
      <div className="container mx-auto py-6">
        <TaxAssessmentDashboard />
      </div>
    </AppProvider>
  );
}