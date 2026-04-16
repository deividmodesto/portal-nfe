import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, XCircle, Activity } from "lucide-react"

interface KpiCardsProps {
  lancadoValor: number;
  lancadoQtd: number;
  pendenteValor: number;
  pendenteQtd: number;
  canceladaValor: number; // Ajustado de 'cancelado' para 'cancelada' para bater com a tabela
  canceladaQtd: number;   // Ajustado de 'cancelado' para 'cancelada' para bater com a tabela
  taxaConciliacao: number;
  servicoValor?: number;  // Adicionado como opcional para evitar erro de Type no TypeScript
  servicoQtd?: number;
  notasAtrasadasQtd?: number    // Adicionado como opcional para evitar erro de Type no TypeScript
}


export function KpiCards({ 
  lancadoValor, 
  lancadoQtd, 
  pendenteValor, 
  pendenteQtd, 
  canceladaValor, 
  canceladaQtd, 
  taxaConciliacao,
  servicoValor,
  servicoQtd,
  notasAtrasadasQtd // <--- ELE PRECISA ENTRAR AQUI TAMBÉM!
}: KpiCardsProps) {

  const formatBRL = (valor: number | undefined) => {
    if (valor === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      
      {/* CARD 1: LANÇADOS */}
      <Card className="border-l-4 border-l-green-600 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Lançadas no Protheus</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800">{formatBRL(lancadoValor)}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {lancadoQtd} {lancadoQtd === 1 ? 'nota processada' : 'notas processadas'}
          </p>
        </CardContent>
      </Card>

      {/* CARD 2: PENDENTES */}
      <Card className="border-l-4 border-l-amber-500 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Pendentes (Não Lançadas)</CardTitle>
          <AlertCircle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800">{formatBRL(pendenteValor)}</div>
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-xs text-amber-600 font-semibold">
              {pendenteQtd} {pendenteQtd === 1 ? 'nota aguardando' : 'notas aguardando'}
            </p>
            {/* NOVO ALERTA DE SLA */}
            {notasAtrasadasQtd !== undefined && notasAtrasadasQtd > 0 && (
              <span className="text-[10px] font-bold text-white bg-red-500 rounded-full px-2 py-0.5 mt-1 inline-flex items-center w-fit animate-pulse shadow-sm">
                ⚠️ {notasAtrasadasQtd} {notasAtrasadasQtd === 1 ? 'nota crítica' : 'notas críticas'} (+5 dias)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CARD 3: CANCELADAS */}
      <Card className="border-l-4 border-l-slate-400 shadow-sm bg-slate-50/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Notas Canceladas</CardTitle>
          <XCircle className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-700">{formatBRL(canceladaValor)}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {canceladaQtd} {canceladaQtd === 1 ? 'documento invalidado' : 'documentos invalidados'}
          </p>
        </CardContent>
      </Card>

      {/* CARD 4: TAXA DE CONCILIAÇÃO */}
      <Card className="border-l-4 border-l-blue-600 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Taxa de Conciliação</CardTitle>
          <Activity className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800">{taxaConciliacao}%</div>
          {/* Barra de progresso visual */}
          <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
            <div 
              className={`h-2 rounded-full ${taxaConciliacao > 90 ? 'bg-green-500' : taxaConciliacao > 50 ? 'bg-blue-500' : 'bg-red-500'}`} 
              style={{ width: `${taxaConciliacao}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}