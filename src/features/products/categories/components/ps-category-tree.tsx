// src/features/products/categories/ps-category-tree.tsx
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { prestashopClient, type PrestashopCategoryNode } from "@/api/prestashop";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Loader2,
  ChevronRight,
  ChevronDown,
  Search,
  FolderTree,
  Check,
} from "lucide-react";

type Props = {
  selectedId: number | null;
  onSelect: (category: { id: number; name: string }) => void;
};

function CategoryTreeNode({
  node,
  depth,
  selectedId,
  onSelect,
  expandedIds,
  toggleExpand,
  searchQuery,
}: {
  node: PrestashopCategoryNode;
  depth: number;
  selectedId: number | null;
  onSelect: (category: { id: number; name: string }) => void;
  expandedIds: Set<number>;
  toggleExpand: (id: number) => void;
  searchQuery: string;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id_category);
  const isSelected = selectedId === node.id_category;

  // Filter children based on search
  const matchesSearch =
    !searchQuery ||
    node.name.toLowerCase().includes(searchQuery.toLowerCase());
  const hasMatchingChildren = node.children?.some(
    (child) =>
      child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.children?.some((grandchild) =>
        grandchild.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  if (searchQuery && !matchesSearch && !hasMatchingChildren) {
    return null;
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-colors",
          "hover:bg-muted/50",
          isSelected && "bg-primary/10 text-primary font-medium"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect({ id: node.id_category, name: node.name })}
      >
        {hasChildren ? (
          <button
            type="button"
            className="p-0.5 hover:bg-muted rounded"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(node.id_category);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <FolderTree className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="truncate text-sm">{node.name}</span>
        {isSelected && <Check className="h-4 w-4 ml-auto text-primary" />}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <CategoryTreeNode
              key={child.id_category}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PsCategoryTree({ selectedId, onSelect }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ["prestashop", "categories"],
    queryFn: () => prestashopClient.getCategories(),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (!data?.categories) return;
    const allIds = new Set<number>();
    const collect = (nodes: PrestashopCategoryNode[]) => {
      nodes.forEach((n) => {
        if (n.children && n.children.length > 0) {
          allIds.add(n.id_category);
          collect(n.children);
        }
      });
    };
    collect(data.categories);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Auto-expand when searching
  useMemo(() => {
    if (searchQuery && data?.categories) {
      expandAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          A carregar categorias...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive py-4 text-center">
        Erro ao carregar categorias PrestaShop
      </div>
    );
  }

  const categories = data?.categories ?? [];

  return (
    <div className="space-y-3">
      {/* Search and controls */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={expandAll}
          className="text-xs"
        >
          Expandir
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={collapseAll}
          className="text-xs"
        >
          Colapsar
        </Button>
      </div>

      {/* Tree */}
      <ScrollArea className="h-[300px] border rounded-md">
        <div className="p-2">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma categoria encontrada
            </p>
          ) : (
            categories.map((cat) => (
              <CategoryTreeNode
                key={cat.id_category}
                node={cat}
                depth={0}
                selectedId={selectedId}
                onSelect={onSelect}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
                searchQuery={searchQuery}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
