import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Settings, Link, TestTube } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookUrl: string;
  onWebhookUrlChange: (url: string) => void;
}

export function ConfigModal({ 
  isOpen, 
  onClose, 
  webhookUrl, 
  onWebhookUrlChange 
}: ConfigModalProps) {
  const [tempUrl, setTempUrl] = useState(webhookUrl);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = () => {
    onWebhookUrlChange(tempUrl);
    toast({
      title: "Configurações salvas",
      description: "URL do webhook n8n foi atualizada.",
    });
    onClose();
  };

  const handleTestWebhook = async () => {
    if (!tempUrl.trim()) {
      toast({
        title: "URL necessária",
        description: "Digite uma URL válida para testar.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);

    try {
      const response = await fetch(tempUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: 'Teste de conexão com o webhook n8n',
          test: true 
        }),
      });

      if (response.ok) {
        toast({
          title: "Conexão bem-sucedida",
          description: "O webhook n8n está funcionando corretamente.",
        });
      } else {
        toast({
          title: "Erro na conexão",
          description: `Erro ${response.status}: ${response.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Falha na conexão",
        description: "Não foi possível conectar com o webhook.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const resetUrl = () => {
    setTempUrl('');
    toast({
      title: "URL limpa",
      description: "Campo de URL foi resetado.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Configurações do Editor
          </DialogTitle>
          <DialogDescription>
            Configure a integração com n8n para análise de texto com IA.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card className="p-4 bg-muted/50">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Link className="w-4 h-4 text-primary" />
                <Label className="text-sm font-medium">Webhook n8n</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhook-url" className="text-sm text-muted-foreground">
                  URL do Webhook
                </Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://seu-n8n.com/webhook/analise-texto"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Cole a URL do webhook configurado no n8n para análise de texto.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestWebhook}
                  disabled={isTesting || !tempUrl.trim()}
                  className="hover:bg-button-hover hover:text-white"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {isTesting ? 'Testando...' : 'Testar Conexão'}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetUrl}
                  className="hover:bg-destructive hover:text-white"
                >
                  Limpar
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-yellow/10 border-yellow">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                Como configurar:
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Configure um webhook no n8n que receba POST com {"{ text: 'conteúdo' }"}</li>
                <li>• O webhook deve retornar {"{ suggestion: 'texto_melhorado' }"} ou {"{ text: 'texto_melhorado' }"}</li>
                <li>• Use HTTPS para maior segurança</li>
                <li>• Teste a conexão antes de usar</li>
              </ul>
            </div>
          </Card>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-button-hover">
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}