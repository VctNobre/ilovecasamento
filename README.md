Ilovecasamento 🤍

📖 Sobre o Projeto
Ilovecasamento é uma plataforma web completa que permite a casais criarem os seus próprios sites de casamento personalizados. A aplicação foi desenhada para ser intuitiva, permitindo que os utilizadores, mesmo sem conhecimentos técnicos, possam criar uma página elegante para partilhar com os seus convidados.

O projeto foi construído como uma aplicação de página única (SPA) com um backend Node.js, utilizando o Supabase para a gestão de utilizadores, base de dados e armazenamento de ficheiros, e o Mercado Pago para a futura implementação de um sistema de pagamentos com split.

✨ Funcionalidades Principais
Página de Apresentação (Landing Page): Uma página inicial moderna para apresentar o serviço a novos utilizadores.

Sistema de Autenticação Completo:

Registo de conta com validação de dados (idade, força da senha).

Login com email/senha e com o Google (OAuth).

Funcionalidade segura de "Esqueceu a senha?".

Painel de Controlo do Casal (Dashboard):

Interface organizada com um menu lateral retrátil e navegação por abas.

Edição do Site: Personalização completa da página pública, incluindo nomes, datas, textos, imagens de capa, e paleta de cores.

Gestão de Presentes: Adicionar, editar e remover itens da lista de presentes, com upload de imagens para cada um.

Minha Carteira: Secção preparada para a integração com o Mercado Pago, permitindo ao casal conectar a sua conta para receber os valores.

Gestão de Conta: Alteração de e-mail e senha de forma segura.

Página Pública do Casamento:

Design elegante e totalmente responsivo, adaptando-se a telemóveis, tablets e computadores.

Secção de capa (Hero) com monograma personalizado.

Apresentação da história do casal com formatação de parágrafos e assinatura.

Lista de presentes interativa com opção de ordenação (por preço e nome).

Sistema de carrinho de compras para que os convidados possam selecionar múltiplos presentes.

🛠️ Tecnologias Utilizadas
Frontend:

HTML5

CSS3 com Tailwind CSS para um design responsivo e moderno.

JavaScript (ES6 Modules) para toda a interatividade.

Backend:

Node.js com Express.js para a criação do servidor e da API.

Base de Dados e Backend-as-a-Service (BaaS):

Supabase para:

Autenticação de utilizadores.

Base de dados PostgreSQL.

Armazenamento de ficheiros (Storage).

Segurança com Row Level Security (RLS).

Pagamentos (Marketplace):

Mercado Pago (configurado para Split de Pagamentos).

Hospedagem:

O projeto está pronto para ser hospedado em plataformas como o Render.