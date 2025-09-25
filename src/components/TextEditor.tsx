import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  Download, 
  Settings, 
  Brain, 
  ExternalLink, 
  Upload, 
  Copy, 
  Check, 
  X,
  Sparkles 
} from 'lucide-react';
import { TextComparison } from './TextComparison';
import { ConfigModal } from './ConfigModal';
import editorLogo from '@/assets/editor-logo.png';

interface TextEditorProps {
  className?: string;
}

export function TextEditor({ className }: TextEditorProps) {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://analu99.app.n8n.cloud/webhook-test/7fba5100-1147-4e40-9d03-c617d8744d4a');
  const [showConfig, setShowConfig] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = useCallback(() => {
    // Implementar lógica de salvamento
    toast({
      title: "Texto salvo",
      description: "O conteúdo foi salvo com sucesso.",
    });
  }, [content]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documento.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download iniciado",
      description: "O arquivo está sendo baixado.",
    });
  }, [content]);

  const handleJiraRequest = useCallback(() => {
    // Implementar integração com Jira
    toast({
      title: "Solicitação enviada",
      description: "Chamado criado no Jira para adicionar o texto à base de conhecimento.",
    });
  }, [content]);

  const handleAiAnalysis = useCallback(async () => {
    if (!webhookUrl) {
      toast({
        title: "Configuração necessária",
        description: "Configure a URL do webhook n8n primeiro.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Texto vazio",
        description: "Digite algum conteúdo para analisar.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setOriginalContent(content);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });

      if (!response.ok) {
        throw new Error('Erro na análise');
      }

      const result = await response.json();
      console.log('Resposta do webhook:', result); // Debug log
      
      // Captura a resposta do webhook - tenta vários campos possíveis
      const aiResponse = result.output || result.suggestion || result.text || result.response || 'Nenhuma sugestão retornada';
      console.log('Resultado capturado:', aiResponse); // Debug log
      
      setAiSuggestion(aiResponse);
      setShowComparison(true);
      
      toast({
        title: "Análise concluída",
        description: `Aqui está o texto. Resultado: "${aiResponse.substring(0, 50)}${aiResponse.length > 50 ? '...' : ''}"`,
      });
    } catch (error) {
      toast({
        title: "Erro na análise",
        description: "Não foi possível conectar com o webhook.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, webhookUrl]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setContent(text);
      toast({
        title: "Arquivo carregado",
        description: `Conteúdo do arquivo ${file.name} foi carregado.`,
      });
    };
    reader.readAsText(file);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copiado",
        description: "Texto copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
    }
  }, [content]);

  const handleAcceptSuggestion = useCallback(() => {
    setContent(aiSuggestion);
    setShowComparison(false);
    toast({
      title: "Sugestão aceita",
      description: "As mudanças da IA foram aplicadas ao texto.",
    });
  }, [aiSuggestion]);

  const handleRejectSuggestion = useCallback(() => {
    setShowComparison(false);
    toast({
      title: "Sugestão rejeitada",
      description: "O texto original foi mantido.",
    });
  }, []);

  return (
    <div className={`flex flex-col h-screen bg-background ${className}`}>
      {/* Toolbar */}
      <Card className="border-b border-border bg-toolbar-background">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={editorLogo} 
                alt="Editor IA" 
                className="w-8 h-8 object-contain" 
              />
              <div>
                <h1 className="text-lg font-semibold text-foreground">Editor de FAQ</h1>
                <p className="text-xs text-muted-foreground">crie, analise e edite</p>
              </div>
            </div>
            
            <div className="h-8 w-px bg-border mx-2"></div>
            
            <div className="flex items-center gap-2">
              <Button
              variant="outline" 
              size="sm" 
              onClick={handleSave}
              className="hover:bg-button-hover hover:text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
              className="hover:bg-button-hover hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleJiraRequest}
              className="hover:bg-button-hover hover:text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Solicitar cadastro no Jira
            </Button>
            
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleAiAnalysis}
                disabled={isAnalyzing}
                className="bg-primary hover:bg-button-hover"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isAnalyzing ? 'Revisando...' : 'Revise com IA'}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopy}
              className="hover:bg-button-hover hover:text-white"
            >
              <Copy className="w-4 h-4" />
            </Button>
            
            <Input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              className="hover:bg-button-hover hover:text-white"
            >
              <Upload className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowConfig(true)}
              className="hover:bg-button-hover hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Editor Content */}
      <div className="flex-1 flex">
        {!showComparison ? (
          <div className="flex-1 p-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite seu texto aqui ou faça upload de um arquivo..."
              className="w-full h-full min-h-[500px] resize-none bg-editor-background border-0 text-base leading-relaxed focus:ring-2 focus:ring-primary"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-4 gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Comparação: Original vs Sugestão da IA
              </h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAcceptSuggestion}
                  className="bg-green hover:bg-green/80 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Aceitar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectSuggestion}
                  className="hover:bg-destructive hover:text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  Rejeitar
                </Button>
              </div>
            </div>
            
            <TextComparison 
              originalText={originalContent}
              suggestedText={aiSuggestion}
              onOriginalTextChange={setOriginalContent}
              onSuggestedTextChange={setAiSuggestion}
            />
          </div>
        )}
      </div>

      <ConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        webhookUrl={webhookUrl}
        onWebhookUrlChange={setWebhookUrl}
      />
    </div>
  );
}