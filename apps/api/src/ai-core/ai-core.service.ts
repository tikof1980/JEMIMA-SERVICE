import { Injectable } from '@nestjs/common';

@Injectable()
export class AiCoreService {
  // La clé Gemini est lue exclusivement côté serveur (process.env.GEMINI_API_KEY)
  // et n'est jamais transmise au frontend. Chaque appel doit imposer un
  // company_id issu du contexte d'authentification, jamais du prompt.
  //
  // À implémenter en Phase 9 :
  // - get_company_data(), get_sales(), get_stock(), get_customers()
  // - get_appointments(), get_reservations(), get_payments()
  // - create_task(), create_appointment(), send_notification()
  // - prepare_message(), generate_report()
  // - gestion des 3 niveaux d'action (info / auto-autorisé / validation requise)
}
