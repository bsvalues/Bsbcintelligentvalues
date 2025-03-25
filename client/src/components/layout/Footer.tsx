const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-medium">BS Values</h3>
            <p className="text-sm text-slate-300">Advanced Tax Assessment Platform</p>
          </div>
          
          <div className="text-sm text-slate-300">
            © {currentYear} BS Values. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;