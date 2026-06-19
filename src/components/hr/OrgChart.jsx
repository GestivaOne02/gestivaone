import { motion } from 'framer-motion'
import { Shield, Users, Briefcase, Award } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

export default function OrgChart({ employees }) {
  const { user } = useAuthStore()

  // 1. Group employees by Department
  const departments = {}
  employees.forEach(emp => {
    if (emp.status === 'active') {
      if (!departments[emp.department]) {
        departments[emp.department] = []
      }
      departments[emp.department].push(emp)
    }
  })

  return (
    <div className="space-y-8 flex flex-col items-center py-6 min-w-max md:min-w-0 overflow-x-auto">
      
      {/* Root Node: Company Owner */}
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="liquid-glass border-2 border-brand-500 bg-brand-500/10 p-4 rounded-3xl text-center w-52 shadow-glow-sm relative z-10"
        >
          <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white mx-auto mb-2 font-black text-sm">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <p className="text-xs font-black text-foreground">{user?.name || 'Administrador'}</p>
          <p className="text-[9px] text-brand-400 font-bold uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
            <Shield size={10} />
            Director General
          </p>
          <p className="text-[8px] text-muted-500 mt-0.5 truncate">{user?.email}</p>
        </motion.div>
        
        {/* Connecting Vertical Line */}
        {Object.keys(departments).length > 0 && (
          <div className="w-0.5 h-10 bg-subtle/60" />
        )}
      </div>

      {/* Departments Row */}
      {Object.keys(departments).length > 0 && (
        <div className="relative flex flex-col items-center w-full">
          
          {/* Horizontal connecting bridge */}
          <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-subtle/60" style={{ left: `${100 / (Object.keys(departments).length * 2)}%`, right: `${100 / (Object.keys(departments).length * 2)}%` }} />

          {/* Department Nodes Grid */}
          <div className="flex gap-12 justify-center pt-0.5">
            {Object.keys(departments).map((dept, dIdx) => (
              <div key={dept} className="relative flex flex-col items-center">
                
                {/* Vertical drop line to department header */}
                <div className="w-0.5 h-6 bg-subtle/60" />

                {/* Department Header Node */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface-800 border border-subtle px-4 py-2.5 rounded-2xl text-center w-44 shadow-sm relative z-10"
                >
                  <p className="text-[10px] font-black uppercase tracking-wider text-brand-400">{dept}</p>
                  <p className="text-[8px] text-muted-500 uppercase mt-0.5 font-bold">{departments[dept].length} colaboradores</p>
                </motion.div>

                {/* Vertical drop line to department workers */}
                <div className="w-0.5 h-8 bg-subtle/60" />

                {/* Department Workers List */}
                <div className="space-y-4 flex flex-col items-center">
                  {departments[dept].map((emp, eIdx) => (
                    <div key={emp.id} className="relative flex flex-col items-center">
                      
                      {/* Node Connection for subsequent workers in stack */}
                      {eIdx > 0 && (
                        <div className="w-0.5 h-4 bg-subtle/60 absolute -top-4" />
                      )}

                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (dIdx * 3 + eIdx) * 0.05 }}
                        className="bg-surface-800 border border-subtle/60 hover:border-brand-500/30 p-3 rounded-2xl w-44 text-center shadow-sm relative hover:scale-[1.01] transition-all"
                      >
                        <div className="w-7 h-7 rounded-full bg-surface-700 flex items-center justify-center text-muted-300 mx-auto mb-1.5 font-bold text-xs">
                          {emp.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-[11px] font-bold text-foreground truncate">{emp.full_name}</p>
                        <p className="text-[9px] text-muted-400 font-medium truncate mt-0.5 flex items-center justify-center gap-1">
                          <Briefcase size={9} className="text-muted-500" />
                          {emp.position}
                        </p>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
