import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, Heading } from 'lucide-react';

interface TextComparisonProps {
  originalText: string;
  suggestedText: string;
  onOriginalTextChange?: (text: string) => void;
  onSuggestedTextChange?: (text: string) => void;
}

interface DiffSegment {
  type: 'unchanged' | 'added' | 'removed';
  text: string;
}

export function TextComparison({ originalText, suggestedText, onOriginalTextChange, onSuggestedTextChange }: TextComparisonProps) {
  const [editableOriginal, setEditableOriginal] = useState(originalText);
  const [editableSuggested, setEditableSuggested] = useState(suggestedText);
  const diffs = useMemo(() => {
    // Algoritmo melhorado de diff por palavras
    const originalWords = editableOriginal.split(/(\s+|[^\w\s])/);
    const suggestedWords = editableSuggested.split(/(\s+|[^\w\s])/);
    
    const originalDiffs: DiffSegment[] = [];
    const suggestedDiffs: DiffSegment[] = [];
    
    // Algoritmo LCS simples para melhor comparação
    const matrix = Array(originalWords.length + 1).fill(null).map(() => 
      Array(suggestedWords.length + 1).fill(0)
    );
    
    // Construir matriz LCS
    for (let i = 1; i <= originalWords.length; i++) {
      for (let j = 1; j <= suggestedWords.length; j++) {
        if (originalWords[i - 1] === suggestedWords[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1] + 1;
        } else {
          matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
        }
      }
    }
    
    // Rastrear diferenças
    let i = originalWords.length;
    let j = suggestedWords.length;
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && originalWords[i - 1] === suggestedWords[j - 1]) {
        originalDiffs.unshift({ type: 'unchanged', text: originalWords[i - 1] });
        suggestedDiffs.unshift({ type: 'unchanged', text: suggestedWords[j - 1] });
        i--;
        j--;
      } else if (i > 0 && (j === 0 || matrix[i - 1][j] >= matrix[i][j - 1])) {
        originalDiffs.unshift({ type: 'removed', text: originalWords[i - 1] });
        i--;
      } else if (j > 0) {
        suggestedDiffs.unshift({ type: 'added', text: suggestedWords[j - 1] });
        j--;
      }
    }
    
    return { originalDiffs, suggestedDiffs };
  }, [editableOriginal, editableSuggested]);

  const formatText = (editorElement: HTMLElement, format: 'bold' | 'italic' | 'header' | 'list') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!editorElement.contains(range.commonAncestorContainer)) return;

    const selectedText = selection.toString();
    if (!selectedText) return;

    switch (format) {
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'header':
        document.execCommand('formatBlock', false, 'h3');
        break;
      case 'list':
        document.execCommand('insertUnorderedList', false);
        break;
    }
  };

  const handleOriginalFormat = (format: 'bold' | 'italic' | 'header' | 'list') => {
    const editorElement = document.querySelector('[data-editor="original"]') as HTMLElement;
    if (editorElement) {
      formatText(editorElement, format);
      // Atualizar estado com o conteúdo HTML
      const content = editorElement.textContent || '';
      setEditableOriginal(content);
      onOriginalTextChange?.(content);
    }
  };

  const handleSuggestedFormat = (format: 'bold' | 'italic' | 'header' | 'list') => {
    const editorElement = document.querySelector('[data-editor="suggested"]') as HTMLElement;
    if (editorElement) {
      formatText(editorElement, format);
      // Atualizar estado com o conteúdo HTML
      const content = editorElement.textContent || '';
      setEditableSuggested(content);
      onSuggestedTextChange?.(content);
    }
  };

  const renderDiff = (segments: DiffSegment[]) => {
    return segments.map((segment, index) => {
      let className = '';
      let style = {};
      
      switch (segment.type) {
        case 'added':
          className = 'bg-added text-added-text px-1 rounded';
          style = { backgroundColor: 'hsl(120, 60%, 90%)', color: 'hsl(120, 60%, 25%)' };
          break;
        case 'removed':
          className = 'bg-removed text-removed-text px-1 rounded';
          style = { backgroundColor: 'hsl(0, 60%, 90%)', color: 'hsl(0, 60%, 25%)' };
          break;
        case 'unchanged':
          className = '';
          break;
      }
      
      return (
        <span key={index} className={className} style={style}>
          {segment.text}
        </span>
      );
    }).join('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      <Card className="p-4 bg-card">
        <div className="mb-3">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <div className="w-3 h-3 bg-removed rounded-full"></div>
            Texto Original
          </h4>
          <div className="flex gap-1 mt-2">
            <Button size="sm" variant="ghost" onClick={() => handleOriginalFormat('bold')}>
              <Bold className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleOriginalFormat('italic')}>
              <Italic className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleOriginalFormat('header')}>
              <Heading className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleOriginalFormat('list')}>
              <List className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="prose max-w-none text-sm leading-relaxed h-full overflow-auto">
          <div 
            contentEditable
            suppressContentEditableWarning
            data-editor="original"
            onInput={(e) => {
              const content = e.currentTarget.textContent || '';
              setEditableOriginal(content);
              onOriginalTextChange?.(content);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                document.execCommand('insertText', false, '  ');
              }
            }}
            className="w-full h-64 p-3 border rounded bg-background text-foreground resize-none focus:ring-2 focus:ring-primary focus:outline-none"
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            dangerouslySetInnerHTML={{ __html: renderDiff(diffs.originalDiffs) }}
          />
        </div>
      </Card>

      <Card className="p-4 bg-card">
        <div className="mb-3">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <div className="w-3 h-3 bg-added rounded-full"></div>
            Sugestão da IA (via n8n)
          </h4>
          <div className="flex gap-1 mt-2">
            <Button size="sm" variant="ghost" onClick={() => handleSuggestedFormat('bold')}>
              <Bold className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleSuggestedFormat('italic')}>
              <Italic className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleSuggestedFormat('header')}>
              <Heading className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleSuggestedFormat('list')}>
              <List className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="prose max-w-none text-sm leading-relaxed h-full overflow-auto">
          <div 
            contentEditable
            suppressContentEditableWarning
            data-editor="suggested"
            onInput={(e) => {
              const content = e.currentTarget.textContent || '';
              setEditableSuggested(content);
              onSuggestedTextChange?.(content);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                document.execCommand('insertText', false, '  ');
              }
            }}
            className="w-full h-64 p-3 border rounded bg-background text-foreground resize-none focus:ring-2 focus:ring-primary focus:outline-none"
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            dangerouslySetInnerHTML={{ __html: renderDiff(diffs.suggestedDiffs) }}
          />
        </div>
      </Card>

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