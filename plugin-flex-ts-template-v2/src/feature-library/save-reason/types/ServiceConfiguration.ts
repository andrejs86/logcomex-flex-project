export default interface SaveReasonConfig {
  enabled: boolean;
  typesAndOutcomesDocumentSid: string;
  customObjectConversas: string;
  wrapupTimeout: number;
  reasons: Array<{ topic: string; options: string[] }>;
}

// [
//   {
//     "topic": "Cliente Logcomex",
//     "options": [
//       "Problemas",
//       "Dúvidas",
//       "Solicitação de Serviços",
//       "Solicitação Geral"
//     ]
//   },
//   {
//     "topic": "Não cliente Logcomex",
//     "options": [
//       "Orçamento",
//       "Dúvidas",
//       "Apresentação"
//     ]
//   }
// ]
