import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { RichTextEditor } from './RichTextEditor';
import DiffMatchPatch from 'diff-match-patch';

interface TextComparisonProps {
  originalText: string;
  suggestedText: string;
  onOriginalTextChange?: (text: string) => void;
  onSuggestedTextChange?: (text: string) => void;
}

export function TextComparison({ originalText, suggestedText, onOriginalTextChange, onSuggestedTextChange }: TextComparisonProps) {
  const { originalWithDiff, suggestedWithDiff } = useMemo(() => {
    if (!originalText && !suggestedText) {
      return { originalWithDiff: '', suggestedWithDiff: '' };
    }

    // Textos já vêm em HTML, não precisa converter
    const dmp = new DiffMatchPatch();
    const diffs = dmp.diff_main(originalText, suggestedText);
    dmp.diff_cleanupSemantic(diffs);

    let originalWithDiff = '';
    let suggestedWithDiff = '';

    diffs.forEach(([operation, text]) => {
      if (operation === 0) {
        // Texto igual - mantém em ambos sem highlight
        originalWithDiff += text;
        suggestedWithDiff += text;
      } else if (operation === -1) {
        // Texto removido - mostrar em vermelho riscado no original usando tokens do design system
        originalWithDiff += `<mark style="background-color: hsl(var(--removed)); color: hsl(var(--removed-text)); text-decoration: line-through; padding: 0 4px; border-radius: 3px;">${text}</mark>`;
      } else if (operation === 1) {
        // Texto adicionado - mostrar em verde na sugestão usando tokens do design system
        suggestedWithDiff += `<mark style="background-color: hsl(var(--added)); color: hsl(var(--added-text)); font-weight: 500; padding: 0 4px; border-radius: 3px;">${text}</mark>`;
      }
    });

    return { originalWithDiff, suggestedWithDiff };
  }, [originalText, suggestedText]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
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
          content={originalWithDiff}
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
          content={suggestedWithDiff}
          onChange={(html) => onSuggestedTextChange?.(html)}
          placeholder="Sugestão da IA..."
        />
      </Card>

      <div className="md:col-span-2 mt-4">
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