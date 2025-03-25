/**
 * App Component - Debug Version
 * 
 * Simplified version to troubleshoot mounting issues
 */

const App = () => {
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto', 
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>BS Values - Tax Assessment SaaS</h1>
      <p style={{ marginBottom: '20px' }}>
        This is a simplified debug version of the application to troubleshoot mounting issues.
        If you can see this page, the basic React rendering is working correctly.
      </p>
      <hr style={{ margin: '20px 0' }} />
      <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>System Status</h2>
        <p>Application is running in debug mode</p>
        <p>Server Port: 5000</p>
        <p>Environment: {process.env.NODE_ENV}</p>
      </div>
    </div>
  );
};

export default App;