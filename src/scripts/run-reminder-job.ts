import { ConsultationReminderJob } from '../lib/consultation-reminder-job'

async function main() {
  const job = new ConsultationReminderJob()
  await job.execute()
}

main()
  .then(() => {
    console.log('Job de lembretes executado com sucesso')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Erro ao executar job de lembretes:', error)
    process.exit(1)
  })
