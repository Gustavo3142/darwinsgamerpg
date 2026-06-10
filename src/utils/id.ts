export const generateId = () => {
  // Retorna o milissegundo atual + 5 dígitos aleatórios, impossibilitando colisões
  return parseInt(`${Date.now()}${Math.floor(Math.random() * 90000 + 10000)}`);
};