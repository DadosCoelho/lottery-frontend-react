import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white py-6 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            © {currentYear} Consulta de Loterias. Todos os direitos reservados.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Este site não é afiliado à Caixa Econômica Federal.
            Os resultados são obtidos via API pública para fins informativos.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;