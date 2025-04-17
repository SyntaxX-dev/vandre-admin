// app/api/travel-package/travel-package-utils.ts

/**
 * Normaliza um array de locais de embarque.
 * Algumas APIs podem retornar um array com strings que contêm múltiplos locais separados por vírgula.
 */
export const normalizeBoardingLocations = (boardingLocations: string[] | string | undefined): string[] => {
    if (!boardingLocations) {
      return [];
    }
    
    if (typeof boardingLocations === 'string') {
      return boardingLocations.split(',').map(location => location.trim());
    }
    
    if (Array.isArray(boardingLocations)) {
      const normalizedLocations: string[] = [];
      
      boardingLocations.forEach(location => {
        if (typeof location === 'string') {
          if (location.includes(',')) {
            // Se um item do array contém vírgulas, divida-o em múltiplos itens
            normalizedLocations.push(...location.split(',').map(loc => loc.trim()));
          } else {
            normalizedLocations.push(location.trim());
          }
        }
      });
      
      return normalizedLocations;
    }
    
    return [];
  };
  
  /**
   * Formata o mês da viagem para garantir que esteja no formato "Mês/Ano"
   */
export const formatTravelMonth = (month: string): string => {
  // Se contém caracteres que não são letras (incluindo "/"), limpa para manter apenas o nome do mês
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ]+$/.test(month)) {
    // Se tiver um formato como "Janeiro/2025", extrair apenas o nome do mês
    if (month.includes('/')) {
      return month.split('/')[0].trim();
    }
    
    // Remover quaisquer caracteres que não sejam letras
    return month.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '').trim();
  }
  
  return month;
}