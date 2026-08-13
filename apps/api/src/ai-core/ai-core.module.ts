import { Module } from '@nestjs/common';
import { AiCoreService } from './ai-core.service';

@Module({
  providers: [AiCoreService],
  exports: [AiCoreService],
})
// JEMIMA AI CORE — module isolé, seul autorisé à appeler Gemini.
// Aucun autre module ne doit importer @google/generative-ai directement.
// L'implémentation complète (outils contrôlés, mémoire par entreprise,
// niveaux d'action 1/2/3) arrive en Phase 9.
export class AiCoreModule {}
