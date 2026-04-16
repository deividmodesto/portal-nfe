import { NfeTable } from "@/components/dashboard/nfe-table"
import Image from "next/image"
import { Building2, UserCircle } from "lucide-react"

export default function ConferenciasDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* HEADER / NAVBAR */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* LADO ESQUERDO: Logo e Nome do Sistema */}
          <div className="flex items-center gap-3">
            
            {/* --- INSTRUÇÃO PARA A LOGO REAL --- 
                1. Coloque o arquivo da sua logo (ex: logo-reunidas.png) dentro da pasta 'public'
                2. Descomente a linha abaixo e apague a div do ícone temporário
            */}
            {<Image src="/logo-reunidas.png" alt="Logo Reunidas" width={40} height={40} className="object-contain" /> }
            
            {/* Ícone temporário enquanto a logo não é colocada */}
            
            
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 leading-none">Grupo Reunidas</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Portal NFe</p>
            </div>
          </div>

          {/* LADO DIREITO: Usuário / Ações */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-700">Deivid Modesto</p>
              <p className="text-xs text-slate-500 font-medium">Administrador</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
              <UserCircle className="h-6 w-6 text-slate-400" />
            </div>
          </div>
          
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Conferência de Notas Fiscais</h1>
            <p className="text-sm text-slate-500 mt-1">
              Visão geral e cruzamento de dados entre o portal da SEFAZ e o ERP Protheus.
            </p>
          </div>
        </div>
        
        {/* Tabela e Cards */}
        <NfeTable />
      </main>

    </div>
  )
}