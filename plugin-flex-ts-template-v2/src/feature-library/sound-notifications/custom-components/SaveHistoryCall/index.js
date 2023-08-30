// import { withTheme } from '@twilio/flex-ui';
// import { useEffect, useState } from 'react';
// import Modal from 'react-modal';
// import axios from 'axios';

// import { ContactHubspot, Container } from './styles';
// import { getTypeAndOutcome } from '../../../helpers/getTypeAndOutcome';
// import reasons from '../../assets/reasons.json';
// import { getNewClientInformation } from '../../../helpers/getNewClientInformation';
// import { saveHistoryMessage } from '../../../helpers/saveHistoryMessage';
// import { getDeals } from '../../../helpers/getDeals';

// const saveHistoryMethod = async (task, props, selectedDeal, setButtonDisabled, setIsOpen) => {
//   const responseSaveHistory = await saveHistoryMessage(
//     task.attributes,
//     task.dateCreated,
//     task.dateUpdated,
//     props.workerInformation,
//     task.taskChannelUniqueName,
//     selectedDeal,
//   );

//   if (responseSaveHistory) {
//     setIsOpen(false);
//   } else {
//     setButtonDisabled(false);
//     props.flex.Notifications.showNotification('saveHistoryResponseFailed');
//   }
// };

// async function getSegmentLinkFallback(props, task, selectedDeal, setButtonDisabled, setIsOpen) {
//   const tokenAuthorization = `${process.env.FLEX_APP_ACCOUNT_SID}:${process.env.FLEX_APP_AUTH_TOKEN}`;
//   const buffer = Buffer.from(tokenAuthorization);
//   const tokenFormatted = buffer.toString('base64');

//   const { data } = await axios.get(
//     `https://taskrouter.twilio.com/v1/Workspaces/${process.env.FLEX_APP_WORKSPACE_SID}/Tasks/${task.sid}`,
//     {
//       headers: { Authorization: `Basic ${tokenFormatted}` },
//     },
//   );
//   const taskAttributes = data.attributes && JSON.parse(data.attributes);
//   const segmentLink = taskAttributes?.conversations?.segment_link;

//   if (task.attributes.conversations) {
//     task.attributes.conversations = {
//       ...task.attributes.conversations,
//       segment_link: segmentLink,
//     };
//   } else {
//     task.attributes = {
//       ...task.attributes,
//       conversations: {
//         segment_link: segmentLink,
//       },
//     };
//   }

//   await saveHistoryMethod(task, props, selectedDeal, setButtonDisabled, setIsOpen);
// }

// const SaveHistoryCall = (props) => {
//   const [optionsToShow, setOptionsToShow] = useState([]);
//   const [currentTopic, setCurrentTopic] = useState('');
//   const [selectedOption, setSelectedOption] = useState('');
//   const [isOpen, setIsOpen] = useState(props.isOpen);
//   const [buttonDisabled, setButtonDisabled] = useState(false);
//   const [task, setTask] = useState();
//   const [alertContactNotFound, setAlertContactNotFound] = useState();
//   const [selectedDeal, setSelectedDeal] = useState();
//   const [deals, setDeals] = useState();

//   const [outcomeOptions, setOutcomeOptions] = useState([]);
//   const [selectedOutcome, setSelectedOutcome] = useState('');

//   const [typeOptions, setTypeOptions] = useState([]);
//   const [selectedType, setSelectedType] = useState('');

//   const [newEmail, setNewEmail] = useState('');
//   const [wrapupTimeout, setWrapupTimeout] = useState(120);

//   let timeout;

//   useEffect(() => {
//     clearTimeout(timeout);

//     if (wrapupTimeout === 0) onEndTask(true);
//     else {
//       timeout = setTimeout(() => {
//         setWrapupTimeout(wrapupTimeout - 1);
//       }, 1000);
//     }
//   }, [wrapupTimeout]);

//   useEffect(() => {
//     if (alertContactNotFound) {
//       setTimeout(() => {
//         setAlertContactNotFound();
//       }, 5000);
//     }
//   }, [alertContactNotFound]);

