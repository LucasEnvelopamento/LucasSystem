import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50, 100],
  className = ""
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Garante que a página atual nunca exceda o limite máximo de páginas
  React.useEffect(() => {
    if (currentPage > totalPages) {
      onPageChange(totalPages);
    }
  }, [currentPage, totalPages, onPageChange]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handleFirstPage = () => {
    if (currentPage > 1) onPageChange(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handleLastPage = () => {
    if (currentPage < totalPages) onPageChange(totalPages);
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-white border-t border-slate-100 no-print ${className}`}>
      {/* Informações de Registros */}
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Exibindo <span className="text-slate-800 font-black">{startItem}</span> a <span className="text-slate-800 font-black">{endItem}</span> de <span className="text-slate-800 font-black">{totalItems}</span> registros
      </div>

      {/* Controles e Itens por Página */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        {/* Seletor de Quantidade por Página */}
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exibir:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1); // Volta para a primeira página ao alterar o limite
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-black uppercase rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-4 focus:ring-primary/5 cursor-pointer transition-all hover:bg-slate-100"
            >
              {itemsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} itens
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Botões de Navegação */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleFirstPage}
            disabled={currentPage === 1}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-150 ${
              currentPage === 1 
                ? 'text-slate-300 border-slate-100 bg-slate-50 cursor-not-allowed' 
                : 'text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 active:scale-95'
            }`}
            title="Primeira Página"
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-150 ${
              currentPage === 1 
                ? 'text-slate-300 border-slate-100 bg-slate-50 cursor-not-allowed' 
                : 'text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 active:scale-95'
            }`}
            title="Página Anterior"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Estado de Página Atual */}
          <div className="h-9 px-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-xs font-black text-slate-800 select-none">
            {currentPage} / {totalPages}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-150 ${
              currentPage === totalPages 
                ? 'text-slate-300 border-slate-100 bg-slate-50 cursor-not-allowed' 
                : 'text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 active:scale-95'
            }`}
            title="Próxima Página"
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={handleLastPage}
            disabled={currentPage === totalPages}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-150 ${
              currentPage === totalPages 
                ? 'text-slate-300 border-slate-100 bg-slate-50 cursor-not-allowed' 
                : 'text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 active:scale-95'
            }`}
            title="Última Página"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
