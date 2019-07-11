<h1 align="center">
  NestJS-Redoc
  <h4 align="center">ReDoc powered frontend for your NestJS API spec</h4>
</h1>
<br />

<div align="center">
  <a href="http://makeapullrequest.com">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs welcome" />
  </a>
  <a href="https://github.com/nestjs/nest">
    <img src="https://raw.githubusercontent.com/nestjsx/crud/master/img/nest-powered.svg?sanitize=true" alt="Nest Powered" />
  </a>
   <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
</div>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-how-to-use">How to use</a> •
  <a href="#-changelog">Changelog</a> •
</p>

<p align="center">
⚡ This is a ReDoc powered frontend for your NestJS API spec. By using ReDoc you improve your documentation presentation using a better UI/UX design
</p>

## ⚡ Features

TBD

## Installation

Using npm: ```npm i nestjs-redoc```

Using yarn: ```yarn add nestjs-redoc```

## ❓ How to use

You need to install the Swagger module first if you want to get definitions, otherwise you may use a URL parameter for an OpenAPI definition instead of document object.

```typescript
const options = new DocumentBuilder()
  .setTitle('Look, i have a title')
  .setDescription('A very nice description')
  .setBasePath('/api/v1')
  .build();
const document = SwaggerModule.createDocument(app, options);
```

Then add the followring example code.

**Note**: All properties are optional, if you don't specify a title we will fallback to the one you used above.

```typescript
const redocOptions: RedocOptions = {
  title: 'Hello Nest',
  logo: {
    url: 'https://redocly.github.io/redoc/petstore-logo.png',
    backgroundColor: '#F0F0F0',
    altText: 'PetStore logo'
  },
  sortPropsAlphabetically: true,
  hideDownloadButton: false,
  hideHostname: false
};
// Instead of using SwaggerModule.setup() you call this module
RedocModule.setup('/docs', app, document, redocOptions);
```


## 📋 ToDo
bla bla