//   useEffect(() => {
//     if (!isOpen) {
//       const customModalIndex = props.flex.AgentDesktopView.Panel1.Content.fragments.findIndex(
//         (fragment) => fragment.props.children.key === 'save-history-call-hubspot',
//       );

//       props.flex.AgentDesktopView.Panel1.Content.fragments.splice(customModalIndex, 1);
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     setIsOpen(props.isOpen);

//     async function fetchData() {
//       const { types, outcomes } = await getTypeAndOutcome();

//       setTypeOptions(types);
//       setOutcomeOptions(outcomes);

//       const { deals, success } = await getDeals(
//         props?.task?.attributes?.clientInformation?.hs_object_id,
//         props?.task?.attributes?.clientInformation?.associatedcompanyid,
//       );

//       if (success) {
//         setDeals(deals);
//       }
//     }

//     setTask(props.task);

//     fetchData();
//   }, []);

//   function onTopicSelect(selectedTopic) {
//     const answers = reasons.data.find((reason) => reason.topic === selectedTopic);
//     setCurrentTopic(selectedTopic.toUpperCase());
//     setSelectedOption('');
//     setOptionsToShow(answers.options);
//   }

//   async function onEndTask(wasTimeouted = false) {
//     setButtonDisabled(true);
//     let taskDetails = 'Sem descrição de atendimento informada ou não foi possível salvar os dados';

//     if (newEmail !== '') {
//       const clientInformationReturn = await getNewClientInformation(newEmail);

//       if (clientInformationReturn) {
//         task.attributes.clientInformation = clientInformationReturn;
//       } else {
//         setAlertContactNotFound(
//           'Contato não encontrado no Hubspot, por favor informe o e-mail de um contato cadastrado.',
//         );

//         setButtonDisabled(false);

//         return;
//       }
//     }

//     if (document.getElementById('confirm-task-details-call')) {
//       taskDetails = document.getElementById('confirm-task-details-call').value;
//     }

//     if (wasTimeouted) taskDetails += '\nNÃO PREENCHIDO PELO AGENTE';

//     task.attributes.call_outcome = selectedOutcome;
//     task.attributes.call_type = selectedType;
//     task.attributes.taskDetails = `${currentTopic} - ${selectedOption}\n\n${taskDetails}`;

//     if (!task?.attributes?.conversations?.segment_link) {
//       setTimeout(async () => {
//         await getSegmentLinkFallback(props, task, selectedDeal, setButtonDisabled, setIsOpen);
//       }, 3000);

//       return;
//     }

//     await saveHistoryMethod(task, props, selectedDeal, setButtonDisabled, setIsOpen);
//   }

//   return (
//     <>
//       {isOpen && (
//         <Modal
//           className="custom-modal-save-history-call"
//           ariaHideApp={false}
//           isOpen={true}
//           // onRequestClose={() => setIsOpen(false)}
//           style={{
//             content: {
//               backgroundColor: '#ccc',
//               padding: '20px',
//               border: '1px solid #888',
//               width: '25%',
//               position: 'absolute',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               minWidth: '250px',
//               height: 'fit-content',
//               maxHeight: '70%',
//               minHeight: '250px',

//               boxShadow: '1px 4px 10px #00000055',
//               zIndex: '15',

//               textAlign: 'center',
//               borderRadius: '5px',
//             },
//             overlay: {
//               backgroundColor: 'rgba(128,128,128, 0.5)',
//               zIndex: '10',
//             },
//           }}
//         >
//           <Container>
//             <span>
//               <b>{wrapupTimeout}</b>
//             </span>
//             <p className="reasonTitle">Motivo de atendimento</p>
//             {(currentTopic === '' || selectedOption === '') && (
//               <p className="fieldsRequiredTitle">* Selecione a tabulação para finalizar a tarefa</p>
//             )}
//             <select
//               className="reasonsSelect"
//               onChange={(e) => onTopicSelect(e.target.value)}
//               id="save-reason-select-topic"
//               value={currentTopic === '' ? 'defaultReasonSelectValue' : undefined}
//             >
//               <option value="Selecione um tópico..." hidden id="defaultReasonSelectValue">
//                 Selecione um tópico...
//               </option>
//               {reasons.data.map((reason, i) => {
//                 return (
//                   <option value={reason.topic} className="reasonTopic" key={`reasonTopic_${i}`}>
//                     {reason.topic}
//                   </option>
//                 );
//               })}
//             </select>

