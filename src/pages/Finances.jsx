import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Pockets from './Pockets'
import PersonalFinance from './PersonalFinance'
import clsx from 'clsx'

export default function Finances() {
  const [activeTab, setActiveTab] = useState('pockets')

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container flex flex-col gap-5">
      {/* Sticky Header & Control Panel */}
      <div className="sticky top-0 z-20 bg-surface-900/90 backdrop-blur-md pb-4 pt-1 border-b border-subtle flex flex-col gap-4">
        {/* Title and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-foreground">Bolsillos</h1>
            <p className="hidden sm:block text-xs md:text-sm text-muted-400 mt-0.5">Gestiona tus bolsillos empresariales y finanzas personales</p>
          </div>
          {/* Portal container for nested components to inject their action buttons */}
          <div id="finances-header-actions" className="flex gap-2 shrink-0 empty:hidden"></div>
        </div>

        {/* Tabs inside sticky panel */}
        <div className="flex bg-surface-700/50 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('pockets')} 
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-colors', 
              activeTab === 'pockets' ? 'bg-brand-600 text-white shadow-sm' : 'text-muted-400 hover:text-white'
            )}
          >
            Empresariales
          </button>
          <button 
            onClick={() => setActiveTab('personal')} 
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-colors', 
              activeTab === 'personal' ? 'bg-brand-600 text-white shadow-sm' : 'text-muted-400 hover:text-white'
            )}
          >
            Personales
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        {activeTab === 'pockets' && <Pockets isNested />}
        {activeTab === 'personal' && <PersonalFinance isNested />}
      </div>
    </motion.div>
  )
}
