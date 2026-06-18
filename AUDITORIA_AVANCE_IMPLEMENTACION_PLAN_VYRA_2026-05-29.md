
## 41. Invitaciones y suplementos dejaron de sonar a texto viejo de producto

Cambios aplicados:

- vyra-fitness/app/profile/referral.tsx
- vyra-fitness/app/modules/supplements/settings.tsx

Que se corrigio:

- Se removio la frase "primer uso" del flujo de invitaciones.
- El copy de referral ahora habla de compartir solo cuando aporte valor, sin sonar a feature inflada.
- El boton de suplementos ya no dice "Volver a mostrar en primer uso"; ahora usa un texto directo para volver a mostrar el aviso.

Valor real:

- Menos lenguaje improvisado y menos sensacion de producto a medio pulir.
- El usuario ve acciones claras, no metadatos de implementacion.

Validacion tecnica:

- npm -C vyra-fitness run typecheck
- Release reinstalado en emulator-5554

Juicio:

- Bien. Son detalles pequenos, pero juntos levantan mucho la sensacion de producto serio.
