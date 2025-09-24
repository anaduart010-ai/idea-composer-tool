import { useMemo } from 'react';
import { Card } from '@/components/ui/card';

interface TextComparisonProps {
  originalText: string;
  suggestedText: string;
}

interface DiffSegment {
  type: 'unchanged' | 'added' | 'removed';
  text: string;
}

export function TextComparison({ originalText, suggestedText }: TextComparisonProps) {
  const diffs = useMemo(() => {
    // Algoritmo simples de diff por palavras
    const originalWords = originalText.split(/(\s+)/);
    const suggestedWords = suggestedText.split(/(\s+)/);
    
    const originalDiffs: DiffSegment[] = [];
    const suggestedDiffs: DiffSegment[] = [];
    
    let originalIndex = 0;
    let suggestedIndex = 0;
    
    while (originalIndex < originalWords.length || suggestedIndex < suggestedWords.length) {
      const originalWord = originalWords[originalIndex];
      const suggestedWord = suggestedWords[suggestedIndex];
      
      if (originalWord === suggestedWord) {
        // Palavras iguais
        if (originalWord) {
          originalDiffs.push({ type: 'unchanged', text: originalWord });
          suggestedDiffs.push({ type: 'unchanged', text: suggestedWord });
        }
        originalIndex++;
        suggestedIndex++;
      } else {
        // Palavras diferentes - marcar como removida/adicionada
        if (originalIndex < originalWords.length) {
          originalDiffs.push({ type: 'removed', text: originalWord });
          originalIndex++;
        }
        if (suggestedIndex < suggestedWords.length) {
          suggestedDiffs.push({ type: 'added', text: suggestedWord });
          suggestedIndex++;
        }
      }
    }
    
    return { originalDiffs, suggestedDiffs };
  }, [originalText, suggestedText]);

  const renderDiff = (segments: DiffSegment[]) => {
    return segments.map((segment, index) => {
      let className = '';
      
      switch (segment.type) {
        case 'added':
          className = 'bg-added text-added-text';
          break;
        case 'removed':
          className = 'bg-removed text-removed-text';
          break;
        case 'unchanged':
          className = '';
          break;
      }
      
      return (
        <span key={index} className={className}>
          {segment.text}
        </span>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      <Card className="p-4 bg-card">
        <div className="mb-3">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <div className="w-3 h-3 bg-removed rounded-full"></div>
            Texto Original
          </h4>
        </div>
        <div className="prose max-w-none text-sm leading-relaxed h-full overflow-auto">
          <div className="whitespace-pre-wrap font-mono">
            {renderDiff(diffs.originalDiffs)}
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card">
        <div className="mb-3">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <div className="w-3 h-3 bg-added rounded-full"></div>
            Sugestão da IA (via n8n)
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Resultado processado pelo webhook
          </p>
        </div>
        <div className="prose max-w-none text-sm leading-relaxed h-full overflow-auto">
          <div className="whitespace-pre-wrap font-mono">
            {renderDiff(diffs.suggestedDiffs)}
          </div>
        </div>
      </Card>

      <div className="lg:col-span-2 mt-4">
        <Card className="p-4 bg-yellow/10 border-yellow">
          <h4 className="font-medium text-foreground mb-2">Resposta do Webhook n8n:</h4>
          <div className="bg-background rounded p-3 border text-sm font-mono">
            <div className="text-muted-foreground mb-1">Resultado processado:</div>
            <div className="text-foreground">{suggestedText}</div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2 mt-4">
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium text-foreground mb-2">Resumo das Mudanças:</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-added rounded-full"></div>
              <span className="text-added-text">Adições da IA</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-removed rounded-full"></div>
              <span className="text-removed-text">Remoções do original</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted rounded-full"></div>
              <span className="text-muted-foreground">Texto mantido</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}