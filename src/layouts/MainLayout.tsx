import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto px-4 py-6 md:py-8"
        >
          <Outlet />
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;