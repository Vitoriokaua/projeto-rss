<div align="center">
  <a name="readme-top"></a>
  
  <h1> Projeto 2 – Leitor de Notícias RSS (Sprint 2 e 3)</h1>

  <p>
    Avaliação da segunda e terceira sprint do <strong>Scholarship Compass UOL</strong> para formação em Inteligência Artificial para AWS, desenvolvido pelo <strong>Squad 1</strong>.
  </p>

  <p>
    <img src="https://img.shields.io/badge/STATUS-CONCLUIDO-greem" alt="Status do Projeto" />
  </p>
</div>

<br>



---

## 🔍 Visão Geral

API em JavaScript/NodeJs, implementada em Docker na AWS, para extrair informações relevantes de um site no formato RSS.

---

## 🌍 Site Escolhido

| Fonte RSS | URL do RSS |
| :--- | :--- |
| **Metrópoles** | `https://www.metropoles.com/feed` |

---

## 💼 Tecnologias Utilizadas

-   **Node.js**
-   **Express**
-   **cors**
-   **Docker**
-   **AWS S3**
-   **HTML**
-   **RSS Parser** (npm)
-   **AWS SDK** (npm)
-   **Git**

---

## 📂 Estrutura de Pastas



```text
/
|-- public/              # Contém os arquivos estáticos do frontend.
|   |-- index.html       
|   |-- index.js         
|   `-- style.css        
|
|-- src/                 # Código-fonte do backend (servidor).
|   |-- controllers/     # Camada que processa as requisições, chama os serviços e envia as respostas.
|   |   `-- news.controller.js 
|   |
|   |-- routes/          # rotas
|   |   `-- news.route.js    
|   |
|   `-- services/        # Contém a lógica de negócio principal e a comunicação com serviços externos.
|       |-- rss.service.js   
|       `-- s3.service.js    
|
|-- .dockerignore          # Lista arquivos e pastas a serem ignorados pelo Docker na criação da imagem.
|-- app.js                 # Configura a aplicação Express (middlewares, rotas, etc.).
|-- Dockerfile             # Receita para construir a imagem Docker da aplicação.
|-- index.js               # Ponto de entrada que efetivamente inicia o servidor (app.listen).
|-- package.json           # Define o projeto, seus scripts (como `npm start`) e suas dependências.
|-- package-lock.json      # Garante que as mesmas versões de dependências sejam instaladas sempre.
`-- README.md              # Esta documentação.
```
---
## ✨ Funcionalidades

-  **Extração de Notícias:** Leitura de múltiplos feeds RSS categorizados do portal Metrópoles.
-   **Armazenamento em Nuvem:** Persistência dos dados extraídos em arquivos `.json` individuais por categoria em um bucket na AWS S3.
-   **API Robusta:** Exposição de endpoints para buscar/salvar, carregar e listar as categorias de notícias.
-   **Interface Dinâmica:** Frontend que consome a API para popular um menu de filtros e exibir as notícias de forma organizada.
-   **Containerização:** Aplicação totalmente empacotada com Docker, pronta para o deploy em qualquer ambiente.
---

## 🚀 Desenvolvimento do Projeto

O desenvolvimento do projeto foi dividido em etapas claras, começando com a criação da API base e evoluindo para uma aplicação full-stack com uma arquitetura mais robusta e deploy na nuvem.

Inicialmente, o foco foi construir o núcleo da aplicação: uma API em Node.js com Express capaz de consumir um feed RSS, processar os dados e salvá-los em um bucket S3. Após a validação da prova de conceito, o projeto passou por um processo de **refatoração** para melhorar a qualidade e a organização do código. A estrutura foi reorganizada para um padrão com camadas de `routes`, `services` e `controllers`, separando melhor as responsabilidades de cada parte do sistema.

O frontend, que começou como uma página simples, foi aprimorado para se tornar uma interface mais rica, com um painel de filtros que é populado dinamicamente através de um novo endpoint na API. Finalmente, a aplicação foi totalmente containerizada com o **Docker**, e o processo de **deploy** foi realizado no **AWS Elastic Beanstalk**, o que exigiu uma configuração detalhada da infraestrutura de rede (VPC, Sub-redes, Internet Gateway) e de permissões (IAM Roles) para garantir o funcionamento em um ambiente de nuvem seguro e eficiente.

---

## ⚙️ Como Utilizar o Sistema

Para acessar e interagir com a aplicação, utilize o link principal abaixo.

-   **Link da Aplicação:** [Projeto-2-env.eba-2npmqqse.us-east-1.elasticbeanstalk.com](http://Projeto-2-env.eba-2npmqqse.us-east-1.elasticbeanstalk.com)

### **Como funciona:**

1.  **Visualizando e Filtrando as Notícias:**
    Ao acessar o link principal, você verá a interface do sistema. As notícias que aparecem e que você pode filtrar são aquelas que já estão salvas na nossa base de dados na nuvem (AWS).

2.  **Atualizar com Novas Notícias:**
    Para buscar as notícias mais recentes do portal e atualizar a base de dados, **clique no botão "Buscar e Salvar Todas"** na interface.

    Ao fazer isso, o sistema irá automaticamente buscar as novas notícias, atualizar o bucket no S3 e os dados no Elasticsearch. Após o processo terminar, basta filtrar novamente na tela e as notícias mais novas já estarão disponíveis.

---



## 🧗 Dificuldades Encontradas


1.  **Acesso Inicial ao Ambiente:** Houve um atraso na obtenção e liberação das credenciais de acesso ao ambiente AWS, o que impactou o início dos trabalhos de configuração da infraestrutura e deploy.

2.  **Configuração de Permissões (IAM):** Ao tentar criar o ambiente no Elastic Beanstalk, a operação falhava por falta dos perfis de serviço (`service-role`) e de instância (`ec2-role`) na conta. A solução foi criar manualmente esses dois perfis no console do IAM, anexando as políticas de permissão necessárias para que o Elastic Beanstalk pudesse gerenciar os recursos e para que a nossa aplicação pudesse acessar o S3.

3.  **Infraestrutura de Rede (VPC):** tivemos que corrigir a rede virtual (VPC), que não estava configurada para tráfego público. A investigação revelou uma cadeia de problemas que foram solucionados passo a passo:
    * **Falta de Conexão com a Internet:** A VPC não possuía um **Internet Gateway** para se comunicar com a internet, o que foi criado e anexado.
    * **Rotas Incorretas:** A **Tabela de Rotas** principal não tinha uma rota padrão (`0.0.0.0/0`) que direcionasse o tráfego para o Internet Gateway.
    * **Sub-redes Privadas:** Descobrimos que todas as **sub-redes** padrão eram privadas e não atribuíam IP público automaticamente. A solução foi criar uma nova **sub-rede pública** do zero e configurá-la para atribuir IPs públicos e associá-la à tabela de rotas correta.

4.  **Instabilidade do Feed RSS Externo:** A aplicação apresentava erros intermitentes de `parsing` (como `Non-whitespace before first tag`). Após uma análise dos logs, concluímos que o problema não era no nosso código, mas sim na instabilidade do feed RSS do portal de notícias escolhido.

---

## 🧑‍💻 Integrantes do Squad 1

-   [Ana Beatriz Viana](https://github.com/naatrz)
-   [Clara Lima](https://github.com/clauriss)
-   [Cleberson França](https://github.com/Clebers0n)
-   [Lucas Oliveira](https://github.com/Lukasdevoli)
-   [Vitório Rufino](https://github.com/Vitoriokaua)

<p align="right">(<a href="#readme-top">voltar ao topo</a>)</p>
