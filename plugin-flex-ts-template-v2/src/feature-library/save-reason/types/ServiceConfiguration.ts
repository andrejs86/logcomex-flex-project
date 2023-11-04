export default interface SaveReasonConfig {
  enabled: boolean;
  typesAndOutcomesDocumentSid: string;
  customObjectConversas: string;
  wrapupTimeout: number;
  everyoneQueueSid: string;
  authToken: string;
  internationalQueueSid: string;
  internationalNumber: string;
  nationalNumber: string;
  flexWorkspaceSid: string;
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