//             <>
//               <select className="reasonsSelect" onChange={(e) => setSelectedOutcome(e.target.value)}>
//                 <option value="Selecione um outcome..." hidden>
//                   Selecione um Outcome...
//                 </option>
//                 {outcomeOptions.map((reason, i) => {
//                   return (
//                     <option value={reason.id} className="reasonTopic" key={`reasonTopic_${i}`}>
//                       {reason.label}
//                     </option>
//                   );
//                 })}
//               </select>
//               <select className="reasonsSelect" onChange={(e) => setSelectedType(e.target.value)}>
//                 <option value="Selecione um type..." hidden>
//                   Selecione um tipo de Call...
//                 </option>
//                 {typeOptions.map((reason, i) => {
//                   return (
//                     <option value={reason.value} className="reasonTopic" key={`reasonTopic_${i}`}>
//                       {reason.label}
//                     </option>
//                   );
//                 })}
//               </select>

//               {deals && (
//                 <select className="reasonsSelect" onChange={(e) => setSelectedDeal(e.target.value)}>
//                   <option value="Selecione um negócio..." hidden>
//                     Selecione um negócio...
//                   </option>
//                   <optgroup label="Negócios do contato">
//                     {deals?.contactDeals?.length > 0 &&
//                       deals.contactDeals.map((deal, i) => {
//                         return (
//                           <option value={deal.id} className="reasonTopic" key={`contactDealTopic_${i}`}>
//                             {deal.properties.dealname}
//                           </option>
//                         );
//                       })}
//                   </optgroup>
//                   <optgroup label="Negócios da empresa">
//                     {deals?.companyDeals?.length > 0 &&
//                       deals.companyDeals.map((deal, i) => {
//                         return (
//                           <option value={deal.id} className="reasonTopic" key={`contactDealTopic_${i}`}>
//                             {deal.properties.dealname}
//                           </option>
//                         );
//                       })}
//                   </optgroup>
//                 </select>
//               )}
//             </>

//             {optionsToShow.map((option, ind) => (
//               <button
//                 className={`topicButton ${selectedOption === option && 'modalHighlightedOption'}`}
//                 key={`button_${ind}`}
//                 onClick={(bt) => setSelectedOption(bt.target.textContent)}
//               >
//                 {option}
//               </button>
//             ))}

//             <textarea id="confirm-task-details-call" rows={10} />
//             <hr></hr>
//             {props.task.attributes.clientInformation ? (
//               <ContactHubspot>
//                 <p>
//                   <span className="text-bold">Contato identificado:</span>{' '}
//                   {props.task.attributes.clientInformation.firstname} {props.task.attributes.clientInformation.lastname}
//                 </p>
//                 <p>
//                   <span className="text-bold">Email:</span> {props.task.attributes.clientInformation.email}
//                 </p>
//                 <p>Se deseja alterar o contato para cadastro do histórico, informe o email do novo contato:</p>
//               </ContactHubspot>
//             ) : (
//               <span>Informe o e-mail do contato para registro no Hubspot:</span>
//             )}
//             <input
//               type="email"
//               placeholder="E-mail"
//               style={{ width: '80%' }}
//               onChange={(e) => setNewEmail(e.target.value)}
//             ></input>
//             <hr></hr>
//             {alertContactNotFound && (
//               <>
//                 <span>{alertContactNotFound}</span>
//                 <hr></hr>
//               </>
//             )}
//             <button
//               className="modalConfirmButton"
//               onClick={() => {
//                 clearTimeout(timeout);
//                 onEndTask();
//               }}
//               disabled={selectedOption === '' || buttonDisabled}
//             >
//               Confirma
//             </button>
//           </Container>
//         </Modal>
//       )}
//     </>
//   );
// };

// export default withTheme(SaveHistoryCall);
