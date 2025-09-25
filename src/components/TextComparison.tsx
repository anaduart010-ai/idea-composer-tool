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
    // Algoritmo simples de diff por palavras
    const originalWords = editableOriginal.split(/(\s+)/);
    const suggestedWords = editableSuggested.split(/(\s+)/);
    
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
  }, [editableOriginal, editableSuggested]);

  const formatText = (text: string, format: 'bold' | 'italic' | 'header' | 'list') => {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';
    
    if (!selectedText) return text;
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'header':
        formattedText = `# ${selectedText}`;
        break;
      case 'list':
        formattedText = `- ${selectedText}`;
        break;
    }
    
    return text.replace(selectedText, formattedText);
  };

  const handleOriginalFormat = (format: 'bold' | 'italic' | 'header' | 'list') => {
    const newText = formatText(editableOriginal, format);
    setEditableOriginal(newText);
    onOriginalTextChange?.(newText);
  };

  const handleSuggestedFormat = (format: 'bold' | 'italic' | 'header' | 'list') => {
    const newText = formatText(editableSuggested, format);
    setEditableSuggested(newText);
    onSuggestedTextChange?.(newText);
  };

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
          <textarea
            value={editableOriginal}
            onChange={(e) => {
              setEditableOriginal(e.target.value);
              onOriginalTextChange?.(e.target.value);
            }}
            className="w-full h-64 p-3 border rounded bg-background text-foreground resize-none focus:ring-2 focus:ring-primary"
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
          <textarea
            value={editableSuggested}
            onChange={(e) => {
              setEditableSuggested(e.target.value);
              onSuggestedTextChange?.(e.target.value);
            }}
            className="w-full h-64 p-3 border rounded bg-background text-foreground resize-none focus:ring-2 focus:ring-primary"
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