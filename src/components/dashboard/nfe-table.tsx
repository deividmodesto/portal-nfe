"use client"

import { useEffect, useState } from "react"
import { 
  flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, 
  useReactTable, ColumnFiltersState 
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { KpiCards } from "./kpi-cards"
import { NfeCharts } from "./nfe-charts"
import { columns } from "./columns"
import { NotaFiscal } from "@/types/nfe"
import { NfeDetalhes } from "./nfe-detalhes"

export function NfeTable() {
  const [data, setData] = useState<NotaFiscal[]>([])
  const [loading, setLoading] = useState(true)
  
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  
  const [dataInicio, setDataInicio] = useState("2026-01-01")
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0])
  
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const [notaSelecionada, setNotaSelecionada] = useState<NotaFiscal | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  useEffect(() => {
    async function fetchNotas() {
      setLoading(true)
      const url = `/api/notas?inicio=${dataInicio}&fim=${dataFim}`
      
      try {
        const response = await fetch(url)
        const text = await response.text()
        
        if (response.ok) {
          try {
            const notas = JSON.parse(text)
            setData(notas)
            setPagination(prev => ({ ...prev, pageIndex: 0 }))
          } catch (e) {
            console.error('❌ Erro parsing JSON:', e)
          }
        } else {
          console.error('❌ API retornou erro:', response.status, text)
        }
      } catch (error) {
        console.error("❌ Falha na requisição:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchNotas()
  }, [dataInicio, dataFim])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { globalFilter, columnFilters, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
  })

  // Matemática dos Cards e Gráficos
  const rows = table.getFilteredRowModel().rows.map(r => r.original as NotaFiscal);
  const lancadas = rows.filter(r => r.statusSistema === "Entrada" || r.statusSistema === "Saída");
  const pendentes = rows.filter(r => r.statusSistema === "Não lançado");
  const canceladas = rows.filter(r => r.statusSistema === "Cancelada" || r.statusSefaz?.includes("Cancelad")); 
  const notasServico = rows.filter(r => r.tipoNota === "NFSE"); 
  const totalNotas = rows.length;

  // 🚨 NOVA LÓGICA DE SLA (Acima de 5 dias)
  const notasAtrasadas = pendentes.filter(n => {
    if (!n.dataEmissao || !n.dataEmissao.includes('/')) return false;
    const partes = n.dataEmissao.split('/'); // Ex: ["05", "04", "2026"]
    
    // Mês no JavaScript começa em 0 (Janeiro = 0, Abril = 3)
    const dataNf = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
    const hoje = new Date();
    
    // Calcula a diferença em dias
    const diffEmDias = Math.floor((hoje.getTime() - dataNf.getTime()) / (1000 * 60 * 60 * 24));
    return diffEmDias > 5; // Limite do SLA
  });

  const filiaisUnicas = Array.from(new Set(data.map(n => n.filial))).filter(Boolean).sort();

  const stats = {
    lancadoValor: lancadas.reduce((acc, r) => acc + r.valorNF, 0),
    lancadoQtd: lancadas.length,
    pendenteValor: pendentes.reduce((acc, r) => acc + r.valorNF, 0),
    pendenteQtd: pendentes.length,
    servicoValor: notasServico.reduce((acc, r) => acc + r.valorNF, 0),
    servicoQtd: notasServico.length,
    canceladaValor: canceladas.reduce((acc, r) => acc + r.valorNF, 0),
    canceladaQtd: canceladas.length,
    taxaConciliacao: totalNotas > 0 ? Math.round((lancadas.length / totalNotas) * 100) : 0,
    notasAtrasadasQtd: notasAtrasadas.length // <-- PASSANDO O DADO PARA O CARD
  };

  // Exportador Excel (CSV)
  const exportarParaExcel = () => {
    const cabecalho = ["NF", "Tipo", "Filial", "Data Emissão", "CFOP", "CNPJ Emitente", "Nome Emitente", "Doc Destinatário", "Valor NF", "Status Sistema"];
    const linhasCsv = rows.map(n => {
      // Nova formatação blindada contra fuso horário
      const dataFormatada = n.dataEmissao ? n.dataEmissao.split('T')[0].split('-').reverse().join('/') : '';
      const valorFormatado = n.valorNF.toFixed(2).replace('.', ',');
      return [
        n.numeroNF,
        n.tipoNota === 'NFSE' ? 'Servico' : 'Produto',
        `"${n.filial?.trim()}"`,
        dataFormatada,
        n.cfop,
        n.cnpjEmitente,
        `"${n.nomeEmitente}"`, 
        n.cpfCnpjDestinatario,
        valorFormatado,
        n.statusSistema
      ].join(';');
    });

    const conteudoCsv = [cabecalho.join(';'), ...linhasCsv].join('\n');
    const blob = new Blob(["\uFEFF" + conteudoCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Exportacao_Notas_${dataInicio}_ate_${dataFim}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-6">
      <KpiCards {...stats} />
      <NfeCharts data={rows} />

      {/* Grid alterado para 7 colunas (md:grid-cols-7) */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 pb-4">
        <div className="md:col-span-1">
          <Input placeholder="Pesquisar..." value={globalFilter ?? ""} onChange={(e) => setGlobalFilter(e.target.value)} className="bg-white" />
        </div>
        
        <div className="flex items-center gap-2 md:col-span-2">
          <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="bg-white" />
          <span className="text-slate-500">até</span>
          <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="bg-white" />
        </div>

        {/* NOVO FILTRO: FILIAL */}
        <Select value={(table.getColumn("filial")?.getFilterValue() as string) ?? "todos"} onValueChange={(v) => table.getColumn("filial")?.setFilterValue(v === "todos" ? "" : v)}>
          <SelectTrigger className="bg-white"><SelectValue placeholder="Filial" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas Filiais</SelectItem>
            {filiaisUnicas.map(f => (
              <SelectItem key={f} value={f}>{f.trim()}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={(table.getColumn("tipoNota")?.getFilterValue() as string) ?? "todos"} onValueChange={(v) => table.getColumn("tipoNota")?.setFilterValue(v === "todos" ? "" : v)}>
          <SelectTrigger className="bg-white"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Tipos</SelectItem>
            <SelectItem value="NFE" className="text-blue-600">Produto</SelectItem>
            <SelectItem value="NFSE" className="text-purple-600">Serviço</SelectItem>
          </SelectContent>
        </Select>

        <Select value={(table.getColumn("statusSistema")?.getFilterValue() as string) ?? "todos"} onValueChange={(v) => table.getColumn("statusSistema")?.setFilterValue(v === "todos" ? "" : v)}>
          <SelectTrigger className="bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Status</SelectItem>
            <SelectItem value="Entrada">Entrada</SelectItem>
            <SelectItem value="Não lançado" className="text-red-600">Não Lançado</SelectItem>
            <SelectItem value="Cancelada" className="text-orange-600">Cancelada</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-end">
          <Button onClick={exportarParaExcel} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
            Exportar Excel
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center animate-pulse text-slate-500">Buscando registros...</div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-100 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-slate-800 font-bold p-2 align-top">
                      <div className="flex flex-col gap-2">
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        {header.column.getCanFilter() && (
                          <Input placeholder="Filtrar..." value={(header.column.getFilterValue() ?? "") as string} onChange={(e) => header.column.setFilterValue(e.target.value)} className="h-7 text-[10px] bg-white" />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow 
                    key={row.id}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => { setNotaSelecionada(row.original); setIsPanelOpen(true); }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">Nenhuma nota encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-slate-500">Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}</p>
          <Select value={table.getState().pagination.pageSize.toString()} onValueChange={(v) => table.setPageSize(Number(v))}>
            <SelectTrigger className="w-[120px] h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((size) => (
                <SelectItem key={size} value={size.toString()}>{size} itens</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Próximo</Button>
        </div>
      </div>
      
      <NfeDetalhes nota={notaSelecionada} open={isPanelOpen} onOpenChange={setIsPanelOpen} />
    </div>
  )
}