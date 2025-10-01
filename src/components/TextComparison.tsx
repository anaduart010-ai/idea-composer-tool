import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { RichTextEditor } from './RichTextEditor';

interface TextComparisonProps {
  originalText: string;
  suggestedText: string;
  onOriginalTextChange?: (text: string) => void;
  onSuggestedTextChange?: (text: string) => void;
}

export function TextComparison({ originalText, suggestedText, onOriginalTextChange, onSuggestedTextChange }: TextComparisonProps) {
  // Função para criar HTML com destaque de diferenças
  const createDiffHTML = useMemo(() => {
    const stripHTML = (html: string) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };

    const originalPlainText = stripHTML(originalText);
    const suggestedPlainText = stripHTML(suggestedText);

    // Algoritmo simples de diff por palavras
    const originalWords = originalPlainText.split(/(\s+)/);
    const suggestedWords = suggestedPlainText.split(/(\s+)/);
    
    let originalHTML = '';
    let suggestedHTML = '';
    
    let originalIndex = 0;
    let suggestedIndex = 0;
    
    while (originalIndex < originalWords.length || suggestedIndex < suggestedWords.length) {
      const originalWord = originalWords[originalIndex];
      const suggestedWord = suggestedWords[suggestedIndex];
      
      if (originalWord === suggestedWord) {
        // Palavras iguais
        if (originalWord) {
          originalHTML += originalWord;
          suggestedHTML += suggestedWord;
        }
        originalIndex++;
        suggestedIndex++;
      } else {
        // Palavras diferentes - marcar como removida/adicionada
        if (originalIndex < originalWords.length) {
          originalHTML += `<span style="background-color: rgba(239, 68, 68, 0.2); text-decoration: line-through; padding: 0 2px; border-radius: 2px;">${originalWord}</span>`;
          originalIndex++;
        }
        if (suggestedIndex < suggestedWords.length) {
          suggestedHTML += `<span style="background-color: rgba(34, 197, 94, 0.2); font-weight: 500; padding: 0 2px; border-radius: 2px;">${suggestedWord}</span>`;
          suggestedIndex++;
        }
      }
    }
    
    return { originalHTML, suggestedHTML };
  }, [originalText, suggestedText]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      <Card className="p-4 bg-card">
        <div className="mb-3">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <div className="w-3 h-3 bg-destructive rounded-full"></div>
            Texto Original (Editável)
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Vermelho = texto removido pela IA
          </p>
        </div>
        <RichTextEditor
          content={createDiffHTML.originalHTML}
          onChange={(html) => onOriginalTextChange?.(html)}
          placeholder="Texto original..."
        />
      </Card>

      <Card className="p-4 bg-card">
        <div className="mb-3">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <div className="w-3 h-3 bg-green rounded-full"></div>
            Sugestão da IA (Editável)
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Verde = texto adicionado pela IA
          </p>
        </div>
        <RichTextEditor
          content={createDiffHTML.suggestedHTML}
          onChange={(html) => onSuggestedTextChange?.(html)}
          placeholder="Sugestão da IA..."
        />
      </Card>

      <div className="lg:col-span-2 mt-4">
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium text-foreground mb-2">💡 Dicas:</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Você pode editar ambos os textos diretamente usando a barra de ferramentas completa</p>
            <p>• Use Ctrl+Z para desfazer e Ctrl+Y para refazer</p>
            <p>• As mudanças destacadas mostram diferenças: <span className="bg-destructive/20 px-1 rounded">vermelho riscado</span> = removido, <span className="bg-green/20 px-1 rounded font-medium">verde</span> = adicionado</p>
          </div>
        </Card>
      </div>
    </div>
  );
}