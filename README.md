# NovaDrive LD - Sistema de Gestion de Alquiler de Vehiculos de Lujo

Sistema web dinamico para la gestion de alquiler de vehiculos de lujo, desarrollado con Express.js, Handlebars y MySQL como stack tecnologico principal.

## Descripcion del Proyecto

NovaDrive LD es una plataforma web que permite a clientes explorar un catalogo de vehiculos de lujo, iniciar contratos de alquiler y realizar pagos. El sistema gestiona automaticamente la disponibilidad de vehiculos en tiempo real, genera facturas, registra pagos y produce reportes PDF al confirmar cada contrato.

## Tecnologias

- Node.js v24.13.1
- Express.js v5.1.0
- Express-Handlebars v8.0.1
- MySQL2 v3.14.0
- PDFKit v0.15.2
- Express-Session v1.18.1
- Dotenv v16.5.0

## Instalacion

Clonar el repositorio:

    git clone https://github.com/tu-usuario/CatalogoNOVADRIVE.git
    cd CatalogoNOVADRIVE

Instalar dependencias:

    npm install express express-handlebars mysql2 dotenv body-parser pdfkit express-session
    npm install --save-dev nodemon

Configurar variables de entorno (ver seccion Variables de Entorno).

Ejecutar en desarrollo:

    npm run dev

Ejecutar en produccion:

    npm start

## Variables de Entorno

Crear un archivo .env en la raiz del proyecto con la siguiente estructura:

    DB_HOST=your_host
    DB_USER=your_user
    DB_PASS=your_password
    DB_NAME=novadrive
    PORT=3000

## Arquitectura del Proyecto

    CatalogoNOVADRIVE/
    ├── app.js
    ├── .env
    ├── .gitignore
    ├── package.json
    ├── db/
    │   └── connection.js
    ├── routes/
    │   ├── vehiculos.js
    │   └── auth.js
    ├── views/
    │   ├── layouts/
    │   │   ├── main.hbs
    │   │   └── empty.hbs
    │   ├── Catalogo.hbs
    │   ├── contrato.hbs
    │   ├── login.hbs
    │   └── registro.hbs
    └── public/
        ├── css/
        │   └── catalogo.css
        └── img/

## Justificacion del Stack

Express.js fue seleccionado por su simplicidad para construir servidores HTTP en Node.js, su sistema de middlewares y su compatibilidad con multiples motores de plantillas.

Handlebars fue seleccionado como motor de plantillas por su sintaxis clara, su sistema de layouts que evita repeticion de codigo HTML, y su capacidad de renderizar datos dinamicos desde el servidor directamente en la vista.

MySQL fue seleccionado como sistema gestor de base de datos por su robustez, soporte de transacciones, triggers y procedimientos almacenados, necesarios para la logica de negocio del sistema.

## Funcionalidades Principales

- Autenticacion de usuarios con express-session
- Catalogo de vehiculos con disponibilidad en tiempo real
- Proceso de contrato con insercion en cadena: cliente, contrato, factura y pago
- Transacciones con BEGIN, COMMIT y ROLLBACK
- Generacion automatica de PDF al confirmar contrato
- Middleware de proteccion de rutas por sesion
- Manejo de errores en todas las rutas

## Capturas de Pantalla

Incluir capturas de:
- Pantalla de login
- Catalogo de vehiculos
- Formulario de contrato
- PDF generado
- Base de datos MySQL con registros

## Autor

Juan#21 y Liliana#32- 4to INFO
Instituto Politecnico Industrial de Santiago, IPISA