// src/features/not-found/index.tsx
// Página 404 - Rota não encontrada

import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      {/* 404 grande com efeito */}
      <div className="relative">
        <span className="text-[12rem] font-bold leading-none text-muted-foreground/10 select-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-foreground">404</span>
        </div>
      </div>

      {/* Mensagem */}
      <h1 className="text-2xl font-semibold mt-4">Página não encontrada</h1>
      <p className="text-muted-foreground mt-2 max-w-md">
        A página que procuras não existe ou foi movida. Verifica o endereço ou volta à página inicial.
      </p>

      {/* Ações */}
      <div className="flex gap-3 mt-8">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={() => navigate("/")}>
          <Home className="h-4 w-4 mr-2" />
          Página Inicial
        </Button>
      </div>
    </div>
  );
}
