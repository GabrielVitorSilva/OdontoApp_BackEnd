interface ConsultationUpdateEmailProps {
  clientName: string
  professionalName: string
  treatmentName: string
  dateTime: Date
  status: 'SCHEDULED' | 'CANCELED' | 'COMPLETED'
}

export function generateConsultationUpdateEmail({
  clientName,
  professionalName,
  treatmentName,
  dateTime,
  status,
}: ConsultationUpdateEmailProps) {
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateTime)

  const statusTranslation = {
    SCHEDULED: 'remarcada',
    CANCELED: 'cancelada',
    COMPLETED: 'concluída',
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Atualização de Consulta - OdontoApp</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c3e50;">Atualização de Consulta</h1>
          
          <p>Olá, ${clientName}!</p>
          
          <p>Sua consulta foi ${statusTranslation[status]}. Abaixo estão os detalhes atualizados:</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Profissional:</strong> ${professionalName}</p>
            <p><strong>Tratamento:</strong> ${treatmentName}</p>
            <p><strong>Data e Hora:</strong> ${formattedDate}</p>
            <p><strong>Status:</strong> ${statusTranslation[status]}</p>
          </div>
          
          ${status === 'SCHEDULED' ? '<p>Por favor, chegue com 15 minutos de antecedência.</p>' : ''}
          
          <p>Se precisar de mais informações ou tiver alguma dúvida, entre em contato conosco.</p>
          
          <p>Atenciosamente,<br>Equipe OdontoApp</p>
        </div>
      </body>
    </html>
  `
}
