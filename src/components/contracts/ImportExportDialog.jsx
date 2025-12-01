import React, { useState } from "react";
import { toast } from "sonner";
import { Contract } from "@/entities/Contract";
import { ExtractDataFromUploadedFile, UploadFile } from "@/integrations/Core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, FileText, AlertTriangle, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ImportExportDialog({ open, onOpenChange, contracts, onImportComplete }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const schema = Contract.schema();
      const csvHeaders = Object.keys(schema.properties);

      const csvData = contracts.map(contract =>
        csvHeaders.map(header => {
          const value = contract[header] || "";
          // Handle values with commas
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(",")
      );

      const csvContent = [csvHeaders.join(","), ...csvData].join("\n");

      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel compatibility
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `contratos_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      setImportStatus({
        type: "error",
        message: "Erro ao exportar dados. Tente novamente."
      });
    }
    setIsExporting(false);
  };

  const downloadTemplate = () => {
    try {
      const schema = Contract.schema();
      const headers = Object.keys(schema.properties);
      const csvContent = headers.join(",");
      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'template_importacao_contratos.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao baixar template:", error);
    }
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;
    // Try parsing ISO format first
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) return date.toISOString();

    // Try parsing DD/MM/YYYY or DD-MM-YYYY
    const parts = dateString.split(/[\/\-]/);
    if (parts.length === 3) {
      // Assume DD/MM/YYYY
      date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      if (!isNaN(date.getTime())) return date.toISOString();
    }
    return null;
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus({ type: "info", message: "Enviando arquivo..." });
    toast.info("Iniciando importação...");

    try {
      // Add timeout handling and retry logic
      const uploadPromise = UploadFile({ file });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Upload timeout')), 60000) // 60 second timeout
      );

      const { file_url } = await Promise.race([uploadPromise, timeoutPromise]);

      setImportStatus({ type: "info", message: "Processando dados do arquivo..." });

      const extractPromise = ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            contracts: {
              type: "array",
              items: Contract.schema()
            }
          },
          required: ["contracts"]
        }
      });

      const extractTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Processing timeout')), 120000) // 2 minute timeout
      );

      const result = await Promise.race([extractPromise, extractTimeoutPromise]);

      if (result.status === "success" && result.output?.contracts) {
        setImportStatus({ type: "info", message: "Validando e salvando contratos..." });
        const rawContracts = result.output.contracts;

        const processedContracts = rawContracts.map(contract => {
          const processed = { ...contract };
          const numericFields = ["valor_contrato", "valor_faturado", "valor_cancelado", "valor_a_faturar", "valor_novo_contrato"];
          const dateFields = ["data_inicio_efetividade", "data_fim_efetividade", "data_limite_andamento"];

          // Clean numeric fields
          numericFields.forEach(field => {
            if (processed[field] !== undefined && processed[field] !== null) {
              if (typeof processed[field] === 'string') {
                const cleanedValue = processed[field].replace(/[^\d.,-]/g, '').replace(',', '.');
                processed[field] = parseFloat(cleanedValue) || 0;
              } else {
                processed[field] = Number(processed[field]) || 0;
              }
            } else {
              processed[field] = 0;
            }
          });

          // Clean date fields
          dateFields.forEach(field => {
            processed[field] = parseDate(processed[field]);
          });

          if (!processed.analista_responsavel || !processed.cliente || !processed.contrato) {
            return null;
          }

          return processed;
        }).filter(Boolean);

        if (processedContracts.length === 0 && rawContracts.length > 0) {
          const msg = "Nenhum contrato válido encontrado. Verifique se as colunas obrigatórias (analista_responsavel, cliente, contrato) estão preenchidas.";
          setImportStatus({ type: "error", message: msg });
          toast.error(msg);
        } else if (processedContracts.length > 0) {
          await Contract.bulkCreate(processedContracts);
          const msg = `${processedContracts.length} de ${rawContracts.length} contratos foram importados com sucesso!`;
          setImportStatus({ type: "success", message: msg });
          toast.success(msg);
          onImportComplete();
        } else {
          const msg = "O arquivo parece estar vazio ou em um formato incorreto.";
          setImportStatus({ type: "error", message: msg });
          toast.error(msg);
        }
      } else {
        const msg = `Erro ao extrair dados: ${result.details || 'Verifique o formato do arquivo e os dados.'}`;
        setImportStatus({ type: "error", message: msg });
        toast.error(msg);
      }
    } catch (error) {
      console.error("Import error:", error);
      let msg = "Ocorreu um erro inesperado durante a importação.";

      if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        msg = "Timeout na importação. O servidor está sobrecarregado. Tente novamente em alguns minutos com um arquivo menor.";
      } else if (error.message.includes('500') || error.message.includes('DatabaseTimeout')) {
        msg = "Erro no servidor (500). A plataforma está enfrentando problemas temporários. Tente novamente em alguns minutos.";
      }

      setImportStatus({ type: "error", message: msg });
      toast.error(msg);
    }

    setIsImporting(false);
    event.target.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar/Exportar Contratos</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Exportar</TabsTrigger>
            <TabsTrigger value="import">Importar</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="text-center py-6">
              <FileText className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Exportar Contratos</h3>
              <p className="text-gray-600 mb-6">
                Baixe todos os seus contratos em formato CSV.
              </p>
              <Button
                onClick={exportToCSV}
                disabled={isExporting || contracts.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {isExporting ? "Exportando..." : `Baixar ${contracts.length} Contratos`}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 p-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Se encontrar erros de timeout ou servidor (500), aguarde alguns minutos e tente novamente.
                Para arquivos grandes, considere dividir em lotes menores.
              </AlertDescription>
            </Alert>

            <div className="text-center py-6 border-2 border-dashed rounded-lg">
              <Upload className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Importar de CSV</h3>
              <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto">
                Envie um arquivo CSV com os dados dos contratos. Para garantir a compatibilidade, use nosso arquivo de modelo.
              </p>

              <div className="flex justify-center gap-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileImport}
                  className="hidden"
                  id="csv-upload"
                  disabled={isImporting}
                />

                <Button
                  onClick={() => document.getElementById('csv-upload').click()}
                  disabled={isImporting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {isImporting ? "Importando..." : "Selecionar Arquivo"}
                </Button>

                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Modelo
                </Button>
              </div>
            </div>

            {importStatus && (
              <Alert variant={importStatus.type === "error" ? "destructive" : "default"} className={importStatus.type === "success" ? "bg-green-50 border-green-200" : ""}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{importStatus.message}</AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
