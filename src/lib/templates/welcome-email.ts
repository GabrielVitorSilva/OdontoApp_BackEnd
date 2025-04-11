interface WelcomeEmailProps {
  name: string
  role: string
}

export function generateWelcomeEmail({ name, role }: WelcomeEmailProps) {
  const roleTranslation = {
    ADMIN: 'Administrador',
    PROFESSIONAL: 'Profissional',
    CLIENT: 'Cliente',
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Bem-vindo ao OdontoApp</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c3e50;">Bem-vindo ao OdontoApp!</h1>
          
          <p>Olá, ${name}!</p>
          
          <p>É um prazer tê-lo(a) conosco no OdontoApp. Sua conta foi criada com sucesso como ${roleTranslation[role as keyof typeof roleTranslation]}.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p>Com sua conta, você terá acesso a:</p>
            <ul>
              <li>Agendamento de consultas</li>
              <li>Acompanhamento de tratamentos</li>
              <li>Histórico de atendimentos</li>
              <li>E muito mais!</li>
            </ul>
          </div>
          
          <p>Se precisar de ajuda ou tiver alguma dúvida, não hesite em entrar em contato conosco.</p>
          
          <p>Atenciosamente,<br>Equipe OdontoApp</p>
        </div>
      </body>
    </html>
  `
} 