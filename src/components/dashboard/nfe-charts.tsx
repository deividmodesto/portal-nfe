"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { NotaFiscal } from "@/types/nfe"

interface NfeChartsProps {
  data: NotaFiscal[];
}

export function NfeCharts({ data }: NfeChartsProps) {
  // 1. Processar dados para o Gráfico de Rosca (Produtos vs Serviços)
  const qtdProdutos = data.filter(n => n.tipoNota !== 'NFSE').length; 
  const qtdServicos = data.filter(n => n.tipoNota === 'NFSE').length;

  const pieData = [
    { name: 'Produtos (NFe)', value: qtdProdutos, color: '#3b82f6' },
    { name: 'Serviços (NFS-e)', value: qtdServicos, color: '#a855f7' }
  ].filter(d => d.value > 0);

  // 2. Processar dados para o Gráfico de Barras (Volume Financeiro por Dia)
  const agrupadoPorDia = data.reduce((acc, nota) => {
    // 🌟 NOVA LÓGICA: A data já chega como "05/04/2026". 
    // Vamos quebrar nas barras ("/") e pegar só o Dia e o Mês ("05/04").
    let dataFormatada = "";
    if (nota.dataEmissao && nota.dataEmissao.includes('/')) {
      const partes = nota.dataEmissao.split('/'); // Fica: ["05", "04", "2026"]
      dataFormatada = `${partes[0]}/${partes[1]}`; // Fica: "05/04"
    }

    if (!dataFormatada) return acc;

    if (!acc[dataFormatada]) {
      acc[dataFormatada] = 0;
    }
    
    // Soma o valor apenas de notas que NÃO estão canceladas
    if (nota.statusSistema !== 'Cancelada' && !nota.statusSefaz?.includes('Cancelad')) {
      acc[dataFormatada] += nota.valorNF;
    }
    return acc;
  }, {} as Record<string, number>);

  // Converte para o formato que o gráfico lê e ordena cronologicamente
  const barData = Object.entries(agrupadoPorDia)
    .map(([data, valor]) => ({ data, valor }))
    .sort((a, b) => {
       const [diaA, mesA] = a.data.split('/');
       const [diaB, mesB] = b.data.split('/');
       // Usamos um ano base genérico (2026) apenas para a matemática de ordenação do JavaScript funcionar
       return new Date(2026, Number(mesA)-1, Number(diaA)).getTime() - new Date(2026, Number(mesB)-1, Number(diaB)).getTime();
    });

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  // Se a tabela estiver vazia, não mostramos os gráficos
  if (data.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      
      {/* GRÁFICO DE BARRAS - Ocupa 2 colunas */}
      <Card className="col-span-1 md:col-span-2 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Volume Financeiro Válido por Dia</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="data" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [formatarMoeda(value), 'Volume Financeiro']}
                labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Bar dataKey="valor" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRÁFICO DE ROSCA - Ocupa 1 coluna */}
      <Card className="col-span-1 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Proporção por Tipo de Documento</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} notas`, 'Quantidade']}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  )
}