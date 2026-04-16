import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { NotaFiscal } from "@/types/nfe"

interface NfeDetalhesProps {
  nota: NotaFiscal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Criamos a interface para o TypeScript não reclamar
interface ItemNota {
  seq: number;
  descricao: string;
  qtd: number;
  vlrUnit: number;
  vlrTotal: number;
}

export function NfeDetalhes({ nota, open, onOpenChange }: NfeDetalhesProps) {
  const [itens, setItens] = useState<ItemNota[]>([])
  const [loadingItens, setLoadingItens] = useState(false)

  // Dispara a busca sempre que o painel abre com uma nota nova
  useEffect(() => {
    async function fetchItens() {
      if (!nota || !open) return;
      
      setLoadingItens(true)
      try {
        const response = await fetch(`/api/itens?chave=${nota.chaveAcesso}`)
        if (response.ok) {
          const dados = await response.json()
          setItens(dados)
        }
      } catch (error) {
        console.error("Falha ao buscar itens", error)
      } finally {
        setLoadingItens(false)
      }
    }

    fetchItens()
  }, [nota, open])

  if (!nota) return null;

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const dataEmissao = nota.dataEmissao ? nota.dataEmissao.split('T')[0].split('-').reverse().join('/') : '';

  // --- COLE ESTA FUNÇÃO AQUI ---
  const getBadgeStatus = (status: string) => {
    if (status === "Entrada" || status === "Saída") {
      return <Badge className="bg-green-600 hover:bg-green-700 text-white">{status}</Badge>;
    }
    if (status === "Cancelada") {
      return <Badge variant="outline" className="text-slate-500 border-slate-300 bg-slate-100">{status}</Badge>;
    }
    return <Badge variant="destructive">{status}</Badge>; // Vermelho padrão para "Não lançado"
  };
  // -----------------------------

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-slate-50">
        <SheetHeader className="pb-6 border-b border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <SheetTitle className="text-2xl font-bold text-slate-800">
                {nota.tipoNota === 'NFSE' ? 'NFS-e' : 'NF-e'} Nº {nota.numeroNF}
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-500 font-mono mt-1">
                {nota.chaveAcesso}
              </SheetDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-white">{nota.tipoNota === 'NFSE' ? 'Serviço' : 'Produto'}</Badge>
              {getBadgeStatus(nota.statusSistema)}
            </div>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 mb-1">Valor Total</p>
              <p className="text-xl font-bold text-slate-800">{formatBRL(nota.valorNF)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 mb-1">Data de Emissão</p>
              <p className="text-lg font-medium text-slate-700">{dataEmissao}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 mb-1">CFOP / Natureza</p>
              <p className="text-lg font-medium text-slate-700">{nota.cfop}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-700">Dados do Emitente e Destinatário</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Emitente</p>
                <p className="text-sm font-bold text-slate-800">{nota.nomeEmitente}</p>
                <p className="text-sm text-slate-600">{nota.cnpjEmitente}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Destinatário</p>
                <p className="text-sm font-bold text-slate-800">{nota.nomeDestinatario}</p>
                <p className="text-sm text-slate-600">{nota.cpfCnpjDestinatario}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-700">Itens da Nota</h3>
              <Badge className="bg-blue-100 text-blue-700 border-none hover:bg-blue-100">{itens.length} {itens.length === 1 ? 'item' : 'itens'}</Badge>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead className="w-[300px]">Descrição</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Vlr. Unit</TableHead>
                    <TableHead className="text-right">Vlr. Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingItens ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-slate-500 animate-pulse">
                        Carregando itens...
                      </TableCell>
                    </TableRow>
                  ) : itens.length > 0 ? (
                    itens.map((item) => (
                      <TableRow key={item.seq}>
                        <TableCell className="font-medium text-xs text-slate-700">{item.descricao}</TableCell>
                        {/* Adicionando fallback para evitar quebra se vier vazio */}
                        <TableCell className="text-right text-xs">{(item.qtd || 0).toString().replace('.', ',')}</TableCell>
                        <TableCell className="text-right text-xs">{formatBRL(item.vlrUnit || 0)}</TableCell>
                        <TableCell className="text-right text-xs font-semibold">{formatBRL(item.vlrTotal || 0)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-slate-500 text-sm">
                        Nenhum item encontrado no banco para esta nota.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}