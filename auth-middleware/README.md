# Auth Hardening Middleware

Middleware Node/Express para verificação de senha (força + HIBP k-Anonymity) e verificação opcional de CAPTCHA (Cloudflare Turnstile).

Requisitos:
- Node 18+
- npm

Instalação:
1. npm install
2. Crie um `.env` baseado em `.env.example`
3. npm start

Endpoints:
- POST /check-password
  - Body: { "password": "..." }
  - Retorno: { ok, compromised, pwnedCount, strengthScore, reason? }

- POST /verify-captcha
  - Body: { "token": "..." }
  - Requer TURNSTILE_SECRET no env

Segurança:
- Não logar senhas.
- Usar TLS em produção.
- Ajustar rate limiting conforme uso.

Deploy:
- Vercel, Heroku, DigitalOcean App Platform — configure variáveis de ambiente no painel.
