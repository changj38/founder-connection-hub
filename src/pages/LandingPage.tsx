import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
const LandingPage = () => {
  return <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <img alt="DayDream Ventures" className="h-10 w-auto" src="/lovable-uploads/39b2d710-6a4c-4f9f-ad95-a8a28ece6867.png" />
        <Link to="/login">
          <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
            Login
          </Button>
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              DayDream Ventures Founder Portal
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12">
              Exclusive access to resources, network, and support for our portfolio companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-lg">
                  Login to Portal
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} DayDream Ventures. All rights reserved.</p>
      </footer>

      <div className="absolute inset-0 -z-10 dots-bg opacity-10 pointer-events-none"></div>
    </div>;
};
export default LandingPage;