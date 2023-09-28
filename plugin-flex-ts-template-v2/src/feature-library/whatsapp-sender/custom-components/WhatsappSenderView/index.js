import React, { useEffect, useState } from 'react';
import { Input, Box, Label, Text, useToaster, Combobox, Badge } from '@twilio-paste/core';
import { MediaObject, MediaFigure, MediaBody } from '@twilio-paste/core/media-object';
import { Form, FormControl, FormActions } from '@twilio-paste/core/form';
import { Grid, Column } from '@twilio-paste/core/grid';
import { Heading } from '@twilio-paste/core/heading';
import { Toaster } from '@twilio-paste/core/toast';
import { Button } from '@twilio-paste/core/button';
import { Spinner } from '@twilio-paste/core/spinner';

import { LoadingContainer, Preview } from './styles';
import WhatsappSenderService from '../../utils/WhatsappSenderService';
import HubspotService from '../../utils/HubspotService';

const WhatsappSenderView = ({ manager }) => {
  const toaster = useToaster();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [templates, setTemplates] = useState([]);
  const [templateFiltered, setTemplateFiltered] = useState('');
  const [allTestVars, setAllTestVars] = useState([
    { id: 0, value: '', string: '' },
    { id: 1, value: '', string: '' },
    { id: 2, value: '', string: '' },
    { id: 3, value: '', string: '' },
    { id: 4, value: '', string: '' },
  ]);
  const [replacedTemplate, setReplacedTemplate] = useState([]);

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let phone = urlParams.get('phone');
    if (phone && phone?.endsWith('/')) {
      phone = phone.replace('/', '');
    }

    console.log('received phone from QueryString', phone);
    if (phone) setPhone(phone);

    async function getAllTemplates() {
      try {
        setLoading(true);
        const data = await WhatsappSenderService.getTemplates();
        if (data.success) {
          setTemplates(data.templatesFiltered);
        }
      } catch {
        toaster.push({
          message: 'Não foi possível carregar os templates.',
          variant: 'error',
          dismissAfter: 5000,
        });
      } finally {
        setLoading(false);
      }
    }

    getAllTemplates();
  }, []);

  function handleSelectTemplate(value) {
    setReplacedTemplate([]);
    let replacedModel = '';
    const splittedContent = value.split('{{');

    replacedModel = splittedContent.map((template, index) => {
      const string = template
        .replace('1}}', '')
        .replace('2}}', '')
        .replace('3}}', '')
        .replace('4}}', '')
        .replace('5}}', '');
      return { var: index, string };
    });
    setReplacedTemplate(replacedModel);
  }

  function setTestVars(id, value) {
    const index = allTestVars.findIndex((x) => x.id === id);
    const newArray = allTestVars.map((l) => {
      return { ...l };
    });
    newArray[index].value = value;
    setAllTestVars(newArray);
  }

  const sendMessage = (e) => {
    console.log('Sending Whatsapp message...');
    e.preventDefault();
    setLoading(true);
    const checkTemplateHasVariable = /\{\{/g;
    let templateReplaced = '';

    if (checkTemplateHasVariable.test(templateFiltered)) {
      replacedTemplate.forEach((r) => {
        templateReplaced += r.string;
        templateReplaced += allTestVars[r.var].value;
      });
    } else {
      templateReplaced = templateFiltered;
    }

    WhatsappSenderService.sendMessage({
      clientNumber: phone,
      templateContent: templateReplaced,
    })
      .then((data) => {
        if (data.success) {
          console.log('Whatsapp message sent to', phone);
          toaster.push({
            message: 'Mensagem enviada com sucesso! :D',
            variant: 'success',
            dismissAfter: 5000,
          });
        } else {
          toaster.push({
            message: 'Erro para enviar mensagem, verifique os dados digitados',
            variant: 'error',
            dismissAfter: 5000,
          });
        }
      })
      .catch(() => {
        console.error('Could not send Whatsapp message. Check serverless functions');
        toaster.push({
          message: 'Erro para enviar mensagem, verifique os dados digitados',
          variant: 'error',
          dismissAfter: 5000,
        });
      })
      .finally(() => {
        setLoading(false);
        setPhone('');
        setTemplateFiltered('');
        setAllTestVars([
          { id: 0, value: '', string: '' },
          { id: 1, value: '', string: '' },
          { id: 2, value: '', string: '' },
          { id: 3, value: '', string: '' },
          { id: 4, value: '', string: '' },
        ]);
        setReplacedTemplate([]);
      });

    if (manager && manager.workerClient && manager.workerClient.attributes && manager.workerClient.attributes.email) {
      const date = new Date();
      const dateFormatted = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

      const messageFormatted = `${dateFormatted} - ${templateReplaced}`;

      try {
        console.log('updating Hubspot');
        HubspotService.UpdateInfo({
          newNumber: manager.workerClient.attributes.email,
          messagePropertyValue: true,
          search: phone,
          message: messageFormatted,
        }).then(() => console.log('Hubspot updated'));
      } catch (err) {
        console.error('Could not update Hubspot', err);
      }
    }
  };

  return (
    <Box overflow="auto">
      {loading && (
        <LoadingContainer>
          <Spinner decorative={false} title="Carregando..." />;
        </LoadingContainer>
      )}
      <Form aria-labelledby="wa-form-heading" element="WA_FORM">
        <Heading as="h1" variant="heading10" id="wa-form-heading" marginBottom="space0">
          Disparador de Mensagem Whatsapp
        </Heading>
        <Grid gutter="space30">
          <Column>
            <FormControl element="WA_FORM_CONTROL">
              <Label htmlFor="phone-number" required>
                Número de Telefone:
              </Label>
              <Input
                id="phone-number"
                name="phone-number"
                type="tel"
                placeholder="+55 ## #####-#####"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </FormControl>
            <FormControl element="WA_FORM_CONTROL">
              <Label htmlFor="wa-template">Template:</Label>
              <Combobox
                items={templates}
                labelText="Selecione um template"
                initialSelectedItem={templateFiltered}
                optionTemplate={(item) => (
                  <MediaObject verticalAlign="center">
                    <MediaBody>
                      <Text as="span">{item.name}</Text>
                    </MediaBody>
                    {item.language && (
                      <>
                        <Text as="span">&nbsp;</Text>
                        <MediaFigure spacing="space30">
                          <Badge as="span" variant="decorative10">
                            {item.language.replace('_', '-').toUpperCase()}
                          </Badge>
                        </MediaFigure>
                      </>
                    )}
                  </MediaObject>
                )}
                required
                onSelectedItemChange={(e) => {
                  handleSelectTemplate(e.selectedItem.content);
                  setTemplateFiltered(e.selectedItem.content);
                }}
                itemToString={(item) => (item ? String(item.name) : null)}
              />
            </FormControl>
            {replacedTemplate &&
              replacedTemplate.map((temp, index) => (
                <FormControl element="WA_FORM_CONTROL" key={`wa-template-formcontrol-var${index}`}>
                  {index + 1 !== replacedTemplate.length && (
                    <Input
                      key={`wa-template-input-var${index}`}
                      id={`wa-template-var${index}`}
                      onChange={({ target }) => {
                        setTestVars(temp.var, target.value);
                      }}
                      type="text"
                      required
                      placeholder={`Variável ${index + 1}`}
                      value={allTestVars[index].value}
                    />
                  )}
                </FormControl>
              ))}
          </Column>
          <Column>
            <Preview>
              <img src="https://drab-newt-3733.twil.io/assets/preview.png" alt="whatsapp-preview" height="400" />
              <p>{templateFiltered || 'Selecione um template para ver o preview'}</p>
            </Preview>
          </Column>
          <Column></Column>
        </Grid>
        <FormActions>
          <Button variant="primary" disabled={!phone || !templateFiltered} onClick={sendMessage}>
            Enviar mensagem
          </Button>
        </FormActions>
        <div>&nbsp;</div>
      </Form>
      <Toaster left={['space50', 'unset', 'unset']} {...toaster} />
    </Box>
  );
};

export default WhatsappSenderView;
