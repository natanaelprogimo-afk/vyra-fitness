import type { Exercise, Routine, WorkoutProgram } from '@/lib/workout-types';

// Archivo generado por scripts/generate_workout_catalog_seed.py

export const WORKOUT_CATALOG_VERSION = 4;

export const GENERATED_WORKOUT_EXERCISES: Exercise[] = [
  {
    "id": "4dbd0202-6649-54a3-95ca-d437d3b3c56a",
    "slug": "press_de_banca_con_barra",
    "name": "Press de banca con barra",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press de banca barra",
      "Press de banca"
    ],
    "variations": [
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower",
      "Press de banca con pausa"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "a5b143e0-1f5e-5415-8a7c-e4821c37da92",
    "slug": "press_de_banca_con_mancuernas",
    "name": "Press de banca con mancuernas",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Mancuernas",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press de banca mancuernas",
      "Press de banca"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca en máquina",
      "Press de banca en multipower",
      "Press de banca con pausa"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "734b3afe-bd7e-54c3-9b1f-5c5015ef64cf",
    "slug": "press_de_banca_en_maquina",
    "name": "Press de banca en máquina",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Máquina",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press de banca en máquina"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en multipower",
      "Press de banca con pausa"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "eec30785-be70-5442-aa74-7576754f4dcc",
    "slug": "press_de_banca_en_multipower",
    "name": "Press de banca en multipower",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Multipower",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press de banca en multipower"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca con pausa"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "df18c0c4-6cea-5f8c-88ac-04b09d9d818d",
    "slug": "press_de_banca_con_pausa",
    "name": "Press de banca con pausa",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press de banca pausa",
      "Press de banca"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "6dae0bfe-4118-5453-b0cf-ec9c2b8c7f85",
    "slug": "press_de_banca_tempo",
    "name": "Press de banca tempo",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press de banca tempo"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "910d5085-ed82-5e15-83f4-3b82bddd10e7",
    "slug": "press_de_banca_agarre_cerrado",
    "name": "Press de banca agarre cerrado",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press de banca agarre cerrado"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "572737a7-b2b0-5584-ba17-f62c79889931",
    "slug": "press_inclinado_con_barra",
    "name": "Press inclinado con barra",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press inclinado barra",
      "Press inclinado"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "41f00082-74b2-5b36-9533-db311c9bbf7a",
    "slug": "press_inclinado_con_mancuernas",
    "name": "Press inclinado con mancuernas",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Mancuernas",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press inclinado mancuernas",
      "Press inclinado"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "2a237cac-2d8f-581e-9e04-9d0438361372",
    "slug": "press_inclinado_en_maquina",
    "name": "Press inclinado en máquina",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Máquina",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press inclinado en máquina"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "0757f9a5-c22c-5541-9204-6866c3028ca0",
    "slug": "press_inclinado_en_multipower",
    "name": "Press inclinado en multipower",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Multipower",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press inclinado en multipower"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "13073d3e-0b76-5613-bf4d-0165ab1a8011",
    "slug": "press_inclinado_con_pausa",
    "name": "Press inclinado con pausa",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press inclinado pausa",
      "Press inclinado"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "9718e5e6-ffe6-50ad-8780-2ce7a2139671",
    "slug": "press_inclinado_tempo",
    "name": "Press inclinado tempo",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press inclinado tempo"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "9d3ac987-582a-560d-bfae-887e57c6e886",
    "slug": "press_inclinado_agarre_cerrado",
    "name": "Press inclinado agarre cerrado",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press inclinado agarre cerrado"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "1852ca85-601a-5c34-993d-dfbf495de30e",
    "slug": "press_declinado_con_barra",
    "name": "Press declinado con barra",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press declinado barra",
      "Press declinado"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "f6509561-25aa-5855-bbd5-f9484acfd28c",
    "slug": "press_declinado_con_mancuernas",
    "name": "Press declinado con mancuernas",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Mancuernas",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press declinado mancuernas",
      "Press declinado"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "8576c3a2-9b43-5f34-9890-0af94c76580d",
    "slug": "press_declinado_en_maquina",
    "name": "Press declinado en máquina",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Máquina",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press declinado en máquina"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "fda91cc6-0c58-56a5-b653-0c584686cf83",
    "slug": "press_declinado_en_multipower",
    "name": "Press declinado en multipower",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Multipower",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press declinado en multipower"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "cd53321a-44c3-58dd-8fb9-0a5a9fb59fce",
    "slug": "press_declinado_con_pausa",
    "name": "Press declinado con pausa",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press declinado pausa",
      "Press declinado"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "2a56f6d4-bfdd-57e5-b62d-cde91000f656",
    "slug": "press_declinado_tempo",
    "name": "Press declinado tempo",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press declinado tempo"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "ebd1c8ee-cebc-5c5e-995a-ce11ddac0a61",
    "slug": "press_declinado_agarre_cerrado",
    "name": "Press declinado agarre cerrado",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press declinado agarre cerrado"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "00bb2a88-24a9-53f7-b958-ad88ed84ee7f",
    "slug": "floor_press_con_barra",
    "name": "Floor press con barra",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Floor press barra",
      "Floor press"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "49e58403-6c3e-5a75-a672-ca8d49403a60",
    "slug": "floor_press_con_mancuernas",
    "name": "Floor press con mancuernas",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Mancuernas",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Floor press mancuernas",
      "Floor press"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "28cd0339-3576-52a5-9527-6be594f30897",
    "slug": "press_convergente_en_maquina",
    "name": "Press convergente en máquina",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Máquina",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press convergente en máquina"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "e0159a9c-9bb5-593e-8d7a-2ab1418df3e8",
    "slug": "press_con_landmine_a_una_mano",
    "name": "Press con landmine a una mano",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Landmine",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press landmine a una mano",
      "Press"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "eb6ca55a-e9c9-521e-a7ae-ea017d18b19f",
    "slug": "press_con_landmine_a_dos_manos",
    "name": "Press con landmine a dos manos",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Hombros"
    ],
    "equipment": "Landmine",
    "instructions": "Prepará la base, mantené escápulas activas y empujá con recorrido estable.",
    "movement_pattern": "Empuje horizontal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje horizontal para pecho y tríceps.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press landmine a dos manos",
      "Press"
    ],
    "variations": [
      "Press de banca con barra",
      "Press de banca con mancuernas",
      "Press de banca en máquina",
      "Press de banca en multipower"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "31f91a77-ee6b-514e-82e1-5a7fcb83bba0",
    "slug": "apertura_de_pecho_con_mancuernas",
    "name": "Apertura de pecho con mancuernas",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Mancuernas",
    "instructions": "Abrí hasta un rango cómodo y cerrá sin perder control.",
    "movement_pattern": "Aducción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento de pecho con menos carga sistémica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Apertura de pecho mancuernas",
      "Apertura de pecho"
    ],
    "variations": [
      "Apertura de pecho en polea baja",
      "Apertura de pecho en polea media",
      "Apertura de pecho en polea alta",
      "Apertura de pecho en máquina"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "b1105ac3-8c61-5b20-9709-d6fd253db817",
    "slug": "apertura_de_pecho_en_polea_baja",
    "name": "Apertura de pecho en polea baja",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Abrí hasta un rango cómodo y cerrá sin perder control.",
    "movement_pattern": "Aducción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento de pecho con menos carga sistémica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Apertura de pecho en polea baja"
    ],
    "variations": [
      "Apertura de pecho con mancuernas",
      "Apertura de pecho en polea media",
      "Apertura de pecho en polea alta",
      "Apertura de pecho en máquina"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "756ff492-b627-54f7-a926-0c7c4f85faad",
    "slug": "apertura_de_pecho_en_polea_media",
    "name": "Apertura de pecho en polea media",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Abrí hasta un rango cómodo y cerrá sin perder control.",
    "movement_pattern": "Aducción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento de pecho con menos carga sistémica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Apertura de pecho en polea media"
    ],
    "variations": [
      "Apertura de pecho con mancuernas",
      "Apertura de pecho en polea baja",
      "Apertura de pecho en polea alta",
      "Apertura de pecho en máquina"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "8ef17bdd-a4f5-59d2-be99-0c6806c1947d",
    "slug": "apertura_de_pecho_en_polea_alta",
    "name": "Apertura de pecho en polea alta",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Abrí hasta un rango cómodo y cerrá sin perder control.",
    "movement_pattern": "Aducción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento de pecho con menos carga sistémica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Apertura de pecho en polea alta"
    ],
    "variations": [
      "Apertura de pecho con mancuernas",
      "Apertura de pecho en polea baja",
      "Apertura de pecho en polea media",
      "Apertura de pecho en máquina"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "8f544786-813c-51c3-9059-f94ada36cc3c",
    "slug": "apertura_de_pecho_en_maquina",
    "name": "Apertura de pecho en máquina",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Máquina",
    "instructions": "Abrí hasta un rango cómodo y cerrá sin perder control.",
    "movement_pattern": "Aducción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento de pecho con menos carga sistémica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Apertura de pecho en máquina"
    ],
    "variations": [
      "Apertura de pecho con mancuernas",
      "Apertura de pecho en polea baja",
      "Apertura de pecho en polea media",
      "Apertura de pecho en polea alta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "b000a897-9d78-572c-8983-383a45351f58",
    "slug": "apertura_de_pecho_con_banda",
    "name": "Apertura de pecho con banda",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Banda",
    "instructions": "Abrí hasta un rango cómodo y cerrá sin perder control.",
    "movement_pattern": "Aducción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento de pecho con menos carga sistémica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Apertura de pecho banda",
      "Apertura de pecho"
    ],
    "variations": [
      "Apertura de pecho con mancuernas",
      "Apertura de pecho en polea baja",
      "Apertura de pecho en polea media",
      "Apertura de pecho en polea alta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "67bdcbf5-9688-53ae-b010-04599fc5b1c8",
    "slug": "cruce_de_pecho_con_mancuernas",
    "name": "Cruce de pecho con mancuernas",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Mancuernas",
    "instructions": "Abrí hasta un rango cómodo y cerrá sin perder control.",
    "movement_pattern": "Aducción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento de pecho con menos carga sistémica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Cruce de pecho mancuernas",
      "Cruce de pecho"
    ],
    "variations": [
      "Apertura de pecho con mancuernas",
      "Apertura de pecho en polea baja",
      "Apertura de pecho en polea media",
      "Apertura de pecho en polea alta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "33404c3d-b6d9-58ef-ad20-4ac809588473",
    "slug": "cruce_de_pecho_en_polea_baja",
    "name": "Cruce de pecho en polea baja",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Abrí hasta un rango cómodo y cerrá sin perder control.",
    "movement_pattern": "Aducción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento de pecho con menos carga sistémica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Cruce de pecho en polea baja"
    ],
    "variations": [
      "Apertura de pecho con mancuernas",
      "Apertura de pecho en polea baja",
      "Apertura de pecho en polea media",
      "Apertura de pecho en polea alta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "c476c2df-bc1b-5d1c-800d-f7876d9122a0",
    "slug": "cruce_de_pecho_en_polea_media",
    "name": "Cruce de pecho en polea media",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Abrí hasta un rango cómodo y cerrá sin perder control.",
    "movement_pattern": "Aducción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento de pecho con menos carga sistémica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Cruce de pecho en polea media"
    ],
    "variations": [
      "Apertura de pecho con mancuernas",
      "Apertura de pecho en polea baja",
      "Apertura de pecho en polea media",
      "Apertura de pecho en polea alta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "ced49616-e09b-5d61-8d1b-7c820e40f721",
    "slug": "cruce_de_pecho_en_polea_alta",
    "name": "Cruce de pecho en polea alta",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Abrí hasta un rango cómodo y cerrá sin perder control.",
    "movement_pattern": "Aducción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento de pecho con menos carga sistémica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Cruce de pecho en polea alta"
    ],
    "variations": [
      "Apertura de pecho con mancuernas",
      "Apertura de pecho en polea baja",
      "Apertura de pecho en polea media",
      "Apertura de pecho en polea alta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "85d7ea9e-60cf-5738-8d20-ff2ea575d8ea",
    "slug": "cruce_de_pecho_en_maquina",
    "name": "Cruce de pecho en máquina",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Máquina",
    "instructions": "Abrí hasta un rango cómodo y cerrá sin perder control.",
    "movement_pattern": "Aducción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento de pecho con menos carga sistémica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Cruce de pecho en máquina"
    ],
    "variations": [
      "Apertura de pecho con mancuernas",
      "Apertura de pecho en polea baja",
      "Apertura de pecho en polea media",
      "Apertura de pecho en polea alta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "2f93dd5d-7d22-5240-af02-6bbfe046c2ca",
    "slug": "cruce_de_pecho_con_banda",
    "name": "Cruce de pecho con banda",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Banda",
    "instructions": "Abrí hasta un rango cómodo y cerrá sin perder control.",
    "movement_pattern": "Aducción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento de pecho con menos carga sistémica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Cruce de pecho banda",
      "Cruce de pecho"
    ],
    "variations": [
      "Apertura de pecho con mancuernas",
      "Apertura de pecho en polea baja",
      "Apertura de pecho en polea media",
      "Apertura de pecho en polea alta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "41254be1-dfb4-5120-b912-df492f88a551",
    "slug": "pec_deck_tradicional",
    "name": "Pec deck tradicional",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Mancuernas",
    "instructions": "Abrí hasta un rango cómodo y cerrá sin perder control.",
    "movement_pattern": "Aducción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento de pecho con menos carga sistémica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pec deck tradicional"
    ],
    "variations": [
      "Apertura de pecho con mancuernas",
      "Apertura de pecho en polea baja",
      "Apertura de pecho en polea media",
      "Apertura de pecho en polea alta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "0d1d2d2b-b741-5dc7-a9e9-f68d488e76a6",
    "slug": "pec_deck_unilateral",
    "name": "Pec deck unilateral",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Mancuernas",
    "instructions": "Abrí hasta un rango cómodo y cerrá sin perder control.",
    "movement_pattern": "Aducción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento de pecho con menos carga sistémica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pec deck unilateral"
    ],
    "variations": [
      "Apertura de pecho con mancuernas",
      "Apertura de pecho en polea baja",
      "Apertura de pecho en polea media",
      "Apertura de pecho en polea alta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "667af713-023b-5429-8ae3-f75f89b32b7a",
    "slug": "press_squeeze_con_mancuernas",
    "name": "Press squeeze con mancuernas",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Mancuernas",
    "instructions": "Abrí hasta un rango cómodo y cerrá sin perder control.",
    "movement_pattern": "Aducción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento de pecho con menos carga sistémica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press squeeze mancuernas",
      "Press squeeze"
    ],
    "variations": [
      "Apertura de pecho con mancuernas",
      "Apertura de pecho en polea baja",
      "Apertura de pecho en polea media",
      "Apertura de pecho en polea alta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "d0130c2e-a066-52d1-977c-d57031ff68da",
    "slug": "apertura_inclinada_con_mancuernas",
    "name": "Apertura inclinada con mancuernas",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Mancuernas",
    "instructions": "Abrí hasta un rango cómodo y cerrá sin perder control.",
    "movement_pattern": "Aducción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento de pecho con menos carga sistémica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Apertura inclinada mancuernas",
      "Apertura inclinada"
    ],
    "variations": [
      "Apertura de pecho con mancuernas",
      "Apertura de pecho en polea baja",
      "Apertura de pecho en polea media",
      "Apertura de pecho en polea alta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "c33080bf-d617-5b59-bfe8-4c99cdb46aa7",
    "slug": "apertura_declinada_con_mancuernas",
    "name": "Apertura declinada con mancuernas",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Mancuernas",
    "instructions": "Abrí hasta un rango cómodo y cerrá sin perder control.",
    "movement_pattern": "Aducción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento de pecho con menos carga sistémica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Apertura declinada mancuernas",
      "Apertura declinada"
    ],
    "variations": [
      "Apertura de pecho con mancuernas",
      "Apertura de pecho en polea baja",
      "Apertura de pecho en polea media",
      "Apertura de pecho en polea alta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "5f29ad14-4d14-54e4-b2c4-edd8a973fcb7",
    "slug": "flexion_estandar",
    "name": "Flexión estándar",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Flexión estándar"
    ],
    "variations": [
      "Flexión inclinada",
      "Flexión declinada",
      "Flexión diamante",
      "Flexión arquero"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "a4262d65-f458-5d75-82cf-1e41edae13d2",
    "slug": "flexion_inclinada",
    "name": "Flexión inclinada",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Flexión inclinada"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión declinada",
      "Flexión diamante",
      "Flexión arquero"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "0d91a960-6149-52af-a44a-25d544766c71",
    "slug": "flexion_declinada",
    "name": "Flexión declinada",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Flexión declinada"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión inclinada",
      "Flexión diamante",
      "Flexión arquero"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "652e60b6-cf12-5588-b7ea-acd029b51380",
    "slug": "flexion_diamante",
    "name": "Flexión diamante",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Flexión diamante"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión inclinada",
      "Flexión declinada",
      "Flexión arquero"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "add70899-136f-5260-8c7b-3b9e86604cfe",
    "slug": "flexion_arquero",
    "name": "Flexión arquero",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Flexión arquero"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión inclinada",
      "Flexión declinada",
      "Flexión diamante"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "f5c6bd16-16cd-5604-8ef5-cb0abc249fe5",
    "slug": "flexion_con_banda",
    "name": "Flexión con banda",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Banda",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Flexión banda",
      "Flexión"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión inclinada",
      "Flexión declinada",
      "Flexión diamante"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "9b4659d9-509e-5c74-853b-595c85b47c3e",
    "slug": "flexion_con_lastre",
    "name": "Flexión con lastre",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Flexión lastre",
      "Flexión"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión inclinada",
      "Flexión declinada",
      "Flexión diamante"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "97fa317c-2903-511c-862e-07dc0a74763a",
    "slug": "flexion_en_anillas",
    "name": "Flexión en anillas",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Anillas",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Flexión en anillas"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión inclinada",
      "Flexión declinada",
      "Flexión diamante"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "3d504664-4342-5a5c-9ce5-5970b14d3eb5",
    "slug": "flexion_explosiva",
    "name": "Flexión explosiva",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Flexión explosiva"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión inclinada",
      "Flexión declinada",
      "Flexión diamante"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "bb263c42-a682-5d30-82b6-caa7c97bfddd",
    "slug": "flexion_con_pausa",
    "name": "Flexión con pausa",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Flexión pausa",
      "Flexión"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión inclinada",
      "Flexión declinada",
      "Flexión diamante"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "f2775340-688f-5510-a982-6b0fe553c4b2",
    "slug": "flexion_a_una_mano_asistida",
    "name": "Flexión a una mano asistida",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Flexión a una mano asistida"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión inclinada",
      "Flexión declinada",
      "Flexión diamante"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "5333b036-6a6c-5d07-b0c3-5e171e00f402",
    "slug": "flexion_de_rodillas",
    "name": "Flexión de rodillas",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Flexión de rodillas"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión inclinada",
      "Flexión declinada",
      "Flexión diamante"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "e9c68c0b-9dbb-56d4-80a7-7314dc35fa02",
    "slug": "fondo_en_paralelas",
    "name": "Fondo en paralelas",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Fondo en paralelas"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión inclinada",
      "Flexión declinada",
      "Flexión diamante"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "b9562337-582c-5599-9b6a-a87d5f2fb59b",
    "slug": "fondo_en_paralelas_asistido",
    "name": "Fondo en paralelas asistido",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Fondo en paralelas asistido"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión inclinada",
      "Flexión declinada",
      "Flexión diamante"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "853bf781-813b-5a41-a8d9-3bdd078e7c8f",
    "slug": "fondo_en_paralelas_con_lastre",
    "name": "Fondo en paralelas con lastre",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Fondo en paralelas lastre",
      "Fondo en paralelas"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión inclinada",
      "Flexión declinada",
      "Flexión diamante"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "dc4e6ba4-255f-5362-92b6-0aa341fa348e",
    "slug": "fondo_entre_bancos",
    "name": "Fondo entre bancos",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Fondo entre bancos"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión inclinada",
      "Flexión declinada",
      "Flexión diamante"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "b3c319aa-9e6f-56ff-a525-db5bdb238c79",
    "slug": "fondo_entre_bancos_con_pausa",
    "name": "Fondo entre bancos con pausa",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Fondo entre bancos pausa",
      "Fondo entre bancos"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión inclinada",
      "Flexión declinada",
      "Flexión diamante"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "0fc41513-8c00-565a-aee6-1103ce87f903",
    "slug": "fondo_en_anillas",
    "name": "Fondo en anillas",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Anillas",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Fondo en anillas"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión inclinada",
      "Flexión declinada",
      "Flexión diamante"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "3000afb8-a8ad-589a-9e6d-c757b7ee2417",
    "slug": "fondo_coreano_asistido",
    "name": "Fondo coreano asistido",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Fondo coreano asistido"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión inclinada",
      "Flexión declinada",
      "Flexión diamante"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "2ed9ecd1-9751-5ece-acab-c8a7968fa676",
    "slug": "fondo_coreano_con_lastre",
    "name": "Fondo coreano con lastre",
    "muscle_group": "Pecho",
    "muscles_secondary": [
      "Tríceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mantené el cuerpo en bloque y el cuello neutro.",
    "movement_pattern": "Empuje corporal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Empuje con peso corporal para fuerza relativa.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Fondo coreano lastre",
      "Fondo coreano"
    ],
    "variations": [
      "Flexión estándar",
      "Flexión inclinada",
      "Flexión declinada",
      "Flexión diamante"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "45f587b5-9858-5513-b305-277e072b99d8",
    "slug": "remo_con_barra",
    "name": "Remo con barra",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo barra",
      "Remo"
    ],
    "variations": [
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina",
      "Remo con barra en Pendlay"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "e024a52e-3df1-5daa-bcb4-870969116e79",
    "slug": "remo_con_mancuernas",
    "name": "Remo con mancuernas",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Mancuernas",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo mancuernas",
      "Remo"
    ],
    "variations": [
      "Remo con barra",
      "Remo en polea baja",
      "Remo en máquina",
      "Remo con barra en Pendlay"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "6f4d974c-90f0-522d-8e1c-915bdf3e2a65",
    "slug": "remo_en_polea_baja",
    "name": "Remo en polea baja",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo en polea baja"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en máquina",
      "Remo con barra en Pendlay"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "b5bd70ef-2386-562c-b8bd-de5a17200a97",
    "slug": "remo_en_maquina",
    "name": "Remo en máquina",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Máquina",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo en máquina"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo con barra en Pendlay"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "14ef7bd2-0bd3-5222-8336-d11971cfe1ca",
    "slug": "remo_con_barra_en_pendlay",
    "name": "Remo con barra en Pendlay",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo barra en Pendlay",
      "Remo"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "c962bb41-d9e2-5019-9e5e-3b3100cb61b5",
    "slug": "remo_a_una_mano",
    "name": "Remo a una mano",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo a una mano"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "0bdcd832-4f28-50be-98de-d27a0b113a21",
    "slug": "remo_agarre_neutro",
    "name": "Remo agarre neutro",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo agarre neutro"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "562ec324-b955-5b9a-9d1c-8ed5c43b5138",
    "slug": "remo_con_pecho_apoyado_con_barra",
    "name": "Remo con pecho apoyado con barra",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo pecho apoyado barra",
      "Remo"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "fd232e4e-4567-5312-88cd-3ab861be7ddd",
    "slug": "remo_con_pecho_apoyado_con_mancuernas",
    "name": "Remo con pecho apoyado con mancuernas",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Mancuernas",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo pecho apoyado mancuernas",
      "Remo"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "31135b63-6bfb-5036-b011-354899ffe3ea",
    "slug": "remo_con_pecho_apoyado_en_polea_baja",
    "name": "Remo con pecho apoyado en polea baja",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo pecho apoyado en polea baja",
      "Remo"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "9257c82d-5d76-5b99-b8b3-1582c6c7285f",
    "slug": "remo_con_pecho_apoyado_en_maquina",
    "name": "Remo con pecho apoyado en máquina",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Máquina",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo pecho apoyado en máquina",
      "Remo"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "9590f9dc-d8b0-5836-8f2a-c62d1e780b0e",
    "slug": "remo_con_pecho_apoyado_con_barra_en_pendlay",
    "name": "Remo con pecho apoyado con barra en Pendlay",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo pecho apoyado barra en Pendlay",
      "Remo"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "b74df818-25c0-5f8e-9cca-795c70408040",
    "slug": "remo_con_pecho_apoyado_a_una_mano",
    "name": "Remo con pecho apoyado a una mano",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo pecho apoyado a una mano",
      "Remo"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "42bdfbaf-2b34-5064-9fdb-656b02caada6",
    "slug": "remo_con_pecho_apoyado_agarre_neutro",
    "name": "Remo con pecho apoyado agarre neutro",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo pecho apoyado agarre neutro",
      "Remo"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "73169899-8907-582d-934d-9fb9a91f1065",
    "slug": "remo_en_t_con_barra",
    "name": "Remo en T con barra",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo en T barra",
      "Remo en T"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "b228d82d-506c-5836-9d68-f9961c062bad",
    "slug": "remo_en_t_con_mancuernas",
    "name": "Remo en T con mancuernas",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Mancuernas",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo en T mancuernas",
      "Remo en T"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "721134cb-98cd-53ee-b753-e96f57c83733",
    "slug": "remo_en_t_en_polea_baja",
    "name": "Remo en T en polea baja",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo en T en polea baja"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "12a11ce3-ff67-5bdf-82c0-989b719fe23e",
    "slug": "remo_en_t_en_maquina",
    "name": "Remo en T en máquina",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Máquina",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo en T en máquina"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "0ca86b73-8ae5-598d-845f-865618e96e00",
    "slug": "remo_en_t_con_barra_en_pendlay",
    "name": "Remo en T con barra en Pendlay",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo en T barra en Pendlay",
      "Remo en T"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "abafa276-94c7-5367-87a5-4bc4c80bfa5c",
    "slug": "remo_en_t_a_una_mano",
    "name": "Remo en T a una mano",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo en T a una mano"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "cfbd9265-bb62-53fe-bc8c-08f12721c272",
    "slug": "remo_en_t_agarre_neutro",
    "name": "Remo en T agarre neutro",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo en T agarre neutro"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "82772068-d284-57e4-9e5c-23268aabf47c",
    "slug": "remo_sentado_con_barra",
    "name": "Remo sentado con barra",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo sentado barra",
      "Remo sentado"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "9f2dada0-583c-5ad7-a022-d3aa96402340",
    "slug": "remo_sentado_con_mancuernas",
    "name": "Remo sentado con mancuernas",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Mancuernas",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo sentado mancuernas",
      "Remo sentado"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "9d3d4920-e2df-57bf-aba0-fa1f69c6e1c7",
    "slug": "remo_sentado_en_polea_baja",
    "name": "Remo sentado en polea baja",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo sentado en polea baja"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "3a556dc9-0305-5233-90b3-e9be0eb8dcd7",
    "slug": "remo_sentado_en_maquina",
    "name": "Remo sentado en máquina",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Máquina",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo sentado en máquina"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "1aaa1e78-1cc2-50d5-bc58-828abb5b322f",
    "slug": "remo_sentado_con_barra_en_pendlay",
    "name": "Remo sentado con barra en Pendlay",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo sentado barra en Pendlay",
      "Remo sentado"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "0f24e8db-93b3-54bb-83f0-280b94c32294",
    "slug": "remo_sentado_a_una_mano",
    "name": "Remo sentado a una mano",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo sentado a una mano"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "cdf69732-9364-5cc8-8329-917913571fe0",
    "slug": "remo_sentado_agarre_neutro",
    "name": "Remo sentado agarre neutro",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo sentado agarre neutro"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "10713162-ef21-51ef-9eb7-7b65df021462",
    "slug": "remo_renegado",
    "name": "Remo renegado",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo renegado"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "41850061-c076-52f0-951a-970bd2ba33c3",
    "slug": "remo_en_banco_inclinado_con_mancuernas",
    "name": "Remo en banco inclinado con mancuernas",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Mancuernas",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo en banco inclinado mancuernas",
      "Remo en banco inclinado"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "30057ff1-3250-5b9a-be78-3230ad701846",
    "slug": "remo_en_landmine",
    "name": "Remo en landmine",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Landmine",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo en landmine"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "94d72876-e389-58cf-9d10-5f86808599da",
    "slug": "remo_meadows",
    "name": "Remo Meadows",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo Meadows"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "9c4355ce-3fc0-563c-b009-b3695f43491a",
    "slug": "remo_alto_en_polea",
    "name": "Remo alto en polea",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core",
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Tirá con codos hacia atrás y controlá la vuelta.",
    "movement_pattern": "Tracción horizontal",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción horizontal para espalda media y dorsales.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo alto en polea"
    ],
    "variations": [
      "Remo con barra",
      "Remo con mancuernas",
      "Remo en polea baja",
      "Remo en máquina"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "a184a9bd-812c-5559-9dcf-8fdcd8b8ec13",
    "slug": "dominada_pronada",
    "name": "Dominada pronada",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Barra fija",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Dominada pronada"
    ],
    "variations": [
      "Dominada supina",
      "Dominada neutra",
      "Dominada asistida",
      "Dominada con lastre"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "c827a843-b014-5614-b840-0ebe451cb5a5",
    "slug": "dominada_supina",
    "name": "Dominada supina",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Barra fija",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Dominada supina"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada neutra",
      "Dominada asistida",
      "Dominada con lastre"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "a5c4aae4-be73-58ff-83ee-fbcbf6b68638",
    "slug": "dominada_neutra",
    "name": "Dominada neutra",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Barra fija",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Dominada neutra"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada supina",
      "Dominada asistida",
      "Dominada con lastre"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "568a6d30-f7d5-5687-8aa3-127e5d2bfc70",
    "slug": "dominada_asistida",
    "name": "Dominada asistida",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Barra fija",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Dominada asistida"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada supina",
      "Dominada neutra",
      "Dominada con lastre"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "bee91526-fe8e-5a4b-a2e0-dfd9d28e0081",
    "slug": "dominada_con_lastre",
    "name": "Dominada con lastre",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Barra fija",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Dominada lastre",
      "Dominada"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada supina",
      "Dominada neutra",
      "Dominada asistida"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "ba90fb7b-af5f-5a95-8fda-39d9b713460e",
    "slug": "dominada_excentrica",
    "name": "Dominada excéntrica",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Barra fija",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Dominada excéntrica"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada supina",
      "Dominada neutra",
      "Dominada asistida"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "9db7b5b7-246f-54bc-9aee-14effdcc9b26",
    "slug": "dominada_al_pecho",
    "name": "Dominada al pecho",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Barra fija",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Dominada al pecho"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada supina",
      "Dominada neutra",
      "Dominada asistida"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "73b9c624-cbcb-593d-a48d-7d1af433f418",
    "slug": "muscle_up_asistido",
    "name": "Muscle-up asistido",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Barra fija",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Muscle-up asistido"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada supina",
      "Dominada neutra",
      "Dominada asistida"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "dd99446f-63f1-54bb-aab6-15b443490678",
    "slug": "jalon_al_pecho_pronado",
    "name": "Jalón al pecho pronado",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Barra fija",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Jalón al pecho pronado"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada supina",
      "Dominada neutra",
      "Dominada asistida"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "6b5d6049-c369-559f-ac31-f4daff883d89",
    "slug": "jalon_al_pecho_supino",
    "name": "Jalón al pecho supino",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Barra fija",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Jalón al pecho supino"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada supina",
      "Dominada neutra",
      "Dominada asistida"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "ef613d57-e019-5d30-a29a-e7500c7da28a",
    "slug": "jalon_al_pecho_agarre_neutro",
    "name": "Jalón al pecho agarre neutro",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Barra fija",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Jalón al pecho agarre neutro"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada supina",
      "Dominada neutra",
      "Dominada asistida"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "c2449a48-6116-5885-9f0d-231980e80076",
    "slug": "jalon_al_pecho_unilateral",
    "name": "Jalón al pecho unilateral",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Barra fija",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Jalón al pecho unilateral"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada supina",
      "Dominada neutra",
      "Dominada asistida"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "e0b16192-4af1-5a6a-bf8d-2d091c62ece7",
    "slug": "jalon_al_pecho_en_maquina",
    "name": "Jalón al pecho en máquina",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Máquina",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Jalón al pecho en máquina"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada supina",
      "Dominada neutra",
      "Dominada asistida"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "0604a60a-9809-5e0d-87f8-a2c579f34df4",
    "slug": "jalon_al_pecho_con_banda",
    "name": "Jalón al pecho con banda",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Banda",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Jalón al pecho banda",
      "Jalón al pecho"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada supina",
      "Dominada neutra",
      "Dominada asistida"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "d06a3ae8-9e69-51c2-8ce1-5e45ce2588ec",
    "slug": "pullover_dorsal_en_polea",
    "name": "Pullover dorsal en polea",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Polea",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pullover dorsal en polea"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada supina",
      "Dominada neutra",
      "Dominada asistida"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "fc9d267e-ce06-5c4a-986b-e9a33c9372c2",
    "slug": "pullover_dorsal_con_mancuerna",
    "name": "Pullover dorsal con mancuerna",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Mancuerna",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pullover dorsal mancuerna",
      "Pullover dorsal"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada supina",
      "Dominada neutra",
      "Dominada asistida"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "f153afe2-706f-5a04-9122-6921a676102f",
    "slug": "pullover_dorsal_en_maquina",
    "name": "Pullover dorsal en máquina",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Máquina",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pullover dorsal en máquina"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada supina",
      "Dominada neutra",
      "Dominada asistida"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "9ec66f74-c7b2-5e8e-a3fc-ee34826ee9a4",
    "slug": "remo_vertical_al_pecho_en_polea",
    "name": "Remo vertical al pecho en polea",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Polea",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo vertical al pecho en polea"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada supina",
      "Dominada neutra",
      "Dominada asistida"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "171822e7-0569-511f-a8e3-6876768bc7b4",
    "slug": "straight_arm_pulldown",
    "name": "Straight-arm pulldown",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Barra fija",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Straight-arm pulldown"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada supina",
      "Dominada neutra",
      "Dominada asistida"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "9b5b3a45-3f82-5a5b-984b-684dc8a94278",
    "slug": "dominada_escapular",
    "name": "Dominada escapular",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Bíceps",
      "Core"
    ],
    "equipment": "Barra fija",
    "instructions": "Iniciá desde la escápula y evitá compensar con el cuello.",
    "movement_pattern": "Tracción vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Tracción vertical para dorsales y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Dominada escapular"
    ],
    "variations": [
      "Dominada pronada",
      "Dominada supina",
      "Dominada neutra",
      "Dominada asistida"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "56336536-d3c8-5a6a-9c00-1bfac43f89d6",
    "slug": "encogimiento_con_barra",
    "name": "Encogimiento con barra",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Trapecio",
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Pensá primero en mover la escápula y recién después el brazo.",
    "movement_pattern": "Control escapular",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo específico para trapecio y salud escapular.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Encogimiento barra",
      "Encogimiento"
    ],
    "variations": [
      "Encogimiento con mancuernas",
      "Encogimiento en trap bar",
      "Face pull en polea alta",
      "Face pull con banda"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "da6630ca-d3e9-5d65-b7ed-0ba530c0b5bf",
    "slug": "encogimiento_con_mancuernas",
    "name": "Encogimiento con mancuernas",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Trapecio",
      "Hombros"
    ],
    "equipment": "Mancuernas",
    "instructions": "Pensá primero en mover la escápula y recién después el brazo.",
    "movement_pattern": "Control escapular",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo específico para trapecio y salud escapular.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Encogimiento mancuernas",
      "Encogimiento"
    ],
    "variations": [
      "Encogimiento con barra",
      "Encogimiento en trap bar",
      "Face pull en polea alta",
      "Face pull con banda"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "e9548bb1-fc99-5f0f-8acf-0ffb6c0af56f",
    "slug": "encogimiento_en_trap_bar",
    "name": "Encogimiento en trap bar",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Trapecio",
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Pensá primero en mover la escápula y recién después el brazo.",
    "movement_pattern": "Control escapular",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo específico para trapecio y salud escapular.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Encogimiento en trap bar"
    ],
    "variations": [
      "Encogimiento con barra",
      "Encogimiento con mancuernas",
      "Face pull en polea alta",
      "Face pull con banda"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "d5707805-831a-5197-b7a3-03f1e37a3f72",
    "slug": "face_pull_en_polea_alta",
    "name": "Face pull en polea alta",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Trapecio",
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Pensá primero en mover la escápula y recién después el brazo.",
    "movement_pattern": "Control escapular",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo específico para trapecio y salud escapular.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Face pull en polea alta"
    ],
    "variations": [
      "Encogimiento con barra",
      "Encogimiento con mancuernas",
      "Encogimiento en trap bar",
      "Face pull con banda"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "ee0f4bcd-1b96-56c9-b489-f85dd17c69ee",
    "slug": "face_pull_con_banda",
    "name": "Face pull con banda",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Trapecio",
      "Hombros"
    ],
    "equipment": "Banda",
    "instructions": "Pensá primero en mover la escápula y recién después el brazo.",
    "movement_pattern": "Control escapular",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo específico para trapecio y salud escapular.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Face pull banda",
      "Face pull"
    ],
    "variations": [
      "Encogimiento con barra",
      "Encogimiento con mancuernas",
      "Encogimiento en trap bar",
      "Face pull en polea alta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "f04e59b8-dbd3-5732-867c-1cd93246f67a",
    "slug": "pulldown_escapular_en_polea",
    "name": "Pulldown escapular en polea",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Trapecio",
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Pensá primero en mover la escápula y recién después el brazo.",
    "movement_pattern": "Control escapular",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo específico para trapecio y salud escapular.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pulldown escapular en polea"
    ],
    "variations": [
      "Encogimiento con barra",
      "Encogimiento con mancuernas",
      "Encogimiento en trap bar",
      "Face pull en polea alta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "f83a2467-8334-50c9-8e4c-a9818706a3b9",
    "slug": "retraccion_escapular_colgado",
    "name": "Retracción escapular colgado",
    "muscle_group": "Espalda",
    "muscles_secondary": [
      "Trapecio",
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Pensá primero en mover la escápula y recién después el brazo.",
    "movement_pattern": "Control escapular",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo específico para trapecio y salud escapular.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Retracción escapular colgado"
    ],
    "variations": [
      "Encogimiento con barra",
      "Encogimiento con mancuernas",
      "Encogimiento en trap bar",
      "Face pull en polea alta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "2a3336e2-6165-5a88-90b9-6c1737220f9a",
    "slug": "press_militar_con_barra",
    "name": "Press militar con barra",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Tríceps",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Apretá glúteos y abdomen antes de empujar.",
    "movement_pattern": "Empuje vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje vertical para hombros y estabilidad sobre cabeza.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press militar barra",
      "Press militar"
    ],
    "variations": [
      "Press militar con mancuernas",
      "Press militar sentado",
      "Press militar de pie",
      "Press Arnold con mancuernas"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "4409dfe9-5930-5957-8f25-17c75cf65957",
    "slug": "press_militar_con_mancuernas",
    "name": "Press militar con mancuernas",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Tríceps",
      "Core"
    ],
    "equipment": "Mancuernas",
    "instructions": "Apretá glúteos y abdomen antes de empujar.",
    "movement_pattern": "Empuje vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje vertical para hombros y estabilidad sobre cabeza.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press militar mancuernas",
      "Press militar"
    ],
    "variations": [
      "Press militar con barra",
      "Press militar sentado",
      "Press militar de pie",
      "Press Arnold con mancuernas"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "3b130807-fe7f-539d-a7b4-539f044cf6fd",
    "slug": "press_militar_sentado",
    "name": "Press militar sentado",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Tríceps",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Apretá glúteos y abdomen antes de empujar.",
    "movement_pattern": "Empuje vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje vertical para hombros y estabilidad sobre cabeza.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press militar sentado"
    ],
    "variations": [
      "Press militar con barra",
      "Press militar con mancuernas",
      "Press militar de pie",
      "Press Arnold con mancuernas"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "b41bce52-73eb-5607-bf9f-f7480a252eca",
    "slug": "press_militar_de_pie",
    "name": "Press militar de pie",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Tríceps",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Apretá glúteos y abdomen antes de empujar.",
    "movement_pattern": "Empuje vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje vertical para hombros y estabilidad sobre cabeza.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press militar de pie"
    ],
    "variations": [
      "Press militar con barra",
      "Press militar con mancuernas",
      "Press militar sentado",
      "Press Arnold con mancuernas"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "96c15a13-0891-545c-a1ae-3e20eb02bf82",
    "slug": "press_arnold_con_mancuernas",
    "name": "Press Arnold con mancuernas",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Tríceps",
      "Core"
    ],
    "equipment": "Mancuernas",
    "instructions": "Apretá glúteos y abdomen antes de empujar.",
    "movement_pattern": "Empuje vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje vertical para hombros y estabilidad sobre cabeza.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press Arnold mancuernas",
      "Press Arnold"
    ],
    "variations": [
      "Press militar con barra",
      "Press militar con mancuernas",
      "Press militar sentado",
      "Press militar de pie"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "5b765779-9b2a-52ba-b764-5e0ead410404",
    "slug": "press_en_maquina_para_hombros",
    "name": "Press en máquina para hombros",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Tríceps",
      "Core"
    ],
    "equipment": "Máquina",
    "instructions": "Apretá glúteos y abdomen antes de empujar.",
    "movement_pattern": "Empuje vertical",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje vertical para hombros y estabilidad sobre cabeza.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press en máquina para hombros"
    ],
    "variations": [
      "Press militar con barra",
      "Press militar con mancuernas",
      "Press militar sentado",
      "Press militar de pie"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "8cafda0c-295d-5549-ba65-36e59489795a",
    "slug": "push_press_con_barra",
    "name": "Push press con barra",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Tríceps",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Apretá glúteos y abdomen antes de empujar.",
    "movement_pattern": "Empuje vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje vertical para hombros y estabilidad sobre cabeza.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Push press barra",
      "Push press"
    ],
    "variations": [
      "Press militar con barra",
      "Press militar con mancuernas",
      "Press militar sentado",
      "Press militar de pie"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "a3476bea-7531-513a-99b3-979c7145419f",
    "slug": "push_press_con_mancuernas",
    "name": "Push press con mancuernas",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Tríceps",
      "Core"
    ],
    "equipment": "Mancuernas",
    "instructions": "Apretá glúteos y abdomen antes de empujar.",
    "movement_pattern": "Empuje vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje vertical para hombros y estabilidad sobre cabeza.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Push press mancuernas",
      "Push press"
    ],
    "variations": [
      "Press militar con barra",
      "Press militar con mancuernas",
      "Press militar sentado",
      "Press militar de pie"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "b64c91e7-8131-5d4c-a221-72c5db91a58e",
    "slug": "press_con_landmine_unilateral",
    "name": "Press con landmine unilateral",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Tríceps",
      "Core"
    ],
    "equipment": "Landmine",
    "instructions": "Apretá glúteos y abdomen antes de empujar.",
    "movement_pattern": "Empuje vertical",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje vertical para hombros y estabilidad sobre cabeza.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press landmine unilateral",
      "Press"
    ],
    "variations": [
      "Press militar con barra",
      "Press militar con mancuernas",
      "Press militar sentado",
      "Press militar de pie"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "72c3593b-a8e0-5767-ab11-8b011cc5494f",
    "slug": "press_con_landmine_bilateral",
    "name": "Press con landmine bilateral",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Tríceps",
      "Core"
    ],
    "equipment": "Landmine",
    "instructions": "Apretá glúteos y abdomen antes de empujar.",
    "movement_pattern": "Empuje vertical",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje vertical para hombros y estabilidad sobre cabeza.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press landmine bilateral",
      "Press"
    ],
    "variations": [
      "Press militar con barra",
      "Press militar con mancuernas",
      "Press militar sentado",
      "Press militar de pie"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "f5bd9b1a-5ac3-5a63-94bb-e8053343ae6f",
    "slug": "z_press_con_barra",
    "name": "Z press con barra",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Tríceps",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Apretá glúteos y abdomen antes de empujar.",
    "movement_pattern": "Empuje vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje vertical para hombros y estabilidad sobre cabeza.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Z press barra",
      "Z press"
    ],
    "variations": [
      "Press militar con barra",
      "Press militar con mancuernas",
      "Press militar sentado",
      "Press militar de pie"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "021142bd-9e31-59a7-9e43-74d5f51c8563",
    "slug": "z_press_con_mancuernas",
    "name": "Z press con mancuernas",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Tríceps",
      "Core"
    ],
    "equipment": "Mancuernas",
    "instructions": "Apretá glúteos y abdomen antes de empujar.",
    "movement_pattern": "Empuje vertical",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Empuje vertical para hombros y estabilidad sobre cabeza.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Z press mancuernas",
      "Z press"
    ],
    "variations": [
      "Press militar con barra",
      "Press militar con mancuernas",
      "Press militar sentado",
      "Press militar de pie"
    ],
    "contraindications": [
      "Dolor agudo de hombro",
      "Pérdida de control escapular con carga"
    ]
  },
  {
    "id": "6ff81c25-b7d6-5a67-b046-7791d0da9dfa",
    "slug": "elevacion_lateral_con_mancuernas",
    "name": "Elevación lateral con mancuernas",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Trapecio",
      "Espalda alta"
    ],
    "equipment": "Mancuernas",
    "instructions": "Levantá con control y sin balancear el torso.",
    "movement_pattern": "Aislamiento de hombro",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para deltoides y salud del hombro.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elevación lateral mancuernas",
      "Elevación lateral"
    ],
    "variations": [
      "Elevación lateral en polea",
      "Elevación lateral con banda",
      "Elevación lateral inclinada",
      "Elevación lateral unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "4bf5e742-6fa2-5146-8cb9-ae9e09f0d6fa",
    "slug": "elevacion_lateral_en_polea",
    "name": "Elevación lateral en polea",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Trapecio",
      "Espalda alta"
    ],
    "equipment": "Polea",
    "instructions": "Levantá con control y sin balancear el torso.",
    "movement_pattern": "Aislamiento de hombro",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para deltoides y salud del hombro.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elevación lateral en polea"
    ],
    "variations": [
      "Elevación lateral con mancuernas",
      "Elevación lateral con banda",
      "Elevación lateral inclinada",
      "Elevación lateral unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "1c95a299-e053-50c5-b6ad-692086e9e8f7",
    "slug": "elevacion_lateral_con_banda",
    "name": "Elevación lateral con banda",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Trapecio",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Levantá con control y sin balancear el torso.",
    "movement_pattern": "Aislamiento de hombro",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para deltoides y salud del hombro.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elevación lateral banda",
      "Elevación lateral"
    ],
    "variations": [
      "Elevación lateral con mancuernas",
      "Elevación lateral en polea",
      "Elevación lateral inclinada",
      "Elevación lateral unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "6497e9b0-79c6-5f18-a0d7-5eca91ec1ec4",
    "slug": "elevacion_lateral_inclinada",
    "name": "Elevación lateral inclinada",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Trapecio",
      "Espalda alta"
    ],
    "equipment": "Mancuernas",
    "instructions": "Levantá con control y sin balancear el torso.",
    "movement_pattern": "Aislamiento de hombro",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para deltoides y salud del hombro.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elevación lateral inclinada"
    ],
    "variations": [
      "Elevación lateral con mancuernas",
      "Elevación lateral en polea",
      "Elevación lateral con banda",
      "Elevación lateral unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "283c0f1f-f579-5bdd-a64e-d1476ce90841",
    "slug": "elevacion_lateral_unilateral",
    "name": "Elevación lateral unilateral",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Trapecio",
      "Espalda alta"
    ],
    "equipment": "Mancuernas",
    "instructions": "Levantá con control y sin balancear el torso.",
    "movement_pattern": "Aislamiento de hombro",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para deltoides y salud del hombro.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elevación lateral unilateral"
    ],
    "variations": [
      "Elevación lateral con mancuernas",
      "Elevación lateral en polea",
      "Elevación lateral con banda",
      "Elevación lateral inclinada"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "dc061cd6-2488-56be-9f50-5921f3525a86",
    "slug": "elevacion_frontal_con_mancuernas",
    "name": "Elevación frontal con mancuernas",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Trapecio",
      "Espalda alta"
    ],
    "equipment": "Mancuernas",
    "instructions": "Levantá con control y sin balancear el torso.",
    "movement_pattern": "Aislamiento de hombro",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para deltoides y salud del hombro.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elevación frontal mancuernas",
      "Elevación frontal"
    ],
    "variations": [
      "Elevación lateral con mancuernas",
      "Elevación lateral en polea",
      "Elevación lateral con banda",
      "Elevación lateral inclinada"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "8113f8ac-6e2a-59f1-bc96-4134ed8a5c1f",
    "slug": "elevacion_frontal_con_disco",
    "name": "Elevación frontal con disco",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Trapecio",
      "Espalda alta"
    ],
    "equipment": "Mancuernas",
    "instructions": "Levantá con control y sin balancear el torso.",
    "movement_pattern": "Aislamiento de hombro",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para deltoides y salud del hombro.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elevación frontal disco",
      "Elevación frontal"
    ],
    "variations": [
      "Elevación lateral con mancuernas",
      "Elevación lateral en polea",
      "Elevación lateral con banda",
      "Elevación lateral inclinada"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "75a75f5e-d21e-531c-85f0-0def44feca6b",
    "slug": "elevacion_frontal_con_banda",
    "name": "Elevación frontal con banda",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Trapecio",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Levantá con control y sin balancear el torso.",
    "movement_pattern": "Aislamiento de hombro",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para deltoides y salud del hombro.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elevación frontal banda",
      "Elevación frontal"
    ],
    "variations": [
      "Elevación lateral con mancuernas",
      "Elevación lateral en polea",
      "Elevación lateral con banda",
      "Elevación lateral inclinada"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "78238b21-d878-5736-89a2-446bc242ac91",
    "slug": "pajaro_posterior_con_mancuernas",
    "name": "Pájaro posterior con mancuernas",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Trapecio",
      "Espalda alta"
    ],
    "equipment": "Mancuernas",
    "instructions": "Levantá con control y sin balancear el torso.",
    "movement_pattern": "Aislamiento de hombro",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para deltoides y salud del hombro.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pájaro posterior mancuernas",
      "Pájaro posterior"
    ],
    "variations": [
      "Elevación lateral con mancuernas",
      "Elevación lateral en polea",
      "Elevación lateral con banda",
      "Elevación lateral inclinada"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "dd7e42ac-4685-5c73-8b70-dde73715553a",
    "slug": "pajaro_posterior_en_maquina",
    "name": "Pájaro posterior en máquina",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Trapecio",
      "Espalda alta"
    ],
    "equipment": "Máquina",
    "instructions": "Levantá con control y sin balancear el torso.",
    "movement_pattern": "Aislamiento de hombro",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para deltoides y salud del hombro.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pájaro posterior en máquina"
    ],
    "variations": [
      "Elevación lateral con mancuernas",
      "Elevación lateral en polea",
      "Elevación lateral con banda",
      "Elevación lateral inclinada"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "bd5320bc-753b-5718-a018-1a601feaf528",
    "slug": "pajaro_posterior_en_polea",
    "name": "Pájaro posterior en polea",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Trapecio",
      "Espalda alta"
    ],
    "equipment": "Polea",
    "instructions": "Levantá con control y sin balancear el torso.",
    "movement_pattern": "Aislamiento de hombro",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para deltoides y salud del hombro.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pájaro posterior en polea"
    ],
    "variations": [
      "Elevación lateral con mancuernas",
      "Elevación lateral en polea",
      "Elevación lateral con banda",
      "Elevación lateral inclinada"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "76ef2ce3-4f49-5a7b-8bc7-cea674324bde",
    "slug": "y_raise_en_banco_inclinado",
    "name": "Y-raise en banco inclinado",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Trapecio",
      "Espalda alta"
    ],
    "equipment": "Mancuernas",
    "instructions": "Levantá con control y sin balancear el torso.",
    "movement_pattern": "Aislamiento de hombro",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para deltoides y salud del hombro.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Y-raise en banco inclinado"
    ],
    "variations": [
      "Elevación lateral con mancuernas",
      "Elevación lateral en polea",
      "Elevación lateral con banda",
      "Elevación lateral inclinada"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "2dee4502-6a9c-5b99-8edf-88b81fe91288",
    "slug": "w_raise_en_banco_inclinado",
    "name": "W-raise en banco inclinado",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Trapecio",
      "Espalda alta"
    ],
    "equipment": "Mancuernas",
    "instructions": "Levantá con control y sin balancear el torso.",
    "movement_pattern": "Aislamiento de hombro",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para deltoides y salud del hombro.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "W-raise en banco inclinado"
    ],
    "variations": [
      "Elevación lateral con mancuernas",
      "Elevación lateral en polea",
      "Elevación lateral con banda",
      "Elevación lateral inclinada"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "e30b035d-1b2c-5994-9adb-6461a02362f8",
    "slug": "face_pull_alto_con_cuerda",
    "name": "Face pull alto con cuerda",
    "muscle_group": "Hombros",
    "muscles_secondary": [
      "Trapecio",
      "Espalda alta"
    ],
    "equipment": "Cuerda",
    "instructions": "Levantá con control y sin balancear el torso.",
    "movement_pattern": "Aislamiento de hombro",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para deltoides y salud del hombro.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Face pull alto cuerda",
      "Face pull alto"
    ],
    "variations": [
      "Elevación lateral con mancuernas",
      "Elevación lateral en polea",
      "Elevación lateral con banda",
      "Elevación lateral inclinada"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "15c4903b-06b6-57b9-93b4-f6446b08c7d1",
    "slug": "curl_de_biceps_con_barra",
    "name": "Curl de bíceps con barra",
    "muscle_group": "Bíceps",
    "muscles_secondary": [
      "Antebrazos"
    ],
    "equipment": "Barra",
    "instructions": "Clavá el brazo y bajá más lento de lo que subís.",
    "movement_pattern": "Flexión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Flexión de codo para bíceps y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl de bíceps barra",
      "Curl de bíceps"
    ],
    "variations": [
      "Curl de bíceps con barra EZ",
      "Curl de bíceps con mancuernas",
      "Curl de bíceps alterno",
      "Curl de bíceps en polea"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "02505bff-0bbd-5e9d-9de8-951a8d5d9d93",
    "slug": "curl_de_biceps_con_barra_ez",
    "name": "Curl de bíceps con barra EZ",
    "muscle_group": "Bíceps",
    "muscles_secondary": [
      "Antebrazos"
    ],
    "equipment": "Barra",
    "instructions": "Clavá el brazo y bajá más lento de lo que subís.",
    "movement_pattern": "Flexión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Flexión de codo para bíceps y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl de bíceps barra EZ",
      "Curl de bíceps"
    ],
    "variations": [
      "Curl de bíceps con barra",
      "Curl de bíceps con mancuernas",
      "Curl de bíceps alterno",
      "Curl de bíceps en polea"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "5a8d831d-888b-5096-b2a9-46d69c8bb1ef",
    "slug": "curl_de_biceps_con_mancuernas",
    "name": "Curl de bíceps con mancuernas",
    "muscle_group": "Bíceps",
    "muscles_secondary": [
      "Antebrazos"
    ],
    "equipment": "Mancuernas",
    "instructions": "Clavá el brazo y bajá más lento de lo que subís.",
    "movement_pattern": "Flexión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Flexión de codo para bíceps y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl de bíceps mancuernas",
      "Curl de bíceps"
    ],
    "variations": [
      "Curl de bíceps con barra",
      "Curl de bíceps con barra EZ",
      "Curl de bíceps alterno",
      "Curl de bíceps en polea"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "540d214f-00f3-51df-be23-a3e88cf622ac",
    "slug": "curl_de_biceps_alterno",
    "name": "Curl de bíceps alterno",
    "muscle_group": "Bíceps",
    "muscles_secondary": [
      "Antebrazos"
    ],
    "equipment": "Barra",
    "instructions": "Clavá el brazo y bajá más lento de lo que subís.",
    "movement_pattern": "Flexión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Flexión de codo para bíceps y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl de bíceps alterno"
    ],
    "variations": [
      "Curl de bíceps con barra",
      "Curl de bíceps con barra EZ",
      "Curl de bíceps con mancuernas",
      "Curl de bíceps en polea"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "a01bb31e-e78e-5ce3-b9ac-05ab761261c9",
    "slug": "curl_de_biceps_en_polea",
    "name": "Curl de bíceps en polea",
    "muscle_group": "Bíceps",
    "muscles_secondary": [
      "Antebrazos"
    ],
    "equipment": "Polea",
    "instructions": "Clavá el brazo y bajá más lento de lo que subís.",
    "movement_pattern": "Flexión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Flexión de codo para bíceps y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl de bíceps en polea"
    ],
    "variations": [
      "Curl de bíceps con barra",
      "Curl de bíceps con barra EZ",
      "Curl de bíceps con mancuernas",
      "Curl de bíceps alterno"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "5c6b31fe-fdb0-5de8-b09c-1fc9af4d2ff4",
    "slug": "curl_de_biceps_en_maquina",
    "name": "Curl de bíceps en máquina",
    "muscle_group": "Bíceps",
    "muscles_secondary": [
      "Antebrazos"
    ],
    "equipment": "Máquina",
    "instructions": "Clavá el brazo y bajá más lento de lo que subís.",
    "movement_pattern": "Flexión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Flexión de codo para bíceps y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl de bíceps en máquina"
    ],
    "variations": [
      "Curl de bíceps con barra",
      "Curl de bíceps con barra EZ",
      "Curl de bíceps con mancuernas",
      "Curl de bíceps alterno"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "8366e338-7c8c-5f90-98b2-217b8dd480b9",
    "slug": "curl_martillo_con_mancuernas",
    "name": "Curl martillo con mancuernas",
    "muscle_group": "Bíceps",
    "muscles_secondary": [
      "Antebrazos"
    ],
    "equipment": "Mancuernas",
    "instructions": "Clavá el brazo y bajá más lento de lo que subís.",
    "movement_pattern": "Flexión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Flexión de codo para bíceps y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl martillo mancuernas",
      "Curl martillo"
    ],
    "variations": [
      "Curl de bíceps con barra",
      "Curl de bíceps con barra EZ",
      "Curl de bíceps con mancuernas",
      "Curl de bíceps alterno"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "6a535c69-4668-5d8f-b9b3-535c76457884",
    "slug": "curl_martillo_cruzado",
    "name": "Curl martillo cruzado",
    "muscle_group": "Bíceps",
    "muscles_secondary": [
      "Antebrazos"
    ],
    "equipment": "Barra",
    "instructions": "Clavá el brazo y bajá más lento de lo que subís.",
    "movement_pattern": "Flexión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Flexión de codo para bíceps y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl martillo cruzado"
    ],
    "variations": [
      "Curl de bíceps con barra",
      "Curl de bíceps con barra EZ",
      "Curl de bíceps con mancuernas",
      "Curl de bíceps alterno"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "aebbb20d-569f-5f5d-9c4d-505b436a13ac",
    "slug": "curl_martillo_en_cuerda",
    "name": "Curl martillo en cuerda",
    "muscle_group": "Bíceps",
    "muscles_secondary": [
      "Antebrazos"
    ],
    "equipment": "Cuerda",
    "instructions": "Clavá el brazo y bajá más lento de lo que subís.",
    "movement_pattern": "Flexión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Flexión de codo para bíceps y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl martillo en cuerda"
    ],
    "variations": [
      "Curl de bíceps con barra",
      "Curl de bíceps con barra EZ",
      "Curl de bíceps con mancuernas",
      "Curl de bíceps alterno"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "57176c01-0f55-5fa6-9f46-da4f8ad890b9",
    "slug": "curl_predicador_con_barra_ez",
    "name": "Curl predicador con barra EZ",
    "muscle_group": "Bíceps",
    "muscles_secondary": [
      "Antebrazos"
    ],
    "equipment": "Barra",
    "instructions": "Clavá el brazo y bajá más lento de lo que subís.",
    "movement_pattern": "Flexión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Flexión de codo para bíceps y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl predicador barra EZ",
      "Curl predicador"
    ],
    "variations": [
      "Curl de bíceps con barra",
      "Curl de bíceps con barra EZ",
      "Curl de bíceps con mancuernas",
      "Curl de bíceps alterno"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "11a0f189-deaa-5468-89a2-7bc11aa5a717",
    "slug": "curl_predicador_con_mancuerna",
    "name": "Curl predicador con mancuerna",
    "muscle_group": "Bíceps",
    "muscles_secondary": [
      "Antebrazos"
    ],
    "equipment": "Mancuerna",
    "instructions": "Clavá el brazo y bajá más lento de lo que subís.",
    "movement_pattern": "Flexión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Flexión de codo para bíceps y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl predicador mancuerna",
      "Curl predicador"
    ],
    "variations": [
      "Curl de bíceps con barra",
      "Curl de bíceps con barra EZ",
      "Curl de bíceps con mancuernas",
      "Curl de bíceps alterno"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "0608232a-44e3-5323-b5ae-346c3e8b1c51",
    "slug": "curl_inclinado_con_mancuernas",
    "name": "Curl inclinado con mancuernas",
    "muscle_group": "Bíceps",
    "muscles_secondary": [
      "Antebrazos"
    ],
    "equipment": "Mancuernas",
    "instructions": "Clavá el brazo y bajá más lento de lo que subís.",
    "movement_pattern": "Flexión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Flexión de codo para bíceps y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl inclinado mancuernas",
      "Curl inclinado"
    ],
    "variations": [
      "Curl de bíceps con barra",
      "Curl de bíceps con barra EZ",
      "Curl de bíceps con mancuernas",
      "Curl de bíceps alterno"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "f13f5165-a815-5f68-9619-d059d12524f7",
    "slug": "curl_spider",
    "name": "Curl spider",
    "muscle_group": "Bíceps",
    "muscles_secondary": [
      "Antebrazos"
    ],
    "equipment": "Barra",
    "instructions": "Clavá el brazo y bajá más lento de lo que subís.",
    "movement_pattern": "Flexión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Flexión de codo para bíceps y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl spider"
    ],
    "variations": [
      "Curl de bíceps con barra",
      "Curl de bíceps con barra EZ",
      "Curl de bíceps con mancuernas",
      "Curl de bíceps alterno"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "ea13d7be-8da4-5fd2-9d24-53d4b3a16ea6",
    "slug": "curl_concentrado",
    "name": "Curl concentrado",
    "muscle_group": "Bíceps",
    "muscles_secondary": [
      "Antebrazos"
    ],
    "equipment": "Barra",
    "instructions": "Clavá el brazo y bajá más lento de lo que subís.",
    "movement_pattern": "Flexión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Flexión de codo para bíceps y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl concentrado"
    ],
    "variations": [
      "Curl de bíceps con barra",
      "Curl de bíceps con barra EZ",
      "Curl de bíceps con mancuernas",
      "Curl de bíceps alterno"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "3ce98cbc-e4b9-5aa7-82cc-4937fc595a7b",
    "slug": "curl_21s_con_barra",
    "name": "Curl 21s con barra",
    "muscle_group": "Bíceps",
    "muscles_secondary": [
      "Antebrazos"
    ],
    "equipment": "Barra",
    "instructions": "Clavá el brazo y bajá más lento de lo que subís.",
    "movement_pattern": "Flexión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Flexión de codo para bíceps y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl 21s barra",
      "Curl 21s"
    ],
    "variations": [
      "Curl de bíceps con barra",
      "Curl de bíceps con barra EZ",
      "Curl de bíceps con mancuernas",
      "Curl de bíceps alterno"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "423b0c84-703b-5bb8-8e6e-c05f629be93a",
    "slug": "curl_inverso_con_barra",
    "name": "Curl inverso con barra",
    "muscle_group": "Bíceps",
    "muscles_secondary": [
      "Antebrazos"
    ],
    "equipment": "Barra",
    "instructions": "Clavá el brazo y bajá más lento de lo que subís.",
    "movement_pattern": "Flexión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Flexión de codo para bíceps y agarre.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl inverso barra",
      "Curl inverso"
    ],
    "variations": [
      "Curl de bíceps con barra",
      "Curl de bíceps con barra EZ",
      "Curl de bíceps con mancuernas",
      "Curl de bíceps alterno"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "5c619fef-8c4e-500d-88e0-0a9f37373b5d",
    "slug": "pushdown_de_triceps_con_cuerda",
    "name": "Pushdown de tríceps con cuerda",
    "muscle_group": "Tríceps",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Cuerda",
    "instructions": "Mantené el codo estable y controlá la vuelta.",
    "movement_pattern": "Extensión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para tríceps y cierre del empuje.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pushdown de tríceps cuerda",
      "Pushdown de tríceps"
    ],
    "variations": [
      "Pushdown de tríceps con barra recta",
      "Pushdown de tríceps unilateral",
      "Pushdown de tríceps invertido",
      "Extensión de tríceps sobre cabeza con mancuerna"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "c009025f-0cbf-54ee-9965-271476cb35f1",
    "slug": "pushdown_de_triceps_con_barra_recta",
    "name": "Pushdown de tríceps con barra recta",
    "muscle_group": "Tríceps",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Mantené el codo estable y controlá la vuelta.",
    "movement_pattern": "Extensión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para tríceps y cierre del empuje.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pushdown de tríceps barra recta",
      "Pushdown de tríceps"
    ],
    "variations": [
      "Pushdown de tríceps con cuerda",
      "Pushdown de tríceps unilateral",
      "Pushdown de tríceps invertido",
      "Extensión de tríceps sobre cabeza con mancuerna"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "f7a7deae-3acc-5dae-a815-53fce8e2ca86",
    "slug": "pushdown_de_triceps_unilateral",
    "name": "Pushdown de tríceps unilateral",
    "muscle_group": "Tríceps",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Mantené el codo estable y controlá la vuelta.",
    "movement_pattern": "Extensión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para tríceps y cierre del empuje.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pushdown de tríceps unilateral"
    ],
    "variations": [
      "Pushdown de tríceps con cuerda",
      "Pushdown de tríceps con barra recta",
      "Pushdown de tríceps invertido",
      "Extensión de tríceps sobre cabeza con mancuerna"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "45203db7-a428-5372-9bb4-24bdd9fd7cc6",
    "slug": "pushdown_de_triceps_invertido",
    "name": "Pushdown de tríceps invertido",
    "muscle_group": "Tríceps",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Mantené el codo estable y controlá la vuelta.",
    "movement_pattern": "Extensión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para tríceps y cierre del empuje.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pushdown de tríceps invertido"
    ],
    "variations": [
      "Pushdown de tríceps con cuerda",
      "Pushdown de tríceps con barra recta",
      "Pushdown de tríceps unilateral",
      "Extensión de tríceps sobre cabeza con mancuerna"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "32241141-7e48-5a7b-8d29-f32c650ce1a1",
    "slug": "extension_de_triceps_sobre_cabeza_con_mancuerna",
    "name": "Extensión de tríceps sobre cabeza con mancuerna",
    "muscle_group": "Tríceps",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Mancuerna",
    "instructions": "Mantené el codo estable y controlá la vuelta.",
    "movement_pattern": "Extensión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para tríceps y cierre del empuje.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Extensión de tríceps sobre cabeza mancuerna",
      "Extensión de tríceps sobre cabeza"
    ],
    "variations": [
      "Pushdown de tríceps con cuerda",
      "Pushdown de tríceps con barra recta",
      "Pushdown de tríceps unilateral",
      "Pushdown de tríceps invertido"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "f71d23fb-7a63-5e89-a84f-55bf91c114c6",
    "slug": "extension_de_triceps_sobre_cabeza_en_polea",
    "name": "Extensión de tríceps sobre cabeza en polea",
    "muscle_group": "Tríceps",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Mantené el codo estable y controlá la vuelta.",
    "movement_pattern": "Extensión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para tríceps y cierre del empuje.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Extensión de tríceps sobre cabeza en polea"
    ],
    "variations": [
      "Pushdown de tríceps con cuerda",
      "Pushdown de tríceps con barra recta",
      "Pushdown de tríceps unilateral",
      "Pushdown de tríceps invertido"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "8fdee418-dfc4-5ca6-86fe-d0bdd0e7a3bc",
    "slug": "extension_de_triceps_con_banda",
    "name": "Extensión de tríceps con banda",
    "muscle_group": "Tríceps",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Banda",
    "instructions": "Mantené el codo estable y controlá la vuelta.",
    "movement_pattern": "Extensión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para tríceps y cierre del empuje.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Extensión de tríceps banda",
      "Extensión de tríceps"
    ],
    "variations": [
      "Pushdown de tríceps con cuerda",
      "Pushdown de tríceps con barra recta",
      "Pushdown de tríceps unilateral",
      "Pushdown de tríceps invertido"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "c49134d9-dda5-5e4a-b807-511f2f905a69",
    "slug": "rompecraneos_con_barra_ez",
    "name": "Rompecráneos con barra EZ",
    "muscle_group": "Tríceps",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Barra",
    "instructions": "Mantené el codo estable y controlá la vuelta.",
    "movement_pattern": "Extensión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para tríceps y cierre del empuje.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Rompecráneos barra EZ",
      "Rompecráneos"
    ],
    "variations": [
      "Pushdown de tríceps con cuerda",
      "Pushdown de tríceps con barra recta",
      "Pushdown de tríceps unilateral",
      "Pushdown de tríceps invertido"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "5bfd73a8-5767-57ff-8f64-3c8a78add455",
    "slug": "rompecraneos_con_mancuernas",
    "name": "Rompecráneos con mancuernas",
    "muscle_group": "Tríceps",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Mancuernas",
    "instructions": "Mantené el codo estable y controlá la vuelta.",
    "movement_pattern": "Extensión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para tríceps y cierre del empuje.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Rompecráneos mancuernas",
      "Rompecráneos"
    ],
    "variations": [
      "Pushdown de tríceps con cuerda",
      "Pushdown de tríceps con barra recta",
      "Pushdown de tríceps unilateral",
      "Pushdown de tríceps invertido"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "b1a9ab01-a20e-5cfc-a04b-b72362a75b64",
    "slug": "press_frances_sentado",
    "name": "Press francés sentado",
    "muscle_group": "Tríceps",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Mantené el codo estable y controlá la vuelta.",
    "movement_pattern": "Extensión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para tríceps y cierre del empuje.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press francés sentado"
    ],
    "variations": [
      "Pushdown de tríceps con cuerda",
      "Pushdown de tríceps con barra recta",
      "Pushdown de tríceps unilateral",
      "Pushdown de tríceps invertido"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "f52dc7ed-ef7b-51c2-bdce-e5b2fce2a60f",
    "slug": "press_frances_acostado",
    "name": "Press francés acostado",
    "muscle_group": "Tríceps",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Mantené el codo estable y controlá la vuelta.",
    "movement_pattern": "Extensión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para tríceps y cierre del empuje.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press francés acostado"
    ],
    "variations": [
      "Pushdown de tríceps con cuerda",
      "Pushdown de tríceps con barra recta",
      "Pushdown de tríceps unilateral",
      "Pushdown de tríceps invertido"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "7d1c5e6d-3b72-5f35-96b6-541e34f0852b",
    "slug": "kickback_de_triceps_con_mancuerna",
    "name": "Kickback de tríceps con mancuerna",
    "muscle_group": "Tríceps",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Mancuerna",
    "instructions": "Mantené el codo estable y controlá la vuelta.",
    "movement_pattern": "Extensión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para tríceps y cierre del empuje.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Kickback de tríceps mancuerna",
      "Kickback de tríceps"
    ],
    "variations": [
      "Pushdown de tríceps con cuerda",
      "Pushdown de tríceps con barra recta",
      "Pushdown de tríceps unilateral",
      "Pushdown de tríceps invertido"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "9522f44a-4a4b-5f88-976b-c79856f8ffe3",
    "slug": "kickback_de_triceps_en_polea",
    "name": "Kickback de tríceps en polea",
    "muscle_group": "Tríceps",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Mantené el codo estable y controlá la vuelta.",
    "movement_pattern": "Extensión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para tríceps y cierre del empuje.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Kickback de tríceps en polea"
    ],
    "variations": [
      "Pushdown de tríceps con cuerda",
      "Pushdown de tríceps con barra recta",
      "Pushdown de tríceps unilateral",
      "Pushdown de tríceps invertido"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "26dd0cc9-cd29-5d43-9b8c-72e9c927fb6a",
    "slug": "fondos_cerrados_para_triceps",
    "name": "Fondos cerrados para tríceps",
    "muscle_group": "Tríceps",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Mantené el codo estable y controlá la vuelta.",
    "movement_pattern": "Extensión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para tríceps y cierre del empuje.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Fondos cerrados para tríceps"
    ],
    "variations": [
      "Pushdown de tríceps con cuerda",
      "Pushdown de tríceps con barra recta",
      "Pushdown de tríceps unilateral",
      "Pushdown de tríceps invertido"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "5979f5ba-3e8f-55b4-acd9-7623fd3abf45",
    "slug": "extension_jm_press",
    "name": "Extensión JM press",
    "muscle_group": "Tríceps",
    "muscles_secondary": [
      "Hombros"
    ],
    "equipment": "Polea",
    "instructions": "Mantené el codo estable y controlá la vuelta.",
    "movement_pattern": "Extensión de codo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para tríceps y cierre del empuje.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Extensión JM press"
    ],
    "variations": [
      "Pushdown de tríceps con cuerda",
      "Pushdown de tríceps con barra recta",
      "Pushdown de tríceps unilateral",
      "Pushdown de tríceps invertido"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "6fab3ac3-aa88-5970-921e-651b2ffa095a",
    "slug": "sentadilla_con_barra",
    "name": "Sentadilla con barra",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Enraizá el pie y seguí la línea de la rodilla.",
    "movement_pattern": "Sentadilla",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Dominante de rodilla para fuerza y masa en piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentadilla barra",
      "Sentadilla"
    ],
    "variations": [
      "Sentadilla con mancuernas",
      "Sentadilla goblet",
      "Sentadilla en multipower",
      "Sentadilla con pausa"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "41029993-e793-56b7-b7a8-08e2115f3cf3",
    "slug": "sentadilla_con_mancuernas",
    "name": "Sentadilla con mancuernas",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Mancuernas",
    "instructions": "Enraizá el pie y seguí la línea de la rodilla.",
    "movement_pattern": "Sentadilla",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Dominante de rodilla para fuerza y masa en piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentadilla mancuernas",
      "Sentadilla"
    ],
    "variations": [
      "Sentadilla con barra",
      "Sentadilla goblet",
      "Sentadilla en multipower",
      "Sentadilla con pausa"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "bece1220-5689-5f42-b8b9-429e2b7b6135",
    "slug": "sentadilla_goblet",
    "name": "Sentadilla goblet",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Enraizá el pie y seguí la línea de la rodilla.",
    "movement_pattern": "Sentadilla",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Dominante de rodilla para fuerza y masa en piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentadilla goblet"
    ],
    "variations": [
      "Sentadilla con barra",
      "Sentadilla con mancuernas",
      "Sentadilla en multipower",
      "Sentadilla con pausa"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "e4039641-970c-5347-bfb8-1721c7ae228d",
    "slug": "sentadilla_en_multipower",
    "name": "Sentadilla en multipower",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Multipower",
    "instructions": "Enraizá el pie y seguí la línea de la rodilla.",
    "movement_pattern": "Sentadilla",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Dominante de rodilla para fuerza y masa en piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentadilla en multipower"
    ],
    "variations": [
      "Sentadilla con barra",
      "Sentadilla con mancuernas",
      "Sentadilla goblet",
      "Sentadilla con pausa"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "fb66d16a-0564-537e-aec2-e4ae3a355f17",
    "slug": "sentadilla_con_pausa",
    "name": "Sentadilla con pausa",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Enraizá el pie y seguí la línea de la rodilla.",
    "movement_pattern": "Sentadilla",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Dominante de rodilla para fuerza y masa en piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentadilla pausa",
      "Sentadilla"
    ],
    "variations": [
      "Sentadilla con barra",
      "Sentadilla con mancuernas",
      "Sentadilla goblet",
      "Sentadilla en multipower"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "23c53308-a1af-52e6-9784-592b93da9f1e",
    "slug": "sentadilla_tempo",
    "name": "Sentadilla tempo",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Enraizá el pie y seguí la línea de la rodilla.",
    "movement_pattern": "Sentadilla",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Dominante de rodilla para fuerza y masa en piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentadilla tempo"
    ],
    "variations": [
      "Sentadilla con barra",
      "Sentadilla con mancuernas",
      "Sentadilla goblet",
      "Sentadilla en multipower"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "3ed38bb6-a7d5-57b5-a775-4c8cfa4caf0f",
    "slug": "sentadilla_box",
    "name": "Sentadilla box",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Enraizá el pie y seguí la línea de la rodilla.",
    "movement_pattern": "Sentadilla",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Dominante de rodilla para fuerza y masa en piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentadilla box"
    ],
    "variations": [
      "Sentadilla con barra",
      "Sentadilla con mancuernas",
      "Sentadilla goblet",
      "Sentadilla en multipower"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "c6ac787c-7a01-5421-955c-00cb342b03ca",
    "slug": "sentadilla_frontal_con_barra",
    "name": "Sentadilla frontal con barra",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Enraizá el pie y seguí la línea de la rodilla.",
    "movement_pattern": "Sentadilla",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Dominante de rodilla para fuerza y masa en piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentadilla frontal barra",
      "Sentadilla frontal"
    ],
    "variations": [
      "Sentadilla con barra",
      "Sentadilla con mancuernas",
      "Sentadilla goblet",
      "Sentadilla en multipower"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "e864c95e-a969-5c84-a537-2db3227a591f",
    "slug": "sentadilla_frontal_con_mancuernas",
    "name": "Sentadilla frontal con mancuernas",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Mancuernas",
    "instructions": "Enraizá el pie y seguí la línea de la rodilla.",
    "movement_pattern": "Sentadilla",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Dominante de rodilla para fuerza y masa en piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentadilla frontal mancuernas",
      "Sentadilla frontal"
    ],
    "variations": [
      "Sentadilla con barra",
      "Sentadilla con mancuernas",
      "Sentadilla goblet",
      "Sentadilla en multipower"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "63a74b89-f293-58b1-b187-dbda3cc6c9ff",
    "slug": "sentadilla_frontal_en_multipower",
    "name": "Sentadilla frontal en multipower",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Multipower",
    "instructions": "Enraizá el pie y seguí la línea de la rodilla.",
    "movement_pattern": "Sentadilla",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Dominante de rodilla para fuerza y masa en piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentadilla frontal en multipower"
    ],
    "variations": [
      "Sentadilla con barra",
      "Sentadilla con mancuernas",
      "Sentadilla goblet",
      "Sentadilla en multipower"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "492620a5-57d3-517a-8fac-9667dc6e16b8",
    "slug": "sentadilla_zercher_con_barra",
    "name": "Sentadilla Zercher con barra",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Enraizá el pie y seguí la línea de la rodilla.",
    "movement_pattern": "Sentadilla",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Dominante de rodilla para fuerza y masa en piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentadilla Zercher barra",
      "Sentadilla Zercher"
    ],
    "variations": [
      "Sentadilla con barra",
      "Sentadilla con mancuernas",
      "Sentadilla goblet",
      "Sentadilla en multipower"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "d5cf68f3-db40-5373-8ed0-bb288de3b716",
    "slug": "hack_squat_en_maquina",
    "name": "Hack squat en máquina",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Máquina",
    "instructions": "Enraizá el pie y seguí la línea de la rodilla.",
    "movement_pattern": "Sentadilla",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Dominante de rodilla para fuerza y masa en piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Hack squat en máquina"
    ],
    "variations": [
      "Sentadilla con barra",
      "Sentadilla con mancuernas",
      "Sentadilla goblet",
      "Sentadilla en multipower"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "4d62abd9-722d-5d06-becb-c642a0282f48",
    "slug": "hack_squat_con_barra",
    "name": "Hack squat con barra",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Enraizá el pie y seguí la línea de la rodilla.",
    "movement_pattern": "Sentadilla",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Dominante de rodilla para fuerza y masa en piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Hack squat barra",
      "Hack squat"
    ],
    "variations": [
      "Sentadilla con barra",
      "Sentadilla con mancuernas",
      "Sentadilla goblet",
      "Sentadilla en multipower"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "6a3e8203-1555-5135-8da1-52fac61fcaa1",
    "slug": "prensa_de_piernas_alta",
    "name": "Prensa de piernas alta",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Enraizá el pie y seguí la línea de la rodilla.",
    "movement_pattern": "Sentadilla",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Dominante de rodilla para fuerza y masa en piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Prensa de piernas alta"
    ],
    "variations": [
      "Sentadilla con barra",
      "Sentadilla con mancuernas",
      "Sentadilla goblet",
      "Sentadilla en multipower"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "93335fab-41d3-5303-8fa5-f90baadd178c",
    "slug": "prensa_de_piernas_baja",
    "name": "Prensa de piernas baja",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Enraizá el pie y seguí la línea de la rodilla.",
    "movement_pattern": "Sentadilla",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Dominante de rodilla para fuerza y masa en piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Prensa de piernas baja"
    ],
    "variations": [
      "Sentadilla con barra",
      "Sentadilla con mancuernas",
      "Sentadilla goblet",
      "Sentadilla en multipower"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "af144de2-9fff-57e6-bcd5-340073d519d4",
    "slug": "prensa_de_piernas_unilateral",
    "name": "Prensa de piernas unilateral",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Enraizá el pie y seguí la línea de la rodilla.",
    "movement_pattern": "Sentadilla",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Dominante de rodilla para fuerza y masa en piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Prensa de piernas unilateral"
    ],
    "variations": [
      "Sentadilla con barra",
      "Sentadilla con mancuernas",
      "Sentadilla goblet",
      "Sentadilla en multipower"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "9982b3f8-7901-502b-b28f-7c5af4802714",
    "slug": "prensa_de_piernas_con_pausa",
    "name": "Prensa de piernas con pausa",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Enraizá el pie y seguí la línea de la rodilla.",
    "movement_pattern": "Sentadilla",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Dominante de rodilla para fuerza y masa en piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Prensa de piernas pausa",
      "Prensa de piernas"
    ],
    "variations": [
      "Sentadilla con barra",
      "Sentadilla con mancuernas",
      "Sentadilla goblet",
      "Sentadilla en multipower"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "4689ad06-9711-588d-9f95-bdeaddc6454a",
    "slug": "prensa_de_piernas_tempo",
    "name": "Prensa de piernas tempo",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Enraizá el pie y seguí la línea de la rodilla.",
    "movement_pattern": "Sentadilla",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Dominante de rodilla para fuerza y masa en piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Prensa de piernas tempo"
    ],
    "variations": [
      "Sentadilla con barra",
      "Sentadilla con mancuernas",
      "Sentadilla goblet",
      "Sentadilla en multipower"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "03c45baa-2bf4-5470-86f2-bd8bbd43c3ee",
    "slug": "zancada_caminando_con_mancuernas",
    "name": "Zancada caminando con mancuernas",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Mancuernas",
    "instructions": "Controlá la pelvis y empujá el suelo con la pierna de trabajo.",
    "movement_pattern": "Lunge",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo unilateral para estabilidad y volumen útil.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Zancada caminando mancuernas",
      "Zancada caminando"
    ],
    "variations": [
      "Zancada caminando con barra",
      "Zancada hacia atrás con mancuernas",
      "Zancada hacia atrás con barra",
      "Zancada adelante con mancuernas"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "83c0f6c0-b143-5291-a460-a8564e42edbe",
    "slug": "zancada_caminando_con_barra",
    "name": "Zancada caminando con barra",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Controlá la pelvis y empujá el suelo con la pierna de trabajo.",
    "movement_pattern": "Lunge",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo unilateral para estabilidad y volumen útil.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Zancada caminando barra",
      "Zancada caminando"
    ],
    "variations": [
      "Zancada caminando con mancuernas",
      "Zancada hacia atrás con mancuernas",
      "Zancada hacia atrás con barra",
      "Zancada adelante con mancuernas"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "68d4d7f0-0c1e-560f-9b39-ffa73136a768",
    "slug": "zancada_hacia_atras_con_mancuernas",
    "name": "Zancada hacia atrás con mancuernas",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Mancuernas",
    "instructions": "Controlá la pelvis y empujá el suelo con la pierna de trabajo.",
    "movement_pattern": "Lunge",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo unilateral para estabilidad y volumen útil.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Zancada hacia atrás mancuernas",
      "Zancada hacia atrás"
    ],
    "variations": [
      "Zancada caminando con mancuernas",
      "Zancada caminando con barra",
      "Zancada hacia atrás con barra",
      "Zancada adelante con mancuernas"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "3733c230-7faa-54e0-bc4b-679dc6f05d51",
    "slug": "zancada_hacia_atras_con_barra",
    "name": "Zancada hacia atrás con barra",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Controlá la pelvis y empujá el suelo con la pierna de trabajo.",
    "movement_pattern": "Lunge",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo unilateral para estabilidad y volumen útil.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Zancada hacia atrás barra",
      "Zancada hacia atrás"
    ],
    "variations": [
      "Zancada caminando con mancuernas",
      "Zancada caminando con barra",
      "Zancada hacia atrás con mancuernas",
      "Zancada adelante con mancuernas"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "e891b9ae-b912-520e-990d-6c582a0ea8d8",
    "slug": "zancada_adelante_con_mancuernas",
    "name": "Zancada adelante con mancuernas",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Mancuernas",
    "instructions": "Controlá la pelvis y empujá el suelo con la pierna de trabajo.",
    "movement_pattern": "Lunge",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo unilateral para estabilidad y volumen útil.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Zancada adelante mancuernas",
      "Zancada adelante"
    ],
    "variations": [
      "Zancada caminando con mancuernas",
      "Zancada caminando con barra",
      "Zancada hacia atrás con mancuernas",
      "Zancada hacia atrás con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "538d6dc8-3439-5014-855a-698c95467138",
    "slug": "zancada_adelante_con_barra",
    "name": "Zancada adelante con barra",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Controlá la pelvis y empujá el suelo con la pierna de trabajo.",
    "movement_pattern": "Lunge",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo unilateral para estabilidad y volumen útil.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Zancada adelante barra",
      "Zancada adelante"
    ],
    "variations": [
      "Zancada caminando con mancuernas",
      "Zancada caminando con barra",
      "Zancada hacia atrás con mancuernas",
      "Zancada hacia atrás con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "a51a6b47-0ac1-5589-b8a8-9be6be227fea",
    "slug": "split_squat_bulgaro_con_mancuernas",
    "name": "Split squat búlgaro con mancuernas",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Mancuernas",
    "instructions": "Controlá la pelvis y empujá el suelo con la pierna de trabajo.",
    "movement_pattern": "Lunge",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo unilateral para estabilidad y volumen útil.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Split squat búlgaro mancuernas",
      "Split squat búlgaro"
    ],
    "variations": [
      "Zancada caminando con mancuernas",
      "Zancada caminando con barra",
      "Zancada hacia atrás con mancuernas",
      "Zancada hacia atrás con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "e10bdf2a-c590-56bb-8807-d656e23965fb",
    "slug": "split_squat_bulgaro_con_barra",
    "name": "Split squat búlgaro con barra",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Controlá la pelvis y empujá el suelo con la pierna de trabajo.",
    "movement_pattern": "Lunge",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo unilateral para estabilidad y volumen útil.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Split squat búlgaro barra",
      "Split squat búlgaro"
    ],
    "variations": [
      "Zancada caminando con mancuernas",
      "Zancada caminando con barra",
      "Zancada hacia atrás con mancuernas",
      "Zancada hacia atrás con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "96fa36cc-1a8c-5acc-870e-752cfc14912e",
    "slug": "split_squat_bulgaro_con_pausa",
    "name": "Split squat búlgaro con pausa",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Mancuernas",
    "instructions": "Controlá la pelvis y empujá el suelo con la pierna de trabajo.",
    "movement_pattern": "Lunge",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo unilateral para estabilidad y volumen útil.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Split squat búlgaro pausa",
      "Split squat búlgaro"
    ],
    "variations": [
      "Zancada caminando con mancuernas",
      "Zancada caminando con barra",
      "Zancada hacia atrás con mancuernas",
      "Zancada hacia atrás con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "1384442e-b276-5617-97b6-60c28be5e9a5",
    "slug": "step_up_con_mancuernas",
    "name": "Step-up con mancuernas",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Mancuernas",
    "instructions": "Controlá la pelvis y empujá el suelo con la pierna de trabajo.",
    "movement_pattern": "Lunge",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo unilateral para estabilidad y volumen útil.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Step-up mancuernas",
      "Step-up"
    ],
    "variations": [
      "Zancada caminando con mancuernas",
      "Zancada caminando con barra",
      "Zancada hacia atrás con mancuernas",
      "Zancada hacia atrás con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "84c09cc6-5d02-5727-bbd8-29b5e930c248",
    "slug": "step_up_con_barra",
    "name": "Step-up con barra",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Controlá la pelvis y empujá el suelo con la pierna de trabajo.",
    "movement_pattern": "Lunge",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo unilateral para estabilidad y volumen útil.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Step-up barra",
      "Step-up"
    ],
    "variations": [
      "Zancada caminando con mancuernas",
      "Zancada caminando con barra",
      "Zancada hacia atrás con mancuernas",
      "Zancada hacia atrás con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "a209e389-8d0f-5e55-bb7a-564411d81267",
    "slug": "step_up_lateral",
    "name": "Step-up lateral",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Step",
    "instructions": "Controlá la pelvis y empujá el suelo con la pierna de trabajo.",
    "movement_pattern": "Lunge",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo unilateral para estabilidad y volumen útil.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Step-up lateral"
    ],
    "variations": [
      "Zancada caminando con mancuernas",
      "Zancada caminando con barra",
      "Zancada hacia atrás con mancuernas",
      "Zancada hacia atrás con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "ecb48436-8acd-57d7-b458-7925e1fd39f2",
    "slug": "sentadilla_lateral_con_mancuerna",
    "name": "Sentadilla lateral con mancuerna",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Mancuerna",
    "instructions": "Controlá la pelvis y empujá el suelo con la pierna de trabajo.",
    "movement_pattern": "Lunge",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo unilateral para estabilidad y volumen útil.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentadilla lateral mancuerna",
      "Sentadilla lateral"
    ],
    "variations": [
      "Zancada caminando con mancuernas",
      "Zancada caminando con barra",
      "Zancada hacia atrás con mancuernas",
      "Zancada hacia atrás con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "932e34b3-3e80-5770-b04b-7b07abb2cf36",
    "slug": "sentadilla_lateral_con_kettlebell",
    "name": "Sentadilla lateral con kettlebell",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Kettlebell",
    "instructions": "Controlá la pelvis y empujá el suelo con la pierna de trabajo.",
    "movement_pattern": "Lunge",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo unilateral para estabilidad y volumen útil.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentadilla lateral kettlebell",
      "Sentadilla lateral"
    ],
    "variations": [
      "Zancada caminando con mancuernas",
      "Zancada caminando con barra",
      "Zancada hacia atrás con mancuernas",
      "Zancada hacia atrás con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "7d55cc5a-a66f-5314-a516-41ae6e6b980e",
    "slug": "patinador_lateral_controlado",
    "name": "Patinador lateral controlado",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Core"
    ],
    "equipment": "Mancuernas",
    "instructions": "Controlá la pelvis y empujá el suelo con la pierna de trabajo.",
    "movement_pattern": "Lunge",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Trabajo unilateral para estabilidad y volumen útil.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Patinador lateral controlado"
    ],
    "variations": [
      "Zancada caminando con mancuernas",
      "Zancada caminando con barra",
      "Zancada hacia atrás con mancuernas",
      "Zancada hacia atrás con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "c0af26a4-16cc-5bb3-b42f-e3c91e8324f6",
    "slug": "peso_muerto_con_barra",
    "name": "Peso muerto con barra",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Llevá la cadera atrás y mantené la espalda larga.",
    "movement_pattern": "Bisagra",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Bisagra para cadena posterior y potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Peso muerto barra",
      "Peso muerto"
    ],
    "variations": [
      "Peso muerto con mancuernas",
      "Peso muerto en trap bar",
      "Peso muerto sumo con barra",
      "Peso muerto con pausa"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "ead33bd7-595e-52f7-9540-8258c5f92186",
    "slug": "peso_muerto_con_mancuernas",
    "name": "Peso muerto con mancuernas",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Espalda"
    ],
    "equipment": "Mancuernas",
    "instructions": "Llevá la cadera atrás y mantené la espalda larga.",
    "movement_pattern": "Bisagra",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Bisagra para cadena posterior y potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Peso muerto mancuernas",
      "Peso muerto"
    ],
    "variations": [
      "Peso muerto con barra",
      "Peso muerto en trap bar",
      "Peso muerto sumo con barra",
      "Peso muerto con pausa"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "4cf9cba6-eaa8-5b3d-80f5-cd475d00d7ac",
    "slug": "peso_muerto_en_trap_bar",
    "name": "Peso muerto en trap bar",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Llevá la cadera atrás y mantené la espalda larga.",
    "movement_pattern": "Bisagra",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Bisagra para cadena posterior y potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Peso muerto en trap bar"
    ],
    "variations": [
      "Peso muerto con barra",
      "Peso muerto con mancuernas",
      "Peso muerto sumo con barra",
      "Peso muerto con pausa"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "89cb4d1d-7b9e-5968-9711-f5682008a311",
    "slug": "peso_muerto_sumo_con_barra",
    "name": "Peso muerto sumo con barra",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Llevá la cadera atrás y mantené la espalda larga.",
    "movement_pattern": "Bisagra",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Bisagra para cadena posterior y potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Peso muerto sumo barra",
      "Peso muerto sumo"
    ],
    "variations": [
      "Peso muerto con barra",
      "Peso muerto con mancuernas",
      "Peso muerto en trap bar",
      "Peso muerto con pausa"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "ad6bb859-d8d9-5beb-ae6d-818494d7cf03",
    "slug": "peso_muerto_con_pausa",
    "name": "Peso muerto con pausa",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Llevá la cadera atrás y mantené la espalda larga.",
    "movement_pattern": "Bisagra",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Bisagra para cadena posterior y potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Peso muerto pausa",
      "Peso muerto"
    ],
    "variations": [
      "Peso muerto con barra",
      "Peso muerto con mancuernas",
      "Peso muerto en trap bar",
      "Peso muerto sumo con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "a8aeba2b-97e5-5981-96a9-3dacc4640647",
    "slug": "peso_muerto_desde_bloques",
    "name": "Peso muerto desde bloques",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Llevá la cadera atrás y mantené la espalda larga.",
    "movement_pattern": "Bisagra",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Bisagra para cadena posterior y potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Peso muerto desde bloques"
    ],
    "variations": [
      "Peso muerto con barra",
      "Peso muerto con mancuernas",
      "Peso muerto en trap bar",
      "Peso muerto sumo con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "42a8879c-d1d2-55de-a64d-c4045e5a019a",
    "slug": "peso_muerto_rumano_con_barra",
    "name": "Peso muerto rumano con barra",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Llevá la cadera atrás y mantené la espalda larga.",
    "movement_pattern": "Bisagra",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Bisagra para cadena posterior y potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Peso muerto rumano barra",
      "Peso muerto rumano"
    ],
    "variations": [
      "Peso muerto con barra",
      "Peso muerto con mancuernas",
      "Peso muerto en trap bar",
      "Peso muerto sumo con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "32db51df-570e-5d84-9227-dff4a4afc132",
    "slug": "peso_muerto_rumano_con_mancuernas",
    "name": "Peso muerto rumano con mancuernas",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Espalda"
    ],
    "equipment": "Mancuernas",
    "instructions": "Llevá la cadera atrás y mantené la espalda larga.",
    "movement_pattern": "Bisagra",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Bisagra para cadena posterior y potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Peso muerto rumano mancuernas",
      "Peso muerto rumano"
    ],
    "variations": [
      "Peso muerto con barra",
      "Peso muerto con mancuernas",
      "Peso muerto en trap bar",
      "Peso muerto sumo con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "f6ab8df3-4740-54d8-ba5e-dd9345cbcb89",
    "slug": "peso_muerto_rumano_unilateral",
    "name": "Peso muerto rumano unilateral",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Llevá la cadera atrás y mantené la espalda larga.",
    "movement_pattern": "Bisagra",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Bisagra para cadena posterior y potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Peso muerto rumano unilateral"
    ],
    "variations": [
      "Peso muerto con barra",
      "Peso muerto con mancuernas",
      "Peso muerto en trap bar",
      "Peso muerto sumo con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "23f45c2e-20d1-5db7-a021-a1e856be1969",
    "slug": "peso_muerto_rumano_con_kettlebell",
    "name": "Peso muerto rumano con kettlebell",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Espalda"
    ],
    "equipment": "Kettlebell",
    "instructions": "Llevá la cadera atrás y mantené la espalda larga.",
    "movement_pattern": "Bisagra",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Bisagra para cadena posterior y potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Peso muerto rumano kettlebell",
      "Peso muerto rumano"
    ],
    "variations": [
      "Peso muerto con barra",
      "Peso muerto con mancuernas",
      "Peso muerto en trap bar",
      "Peso muerto sumo con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "346e39d3-b157-503f-b3d3-8e89f5444c06",
    "slug": "buenos_dias_con_barra",
    "name": "Buenos días con barra",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Llevá la cadera atrás y mantené la espalda larga.",
    "movement_pattern": "Bisagra",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Bisagra para cadena posterior y potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Buenos días barra",
      "Buenos días"
    ],
    "variations": [
      "Peso muerto con barra",
      "Peso muerto con mancuernas",
      "Peso muerto en trap bar",
      "Peso muerto sumo con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "70fb1b79-b1c1-5ea1-bf74-8d85b78b7f48",
    "slug": "buenos_dias_con_banda",
    "name": "Buenos días con banda",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Espalda"
    ],
    "equipment": "Banda",
    "instructions": "Llevá la cadera atrás y mantené la espalda larga.",
    "movement_pattern": "Bisagra",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Bisagra para cadena posterior y potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Buenos días banda",
      "Buenos días"
    ],
    "variations": [
      "Peso muerto con barra",
      "Peso muerto con mancuernas",
      "Peso muerto en trap bar",
      "Peso muerto sumo con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "a98c3d9d-cf0c-5e13-a728-b08e84865611",
    "slug": "pull_through_en_polea",
    "name": "Pull-through en polea",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Espalda"
    ],
    "equipment": "Polea",
    "instructions": "Llevá la cadera atrás y mantené la espalda larga.",
    "movement_pattern": "Bisagra",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Bisagra para cadena posterior y potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pull-through en polea"
    ],
    "variations": [
      "Peso muerto con barra",
      "Peso muerto con mancuernas",
      "Peso muerto en trap bar",
      "Peso muerto sumo con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "17b034b2-2a85-5d04-a323-41a7d642f786",
    "slug": "pull_through_con_banda",
    "name": "Pull-through con banda",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Espalda"
    ],
    "equipment": "Banda",
    "instructions": "Llevá la cadera atrás y mantené la espalda larga.",
    "movement_pattern": "Bisagra",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Bisagra para cadena posterior y potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pull-through banda",
      "Pull-through"
    ],
    "variations": [
      "Peso muerto con barra",
      "Peso muerto con mancuernas",
      "Peso muerto en trap bar",
      "Peso muerto sumo con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "cfcba048-3831-5b4f-977c-a31b11808eed",
    "slug": "buenos_dias_sentado_con_banda",
    "name": "Buenos días sentado con banda",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Glúteos",
      "Espalda"
    ],
    "equipment": "Banda",
    "instructions": "Llevá la cadera atrás y mantené la espalda larga.",
    "movement_pattern": "Bisagra",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Bisagra para cadena posterior y potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Buenos días sentado banda",
      "Buenos días sentado"
    ],
    "variations": [
      "Peso muerto con barra",
      "Peso muerto con mancuernas",
      "Peso muerto en trap bar",
      "Peso muerto sumo con barra"
    ],
    "contraindications": [
      "Dolor lumbar agudo",
      "Molestia articular creciente en rodilla o cadera"
    ]
  },
  {
    "id": "ffac29f2-7f28-52b2-88a4-351ad764f3b9",
    "slug": "hip_thrust_con_barra",
    "name": "Hip thrust con barra",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Hip thrust barra",
      "Hip thrust"
    ],
    "variations": [
      "Hip thrust con mancuernas",
      "Hip thrust en máquina",
      "Hip thrust unilateral",
      "Hip thrust con pausa"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "4532c8d9-ff15-5a66-98a7-45836dd33be3",
    "slug": "hip_thrust_con_mancuernas",
    "name": "Hip thrust con mancuernas",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Mancuernas",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Hip thrust mancuernas",
      "Hip thrust"
    ],
    "variations": [
      "Hip thrust con barra",
      "Hip thrust en máquina",
      "Hip thrust unilateral",
      "Hip thrust con pausa"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "f5e62db8-a65a-519e-bac1-bb0aeeab326b",
    "slug": "hip_thrust_en_maquina",
    "name": "Hip thrust en máquina",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Máquina",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Hip thrust en máquina"
    ],
    "variations": [
      "Hip thrust con barra",
      "Hip thrust con mancuernas",
      "Hip thrust unilateral",
      "Hip thrust con pausa"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "3c570823-d625-596a-9f54-3a0688531ffc",
    "slug": "hip_thrust_unilateral",
    "name": "Hip thrust unilateral",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Hip thrust unilateral"
    ],
    "variations": [
      "Hip thrust con barra",
      "Hip thrust con mancuernas",
      "Hip thrust en máquina",
      "Hip thrust con pausa"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "26bcb885-e9a6-5e14-8613-8593a867298c",
    "slug": "hip_thrust_con_pausa",
    "name": "Hip thrust con pausa",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Hip thrust pausa",
      "Hip thrust"
    ],
    "variations": [
      "Hip thrust con barra",
      "Hip thrust con mancuernas",
      "Hip thrust en máquina",
      "Hip thrust unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "3e1bdcad-1fd0-5128-b5f3-7c2155e74af1",
    "slug": "puente_de_gluteo_con_barra",
    "name": "Puente de glúteo con barra",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Puente de glúteo barra",
      "Puente de glúteo"
    ],
    "variations": [
      "Hip thrust con barra",
      "Hip thrust con mancuernas",
      "Hip thrust en máquina",
      "Hip thrust unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "ae56cc4d-407d-5f02-8483-793fcab596cd",
    "slug": "puente_de_gluteo_con_banda",
    "name": "Puente de glúteo con banda",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Banda",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Puente de glúteo banda",
      "Puente de glúteo"
    ],
    "variations": [
      "Hip thrust con barra",
      "Hip thrust con mancuernas",
      "Hip thrust en máquina",
      "Hip thrust unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "14ff07f1-9620-5491-b3ed-45013f9fcffc",
    "slug": "puente_de_gluteo_unilateral",
    "name": "Puente de glúteo unilateral",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Puente de glúteo unilateral"
    ],
    "variations": [
      "Hip thrust con barra",
      "Hip thrust con mancuernas",
      "Hip thrust en máquina",
      "Hip thrust unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "f9105794-5074-5b6a-b57f-09ce9ba540c1",
    "slug": "curl_femoral_acostado_en_maquina",
    "name": "Curl femoral acostado en máquina",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Máquina",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl femoral acostado en máquina"
    ],
    "variations": [
      "Hip thrust con barra",
      "Hip thrust con mancuernas",
      "Hip thrust en máquina",
      "Hip thrust unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "73f43eb4-6078-502b-89bc-b8ff01f95bdf",
    "slug": "curl_femoral_sentado_en_maquina",
    "name": "Curl femoral sentado en máquina",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Máquina",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl femoral sentado en máquina"
    ],
    "variations": [
      "Hip thrust con barra",
      "Hip thrust con mancuernas",
      "Hip thrust en máquina",
      "Hip thrust unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "6b24ac4c-6d89-5ff5-844c-0ef40aa50e92",
    "slug": "curl_femoral_con_fitball",
    "name": "Curl femoral con fitball",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Fitball",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl femoral fitball",
      "Curl femoral"
    ],
    "variations": [
      "Hip thrust con barra",
      "Hip thrust con mancuernas",
      "Hip thrust en máquina",
      "Hip thrust unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "a5e4e466-343c-531f-b556-73716e190799",
    "slug": "curl_femoral_nordico_asistido",
    "name": "Curl femoral nórdico asistido",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl femoral nórdico asistido"
    ],
    "variations": [
      "Hip thrust con barra",
      "Hip thrust con mancuernas",
      "Hip thrust en máquina",
      "Hip thrust unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "3eecc116-4394-575f-b7f6-72bed286aca1",
    "slug": "curl_femoral_nordico",
    "name": "Curl femoral nórdico",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl femoral nórdico"
    ],
    "variations": [
      "Hip thrust con barra",
      "Hip thrust con mancuernas",
      "Hip thrust en máquina",
      "Hip thrust unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "d11dcd5d-4b3f-5c7e-839a-f0189021ced1",
    "slug": "extension_de_cadera_en_banco_romano",
    "name": "Extensión de cadera en banco romano",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Barra",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Extensión de cadera en banco romano"
    ],
    "variations": [
      "Hip thrust con barra",
      "Hip thrust con mancuernas",
      "Hip thrust en máquina",
      "Hip thrust unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "8caf2ae0-942b-5f8f-98c1-59b02644dbe3",
    "slug": "patada_de_gluteo_en_polea",
    "name": "Patada de glúteo en polea",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Polea",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Patada de glúteo en polea"
    ],
    "variations": [
      "Hip thrust con barra",
      "Hip thrust con mancuernas",
      "Hip thrust en máquina",
      "Hip thrust unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "0b9dd01c-a6a3-5aaa-abee-07f7181484d5",
    "slug": "patada_de_gluteo_con_banda",
    "name": "Patada de glúteo con banda",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Banda",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Patada de glúteo banda",
      "Patada de glúteo"
    ],
    "variations": [
      "Hip thrust con barra",
      "Hip thrust con mancuernas",
      "Hip thrust en máquina",
      "Hip thrust unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "03438cf6-6d9c-5b10-b70d-fdc751305ce4",
    "slug": "abduccion_de_cadera_en_maquina",
    "name": "Abducción de cadera en máquina",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Máquina",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Abducción de cadera en máquina"
    ],
    "variations": [
      "Hip thrust con barra",
      "Hip thrust con mancuernas",
      "Hip thrust en máquina",
      "Hip thrust unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "bf0dd0b4-c306-5c50-9f12-2bbdda7381e9",
    "slug": "abduccion_de_cadera_con_banda",
    "name": "Abducción de cadera con banda",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Banda",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Abducción de cadera banda",
      "Abducción de cadera"
    ],
    "variations": [
      "Hip thrust con barra",
      "Hip thrust con mancuernas",
      "Hip thrust en máquina",
      "Hip thrust unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "51a14dec-aab3-5900-9185-8cc05d50027f",
    "slug": "monster_walk_con_banda",
    "name": "Monster walk con banda",
    "muscle_group": "Glúteos",
    "muscles_secondary": [
      "Isquios",
      "Core"
    ],
    "equipment": "Banda",
    "instructions": "Buscá rango útil y apretá glúteos arriba.",
    "movement_pattern": "Extensión de cadera",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Glúteos e isquios para más fuerza y estabilidad de cadera.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Monster walk banda",
      "Monster walk"
    ],
    "variations": [
      "Hip thrust con barra",
      "Hip thrust con mancuernas",
      "Hip thrust en máquina",
      "Hip thrust unilateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "8be296ff-77d0-54a2-b1f4-5139293fbbe1",
    "slug": "extension_de_cuadriceps_en_maquina",
    "name": "Extensión de cuádriceps en máquina",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Pantorrillas"
    ],
    "equipment": "Máquina",
    "instructions": "Mové solo la articulación que querés aislar.",
    "movement_pattern": "Aislamiento de pierna",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para cuádriceps, pantorrillas y complementos.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Extensión de cuádriceps en máquina"
    ],
    "variations": [
      "Extensión de cuádriceps unilateral",
      "Sissy squat asistida",
      "Spanish squat con banda",
      "Terminal knee extension con banda"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "f2112d95-acd6-5e25-9191-3af2729bff8c",
    "slug": "extension_de_cuadriceps_unilateral",
    "name": "Extensión de cuádriceps unilateral",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Pantorrillas"
    ],
    "equipment": "Máquina",
    "instructions": "Mové solo la articulación que querés aislar.",
    "movement_pattern": "Aislamiento de pierna",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para cuádriceps, pantorrillas y complementos.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Extensión de cuádriceps unilateral"
    ],
    "variations": [
      "Extensión de cuádriceps en máquina",
      "Sissy squat asistida",
      "Spanish squat con banda",
      "Terminal knee extension con banda"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "b08f6e34-c163-5552-bd9a-6ef328e2ddcb",
    "slug": "sissy_squat_asistida",
    "name": "Sissy squat asistida",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Pantorrillas"
    ],
    "equipment": "Máquina",
    "instructions": "Mové solo la articulación que querés aislar.",
    "movement_pattern": "Aislamiento de pierna",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para cuádriceps, pantorrillas y complementos.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sissy squat asistida"
    ],
    "variations": [
      "Extensión de cuádriceps en máquina",
      "Extensión de cuádriceps unilateral",
      "Spanish squat con banda",
      "Terminal knee extension con banda"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "7a4c72e4-bb77-54fc-a3d8-2db05376e073",
    "slug": "spanish_squat_con_banda",
    "name": "Spanish squat con banda",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Pantorrillas"
    ],
    "equipment": "Banda",
    "instructions": "Mové solo la articulación que querés aislar.",
    "movement_pattern": "Aislamiento de pierna",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para cuádriceps, pantorrillas y complementos.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Spanish squat banda",
      "Spanish squat"
    ],
    "variations": [
      "Extensión de cuádriceps en máquina",
      "Extensión de cuádriceps unilateral",
      "Sissy squat asistida",
      "Terminal knee extension con banda"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "17bfed9c-deb8-5aa0-8962-6d13b5ad0b32",
    "slug": "terminal_knee_extension_con_banda",
    "name": "Terminal knee extension con banda",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Pantorrillas"
    ],
    "equipment": "Banda",
    "instructions": "Mové solo la articulación que querés aislar.",
    "movement_pattern": "Aislamiento de pierna",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para cuádriceps, pantorrillas y complementos.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Terminal knee extension banda",
      "Terminal knee extension"
    ],
    "variations": [
      "Extensión de cuádriceps en máquina",
      "Extensión de cuádriceps unilateral",
      "Sissy squat asistida",
      "Spanish squat con banda"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "ef9feef3-5bef-5e4e-9e20-1f656879a91c",
    "slug": "wall_sit_isometrica",
    "name": "Wall sit isométrica",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Pantorrillas"
    ],
    "equipment": "Máquina",
    "instructions": "Mové solo la articulación que querés aislar.",
    "movement_pattern": "Aislamiento de pierna",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para cuádriceps, pantorrillas y complementos.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Wall sit isométrica"
    ],
    "variations": [
      "Extensión de cuádriceps en máquina",
      "Extensión de cuádriceps unilateral",
      "Sissy squat asistida",
      "Spanish squat con banda"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "80c7b6d3-4fa5-5bf4-89a5-c7430c567825",
    "slug": "elevacion_de_pantorrillas_de_pie",
    "name": "Elevación de pantorrillas de pie",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Pantorrillas"
    ],
    "equipment": "Máquina",
    "instructions": "Mové solo la articulación que querés aislar.",
    "movement_pattern": "Aislamiento de pierna",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para cuádriceps, pantorrillas y complementos.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elevación de pantorrillas de pie"
    ],
    "variations": [
      "Extensión de cuádriceps en máquina",
      "Extensión de cuádriceps unilateral",
      "Sissy squat asistida",
      "Spanish squat con banda"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "8e35486a-3972-5c61-8bbe-35af07b874f4",
    "slug": "elevacion_de_pantorrillas_sentado",
    "name": "Elevación de pantorrillas sentado",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Pantorrillas"
    ],
    "equipment": "Máquina",
    "instructions": "Mové solo la articulación que querés aislar.",
    "movement_pattern": "Aislamiento de pierna",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para cuádriceps, pantorrillas y complementos.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elevación de pantorrillas sentado"
    ],
    "variations": [
      "Extensión de cuádriceps en máquina",
      "Extensión de cuádriceps unilateral",
      "Sissy squat asistida",
      "Spanish squat con banda"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "50b38730-d911-5787-9317-f53ed7bfd1ec",
    "slug": "elevacion_de_pantorrillas_unilateral",
    "name": "Elevación de pantorrillas unilateral",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Pantorrillas"
    ],
    "equipment": "Máquina",
    "instructions": "Mové solo la articulación que querés aislar.",
    "movement_pattern": "Aislamiento de pierna",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para cuádriceps, pantorrillas y complementos.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elevación de pantorrillas unilateral"
    ],
    "variations": [
      "Extensión de cuádriceps en máquina",
      "Extensión de cuádriceps unilateral",
      "Sissy squat asistida",
      "Spanish squat con banda"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "d1a7ace3-0c8c-5fc5-8dc1-0137badedd59",
    "slug": "elevacion_de_pantorrillas_en_prensa",
    "name": "Elevación de pantorrillas en prensa",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Pantorrillas"
    ],
    "equipment": "Máquina",
    "instructions": "Mové solo la articulación que querés aislar.",
    "movement_pattern": "Aislamiento de pierna",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para cuádriceps, pantorrillas y complementos.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elevación de pantorrillas en prensa"
    ],
    "variations": [
      "Extensión de cuádriceps en máquina",
      "Extensión de cuádriceps unilateral",
      "Sissy squat asistida",
      "Spanish squat con banda"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "22cc933b-292d-5b30-8b74-a76b45501544",
    "slug": "tibialis_raise_en_pared",
    "name": "Tibialis raise en pared",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Pantorrillas"
    ],
    "equipment": "Pared",
    "instructions": "Mové solo la articulación que querés aislar.",
    "movement_pattern": "Aislamiento de pierna",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para cuádriceps, pantorrillas y complementos.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Tibialis raise en pared"
    ],
    "variations": [
      "Extensión de cuádriceps en máquina",
      "Extensión de cuádriceps unilateral",
      "Sissy squat asistida",
      "Spanish squat con banda"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "9369fcd2-18a4-57c7-91af-ce6cb8ae8394",
    "slug": "tibialis_raise_con_banda",
    "name": "Tibialis raise con banda",
    "muscle_group": "Piernas",
    "muscles_secondary": [
      "Pantorrillas"
    ],
    "equipment": "Banda",
    "instructions": "Mové solo la articulación que querés aislar.",
    "movement_pattern": "Aislamiento de pierna",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Aislamiento para cuádriceps, pantorrillas y complementos.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Tibialis raise banda",
      "Tibialis raise"
    ],
    "variations": [
      "Extensión de cuádriceps en máquina",
      "Extensión de cuádriceps unilateral",
      "Sissy squat asistida",
      "Spanish squat con banda"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "abee45f4-b1ce-5220-bbd7-21211759d1f5",
    "slug": "plancha_frontal",
    "name": "Plancha frontal",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Hombros",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Respirá con costillas abajo y sostené una columna larga.",
    "movement_pattern": "Anti-extensión",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Core para estabilidad lumbo-pélvica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Plancha frontal"
    ],
    "variations": [
      "Plancha frontal con alcance",
      "Plancha frontal con peso",
      "Plancha frontal tempo",
      "Plancha lateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "7dadeb72-dab9-51f1-ac7c-d9a763b372c5",
    "slug": "plancha_frontal_con_alcance",
    "name": "Plancha frontal con alcance",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Hombros",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Respirá con costillas abajo y sostené una columna larga.",
    "movement_pattern": "Anti-extensión",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Core para estabilidad lumbo-pélvica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Plancha frontal alcance",
      "Plancha frontal"
    ],
    "variations": [
      "Plancha frontal",
      "Plancha frontal con peso",
      "Plancha frontal tempo",
      "Plancha lateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "2171b198-0dd3-558e-b56e-a26974e51418",
    "slug": "plancha_frontal_con_peso",
    "name": "Plancha frontal con peso",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Hombros",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Respirá con costillas abajo y sostené una columna larga.",
    "movement_pattern": "Anti-extensión",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Core para estabilidad lumbo-pélvica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Plancha frontal peso",
      "Plancha frontal"
    ],
    "variations": [
      "Plancha frontal",
      "Plancha frontal con alcance",
      "Plancha frontal tempo",
      "Plancha lateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "b1b55235-b88d-5fbc-9115-65becf3a64f9",
    "slug": "plancha_frontal_tempo",
    "name": "Plancha frontal tempo",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Hombros",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Respirá con costillas abajo y sostené una columna larga.",
    "movement_pattern": "Anti-extensión",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Core para estabilidad lumbo-pélvica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Plancha frontal tempo"
    ],
    "variations": [
      "Plancha frontal",
      "Plancha frontal con alcance",
      "Plancha frontal con peso",
      "Plancha lateral"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "1b29c7ad-8679-5f3d-9a46-56244c9d8f7a",
    "slug": "plancha_lateral",
    "name": "Plancha lateral",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Hombros",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Respirá con costillas abajo y sostené una columna larga.",
    "movement_pattern": "Anti-extensión",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Core para estabilidad lumbo-pélvica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Plancha lateral"
    ],
    "variations": [
      "Plancha frontal",
      "Plancha frontal con alcance",
      "Plancha frontal con peso",
      "Plancha frontal tempo"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "3d7a69da-53ed-5478-8ab8-dacb88d4cef1",
    "slug": "plancha_lateral_con_abduccion",
    "name": "Plancha lateral con abducción",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Hombros",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Respirá con costillas abajo y sostené una columna larga.",
    "movement_pattern": "Anti-extensión",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Core para estabilidad lumbo-pélvica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Plancha lateral abducción",
      "Plancha lateral"
    ],
    "variations": [
      "Plancha frontal",
      "Plancha frontal con alcance",
      "Plancha frontal con peso",
      "Plancha frontal tempo"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "a82abdfe-43a2-57be-b178-e17688bf266d",
    "slug": "plancha_lateral_con_remo",
    "name": "Plancha lateral con remo",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Hombros",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Respirá con costillas abajo y sostené una columna larga.",
    "movement_pattern": "Anti-extensión",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Core para estabilidad lumbo-pélvica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Plancha lateral remo",
      "Plancha lateral"
    ],
    "variations": [
      "Plancha frontal",
      "Plancha frontal con alcance",
      "Plancha frontal con peso",
      "Plancha frontal tempo"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "1bb29304-beb8-5403-a18f-0e1727c87c49",
    "slug": "dead_bug_estandar",
    "name": "Dead bug estándar",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Hombros",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Respirá con costillas abajo y sostené una columna larga.",
    "movement_pattern": "Anti-extensión",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Core para estabilidad lumbo-pélvica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Dead bug estándar"
    ],
    "variations": [
      "Plancha frontal",
      "Plancha frontal con alcance",
      "Plancha frontal con peso",
      "Plancha frontal tempo"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "de45a3ea-f52b-5eaa-8735-d24cebd32aed",
    "slug": "dead_bug_con_banda",
    "name": "Dead bug con banda",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Hombros",
      "Glúteos"
    ],
    "equipment": "Banda",
    "instructions": "Respirá con costillas abajo y sostené una columna larga.",
    "movement_pattern": "Anti-extensión",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Core para estabilidad lumbo-pélvica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Dead bug banda",
      "Dead bug"
    ],
    "variations": [
      "Plancha frontal",
      "Plancha frontal con alcance",
      "Plancha frontal con peso",
      "Plancha frontal tempo"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "538db670-4695-5ae3-9b66-5b94e5cdbedb",
    "slug": "dead_bug_con_fitball",
    "name": "Dead bug con fitball",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Hombros",
      "Glúteos"
    ],
    "equipment": "Fitball",
    "instructions": "Respirá con costillas abajo y sostené una columna larga.",
    "movement_pattern": "Anti-extensión",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Core para estabilidad lumbo-pélvica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Dead bug fitball",
      "Dead bug"
    ],
    "variations": [
      "Plancha frontal",
      "Plancha frontal con alcance",
      "Plancha frontal con peso",
      "Plancha frontal tempo"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "42b5c624-b183-578e-9a42-b90252d8af47",
    "slug": "bird_dog_estandar",
    "name": "Bird dog estándar",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Hombros",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Respirá con costillas abajo y sostené una columna larga.",
    "movement_pattern": "Anti-extensión",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Core para estabilidad lumbo-pélvica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Bird dog estándar"
    ],
    "variations": [
      "Plancha frontal",
      "Plancha frontal con alcance",
      "Plancha frontal con peso",
      "Plancha frontal tempo"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "0f21119e-6498-56a3-adbf-c19eb9cb5e4b",
    "slug": "bird_dog_con_pausa",
    "name": "Bird dog con pausa",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Hombros",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Respirá con costillas abajo y sostené una columna larga.",
    "movement_pattern": "Anti-extensión",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Core para estabilidad lumbo-pélvica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Bird dog pausa",
      "Bird dog"
    ],
    "variations": [
      "Plancha frontal",
      "Plancha frontal con alcance",
      "Plancha frontal con peso",
      "Plancha frontal tempo"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "d28a7cc7-e31f-599f-ad98-55f74b0e83c8",
    "slug": "bird_dog_con_banda",
    "name": "Bird dog con banda",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Hombros",
      "Glúteos"
    ],
    "equipment": "Banda",
    "instructions": "Respirá con costillas abajo y sostené una columna larga.",
    "movement_pattern": "Anti-extensión",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Core para estabilidad lumbo-pélvica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Bird dog banda",
      "Bird dog"
    ],
    "variations": [
      "Plancha frontal",
      "Plancha frontal con alcance",
      "Plancha frontal con peso",
      "Plancha frontal tempo"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "41ee6630-6ad5-573d-a564-bd05b59691ab",
    "slug": "hollow_hold",
    "name": "Hollow hold",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Hombros",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Respirá con costillas abajo y sostené una columna larga.",
    "movement_pattern": "Anti-extensión",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Core para estabilidad lumbo-pélvica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Hollow hold"
    ],
    "variations": [
      "Plancha frontal",
      "Plancha frontal con alcance",
      "Plancha frontal con peso",
      "Plancha frontal tempo"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "26011179-07b1-59bb-a150-9934c7fa984e",
    "slug": "hollow_rock",
    "name": "Hollow rock",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Hombros",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Respirá con costillas abajo y sostené una columna larga.",
    "movement_pattern": "Anti-extensión",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Core para estabilidad lumbo-pélvica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Hollow rock"
    ],
    "variations": [
      "Plancha frontal",
      "Plancha frontal con alcance",
      "Plancha frontal con peso",
      "Plancha frontal tempo"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "c88367a5-6875-5583-8aed-65871d1ddc95",
    "slug": "bear_plank",
    "name": "Bear plank",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Hombros",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Respirá con costillas abajo y sostené una columna larga.",
    "movement_pattern": "Anti-extensión",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Core para estabilidad lumbo-pélvica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Bear plank"
    ],
    "variations": [
      "Plancha frontal",
      "Plancha frontal con alcance",
      "Plancha frontal con peso",
      "Plancha frontal tempo"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "db8656c9-6668-5397-beaa-6180c23ec446",
    "slug": "bear_crawl_corto",
    "name": "Bear crawl corto",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Hombros",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Respirá con costillas abajo y sostené una columna larga.",
    "movement_pattern": "Anti-extensión",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Core para estabilidad lumbo-pélvica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Bear crawl corto"
    ],
    "variations": [
      "Plancha frontal",
      "Plancha frontal con alcance",
      "Plancha frontal con peso",
      "Plancha frontal tempo"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "5825e4d4-a8e0-5ba6-8783-6fb9c75b518b",
    "slug": "bear_crawl_largo",
    "name": "Bear crawl largo",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Hombros",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Respirá con costillas abajo y sostené una columna larga.",
    "movement_pattern": "Anti-extensión",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Core para estabilidad lumbo-pélvica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Bear crawl largo"
    ],
    "variations": [
      "Plancha frontal",
      "Plancha frontal con alcance",
      "Plancha frontal con peso",
      "Plancha frontal tempo"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "7abd6879-a38a-561d-ae5b-686a05259570",
    "slug": "crunch_basico",
    "name": "Crunch básico",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Oblicuos",
      "Agarre"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá tensión real y no velocidad vacía.",
    "movement_pattern": "Flexión y anti-rotación",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Flexión, anti-rotación y carries del tronco.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Crunch básico"
    ],
    "variations": [
      "Crunch en fitball",
      "Crunch en polea",
      "Crunch bicicleta",
      "Elevación de piernas en suelo"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "2effcede-ec53-5043-acd8-607aba8be711",
    "slug": "crunch_en_fitball",
    "name": "Crunch en fitball",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Oblicuos",
      "Agarre"
    ],
    "equipment": "Fitball",
    "instructions": "Buscá tensión real y no velocidad vacía.",
    "movement_pattern": "Flexión y anti-rotación",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Flexión, anti-rotación y carries del tronco.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Crunch en fitball"
    ],
    "variations": [
      "Crunch básico",
      "Crunch en polea",
      "Crunch bicicleta",
      "Elevación de piernas en suelo"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "486078f6-95bd-521a-b538-30e9e504b42e",
    "slug": "crunch_en_polea",
    "name": "Crunch en polea",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Oblicuos",
      "Agarre"
    ],
    "equipment": "Polea",
    "instructions": "Buscá tensión real y no velocidad vacía.",
    "movement_pattern": "Flexión y anti-rotación",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Flexión, anti-rotación y carries del tronco.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Crunch en polea"
    ],
    "variations": [
      "Crunch básico",
      "Crunch en fitball",
      "Crunch bicicleta",
      "Elevación de piernas en suelo"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "7750b346-0189-54c4-ba3b-d4868916c904",
    "slug": "crunch_bicicleta",
    "name": "Crunch bicicleta",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Oblicuos",
      "Agarre"
    ],
    "equipment": "Bicicleta",
    "instructions": "Buscá tensión real y no velocidad vacía.",
    "movement_pattern": "Flexión y anti-rotación",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Flexión, anti-rotación y carries del tronco.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Crunch bicicleta"
    ],
    "variations": [
      "Crunch básico",
      "Crunch en fitball",
      "Crunch en polea",
      "Elevación de piernas en suelo"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "ac1fa8ca-56e4-5317-b728-7f59c02966d5",
    "slug": "elevacion_de_piernas_en_suelo",
    "name": "Elevación de piernas en suelo",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Oblicuos",
      "Agarre"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá tensión real y no velocidad vacía.",
    "movement_pattern": "Flexión y anti-rotación",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Flexión, anti-rotación y carries del tronco.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elevación de piernas en suelo"
    ],
    "variations": [
      "Crunch básico",
      "Crunch en fitball",
      "Crunch en polea",
      "Crunch bicicleta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "42402ec5-fbd9-5681-a5e6-695365e86332",
    "slug": "elevacion_de_piernas_colgado",
    "name": "Elevación de piernas colgado",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Oblicuos",
      "Agarre"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá tensión real y no velocidad vacía.",
    "movement_pattern": "Flexión y anti-rotación",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Flexión, anti-rotación y carries del tronco.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elevación de piernas colgado"
    ],
    "variations": [
      "Crunch básico",
      "Crunch en fitball",
      "Crunch en polea",
      "Crunch bicicleta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "8c9fce1b-afde-5caf-ad8d-4a8d94e43309",
    "slug": "elevacion_de_rodillas_colgado",
    "name": "Elevación de rodillas colgado",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Oblicuos",
      "Agarre"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá tensión real y no velocidad vacía.",
    "movement_pattern": "Flexión y anti-rotación",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Flexión, anti-rotación y carries del tronco.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elevación de rodillas colgado"
    ],
    "variations": [
      "Crunch básico",
      "Crunch en fitball",
      "Crunch en polea",
      "Crunch bicicleta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "c959932a-bdca-54df-b79a-0b42b64d1c4a",
    "slug": "russian_twist_con_disco",
    "name": "Russian twist con disco",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Oblicuos",
      "Agarre"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá tensión real y no velocidad vacía.",
    "movement_pattern": "Flexión y anti-rotación",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Flexión, anti-rotación y carries del tronco.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Russian twist disco",
      "Russian twist"
    ],
    "variations": [
      "Crunch básico",
      "Crunch en fitball",
      "Crunch en polea",
      "Crunch bicicleta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "c7558493-8d90-5c59-84de-31335a085de4",
    "slug": "russian_twist_con_balon_medicinal",
    "name": "Russian twist con balón medicinal",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Oblicuos",
      "Agarre"
    ],
    "equipment": "Balón medicinal",
    "instructions": "Buscá tensión real y no velocidad vacía.",
    "movement_pattern": "Flexión y anti-rotación",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Flexión, anti-rotación y carries del tronco.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Russian twist balón medicinal",
      "Russian twist"
    ],
    "variations": [
      "Crunch básico",
      "Crunch en fitball",
      "Crunch en polea",
      "Crunch bicicleta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "fb65685e-941e-5522-be70-1df01aa19a82",
    "slug": "pallof_press_en_polea",
    "name": "Pallof press en polea",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Oblicuos",
      "Agarre"
    ],
    "equipment": "Polea",
    "instructions": "Buscá tensión real y no velocidad vacía.",
    "movement_pattern": "Flexión y anti-rotación",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Flexión, anti-rotación y carries del tronco.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pallof press en polea"
    ],
    "variations": [
      "Crunch básico",
      "Crunch en fitball",
      "Crunch en polea",
      "Crunch bicicleta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "b7688d44-71e5-5ff4-be93-028f0cb6d3b2",
    "slug": "pallof_press_con_banda",
    "name": "Pallof press con banda",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Oblicuos",
      "Agarre"
    ],
    "equipment": "Banda",
    "instructions": "Buscá tensión real y no velocidad vacía.",
    "movement_pattern": "Flexión y anti-rotación",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Flexión, anti-rotación y carries del tronco.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pallof press banda",
      "Pallof press"
    ],
    "variations": [
      "Crunch básico",
      "Crunch en fitball",
      "Crunch en polea",
      "Crunch bicicleta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "6a3ee848-6c3e-5ab3-9824-3ae9abae519d",
    "slug": "woodchop_alto_a_bajo",
    "name": "Woodchop alto a bajo",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Oblicuos",
      "Agarre"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá tensión real y no velocidad vacía.",
    "movement_pattern": "Flexión y anti-rotación",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Flexión, anti-rotación y carries del tronco.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Woodchop alto a bajo"
    ],
    "variations": [
      "Crunch básico",
      "Crunch en fitball",
      "Crunch en polea",
      "Crunch bicicleta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "16b20ac2-77d2-58ab-adae-789d601cfb5a",
    "slug": "woodchop_bajo_a_alto",
    "name": "Woodchop bajo a alto",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Oblicuos",
      "Agarre"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá tensión real y no velocidad vacía.",
    "movement_pattern": "Flexión y anti-rotación",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Flexión, anti-rotación y carries del tronco.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Woodchop bajo a alto"
    ],
    "variations": [
      "Crunch básico",
      "Crunch en fitball",
      "Crunch en polea",
      "Crunch bicicleta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "7aaf7217-6188-55aa-937f-74ea70aa2aa6",
    "slug": "farmer_carry_con_mancuernas",
    "name": "Farmer carry con mancuernas",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Oblicuos",
      "Agarre"
    ],
    "equipment": "Mancuernas",
    "instructions": "Buscá tensión real y no velocidad vacía.",
    "movement_pattern": "Flexión y anti-rotación",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Flexión, anti-rotación y carries del tronco.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Farmer carry mancuernas",
      "Farmer carry"
    ],
    "variations": [
      "Crunch básico",
      "Crunch en fitball",
      "Crunch en polea",
      "Crunch bicicleta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "c728bb3d-de58-5ad7-8625-544482d6ca31",
    "slug": "farmer_carry_con_kettlebell",
    "name": "Farmer carry con kettlebell",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Oblicuos",
      "Agarre"
    ],
    "equipment": "Kettlebell",
    "instructions": "Buscá tensión real y no velocidad vacía.",
    "movement_pattern": "Flexión y anti-rotación",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Flexión, anti-rotación y carries del tronco.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Farmer carry kettlebell",
      "Farmer carry"
    ],
    "variations": [
      "Crunch básico",
      "Crunch en fitball",
      "Crunch en polea",
      "Crunch bicicleta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "ca169861-5873-5795-9477-2e83b4295be1",
    "slug": "suitcase_carry_con_mancuerna",
    "name": "Suitcase carry con mancuerna",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Oblicuos",
      "Agarre"
    ],
    "equipment": "Mancuerna",
    "instructions": "Buscá tensión real y no velocidad vacía.",
    "movement_pattern": "Flexión y anti-rotación",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Flexión, anti-rotación y carries del tronco.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Suitcase carry mancuerna",
      "Suitcase carry"
    ],
    "variations": [
      "Crunch básico",
      "Crunch en fitball",
      "Crunch en polea",
      "Crunch bicicleta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "4194087c-b10a-5bb4-9b38-ddfaa808a6bc",
    "slug": "sit_up_con_peso",
    "name": "Sit-up con peso",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Oblicuos",
      "Agarre"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá tensión real y no velocidad vacía.",
    "movement_pattern": "Flexión y anti-rotación",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Flexión, anti-rotación y carries del tronco.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sit-up peso",
      "Sit-up"
    ],
    "variations": [
      "Crunch básico",
      "Crunch en fitball",
      "Crunch en polea",
      "Crunch bicicleta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "aa8aec02-ed5f-5f7b-bb79-8113413f643b",
    "slug": "v_up",
    "name": "V-up",
    "muscle_group": "Core",
    "muscles_secondary": [
      "Oblicuos",
      "Agarre"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá tensión real y no velocidad vacía.",
    "movement_pattern": "Flexión y anti-rotación",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "core",
    "description": "Flexión, anti-rotación y carries del tronco.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "V-up"
    ],
    "variations": [
      "Crunch básico",
      "Crunch en fitball",
      "Crunch en polea",
      "Crunch bicicleta"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "c1649052-7343-54f3-bcb4-81801af3a32a",
    "slug": "caminata_en_cinta_suave",
    "name": "Caminata en cinta suave",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Cinta",
    "instructions": "Elegí una intensidad que puedas sostener.",
    "movement_pattern": "Cardio continuo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "cardio",
    "description": "Cardio sostenido o por bloques para resistencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Caminata en cinta suave"
    ],
    "variations": [
      "Caminata en cinta inclinada",
      "Caminata al aire libre",
      "Trote continuo",
      "Trote progresivo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "c46d42cc-0e58-5d6e-bd42-e91c7e52fb64",
    "slug": "caminata_en_cinta_inclinada",
    "name": "Caminata en cinta inclinada",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Cinta",
    "instructions": "Elegí una intensidad que puedas sostener.",
    "movement_pattern": "Cardio continuo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "cardio",
    "description": "Cardio sostenido o por bloques para resistencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Caminata en cinta inclinada"
    ],
    "variations": [
      "Caminata en cinta suave",
      "Caminata al aire libre",
      "Trote continuo",
      "Trote progresivo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "f884acf5-64c8-5367-a2f7-a373c31761b9",
    "slug": "caminata_al_aire_libre",
    "name": "Caminata al aire libre",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Cinta",
    "instructions": "Elegí una intensidad que puedas sostener.",
    "movement_pattern": "Cardio continuo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "cardio",
    "description": "Cardio sostenido o por bloques para resistencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Caminata al aire libre"
    ],
    "variations": [
      "Caminata en cinta suave",
      "Caminata en cinta inclinada",
      "Trote continuo",
      "Trote progresivo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "5575232e-4a76-5300-b9ae-8c6d6b726a60",
    "slug": "trote_continuo",
    "name": "Trote continuo",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Cinta",
    "instructions": "Elegí una intensidad que puedas sostener.",
    "movement_pattern": "Cardio continuo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "cardio",
    "description": "Cardio sostenido o por bloques para resistencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Trote continuo"
    ],
    "variations": [
      "Caminata en cinta suave",
      "Caminata en cinta inclinada",
      "Caminata al aire libre",
      "Trote progresivo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "9fd328b1-98ce-5a02-aba5-3ef798fe2592",
    "slug": "trote_progresivo",
    "name": "Trote progresivo",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Cinta",
    "instructions": "Elegí una intensidad que puedas sostener.",
    "movement_pattern": "Cardio continuo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "cardio",
    "description": "Cardio sostenido o por bloques para resistencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Trote progresivo"
    ],
    "variations": [
      "Caminata en cinta suave",
      "Caminata en cinta inclinada",
      "Caminata al aire libre",
      "Trote continuo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "724ce2a2-b73e-52e8-87c8-a9d65592644e",
    "slug": "carrera_tempo",
    "name": "Carrera tempo",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Cinta",
    "instructions": "Elegí una intensidad que puedas sostener.",
    "movement_pattern": "Cardio continuo",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "cardio",
    "description": "Cardio sostenido o por bloques para resistencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Carrera tempo"
    ],
    "variations": [
      "Caminata en cinta suave",
      "Caminata en cinta inclinada",
      "Caminata al aire libre",
      "Trote continuo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "ba58e276-0382-50f4-aa8d-6471b8c5035a",
    "slug": "carrera_por_intervalos",
    "name": "Carrera por intervalos",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Cinta",
    "instructions": "Elegí una intensidad que puedas sostener.",
    "movement_pattern": "Cardio continuo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "cardio",
    "description": "Cardio sostenido o por bloques para resistencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Carrera por intervalos"
    ],
    "variations": [
      "Caminata en cinta suave",
      "Caminata en cinta inclinada",
      "Caminata al aire libre",
      "Trote continuo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "8bed8a7e-f23f-5bd7-8869-99a6f4e82eab",
    "slug": "bicicleta_ritmo_constante",
    "name": "Bicicleta ritmo constante",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Bicicleta",
    "instructions": "Elegí una intensidad que puedas sostener.",
    "movement_pattern": "Cardio continuo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "cardio",
    "description": "Cardio sostenido o por bloques para resistencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Bicicleta ritmo constante"
    ],
    "variations": [
      "Caminata en cinta suave",
      "Caminata en cinta inclinada",
      "Caminata al aire libre",
      "Trote continuo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "f90c6da6-599a-5df0-ad23-b5a184f36850",
    "slug": "bicicleta_por_intervalos",
    "name": "Bicicleta por intervalos",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Bicicleta",
    "instructions": "Elegí una intensidad que puedas sostener.",
    "movement_pattern": "Cardio continuo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "cardio",
    "description": "Cardio sostenido o por bloques para resistencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Bicicleta por intervalos"
    ],
    "variations": [
      "Caminata en cinta suave",
      "Caminata en cinta inclinada",
      "Caminata al aire libre",
      "Trote continuo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "e71270a2-322a-5c47-878a-fae5cf0953ed",
    "slug": "bicicleta_al_aire_libre",
    "name": "Bicicleta al aire libre",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Bicicleta",
    "instructions": "Elegí una intensidad que puedas sostener.",
    "movement_pattern": "Cardio continuo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "cardio",
    "description": "Cardio sostenido o por bloques para resistencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Bicicleta al aire libre"
    ],
    "variations": [
      "Caminata en cinta suave",
      "Caminata en cinta inclinada",
      "Caminata al aire libre",
      "Trote continuo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "1808e976-7c6e-5499-80d6-8181367c900b",
    "slug": "remo_ergometro_continuo",
    "name": "Remo ergómetro continuo",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Remo ergómetro",
    "instructions": "Elegí una intensidad que puedas sostener.",
    "movement_pattern": "Cardio continuo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "cardio",
    "description": "Cardio sostenido o por bloques para resistencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo ergómetro continuo"
    ],
    "variations": [
      "Caminata en cinta suave",
      "Caminata en cinta inclinada",
      "Caminata al aire libre",
      "Trote continuo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "28688fb5-8b74-512a-9619-fad277f519ee",
    "slug": "remo_ergometro_por_intervalos",
    "name": "Remo ergómetro por intervalos",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Remo ergómetro",
    "instructions": "Elegí una intensidad que puedas sostener.",
    "movement_pattern": "Cardio continuo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "cardio",
    "description": "Cardio sostenido o por bloques para resistencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo ergómetro por intervalos"
    ],
    "variations": [
      "Caminata en cinta suave",
      "Caminata en cinta inclinada",
      "Caminata al aire libre",
      "Trote continuo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "85701552-0374-56f0-ade3-bae3480a6e0e",
    "slug": "eliptica_continua",
    "name": "Elíptica continua",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Elíptica",
    "instructions": "Elegí una intensidad que puedas sostener.",
    "movement_pattern": "Cardio continuo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "cardio",
    "description": "Cardio sostenido o por bloques para resistencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elíptica continua"
    ],
    "variations": [
      "Caminata en cinta suave",
      "Caminata en cinta inclinada",
      "Caminata al aire libre",
      "Trote continuo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "96bffdd1-d7bc-5216-ab4e-b4a6cae8fcf2",
    "slug": "eliptica_por_bloques",
    "name": "Elíptica por bloques",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Elíptica",
    "instructions": "Elegí una intensidad que puedas sostener.",
    "movement_pattern": "Cardio continuo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "cardio",
    "description": "Cardio sostenido o por bloques para resistencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elíptica por bloques"
    ],
    "variations": [
      "Caminata en cinta suave",
      "Caminata en cinta inclinada",
      "Caminata al aire libre",
      "Trote continuo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "093bcb01-a431-5cae-aa5a-0747bf98dcad",
    "slug": "escaladora_continua",
    "name": "Escaladora continua",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Escaladora",
    "instructions": "Elegí una intensidad que puedas sostener.",
    "movement_pattern": "Cardio continuo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "cardio",
    "description": "Cardio sostenido o por bloques para resistencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Escaladora continua"
    ],
    "variations": [
      "Caminata en cinta suave",
      "Caminata en cinta inclinada",
      "Caminata al aire libre",
      "Trote continuo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "ca19c395-4885-54c5-a3f3-eacdcafadf07",
    "slug": "escaladora_por_intervalos",
    "name": "Escaladora por intervalos",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Escaladora",
    "instructions": "Elegí una intensidad que puedas sostener.",
    "movement_pattern": "Cardio continuo",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "cardio",
    "description": "Cardio sostenido o por bloques para resistencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Escaladora por intervalos"
    ],
    "variations": [
      "Caminata en cinta suave",
      "Caminata en cinta inclinada",
      "Caminata al aire libre",
      "Trote continuo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "5384d967-6551-5416-96a8-55113d138b41",
    "slug": "cuerda_simple",
    "name": "Cuerda simple",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Core"
    ],
    "equipment": "Cuerda",
    "instructions": "Movete con buena técnica aun cuando el pulso suba.",
    "movement_pattern": "Conditioning",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Bloques metabólicos para subir pulsaciones y sostener potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Cuerda simple"
    ],
    "variations": [
      "Cuerda doble",
      "Cuerda alternada",
      "Burpee estándar",
      "Burpee con salto alto"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "45ad8742-09b1-55a7-94b6-5130186cd96a",
    "slug": "cuerda_doble",
    "name": "Cuerda doble",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Core"
    ],
    "equipment": "Cuerda",
    "instructions": "Movete con buena técnica aun cuando el pulso suba.",
    "movement_pattern": "Conditioning",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Bloques metabólicos para subir pulsaciones y sostener potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Cuerda doble"
    ],
    "variations": [
      "Cuerda simple",
      "Cuerda alternada",
      "Burpee estándar",
      "Burpee con salto alto"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "332c2d63-9b7c-5b0c-92ca-89b4dd307e6c",
    "slug": "cuerda_alternada",
    "name": "Cuerda alternada",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Core"
    ],
    "equipment": "Cuerda",
    "instructions": "Movete con buena técnica aun cuando el pulso suba.",
    "movement_pattern": "Conditioning",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Bloques metabólicos para subir pulsaciones y sostener potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Cuerda alternada"
    ],
    "variations": [
      "Cuerda simple",
      "Cuerda doble",
      "Burpee estándar",
      "Burpee con salto alto"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "f774e4ae-4a1e-5d7b-ae32-c49277c49841",
    "slug": "burpee_estandar",
    "name": "Burpee estándar",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Movete con buena técnica aun cuando el pulso suba.",
    "movement_pattern": "Conditioning",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Bloques metabólicos para subir pulsaciones y sostener potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Burpee estándar"
    ],
    "variations": [
      "Cuerda simple",
      "Cuerda doble",
      "Cuerda alternada",
      "Burpee con salto alto"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "bf46306b-2257-581a-8631-0470b7d8fe69",
    "slug": "burpee_con_salto_alto",
    "name": "Burpee con salto alto",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Movete con buena técnica aun cuando el pulso suba.",
    "movement_pattern": "Conditioning",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Bloques metabólicos para subir pulsaciones y sostener potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Burpee salto alto",
      "Burpee"
    ],
    "variations": [
      "Cuerda simple",
      "Cuerda doble",
      "Cuerda alternada",
      "Burpee estándar"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "a1929a44-126f-53e5-a836-635cd3b111b4",
    "slug": "burpee_con_pecho_al_suelo",
    "name": "Burpee con pecho al suelo",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Movete con buena técnica aun cuando el pulso suba.",
    "movement_pattern": "Conditioning",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Bloques metabólicos para subir pulsaciones y sostener potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Burpee pecho al suelo",
      "Burpee"
    ],
    "variations": [
      "Cuerda simple",
      "Cuerda doble",
      "Cuerda alternada",
      "Burpee estándar"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "fc7344cd-fd87-5857-9150-22cd8b293347",
    "slug": "assault_bike_20_40",
    "name": "Assault bike 20/40",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Core"
    ],
    "equipment": "Assault bike",
    "instructions": "Movete con buena técnica aun cuando el pulso suba.",
    "movement_pattern": "Conditioning",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Bloques metabólicos para subir pulsaciones y sostener potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Assault bike 20/40"
    ],
    "variations": [
      "Cuerda simple",
      "Cuerda doble",
      "Cuerda alternada",
      "Burpee estándar"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "4f90cbe7-2f41-5300-ade9-34cff507a7a7",
    "slug": "assault_bike_30_30",
    "name": "Assault bike 30/30",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Core"
    ],
    "equipment": "Assault bike",
    "instructions": "Movete con buena técnica aun cuando el pulso suba.",
    "movement_pattern": "Conditioning",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Bloques metabólicos para subir pulsaciones y sostener potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Assault bike 30/30"
    ],
    "variations": [
      "Cuerda simple",
      "Cuerda doble",
      "Cuerda alternada",
      "Burpee estándar"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "3bdd5288-1925-5f42-8356-f01a1bda2a02",
    "slug": "battle_rope_olas_alternas",
    "name": "Battle rope olas alternas",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Core"
    ],
    "equipment": "Battle rope",
    "instructions": "Movete con buena técnica aun cuando el pulso suba.",
    "movement_pattern": "Conditioning",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Bloques metabólicos para subir pulsaciones y sostener potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Battle rope olas alternas"
    ],
    "variations": [
      "Cuerda simple",
      "Cuerda doble",
      "Cuerda alternada",
      "Burpee estándar"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "bcc95b67-3dbe-5c46-8135-3e3b039e263e",
    "slug": "battle_rope_dobles",
    "name": "Battle rope dobles",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Core"
    ],
    "equipment": "Battle rope",
    "instructions": "Movete con buena técnica aun cuando el pulso suba.",
    "movement_pattern": "Conditioning",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Bloques metabólicos para subir pulsaciones y sostener potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Battle rope dobles"
    ],
    "variations": [
      "Cuerda simple",
      "Cuerda doble",
      "Cuerda alternada",
      "Burpee estándar"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "8d58b30b-964a-586b-a4c8-cfbf4bb90df2",
    "slug": "empuje_de_trineo_pesado",
    "name": "Empuje de trineo pesado",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Core"
    ],
    "equipment": "Trineo",
    "instructions": "Movete con buena técnica aun cuando el pulso suba.",
    "movement_pattern": "Conditioning",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Bloques metabólicos para subir pulsaciones y sostener potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Empuje de trineo pesado"
    ],
    "variations": [
      "Cuerda simple",
      "Cuerda doble",
      "Cuerda alternada",
      "Burpee estándar"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "7a2c4214-af3f-59e2-b5e0-df8aeb1b33ce",
    "slug": "empuje_de_trineo_ligero",
    "name": "Empuje de trineo ligero",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Core"
    ],
    "equipment": "Trineo",
    "instructions": "Movete con buena técnica aun cuando el pulso suba.",
    "movement_pattern": "Conditioning",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Bloques metabólicos para subir pulsaciones y sostener potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Empuje de trineo ligero"
    ],
    "variations": [
      "Cuerda simple",
      "Cuerda doble",
      "Cuerda alternada",
      "Burpee estándar"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "df016c98-1578-5a0e-998d-aae13151b16a",
    "slug": "sled_drag_hacia_atras",
    "name": "Sled drag hacia atrás",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Movete con buena técnica aun cuando el pulso suba.",
    "movement_pattern": "Conditioning",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Bloques metabólicos para subir pulsaciones y sostener potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sled drag hacia atrás"
    ],
    "variations": [
      "Cuerda simple",
      "Cuerda doble",
      "Cuerda alternada",
      "Burpee estándar"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "06e44e3e-eaf2-57ba-a123-c8b1cf12b1d4",
    "slug": "skater_jump",
    "name": "Skater jump",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Movete con buena técnica aun cuando el pulso suba.",
    "movement_pattern": "Conditioning",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Bloques metabólicos para subir pulsaciones y sostener potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Skater jump"
    ],
    "variations": [
      "Cuerda simple",
      "Cuerda doble",
      "Cuerda alternada",
      "Burpee estándar"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "481d32a8-6a18-5b70-932c-bee12c2b5c14",
    "slug": "saltos_al_cajon",
    "name": "Saltos al cajón",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Movete con buena técnica aun cuando el pulso suba.",
    "movement_pattern": "Conditioning",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Bloques metabólicos para subir pulsaciones y sostener potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Saltos al cajón"
    ],
    "variations": [
      "Cuerda simple",
      "Cuerda doble",
      "Cuerda alternada",
      "Burpee estándar"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "0d705d41-7d0a-5be4-aa2a-cf51bde88421",
    "slug": "step_up_rapido_en_banco",
    "name": "Step-up rápido en banco",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Core"
    ],
    "equipment": "Step",
    "instructions": "Movete con buena técnica aun cuando el pulso suba.",
    "movement_pattern": "Conditioning",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Bloques metabólicos para subir pulsaciones y sostener potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Step-up rápido en banco"
    ],
    "variations": [
      "Cuerda simple",
      "Cuerda doble",
      "Cuerda alternada",
      "Burpee estándar"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "82048bfc-f192-5913-8e9c-48b5b2f20418",
    "slug": "mountain_climber_controlado",
    "name": "Mountain climber controlado",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Movete con buena técnica aun cuando el pulso suba.",
    "movement_pattern": "Conditioning",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Bloques metabólicos para subir pulsaciones y sostener potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Mountain climber controlado"
    ],
    "variations": [
      "Cuerda simple",
      "Cuerda doble",
      "Cuerda alternada",
      "Burpee estándar"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "a4f79805-a947-5c8d-8248-bfadf1cb239f",
    "slug": "mountain_climber_rapido",
    "name": "Mountain climber rápido",
    "muscle_group": "Cardio",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Movete con buena técnica aun cuando el pulso suba.",
    "movement_pattern": "Conditioning",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Bloques metabólicos para subir pulsaciones y sostener potencia.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Mountain climber rápido"
    ],
    "variations": [
      "Cuerda simple",
      "Cuerda doble",
      "Cuerda alternada",
      "Burpee estándar"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "3a044e15-0577-5c55-93ee-0a97d19716ec",
    "slug": "power_clean_con_barra",
    "name": "Power clean con barra",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Acelerá desde el suelo y recibí con estabilidad.",
    "movement_pattern": "Levantamiento olímpico",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Derivados olímpicos para potencia total y coordinación.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Power clean barra",
      "Power clean"
    ],
    "variations": [
      "Power snatch con barra",
      "Hang clean con barra",
      "Hang snatch con barra",
      "Clean high pull con barra"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "be2bdb40-8efc-51dd-a2d0-c92e345f98c7",
    "slug": "power_snatch_con_barra",
    "name": "Power snatch con barra",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Acelerá desde el suelo y recibí con estabilidad.",
    "movement_pattern": "Levantamiento olímpico",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Derivados olímpicos para potencia total y coordinación.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Power snatch barra",
      "Power snatch"
    ],
    "variations": [
      "Power clean con barra",
      "Hang clean con barra",
      "Hang snatch con barra",
      "Clean high pull con barra"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "61d98165-e65c-56b4-b0fc-3675ec581203",
    "slug": "hang_clean_con_barra",
    "name": "Hang clean con barra",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Acelerá desde el suelo y recibí con estabilidad.",
    "movement_pattern": "Levantamiento olímpico",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Derivados olímpicos para potencia total y coordinación.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Hang clean barra",
      "Hang clean"
    ],
    "variations": [
      "Power clean con barra",
      "Power snatch con barra",
      "Hang snatch con barra",
      "Clean high pull con barra"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "2e7c4d25-2d55-5478-8429-6eb8d4908345",
    "slug": "hang_snatch_con_barra",
    "name": "Hang snatch con barra",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Acelerá desde el suelo y recibí con estabilidad.",
    "movement_pattern": "Levantamiento olímpico",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Derivados olímpicos para potencia total y coordinación.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Hang snatch barra",
      "Hang snatch"
    ],
    "variations": [
      "Power clean con barra",
      "Power snatch con barra",
      "Hang clean con barra",
      "Clean high pull con barra"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "063cf5b7-46e7-5e4d-bd22-de633b9aef86",
    "slug": "clean_high_pull_con_barra",
    "name": "Clean high pull con barra",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Acelerá desde el suelo y recibí con estabilidad.",
    "movement_pattern": "Levantamiento olímpico",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Derivados olímpicos para potencia total y coordinación.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Clean high pull barra",
      "Clean high pull"
    ],
    "variations": [
      "Power clean con barra",
      "Power snatch con barra",
      "Hang clean con barra",
      "Hang snatch con barra"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "75188ceb-b8f4-5d96-a62b-42f380cfb799",
    "slug": "snatch_high_pull_con_barra",
    "name": "Snatch high pull con barra",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Acelerá desde el suelo y recibí con estabilidad.",
    "movement_pattern": "Levantamiento olímpico",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Derivados olímpicos para potencia total y coordinación.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Snatch high pull barra",
      "Snatch high pull"
    ],
    "variations": [
      "Power clean con barra",
      "Power snatch con barra",
      "Hang clean con barra",
      "Hang snatch con barra"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "a2b4c035-0f41-5e7c-9f6b-0fcfdecee6d5",
    "slug": "thruster_con_barra",
    "name": "Thruster con barra",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Acelerá desde el suelo y recibí con estabilidad.",
    "movement_pattern": "Levantamiento olímpico",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Derivados olímpicos para potencia total y coordinación.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Thruster barra",
      "Thruster"
    ],
    "variations": [
      "Power clean con barra",
      "Power snatch con barra",
      "Hang clean con barra",
      "Hang snatch con barra"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "af1f3412-9741-51c8-9dcc-14b44a62daa9",
    "slug": "thruster_con_mancuernas",
    "name": "Thruster con mancuernas",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Espalda"
    ],
    "equipment": "Mancuernas",
    "instructions": "Acelerá desde el suelo y recibí con estabilidad.",
    "movement_pattern": "Levantamiento olímpico",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Derivados olímpicos para potencia total y coordinación.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Thruster mancuernas",
      "Thruster"
    ],
    "variations": [
      "Power clean con barra",
      "Power snatch con barra",
      "Hang clean con barra",
      "Hang snatch con barra"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "8eb32c9c-1a5a-5611-940a-82acf3c1c578",
    "slug": "push_jerk_con_barra",
    "name": "Push jerk con barra",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Acelerá desde el suelo y recibí con estabilidad.",
    "movement_pattern": "Levantamiento olímpico",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Derivados olímpicos para potencia total y coordinación.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Push jerk barra",
      "Push jerk"
    ],
    "variations": [
      "Power clean con barra",
      "Power snatch con barra",
      "Hang clean con barra",
      "Hang snatch con barra"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "e58eab17-161c-5299-aea5-a5c988362ffa",
    "slug": "split_jerk_con_barra",
    "name": "Split jerk con barra",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Acelerá desde el suelo y recibí con estabilidad.",
    "movement_pattern": "Levantamiento olímpico",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Derivados olímpicos para potencia total y coordinación.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Split jerk barra",
      "Split jerk"
    ],
    "variations": [
      "Power clean con barra",
      "Power snatch con barra",
      "Hang clean con barra",
      "Hang snatch con barra"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "aa8340b5-c7a6-5c0f-865f-4a892328479f",
    "slug": "clean_pull_con_barra",
    "name": "Clean pull con barra",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Acelerá desde el suelo y recibí con estabilidad.",
    "movement_pattern": "Levantamiento olímpico",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Derivados olímpicos para potencia total y coordinación.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Clean pull barra",
      "Clean pull"
    ],
    "variations": [
      "Power clean con barra",
      "Power snatch con barra",
      "Hang clean con barra",
      "Hang snatch con barra"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "31b32378-62ca-5665-9d20-afab66c0abbd",
    "slug": "snatch_pull_con_barra",
    "name": "Snatch pull con barra",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Hombros",
      "Espalda"
    ],
    "equipment": "Barra",
    "instructions": "Acelerá desde el suelo y recibí con estabilidad.",
    "movement_pattern": "Levantamiento olímpico",
    "difficulty_level": "Avanzado",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "strength",
    "description": "Derivados olímpicos para potencia total y coordinación.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Snatch pull barra",
      "Snatch pull"
    ],
    "variations": [
      "Power clean con barra",
      "Power snatch con barra",
      "Hang clean con barra",
      "Hang snatch con barra"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "fc30e72c-ccbb-537b-a719-ee3df54333ad",
    "slug": "salto_vertical_con_contramovimiento",
    "name": "Salto vertical con contramovimiento",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá calidad de cada repetición.",
    "movement_pattern": "Pliometría",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Pliometría y potencia para acelerar y cambiar de ritmo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Salto vertical contramovimiento",
      "Salto vertical"
    ],
    "variations": [
      "Salto horizontal",
      "Salto lateral sobre línea",
      "Drop jump",
      "Bound alterno"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "ac90f173-4999-5ad2-bb7c-ba88c4dbc8cd",
    "slug": "salto_horizontal",
    "name": "Salto horizontal",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá calidad de cada repetición.",
    "movement_pattern": "Pliometría",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Pliometría y potencia para acelerar y cambiar de ritmo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Salto horizontal"
    ],
    "variations": [
      "Salto vertical con contramovimiento",
      "Salto lateral sobre línea",
      "Drop jump",
      "Bound alterno"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "5ce20ecb-b3f4-5454-b92c-341308b23f5f",
    "slug": "salto_lateral_sobre_linea",
    "name": "Salto lateral sobre línea",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá calidad de cada repetición.",
    "movement_pattern": "Pliometría",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Pliometría y potencia para acelerar y cambiar de ritmo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Salto lateral sobre línea"
    ],
    "variations": [
      "Salto vertical con contramovimiento",
      "Salto horizontal",
      "Drop jump",
      "Bound alterno"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "918275c9-6208-5f89-87db-588133c8bcec",
    "slug": "drop_jump",
    "name": "Drop jump",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá calidad de cada repetición.",
    "movement_pattern": "Pliometría",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Pliometría y potencia para acelerar y cambiar de ritmo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Drop jump"
    ],
    "variations": [
      "Salto vertical con contramovimiento",
      "Salto horizontal",
      "Salto lateral sobre línea",
      "Bound alterno"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "c8be954e-3be2-543a-9bac-44d23d5812ea",
    "slug": "bound_alterno",
    "name": "Bound alterno",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá calidad de cada repetición.",
    "movement_pattern": "Pliometría",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Pliometría y potencia para acelerar y cambiar de ritmo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Bound alterno"
    ],
    "variations": [
      "Salto vertical con contramovimiento",
      "Salto horizontal",
      "Salto lateral sobre línea",
      "Drop jump"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "3ff6051b-b42e-5a76-b171-c9df614be1ea",
    "slug": "bound_unilateral",
    "name": "Bound unilateral",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá calidad de cada repetición.",
    "movement_pattern": "Pliometría",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Pliometría y potencia para acelerar y cambiar de ritmo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Bound unilateral"
    ],
    "variations": [
      "Salto vertical con contramovimiento",
      "Salto horizontal",
      "Salto lateral sobre línea",
      "Drop jump"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "abce5ff9-5445-5462-95bd-b1c388a83ea0",
    "slug": "lanzamiento_de_balon_medicinal_al_pecho",
    "name": "Lanzamiento de balón medicinal al pecho",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Balón medicinal",
    "instructions": "Buscá calidad de cada repetición.",
    "movement_pattern": "Pliometría",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Pliometría y potencia para acelerar y cambiar de ritmo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Lanzamiento de balón medicinal al pecho"
    ],
    "variations": [
      "Salto vertical con contramovimiento",
      "Salto horizontal",
      "Salto lateral sobre línea",
      "Drop jump"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "9ecb77dc-a8dc-5e37-8397-dc1fcc08841f",
    "slug": "lanzamiento_de_balon_medicinal_rotacional",
    "name": "Lanzamiento de balón medicinal rotacional",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Balón medicinal",
    "instructions": "Buscá calidad de cada repetición.",
    "movement_pattern": "Pliometría",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Pliometría y potencia para acelerar y cambiar de ritmo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Lanzamiento de balón medicinal rotacional"
    ],
    "variations": [
      "Salto vertical con contramovimiento",
      "Salto horizontal",
      "Salto lateral sobre línea",
      "Drop jump"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "82b24005-0e5c-5840-9cfb-d610a6a5df72",
    "slug": "lanzamiento_de_balon_medicinal_por_encima_de_la_cabeza",
    "name": "Lanzamiento de balón medicinal por encima de la cabeza",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Balón medicinal",
    "instructions": "Buscá calidad de cada repetición.",
    "movement_pattern": "Pliometría",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Pliometría y potencia para acelerar y cambiar de ritmo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Lanzamiento de balón medicinal por encima de la cabeza"
    ],
    "variations": [
      "Salto vertical con contramovimiento",
      "Salto horizontal",
      "Salto lateral sobre línea",
      "Drop jump"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "5cef851c-f639-527e-b9c9-069dbb288281",
    "slug": "sprint_corto_10_m",
    "name": "Sprint corto 10 m",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá calidad de cada repetición.",
    "movement_pattern": "Pliometría",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Pliometría y potencia para acelerar y cambiar de ritmo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sprint corto 10 m"
    ],
    "variations": [
      "Salto vertical con contramovimiento",
      "Salto horizontal",
      "Salto lateral sobre línea",
      "Drop jump"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "be9a2a8c-b45c-5ffb-b68f-9b6778062cde",
    "slug": "sprint_corto_20_m",
    "name": "Sprint corto 20 m",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá calidad de cada repetición.",
    "movement_pattern": "Pliometría",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Pliometría y potencia para acelerar y cambiar de ritmo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sprint corto 20 m"
    ],
    "variations": [
      "Salto vertical con contramovimiento",
      "Salto horizontal",
      "Salto lateral sobre línea",
      "Drop jump"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "0b6a9c2d-f3a4-5ea8-9a28-d4ca780db491",
    "slug": "aceleracion_desde_parado",
    "name": "Aceleración desde parado",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá calidad de cada repetición.",
    "movement_pattern": "Pliometría",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Pliometría y potencia para acelerar y cambiar de ritmo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Aceleración desde parado"
    ],
    "variations": [
      "Salto vertical con contramovimiento",
      "Salto horizontal",
      "Salto lateral sobre línea",
      "Drop jump"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "08ad14bc-4be6-50ce-9628-f75454bdb9c1",
    "slug": "salto_a_cajon_lateral",
    "name": "Salto a cajón lateral",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá calidad de cada repetición.",
    "movement_pattern": "Pliometría",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Pliometría y potencia para acelerar y cambiar de ritmo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Salto a cajón lateral"
    ],
    "variations": [
      "Salto vertical con contramovimiento",
      "Salto horizontal",
      "Salto lateral sobre línea",
      "Drop jump"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "97bb0854-e8e3-5cec-8ebe-2a9beabfa380",
    "slug": "salto_en_profundidad_controlado",
    "name": "Salto en profundidad controlado",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá calidad de cada repetición.",
    "movement_pattern": "Pliometría",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Pliometría y potencia para acelerar y cambiar de ritmo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Salto en profundidad controlado"
    ],
    "variations": [
      "Salto vertical con contramovimiento",
      "Salto horizontal",
      "Salto lateral sobre línea",
      "Drop jump"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "994320cf-c7ab-5319-93be-a55b51de452f",
    "slug": "skipping_alto",
    "name": "Skipping alto",
    "muscle_group": "Potencia",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá calidad de cada repetición.",
    "movement_pattern": "Pliometría",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Pliometría y potencia para acelerar y cambiar de ritmo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Skipping alto"
    ],
    "variations": [
      "Salto vertical con contramovimiento",
      "Salto horizontal",
      "Salto lateral sobre línea",
      "Drop jump"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "bec8baad-2722-5cac-93c3-662337b033a3",
    "slug": "movilidad_de_hombro_en_pared",
    "name": "Movilidad de hombro en pared",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Pared",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de hombro en pared"
    ],
    "variations": [
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica",
      "Movilidad escapular en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "7d0c5d1b-8087-5de7-85f9-5f55c538b5f2",
    "slug": "movilidad_de_hombro_con_banda",
    "name": "Movilidad de hombro con banda",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de hombro banda",
      "Movilidad de hombro"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica",
      "Movilidad escapular en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "a9c50fe4-4708-542d-b68f-b60812c7c34d",
    "slug": "movilidad_de_hombro_en_colchoneta",
    "name": "Movilidad de hombro en colchoneta",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Colchoneta",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de hombro en colchoneta"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro dinámica",
      "Movilidad escapular en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "e62d26a5-fc0e-544b-882f-163f38e53886",
    "slug": "movilidad_de_hombro_dinamica",
    "name": "Movilidad de hombro dinámica",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de hombro dinámica"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad escapular en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "28c9dc96-ce2c-5273-b94e-6c0d59481c4b",
    "slug": "movilidad_escapular_en_pared",
    "name": "Movilidad escapular en pared",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Pared",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad escapular en pared"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "760026a2-a355-59cb-98de-426a5f2a1b33",
    "slug": "movilidad_escapular_con_banda",
    "name": "Movilidad escapular con banda",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad escapular banda",
      "Movilidad escapular"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "ec07550a-90c9-5360-aa1c-39fcffe76af0",
    "slug": "movilidad_escapular_en_colchoneta",
    "name": "Movilidad escapular en colchoneta",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Colchoneta",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad escapular en colchoneta"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "398271a9-575c-50a5-9841-6e927319e168",
    "slug": "movilidad_escapular_dinamica",
    "name": "Movilidad escapular dinámica",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad escapular dinámica"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "f28222ed-31fc-5af1-8c64-8de62e534fcf",
    "slug": "rotacion_toracica_en_pared",
    "name": "Rotación torácica en pared",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Pared",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Rotación torácica en pared"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "3c7dfccd-4cc9-5979-811a-2db54ae96283",
    "slug": "rotacion_toracica_con_banda",
    "name": "Rotación torácica con banda",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Rotación torácica banda",
      "Rotación torácica"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "920914b7-8ea5-5cc7-899b-d3ee60ea0f83",
    "slug": "rotacion_toracica_en_colchoneta",
    "name": "Rotación torácica en colchoneta",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Colchoneta",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Rotación torácica en colchoneta"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "cb72c1b1-7374-5f76-81ad-5b4f85fc0ba3",
    "slug": "rotacion_toracica_dinamica",
    "name": "Rotación torácica dinámica",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Rotación torácica dinámica"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "b7109f70-5bea-5979-9e65-8c0a431ff42a",
    "slug": "deslizamiento_de_pared_controlado",
    "name": "Deslizamiento de pared controlado",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Pared",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Deslizamiento de pared controlado"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "09b31171-d946-568a-9780-a2ddb16b2c57",
    "slug": "deslizamiento_de_pared_con_pausa",
    "name": "Deslizamiento de pared con pausa",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Pared",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Deslizamiento de pared pausa",
      "Deslizamiento de pared"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "d0bc33c4-1513-5dcf-af5e-dae2b795fd0a",
    "slug": "deslizamiento_de_pared_respirado",
    "name": "Deslizamiento de pared respirado",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Pared",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Deslizamiento de pared respirado"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "b509593a-5457-50dd-9e6c-d567d78d2ed1",
    "slug": "deslizamiento_de_pared_dinamico",
    "name": "Deslizamiento de pared dinámico",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Pared",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Deslizamiento de pared dinámico"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "c06e3ef1-49ba-5f18-b03c-a7781077f619",
    "slug": "angeles_en_pared_controlado",
    "name": "Ángeles en pared controlado",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Pared",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Ángeles en pared controlado"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "74ef0d9b-d128-5083-b3c8-13861db658c0",
    "slug": "angeles_en_pared_con_pausa",
    "name": "Ángeles en pared con pausa",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Pared",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Ángeles en pared pausa",
      "Ángeles en pared"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "9d2c273f-7cfc-5eb9-b38c-3ab94ad0002e",
    "slug": "angeles_en_pared_respirado",
    "name": "Ángeles en pared respirado",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Pared",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Ángeles en pared respirado"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "7d25e2f7-ed59-552f-8f6b-4a4887a93aec",
    "slug": "angeles_en_pared_dinamico",
    "name": "Ángeles en pared dinámico",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Pared",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Ángeles en pared dinámico"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "a22172f5-c940-556d-ba23-b2ff014c29a0",
    "slug": "thread_the_needle_controlado",
    "name": "Thread the needle controlado",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Thread the needle controlado"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "6afa84ce-7be2-5c71-977c-48299005cfac",
    "slug": "thread_the_needle_con_pausa",
    "name": "Thread the needle con pausa",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Thread the needle pausa",
      "Thread the needle"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "3fd5aba9-e781-5660-a184-c5deb3bf41f2",
    "slug": "thread_the_needle_respirado",
    "name": "Thread the needle respirado",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Thread the needle respirado"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "a8263375-63f2-51a3-b957-c6b91a38e3ca",
    "slug": "thread_the_needle_dinamico",
    "name": "Thread the needle dinámico",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Thread the needle dinámico"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "5e33492f-50b1-5f2d-a746-0850174c504c",
    "slug": "apertura_toracica_controlado",
    "name": "Apertura torácica controlado",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Apertura torácica controlado"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "7e78176f-8e2a-5212-87aa-5af45f36b5a9",
    "slug": "apertura_toracica_con_pausa",
    "name": "Apertura torácica con pausa",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Apertura torácica pausa",
      "Apertura torácica"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "7671d467-b77e-5f00-87d2-704c79546dd6",
    "slug": "apertura_toracica_respirado",
    "name": "Apertura torácica respirado",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Apertura torácica respirado"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "0fea69de-2dba-55de-bb70-004dd38eb20f",
    "slug": "apertura_toracica_dinamico",
    "name": "Apertura torácica dinámico",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Apertura torácica dinámico"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "4dd4966a-a8cd-50f7-b170-72bf03dabd57",
    "slug": "cars_de_hombro",
    "name": "CARs de hombro",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "CARs de hombro"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "e9775d97-5427-5254-874f-d82ae3681a37",
    "slug": "cars_escapulares",
    "name": "CARs escapulares",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Peso corporal",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "CARs escapulares"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "9a4d78ac-5ee2-56a4-8b8d-6458ffe46b41",
    "slug": "extension_toracica_en_foam_roller",
    "name": "Extensión torácica en foam roller",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Foam roller",
    "instructions": "Mové lento y priorizá rango útil sobre amplitud forzada.",
    "movement_pattern": "Movilidad superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad superior para hombros, escápulas y columna torácica.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Extensión torácica en foam roller"
    ],
    "variations": [
      "Movilidad de hombro en pared",
      "Movilidad de hombro con banda",
      "Movilidad de hombro en colchoneta",
      "Movilidad de hombro dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "330de80d-2939-5cec-a552-4364e756f764",
    "slug": "movilidad_de_cadera_en_pared",
    "name": "Movilidad de cadera en pared",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Pared",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de cadera en pared"
    ],
    "variations": [
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica",
      "Movilidad de tobillo en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "9aa4962c-1956-5644-8d94-75338f5ee4e8",
    "slug": "movilidad_de_cadera_con_banda",
    "name": "Movilidad de cadera con banda",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Banda",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de cadera banda",
      "Movilidad de cadera"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica",
      "Movilidad de tobillo en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "5e771bdd-65dc-5d8f-abef-84fd9f62ee1b",
    "slug": "movilidad_de_cadera_en_colchoneta",
    "name": "Movilidad de cadera en colchoneta",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Colchoneta",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de cadera en colchoneta"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera dinámica",
      "Movilidad de tobillo en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "1c1e96ce-5320-56b8-a711-c3e6476d9b04",
    "slug": "movilidad_de_cadera_dinamica",
    "name": "Movilidad de cadera dinámica",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de cadera dinámica"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de tobillo en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "b9beb512-305d-58d3-970e-d8629e2c5ff0",
    "slug": "movilidad_de_tobillo_en_pared",
    "name": "Movilidad de tobillo en pared",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Pared",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de tobillo en pared"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "70aacf71-c468-54c3-8a12-ca7eac7b8c20",
    "slug": "movilidad_de_tobillo_con_banda",
    "name": "Movilidad de tobillo con banda",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Banda",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de tobillo banda",
      "Movilidad de tobillo"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "69b667f0-1276-5cef-8bdc-65c1da5b388d",
    "slug": "movilidad_de_tobillo_en_colchoneta",
    "name": "Movilidad de tobillo en colchoneta",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Colchoneta",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de tobillo en colchoneta"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "b28c4a39-f53c-5226-acd9-58871a46f8e3",
    "slug": "movilidad_de_tobillo_dinamica",
    "name": "Movilidad de tobillo dinámica",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de tobillo dinámica"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "ef6fd53d-2b8d-542f-88ad-a2355d9ff29f",
    "slug": "movilidad_de_isquios_en_pared",
    "name": "Movilidad de isquios en pared",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Pared",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de isquios en pared"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "58cadce9-86ba-5780-8198-13a01875e02b",
    "slug": "movilidad_de_isquios_con_banda",
    "name": "Movilidad de isquios con banda",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Banda",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de isquios banda",
      "Movilidad de isquios"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "f35a3c13-fe65-5bdb-87fd-53033cd3e334",
    "slug": "movilidad_de_isquios_en_colchoneta",
    "name": "Movilidad de isquios en colchoneta",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Colchoneta",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de isquios en colchoneta"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "9e86e6d0-8274-5d69-8cf6-5a901891dc8c",
    "slug": "movilidad_de_isquios_dinamica",
    "name": "Movilidad de isquios dinámica",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de isquios dinámica"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "4474c0ed-35cf-50e0-af97-603b4a2a3945",
    "slug": "movilidad_de_aductores_en_pared",
    "name": "Movilidad de aductores en pared",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Pared",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de aductores en pared"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "7116417b-85a6-5e82-9e0a-caf8fb50093d",
    "slug": "movilidad_de_aductores_con_banda",
    "name": "Movilidad de aductores con banda",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Banda",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de aductores banda",
      "Movilidad de aductores"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "8d6835dd-783e-5ae2-96da-b5a4763982cc",
    "slug": "movilidad_de_aductores_en_colchoneta",
    "name": "Movilidad de aductores en colchoneta",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Colchoneta",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de aductores en colchoneta"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "407dabe9-0673-58f7-a5a0-6d77296dd658",
    "slug": "movilidad_de_aductores_dinamica",
    "name": "Movilidad de aductores dinámica",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de aductores dinámica"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "2247b56e-07aa-5b27-a11c-cde380f56a29",
    "slug": "90_90_de_cadera_controlado",
    "name": "90/90 de cadera controlado",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "90/90 de cadera controlado"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "5f658391-8182-5cd5-8a21-fbb0f22689d1",
    "slug": "90_90_de_cadera_con_pausa",
    "name": "90/90 de cadera con pausa",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "90/90 de cadera pausa",
      "90/90 de cadera"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "8378c7f1-37ed-5a7d-b692-f796018257c7",
    "slug": "90_90_de_cadera_respirado",
    "name": "90/90 de cadera respirado",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "90/90 de cadera respirado"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "e626e791-9363-579e-8eb3-af96be4b7cc6",
    "slug": "90_90_de_cadera_dinamico",
    "name": "90/90 de cadera dinámico",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "90/90 de cadera dinámico"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "ed4a5777-e2c4-5506-8889-e67ad80e69a9",
    "slug": "rockback_de_aductores_controlado",
    "name": "Rockback de aductores controlado",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Rockback de aductores controlado"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "044b5a42-17e5-514c-831a-66a055a5de61",
    "slug": "rockback_de_aductores_con_pausa",
    "name": "Rockback de aductores con pausa",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Rockback de aductores pausa",
      "Rockback de aductores"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "4f5057fa-c0cb-55cb-a746-db1f443c9d77",
    "slug": "rockback_de_aductores_respirado",
    "name": "Rockback de aductores respirado",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Rockback de aductores respirado"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "9581eff4-74b6-58eb-881f-5d4ffa40818b",
    "slug": "rockback_de_aductores_dinamico",
    "name": "Rockback de aductores dinámico",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Rockback de aductores dinámico"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "1e0bfc1f-5e7c-57d9-9114-662472f14fef",
    "slug": "sentadilla_profunda_sostenida_controlado",
    "name": "Sentadilla profunda sostenida controlado",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentadilla profunda sostenida controlado"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "073a70f9-6b77-5db7-9fbd-61854c59e078",
    "slug": "sentadilla_profunda_sostenida_con_pausa",
    "name": "Sentadilla profunda sostenida con pausa",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentadilla profunda sostenida pausa",
      "Sentadilla profunda sostenida"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "c93a6e74-d839-52d4-b0de-3bcdf4d958f7",
    "slug": "sentadilla_profunda_sostenida_respirado",
    "name": "Sentadilla profunda sostenida respirado",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentadilla profunda sostenida respirado"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "9ed9d7d6-1e0a-597f-81fc-8b407edf5e36",
    "slug": "sentadilla_profunda_sostenida_dinamico",
    "name": "Sentadilla profunda sostenida dinámico",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentadilla profunda sostenida dinámico"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "0ad76599-29a6-5a83-a9af-11b989e0f86f",
    "slug": "tobillo_rodilla_a_pared_controlado",
    "name": "Tobillo rodilla a pared controlado",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Pared",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Tobillo rodilla a pared controlado"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "2d4c2583-aba6-561d-8131-3cd9c9cf265e",
    "slug": "tobillo_rodilla_a_pared_con_pausa",
    "name": "Tobillo rodilla a pared con pausa",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Pared",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Tobillo rodilla a pared pausa",
      "Tobillo rodilla a pared"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "f4080d15-3c09-5d6e-81da-14e10fb009f0",
    "slug": "tobillo_rodilla_a_pared_respirado",
    "name": "Tobillo rodilla a pared respirado",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Pared",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Tobillo rodilla a pared respirado"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "f3feb0ba-67c6-5188-ba01-7fc6947fe61e",
    "slug": "tobillo_rodilla_a_pared_dinamico",
    "name": "Tobillo rodilla a pared dinámico",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Pared",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Tobillo rodilla a pared dinámico"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "c7c3c10a-fb7d-5eb4-9005-160b86320ee0",
    "slug": "cars_de_cadera",
    "name": "CARs de cadera",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "CARs de cadera"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "7cdbbb81-79c6-5c67-a5f7-6fc0f2fb9f31",
    "slug": "cars_de_tobillo",
    "name": "CARs de tobillo",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "CARs de tobillo"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "51e33bd4-3621-5766-b0c5-0dc422cc3f23",
    "slug": "prying_squat_con_apoyo",
    "name": "Prying squat con apoyo",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Prying squat apoyo",
      "Prying squat"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "a48b47d6-3298-5d10-8350-4a06312bcd49",
    "slug": "movilidad_de_flexor_de_cadera_en_banco",
    "name": "Movilidad de flexor de cadera en banco",
    "muscle_group": "Movilidad",
    "muscles_secondary": [
      "Glúteos",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené la respiración estable durante cada repetición.",
    "movement_pattern": "Movilidad inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Movilidad inferior para cadera, tobillo y piernas.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de flexor de cadera en banco"
    ],
    "variations": [
      "Movilidad de cadera en pared",
      "Movilidad de cadera con banda",
      "Movilidad de cadera en colchoneta",
      "Movilidad de cadera dinámica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "cde2cb9e-352f-56f5-ad63-1c6e1c201b0c",
    "slug": "estiramiento_de_pectoral_en_pared",
    "name": "Estiramiento de pectoral en pared",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda"
    ],
    "equipment": "Pared",
    "instructions": "Entrá suave al rango y salí igual de lento.",
    "movement_pattern": "Estiramiento superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren superior para liberar tensión.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de pectoral en pared"
    ],
    "variations": [
      "Estiramiento de pectoral con banda",
      "Estiramiento de pectoral en puerta",
      "Estiramiento de dorsal en pared",
      "Estiramiento de dorsal con banda"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "4f21af1b-f903-5a09-abef-3d83f8efea32",
    "slug": "estiramiento_de_pectoral_con_banda",
    "name": "Estiramiento de pectoral con banda",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda"
    ],
    "equipment": "Banda",
    "instructions": "Entrá suave al rango y salí igual de lento.",
    "movement_pattern": "Estiramiento superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren superior para liberar tensión.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de pectoral banda",
      "Estiramiento de pectoral"
    ],
    "variations": [
      "Estiramiento de pectoral en pared",
      "Estiramiento de pectoral en puerta",
      "Estiramiento de dorsal en pared",
      "Estiramiento de dorsal con banda"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "82862c4a-39b8-58d9-bbb5-90988ff96dfa",
    "slug": "estiramiento_de_pectoral_en_puerta",
    "name": "Estiramiento de pectoral en puerta",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda"
    ],
    "equipment": "Peso corporal",
    "instructions": "Entrá suave al rango y salí igual de lento.",
    "movement_pattern": "Estiramiento superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren superior para liberar tensión.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de pectoral en puerta"
    ],
    "variations": [
      "Estiramiento de pectoral en pared",
      "Estiramiento de pectoral con banda",
      "Estiramiento de dorsal en pared",
      "Estiramiento de dorsal con banda"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "4cc86ae7-120c-58de-8d71-421f7980e92d",
    "slug": "estiramiento_de_dorsal_en_pared",
    "name": "Estiramiento de dorsal en pared",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda"
    ],
    "equipment": "Pared",
    "instructions": "Entrá suave al rango y salí igual de lento.",
    "movement_pattern": "Estiramiento superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren superior para liberar tensión.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de dorsal en pared"
    ],
    "variations": [
      "Estiramiento de pectoral en pared",
      "Estiramiento de pectoral con banda",
      "Estiramiento de pectoral en puerta",
      "Estiramiento de dorsal con banda"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "c7f67b46-dd09-57b0-a26c-f51eb32dd30f",
    "slug": "estiramiento_de_dorsal_con_banda",
    "name": "Estiramiento de dorsal con banda",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda"
    ],
    "equipment": "Banda",
    "instructions": "Entrá suave al rango y salí igual de lento.",
    "movement_pattern": "Estiramiento superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren superior para liberar tensión.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de dorsal banda",
      "Estiramiento de dorsal"
    ],
    "variations": [
      "Estiramiento de pectoral en pared",
      "Estiramiento de pectoral con banda",
      "Estiramiento de pectoral en puerta",
      "Estiramiento de dorsal en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "a2b89b1f-4300-55ef-a6d2-8e5e801369fe",
    "slug": "estiramiento_de_dorsal_en_puerta",
    "name": "Estiramiento de dorsal en puerta",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda"
    ],
    "equipment": "Peso corporal",
    "instructions": "Entrá suave al rango y salí igual de lento.",
    "movement_pattern": "Estiramiento superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren superior para liberar tensión.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de dorsal en puerta"
    ],
    "variations": [
      "Estiramiento de pectoral en pared",
      "Estiramiento de pectoral con banda",
      "Estiramiento de pectoral en puerta",
      "Estiramiento de dorsal en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "385a7331-a79a-5c4c-82dd-66254b47917f",
    "slug": "estiramiento_de_deltoide_posterior_en_pared",
    "name": "Estiramiento de deltoide posterior en pared",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda"
    ],
    "equipment": "Pared",
    "instructions": "Entrá suave al rango y salí igual de lento.",
    "movement_pattern": "Estiramiento superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren superior para liberar tensión.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de deltoide posterior en pared"
    ],
    "variations": [
      "Estiramiento de pectoral en pared",
      "Estiramiento de pectoral con banda",
      "Estiramiento de pectoral en puerta",
      "Estiramiento de dorsal en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "def43d5b-af0e-5205-8a83-9ec7ea3899d4",
    "slug": "estiramiento_de_deltoide_posterior_con_banda",
    "name": "Estiramiento de deltoide posterior con banda",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda"
    ],
    "equipment": "Banda",
    "instructions": "Entrá suave al rango y salí igual de lento.",
    "movement_pattern": "Estiramiento superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren superior para liberar tensión.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de deltoide posterior banda",
      "Estiramiento de deltoide posterior"
    ],
    "variations": [
      "Estiramiento de pectoral en pared",
      "Estiramiento de pectoral con banda",
      "Estiramiento de pectoral en puerta",
      "Estiramiento de dorsal en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "131dee9d-c435-5263-86e4-c557f7b7c2b8",
    "slug": "estiramiento_de_deltoide_posterior_en_puerta",
    "name": "Estiramiento de deltoide posterior en puerta",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda"
    ],
    "equipment": "Peso corporal",
    "instructions": "Entrá suave al rango y salí igual de lento.",
    "movement_pattern": "Estiramiento superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren superior para liberar tensión.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de deltoide posterior en puerta"
    ],
    "variations": [
      "Estiramiento de pectoral en pared",
      "Estiramiento de pectoral con banda",
      "Estiramiento de pectoral en puerta",
      "Estiramiento de dorsal en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "3a29e586-a01f-5b2d-877e-5a4c9cc41093",
    "slug": "estiramiento_de_cuello_en_pared",
    "name": "Estiramiento de cuello en pared",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda"
    ],
    "equipment": "Pared",
    "instructions": "Entrá suave al rango y salí igual de lento.",
    "movement_pattern": "Estiramiento superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren superior para liberar tensión.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de cuello en pared"
    ],
    "variations": [
      "Estiramiento de pectoral en pared",
      "Estiramiento de pectoral con banda",
      "Estiramiento de pectoral en puerta",
      "Estiramiento de dorsal en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "db1d8333-73b3-5895-b6e0-3cb61f3bbd8a",
    "slug": "estiramiento_de_cuello_con_banda",
    "name": "Estiramiento de cuello con banda",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda"
    ],
    "equipment": "Banda",
    "instructions": "Entrá suave al rango y salí igual de lento.",
    "movement_pattern": "Estiramiento superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren superior para liberar tensión.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de cuello banda",
      "Estiramiento de cuello"
    ],
    "variations": [
      "Estiramiento de pectoral en pared",
      "Estiramiento de pectoral con banda",
      "Estiramiento de pectoral en puerta",
      "Estiramiento de dorsal en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "3fd0205d-b6f2-5b58-95a3-50421bf5d977",
    "slug": "estiramiento_de_cuello_en_puerta",
    "name": "Estiramiento de cuello en puerta",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda"
    ],
    "equipment": "Peso corporal",
    "instructions": "Entrá suave al rango y salí igual de lento.",
    "movement_pattern": "Estiramiento superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren superior para liberar tensión.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de cuello en puerta"
    ],
    "variations": [
      "Estiramiento de pectoral en pared",
      "Estiramiento de pectoral con banda",
      "Estiramiento de pectoral en puerta",
      "Estiramiento de dorsal en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "1ea1b93d-b376-53a4-9d02-3cd5961c55ac",
    "slug": "estiramiento_de_triceps_sobre_cabeza",
    "name": "Estiramiento de tríceps sobre cabeza",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda"
    ],
    "equipment": "Peso corporal",
    "instructions": "Entrá suave al rango y salí igual de lento.",
    "movement_pattern": "Estiramiento superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren superior para liberar tensión.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de tríceps sobre cabeza"
    ],
    "variations": [
      "Estiramiento de pectoral en pared",
      "Estiramiento de pectoral con banda",
      "Estiramiento de pectoral en puerta",
      "Estiramiento de dorsal en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "0d978d0b-2446-558b-a5b9-757b859a4529",
    "slug": "estiramiento_de_biceps_en_pared",
    "name": "Estiramiento de bíceps en pared",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda"
    ],
    "equipment": "Pared",
    "instructions": "Entrá suave al rango y salí igual de lento.",
    "movement_pattern": "Estiramiento superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren superior para liberar tensión.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de bíceps en pared"
    ],
    "variations": [
      "Estiramiento de pectoral en pared",
      "Estiramiento de pectoral con banda",
      "Estiramiento de pectoral en puerta",
      "Estiramiento de dorsal en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "9ac7b176-bb5e-58d1-891e-6bd5758fd123",
    "slug": "estiramiento_toracico_con_banco",
    "name": "Estiramiento torácico con banco",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda"
    ],
    "equipment": "Peso corporal",
    "instructions": "Entrá suave al rango y salí igual de lento.",
    "movement_pattern": "Estiramiento superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren superior para liberar tensión.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento torácico banco",
      "Estiramiento torácico"
    ],
    "variations": [
      "Estiramiento de pectoral en pared",
      "Estiramiento de pectoral con banda",
      "Estiramiento de pectoral en puerta",
      "Estiramiento de dorsal en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "6050f18f-3226-57f7-93cf-0aa6aa45d56a",
    "slug": "postura_del_cachorro",
    "name": "Postura del cachorro",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Hombros",
      "Espalda"
    ],
    "equipment": "Peso corporal",
    "instructions": "Entrá suave al rango y salí igual de lento.",
    "movement_pattern": "Estiramiento superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren superior para liberar tensión.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Postura del cachorro"
    ],
    "variations": [
      "Estiramiento de pectoral en pared",
      "Estiramiento de pectoral con banda",
      "Estiramiento de pectoral en puerta",
      "Estiramiento de dorsal en pared"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "d33dcd4c-18f0-55b9-80d6-7db5568afdf9",
    "slug": "estiramiento_de_isquios_en_suelo",
    "name": "Estiramiento de isquios en suelo",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de isquios en suelo"
    ],
    "variations": [
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado",
      "Estiramiento de cuádriceps en suelo"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "7e27574a-c5ec-5156-93d2-eb608dfe1d91",
    "slug": "estiramiento_de_isquios_de_pie",
    "name": "Estiramiento de isquios de pie",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de isquios de pie"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado",
      "Estiramiento de cuádriceps en suelo"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "1e43733f-b5e8-503e-9767-4cb1266eeb35",
    "slug": "estiramiento_de_isquios_con_banda",
    "name": "Estiramiento de isquios con banda",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Banda",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de isquios banda",
      "Estiramiento de isquios"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios respirado",
      "Estiramiento de cuádriceps en suelo"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "903dd59f-2cd4-5408-97b3-332c11073fbe",
    "slug": "estiramiento_de_isquios_respirado",
    "name": "Estiramiento de isquios respirado",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de isquios respirado"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de cuádriceps en suelo"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "2eaeef6e-aaa2-5572-b225-b24acdf28b87",
    "slug": "estiramiento_de_cuadriceps_en_suelo",
    "name": "Estiramiento de cuádriceps en suelo",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de cuádriceps en suelo"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "868b5b40-0783-5937-8b9f-7b2d8dc963cb",
    "slug": "estiramiento_de_cuadriceps_de_pie",
    "name": "Estiramiento de cuádriceps de pie",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de cuádriceps de pie"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "9292d6fb-baed-51c8-afaf-3854bc480a1d",
    "slug": "estiramiento_de_cuadriceps_con_banda",
    "name": "Estiramiento de cuádriceps con banda",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Banda",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de cuádriceps banda",
      "Estiramiento de cuádriceps"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "7a18fa78-afca-5ff5-ae6a-30ae1757e98f",
    "slug": "estiramiento_de_cuadriceps_respirado",
    "name": "Estiramiento de cuádriceps respirado",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de cuádriceps respirado"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "f2b95a53-d245-5bdb-a24b-8b35e0c19ed9",
    "slug": "estiramiento_de_gluteos_en_suelo",
    "name": "Estiramiento de glúteos en suelo",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de glúteos en suelo"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "5d8f5e54-debb-5066-a61d-fdea2119479a",
    "slug": "estiramiento_de_gluteos_de_pie",
    "name": "Estiramiento de glúteos de pie",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de glúteos de pie"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "da56c518-2398-5672-94a1-21f4c53a141e",
    "slug": "estiramiento_de_gluteos_con_banda",
    "name": "Estiramiento de glúteos con banda",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Banda",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de glúteos banda",
      "Estiramiento de glúteos"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "8476c5bb-b3e2-5cb9-9968-d0699a953e30",
    "slug": "estiramiento_de_gluteos_respirado",
    "name": "Estiramiento de glúteos respirado",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de glúteos respirado"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "4b50e961-2b4b-5d52-a9e3-af1518b5baa5",
    "slug": "estiramiento_de_aductores_en_suelo",
    "name": "Estiramiento de aductores en suelo",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de aductores en suelo"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "828a37ea-3931-5825-ae83-ccb5a2ba9b84",
    "slug": "estiramiento_de_aductores_de_pie",
    "name": "Estiramiento de aductores de pie",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de aductores de pie"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "9831bee4-d6de-53eb-a517-98e86faad5b4",
    "slug": "estiramiento_de_aductores_con_banda",
    "name": "Estiramiento de aductores con banda",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Banda",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de aductores banda",
      "Estiramiento de aductores"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "cc3aee8e-96ee-50fd-88c6-1f64ebff046d",
    "slug": "estiramiento_de_aductores_respirado",
    "name": "Estiramiento de aductores respirado",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de aductores respirado"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "a8ef0ba8-c84c-522b-8d2c-2eb989701c16",
    "slug": "estiramiento_de_pantorrillas_en_suelo",
    "name": "Estiramiento de pantorrillas en suelo",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de pantorrillas en suelo"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "4fa4dcf8-17b0-5d8c-90bd-2621af596bac",
    "slug": "estiramiento_de_pantorrillas_de_pie",
    "name": "Estiramiento de pantorrillas de pie",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de pantorrillas de pie"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "7fa8cf0a-dda1-50d1-ada9-f4573bd6a12b",
    "slug": "estiramiento_de_pantorrillas_con_banda",
    "name": "Estiramiento de pantorrillas con banda",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Banda",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de pantorrillas banda",
      "Estiramiento de pantorrillas"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "d0b0023d-91d1-5821-99fc-cde9ba4ff882",
    "slug": "estiramiento_de_pantorrillas_respirado",
    "name": "Estiramiento de pantorrillas respirado",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Estiramiento de pantorrillas respirado"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "5ce84309-06b4-5108-b2e4-1bf17a4754ad",
    "slug": "figura_cuatro_en_suelo",
    "name": "Figura cuatro en suelo",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Figura cuatro en suelo"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "5359059b-ea27-56f1-bac0-05496d5d6c8d",
    "slug": "paloma_preparatoria",
    "name": "Paloma preparatoria",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Paloma preparatoria"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "70018469-6121-5f9c-abe2-b83d36c08a1f",
    "slug": "flexor_de_cadera_en_estocada",
    "name": "Flexor de cadera en estocada",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Flexor de cadera en estocada"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "e3a68f9c-9c57-5935-ac53-f19282bf86ec",
    "slug": "rana_de_aductores",
    "name": "Rana de aductores",
    "muscle_group": "Flexibilidad",
    "muscles_secondary": [
      "Piernas",
      "Glúteos"
    ],
    "equipment": "Peso corporal",
    "instructions": "Sostené el rango con respiración larga.",
    "movement_pattern": "Estiramiento inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "stretching",
    "description": "Estiramientos de tren inferior para bajar rigidez.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Rana de aductores"
    ],
    "variations": [
      "Estiramiento de isquios en suelo",
      "Estiramiento de isquios de pie",
      "Estiramiento de isquios con banda",
      "Estiramiento de isquios respirado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "a67717b8-3653-5720-b8d9-ab2843a7103e",
    "slug": "postura_del_nino",
    "name": "Postura del niño",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Postura del niño"
    ],
    "variations": [
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca",
      "Guerrero I"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "f161c038-4968-5650-a6ee-6e7ebdcafd4b",
    "slug": "perro_boca_abajo",
    "name": "Perro boca abajo",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Perro boca abajo"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca arriba",
      "Gato-vaca",
      "Guerrero I"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "e01ea3ef-e159-5840-8291-aa358659903f",
    "slug": "perro_boca_arriba",
    "name": "Perro boca arriba",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Perro boca arriba"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Gato-vaca",
      "Guerrero I"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "6d2d2f8b-cbbd-5040-b591-caee3fb10a8e",
    "slug": "gato_vaca",
    "name": "Gato-vaca",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Gato-vaca"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Guerrero I"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "c4684f83-713a-5692-82ea-9d0b2ee55828",
    "slug": "guerrero_i",
    "name": "Guerrero I",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Guerrero I"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "37568c20-cbe3-5d19-8259-18aae2d983fa",
    "slug": "guerrero_ii",
    "name": "Guerrero II",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Guerrero II"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "aecde9f0-5c48-58e3-b53b-f1dd31763235",
    "slug": "guerrero_iii",
    "name": "Guerrero III",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Guerrero III"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "c4398e9c-9bae-5da6-8401-5775f65fa2a0",
    "slug": "triangulo",
    "name": "Triángulo",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Triángulo"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "4b568cbe-5757-5f6a-8520-1c4c210af2ca",
    "slug": "media_luna",
    "name": "Media luna",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Media luna"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "5ba8502d-37d3-5cfa-9b0f-6948b975b2bb",
    "slug": "silla_yoga",
    "name": "Silla yoga",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Silla",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Silla yoga"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "6126ebdd-8e1d-5b53-8d59-a202b703dab6",
    "slug": "arbol",
    "name": "Árbol",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Árbol"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "0936bd0f-215e-570d-866f-c987d748d14f",
    "slug": "paloma",
    "name": "Paloma",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Paloma"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "df55b072-d262-57c9-a5f2-4f86b6c072b4",
    "slug": "paloma_reclinada",
    "name": "Paloma reclinada",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Paloma reclinada"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "85486301-b8ed-548c-ab3b-1db36a13c40c",
    "slug": "cobra",
    "name": "Cobra",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Cobra"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "44b1c796-bacd-5b52-aa9c-2461f72def85",
    "slug": "esfinge",
    "name": "Esfinge",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Esfinge"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "6a1ce768-875f-59bf-a38f-c7ffec393486",
    "slug": "plancha_yoga",
    "name": "Plancha yoga",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Plancha yoga"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "0391f94c-c245-5e43-a6bc-9279571a1298",
    "slug": "chaturanga_asistida",
    "name": "Chaturanga asistida",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Chaturanga asistida"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "3701e521-e8bf-5cfe-b212-d6bfb6586b12",
    "slug": "saludo_al_sol_a",
    "name": "Saludo al sol A",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Saludo al sol A"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "2ecd5893-86cd-5d44-8bda-5010f3fd5497",
    "slug": "saludo_al_sol_b",
    "name": "Saludo al sol B",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Saludo al sol B"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "1ed0dd6a-1ce9-525d-bfff-0c8b326ba95d",
    "slug": "torsion_supina",
    "name": "Torsión supina",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Torsión supina"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "0daf374e-8572-53c4-a878-d19b72185c30",
    "slug": "puente_yoga",
    "name": "Puente yoga",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Puente yoga"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "ecc396f2-b61b-5128-b4ec-f70f70fa4fbb",
    "slug": "happy_baby",
    "name": "Happy baby",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Happy baby"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "048555ad-b7de-5129-b549-bcf91d85135d",
    "slug": "pinza_de_pie",
    "name": "Pinza de pie",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pinza de pie"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "45b7c744-8cd7-5c6d-9c8e-b5ec8b489ea3",
    "slug": "pinza_sentada",
    "name": "Pinza sentada",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pinza sentada"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "80ae2f0b-9018-54c9-91a4-460265f5b483",
    "slug": "mariposa",
    "name": "Mariposa",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Mariposa"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "eeeccef1-03ea-5f42-8acb-d5c5b2a1123b",
    "slug": "lagarto",
    "name": "Lagarto",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Lagarto"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "18c28da6-1850-55a9-a41d-d397bf063863",
    "slug": "media_rana",
    "name": "Media rana",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Media rana"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "057f4d49-a0d7-5c56-809f-a4789c759a8c",
    "slug": "camello",
    "name": "Camello",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Camello"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "15c30a3b-2736-59bd-8c0d-8ce1994a9345",
    "slug": "conejo",
    "name": "Conejo",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Conejo"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "25117502-ea87-5e42-b56e-d7b3a18c2225",
    "slug": "postura_del_pez",
    "name": "Postura del pez",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Postura del pez"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "22811ea7-6aea-5ac0-a61b-82c5b172718a",
    "slug": "postura_del_cadaver",
    "name": "Postura del cadáver",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Postura del cadáver"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "acae52c1-6237-5a8a-8e25-2513036aed5b",
    "slug": "guirnalda",
    "name": "Guirnalda",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Guirnalda"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "89000d3d-b2a8-53e0-8854-e081c325d5fb",
    "slug": "low_lunge_yoga",
    "name": "Low lunge yoga",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Low lunge yoga"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "29d2f384-5d5b-5a16-9d4c-9d0c91fb9575",
    "slug": "delfin",
    "name": "Delfín",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Delfín"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "5cff2330-2216-52fe-91d5-d97715137475",
    "slug": "media_paloma",
    "name": "Media paloma",
    "muscle_group": "Yoga",
    "muscles_secondary": [
      "Movilidad",
      "Core"
    ],
    "equipment": "Colchoneta",
    "instructions": "Respirá largo y no persigas la forma si el cuerpo hoy pide menos rango.",
    "movement_pattern": "Yoga",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "yoga",
    "description": "Posturas de yoga para restaurar movilidad y respiración.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Media paloma"
    ],
    "variations": [
      "Postura del niño",
      "Perro boca abajo",
      "Perro boca arriba",
      "Gato-vaca"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "9ff71e8d-e428-5d2b-af6c-ab940eb09aae",
    "slug": "the_hundred",
    "name": "The hundred",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "The hundred"
    ],
    "variations": [
      "Roll up",
      "Roll down",
      "Single leg stretch",
      "Double leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "414e88c8-9e4d-5e88-b304-d91af35597bb",
    "slug": "roll_up",
    "name": "Roll up",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Roll up"
    ],
    "variations": [
      "The hundred",
      "Roll down",
      "Single leg stretch",
      "Double leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "5fa92f7a-1897-5d2f-9e23-93d637579377",
    "slug": "roll_down",
    "name": "Roll down",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Roll down"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Single leg stretch",
      "Double leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "d1934f66-8392-51e8-9f22-017160f5e9cf",
    "slug": "single_leg_stretch",
    "name": "Single leg stretch",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Single leg stretch"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Double leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "c15bbc43-fcc7-5cf3-905a-52b46667a034",
    "slug": "double_leg_stretch",
    "name": "Double leg stretch",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Double leg stretch"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "0099325a-4934-54e5-a965-4590eda2afaa",
    "slug": "criss_cross",
    "name": "Criss cross",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Criss cross"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "6eeab7fe-44ae-5f30-a1e4-9610258533e8",
    "slug": "teaser_basico",
    "name": "Teaser básico",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Teaser básico"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "2f014abb-72e5-5203-80f2-bcfbba331749",
    "slug": "teaser_avanzado",
    "name": "Teaser avanzado",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Teaser avanzado"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "673192e4-c3ae-55e5-8629-5eedb4facebf",
    "slug": "shoulder_bridge",
    "name": "Shoulder bridge",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Shoulder bridge"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "b7bd40be-1719-52d4-98ee-f3919889c0af",
    "slug": "swimming_de_pilates",
    "name": "Swimming de pilates",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Swimming de pilates"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "0cbdd7f9-8c08-5ce1-9e02-6c78d38520e8",
    "slug": "leg_circles",
    "name": "Leg circles",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Leg circles"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "971e15e0-38ff-5788-9e2f-c1df10dc6541",
    "slug": "spine_stretch_forward",
    "name": "Spine stretch forward",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Spine stretch forward"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "9d3a376a-783a-5231-9a4e-fea2c1333435",
    "slug": "saw",
    "name": "Saw",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Saw"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "e1f7f1fb-574e-51f6-b19c-9c4524b8d4c5",
    "slug": "open_leg_rocker",
    "name": "Open leg rocker",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Open leg rocker"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "e0aa36af-fb10-5ef7-9973-f8af522eb720",
    "slug": "side_kick_series",
    "name": "Side kick series",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Side kick series"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "02618d60-dd54-527e-9ba7-2728c87bc940",
    "slug": "clam_de_pilates",
    "name": "Clam de pilates",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Clam de pilates"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "e56e43b8-1bb9-56fc-83d0-81bf63a0c01b",
    "slug": "pelvic_curl",
    "name": "Pelvic curl",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pelvic curl"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "6f91dfb4-6b93-5519-96a6-e1ab78567c26",
    "slug": "chest_lift",
    "name": "Chest lift",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Chest lift"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "b8860377-afa2-5b7c-8c51-449a487f53aa",
    "slug": "toe_taps",
    "name": "Toe taps",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Toe taps"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "14694488-8396-591c-96fc-bb0214dcd681",
    "slug": "dead_bug_pilates",
    "name": "Dead bug pilates",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Dead bug pilates"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "3b696f5c-3a9b-5ebe-849b-50276123e6ad",
    "slug": "mermaid_stretch",
    "name": "Mermaid stretch",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Mermaid stretch"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "fac02e65-aad1-5909-9ee6-44bbe430aae8",
    "slug": "hip_opener_pilates",
    "name": "Hip opener pilates",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Hip opener pilates"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "b2b5a374-9477-547e-aed0-f27101d5a3cc",
    "slug": "scapular_isolation_pilates",
    "name": "Scapular isolation pilates",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Scapular isolation pilates"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "ec0701e6-40bf-50a4-8de1-cc5312736ea2",
    "slug": "wall_roll_down",
    "name": "Wall roll down",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Wall roll down"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "2fb35adf-ab36-5fb6-a6c1-b43eb34a3301",
    "slug": "footwork_supino",
    "name": "Footwork supino",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Footwork supino"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "4a58deda-dc05-5ee0-98d7-8a20fbee2fd7",
    "slug": "bridge_march",
    "name": "Bridge march",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Bridge march"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "9e944fc1-19ff-5dde-8e81-b32b8afff18f",
    "slug": "tabletop_hold",
    "name": "Tabletop hold",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Tabletop hold"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "f5d3651a-35bc-50ee-be9d-4eb48b9cb508",
    "slug": "pilates_push_up",
    "name": "Pilates push-up",
    "muscle_group": "Pilates",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Colchoneta",
    "instructions": "Movete con precisión y respiración larga.",
    "movement_pattern": "Pilates",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "pilates",
    "description": "Pilates para control del centro, postura y movilidad.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Pilates push-up"
    ],
    "variations": [
      "The hundred",
      "Roll up",
      "Roll down",
      "Single leg stretch"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "fa41074f-6419-56d2-b496-adb220746aa8",
    "slug": "rotacion_externa_de_hombro_con_banda",
    "name": "Rotación externa de hombro con banda",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Usá solo un rango que se sienta seguro y estable.",
    "movement_pattern": "Rehabilitación superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Reeducación para hombro, cuello y escápula.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Rotación externa de hombro banda",
      "Rotación externa de hombro"
    ],
    "variations": [
      "Rotación interna de hombro con banda",
      "Scaption con banda",
      "Scaption con mancuerna liviana",
      "YTW en banco inclinado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "c362ebdc-c978-56f0-9e39-f3fe1d645cd7",
    "slug": "rotacion_interna_de_hombro_con_banda",
    "name": "Rotación interna de hombro con banda",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Usá solo un rango que se sienta seguro y estable.",
    "movement_pattern": "Rehabilitación superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Reeducación para hombro, cuello y escápula.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Rotación interna de hombro banda",
      "Rotación interna de hombro"
    ],
    "variations": [
      "Rotación externa de hombro con banda",
      "Scaption con banda",
      "Scaption con mancuerna liviana",
      "YTW en banco inclinado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "e1c95612-ffab-5333-b8d8-b1942200184e",
    "slug": "scaption_con_banda",
    "name": "Scaption con banda",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Usá solo un rango que se sienta seguro y estable.",
    "movement_pattern": "Rehabilitación superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Reeducación para hombro, cuello y escápula.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Scaption banda",
      "Scaption"
    ],
    "variations": [
      "Rotación externa de hombro con banda",
      "Rotación interna de hombro con banda",
      "Scaption con mancuerna liviana",
      "YTW en banco inclinado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "83b86be5-a58c-5c46-9c85-ae7b6537f3e3",
    "slug": "scaption_con_mancuerna_liviana",
    "name": "Scaption con mancuerna liviana",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Mancuerna",
    "instructions": "Usá solo un rango que se sienta seguro y estable.",
    "movement_pattern": "Rehabilitación superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Reeducación para hombro, cuello y escápula.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Scaption mancuerna liviana",
      "Scaption"
    ],
    "variations": [
      "Rotación externa de hombro con banda",
      "Rotación interna de hombro con banda",
      "Scaption con banda",
      "YTW en banco inclinado"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "a4c22b2a-d9cc-514a-b807-47dcb81c56bc",
    "slug": "ytw_en_banco_inclinado",
    "name": "YTW en banco inclinado",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Usá solo un rango que se sienta seguro y estable.",
    "movement_pattern": "Rehabilitación superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Reeducación para hombro, cuello y escápula.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "YTW en banco inclinado"
    ],
    "variations": [
      "Rotación externa de hombro con banda",
      "Rotación interna de hombro con banda",
      "Scaption con banda",
      "Scaption con mancuerna liviana"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "2791d673-fe12-5331-b29f-407fc64f29dd",
    "slug": "serratus_punch_con_banda",
    "name": "Serratus punch con banda",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Usá solo un rango que se sienta seguro y estable.",
    "movement_pattern": "Rehabilitación superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Reeducación para hombro, cuello y escápula.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Serratus punch banda",
      "Serratus punch"
    ],
    "variations": [
      "Rotación externa de hombro con banda",
      "Rotación interna de hombro con banda",
      "Scaption con banda",
      "Scaption con mancuerna liviana"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "c5bcc4a5-a718-53de-b428-9a7176e4d486",
    "slug": "serratus_wall_slide",
    "name": "Serratus wall slide",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Usá solo un rango que se sienta seguro y estable.",
    "movement_pattern": "Rehabilitación superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Reeducación para hombro, cuello y escápula.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Serratus wall slide"
    ],
    "variations": [
      "Rotación externa de hombro con banda",
      "Rotación interna de hombro con banda",
      "Scaption con banda",
      "Scaption con mancuerna liviana"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "705b1267-bfb9-5d25-b53d-b4079173e611",
    "slug": "isometrico_de_remo_escapular",
    "name": "Isométrico de remo escapular",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Usá solo un rango que se sienta seguro y estable.",
    "movement_pattern": "Rehabilitación superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Reeducación para hombro, cuello y escápula.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Isométrico de remo escapular"
    ],
    "variations": [
      "Rotación externa de hombro con banda",
      "Rotación interna de hombro con banda",
      "Scaption con banda",
      "Scaption con mancuerna liviana"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "09aec189-7ac4-536a-81bf-ab5ac2390a3b",
    "slug": "carry_por_encima_de_la_cabeza_liviano",
    "name": "Carry por encima de la cabeza liviano",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Usá solo un rango que se sienta seguro y estable.",
    "movement_pattern": "Rehabilitación superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Reeducación para hombro, cuello y escápula.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Carry por encima de la cabeza liviano"
    ],
    "variations": [
      "Rotación externa de hombro con banda",
      "Rotación interna de hombro con banda",
      "Scaption con banda",
      "Scaption con mancuerna liviana"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "c318a2d9-6ca1-52f6-8b7c-36440e5f6417",
    "slug": "remo_rehabilitador_con_banda",
    "name": "Remo rehabilitador con banda",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Usá solo un rango que se sienta seguro y estable.",
    "movement_pattern": "Rehabilitación superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Reeducación para hombro, cuello y escápula.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo rehabilitador banda",
      "Remo rehabilitador"
    ],
    "variations": [
      "Rotación externa de hombro con banda",
      "Rotación interna de hombro con banda",
      "Scaption con banda",
      "Scaption con mancuerna liviana"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "ca8dd3e6-0794-52ea-88df-e384d9b852c5",
    "slug": "extension_toracica_asistida",
    "name": "Extensión torácica asistida",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Usá solo un rango que se sienta seguro y estable.",
    "movement_pattern": "Rehabilitación superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Reeducación para hombro, cuello y escápula.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Extensión torácica asistida"
    ],
    "variations": [
      "Rotación externa de hombro con banda",
      "Rotación interna de hombro con banda",
      "Scaption con banda",
      "Scaption con mancuerna liviana"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "1c78d0c8-b4f9-56b4-a659-12521a2bcd4a",
    "slug": "deslizamiento_neural_de_hombro",
    "name": "Deslizamiento neural de hombro",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Usá solo un rango que se sienta seguro y estable.",
    "movement_pattern": "Rehabilitación superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Reeducación para hombro, cuello y escápula.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Deslizamiento neural de hombro"
    ],
    "variations": [
      "Rotación externa de hombro con banda",
      "Rotación interna de hombro con banda",
      "Scaption con banda",
      "Scaption con mancuerna liviana"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "9b573967-7eec-573c-8168-cceeaf54bd05",
    "slug": "movilidad_cervical_controlada",
    "name": "Movilidad cervical controlada",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Usá solo un rango que se sienta seguro y estable.",
    "movement_pattern": "Rehabilitación superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Reeducación para hombro, cuello y escápula.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad cervical controlada"
    ],
    "variations": [
      "Rotación externa de hombro con banda",
      "Rotación interna de hombro con banda",
      "Scaption con banda",
      "Scaption con mancuerna liviana"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "28bfdfb2-efa8-5eed-a3f3-6d5d8e654f6e",
    "slug": "retraccion_cervical_en_pared",
    "name": "Retracción cervical en pared",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Pared",
    "instructions": "Usá solo un rango que se sienta seguro y estable.",
    "movement_pattern": "Rehabilitación superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Reeducación para hombro, cuello y escápula.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Retracción cervical en pared"
    ],
    "variations": [
      "Rotación externa de hombro con banda",
      "Rotación interna de hombro con banda",
      "Scaption con banda",
      "Scaption con mancuerna liviana"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "823b3d16-a2fb-5a27-a706-2e2cbe0f381e",
    "slug": "prone_cobra_suave",
    "name": "Prone cobra suave",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Usá solo un rango que se sienta seguro y estable.",
    "movement_pattern": "Rehabilitación superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Reeducación para hombro, cuello y escápula.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Prone cobra suave"
    ],
    "variations": [
      "Rotación externa de hombro con banda",
      "Rotación interna de hombro con banda",
      "Scaption con banda",
      "Scaption con mancuerna liviana"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "7403bd13-ec86-5b62-99f1-f8b3a12bb32a",
    "slug": "rotacion_toracica_lateral_respirada",
    "name": "Rotación torácica lateral respirada",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Usá solo un rango que se sienta seguro y estable.",
    "movement_pattern": "Rehabilitación superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Reeducación para hombro, cuello y escápula.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Rotación torácica lateral respirada"
    ],
    "variations": [
      "Rotación externa de hombro con banda",
      "Rotación interna de hombro con banda",
      "Scaption con banda",
      "Scaption con mancuerna liviana"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "0b54a769-8496-5f6a-844a-b419460037c8",
    "slug": "alcance_serrato_en_cuadrupedia",
    "name": "Alcance serrato en cuadrupedia",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Usá solo un rango que se sienta seguro y estable.",
    "movement_pattern": "Rehabilitación superior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Reeducación para hombro, cuello y escápula.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Alcance serrato en cuadrupedia"
    ],
    "variations": [
      "Rotación externa de hombro con banda",
      "Rotación interna de hombro con banda",
      "Scaption con banda",
      "Scaption con mancuerna liviana"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "f8a3d582-82d6-5e34-abfc-70c5ca1f8407",
    "slug": "remo_bajo_con_pausa_terapeutica",
    "name": "Remo bajo con pausa terapéutica",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Hombros",
      "Espalda alta"
    ],
    "equipment": "Banda",
    "instructions": "Usá solo un rango que se sienta seguro y estable.",
    "movement_pattern": "Rehabilitación superior",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Reeducación para hombro, cuello y escápula.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo bajo pausa terapéutica",
      "Remo bajo"
    ],
    "variations": [
      "Rotación externa de hombro con banda",
      "Rotación interna de hombro con banda",
      "Scaption con banda",
      "Scaption con mancuerna liviana"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "c81a1b12-3256-574b-b602-53ba6b6f1d71",
    "slug": "puente_lumbar_corto",
    "name": "Puente lumbar corto",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Core",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá control antes que intensidad.",
    "movement_pattern": "Rehabilitación inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Control básico para zona media, cadera, rodilla y tobillo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Puente lumbar corto"
    ],
    "variations": [
      "Respiración 90/90",
      "McGill curl-up",
      "Side plank corta terapéutica",
      "Bird dog terapéutico"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "46fd35fd-f78e-5951-81ef-84d30c270720",
    "slug": "respiracion_90_90",
    "name": "Respiración 90/90",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Core",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá control antes que intensidad.",
    "movement_pattern": "Rehabilitación inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Control básico para zona media, cadera, rodilla y tobillo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Respiración 90/90"
    ],
    "variations": [
      "Puente lumbar corto",
      "McGill curl-up",
      "Side plank corta terapéutica",
      "Bird dog terapéutico"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "58078c80-ccd4-5870-8b91-104da5ccf169",
    "slug": "mcgill_curl_up",
    "name": "McGill curl-up",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Core",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá control antes que intensidad.",
    "movement_pattern": "Rehabilitación inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Control básico para zona media, cadera, rodilla y tobillo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "McGill curl-up"
    ],
    "variations": [
      "Puente lumbar corto",
      "Respiración 90/90",
      "Side plank corta terapéutica",
      "Bird dog terapéutico"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "d8521882-92eb-509d-97e9-03c3e4c611e7",
    "slug": "side_plank_corta_terapeutica",
    "name": "Side plank corta terapéutica",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Core",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá control antes que intensidad.",
    "movement_pattern": "Rehabilitación inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Control básico para zona media, cadera, rodilla y tobillo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Side plank corta terapéutica"
    ],
    "variations": [
      "Puente lumbar corto",
      "Respiración 90/90",
      "McGill curl-up",
      "Bird dog terapéutico"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "75e35f44-92b3-5a08-8cb8-11776d2ec65c",
    "slug": "bird_dog_terapeutico",
    "name": "Bird dog terapéutico",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Core",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá control antes que intensidad.",
    "movement_pattern": "Rehabilitación inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Control básico para zona media, cadera, rodilla y tobillo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Bird dog terapéutico"
    ],
    "variations": [
      "Puente lumbar corto",
      "Respiración 90/90",
      "McGill curl-up",
      "Side plank corta terapéutica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "fd7b241d-ae3f-5a38-92d0-aff6c6ea2926",
    "slug": "extension_de_rodilla_sentado_suave",
    "name": "Extensión de rodilla sentado suave",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Core",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá control antes que intensidad.",
    "movement_pattern": "Rehabilitación inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Control básico para zona media, cadera, rodilla y tobillo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Extensión de rodilla sentado suave"
    ],
    "variations": [
      "Puente lumbar corto",
      "Respiración 90/90",
      "McGill curl-up",
      "Side plank corta terapéutica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "c17561ce-2c7d-513e-961b-379a03ba4bb9",
    "slug": "elevacion_de_talones_asistida",
    "name": "Elevación de talones asistida",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Core",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá control antes que intensidad.",
    "movement_pattern": "Rehabilitación inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Control básico para zona media, cadera, rodilla y tobillo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elevación de talones asistida"
    ],
    "variations": [
      "Puente lumbar corto",
      "Respiración 90/90",
      "McGill curl-up",
      "Side plank corta terapéutica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "f9515a61-6d08-5798-93ff-0bc37379144e",
    "slug": "marcha_en_sitio_terapeutica",
    "name": "Marcha en sitio terapéutica",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Core",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá control antes que intensidad.",
    "movement_pattern": "Rehabilitación inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Control básico para zona media, cadera, rodilla y tobillo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Marcha en sitio terapéutica"
    ],
    "variations": [
      "Puente lumbar corto",
      "Respiración 90/90",
      "McGill curl-up",
      "Side plank corta terapéutica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "b4bdbc02-cee8-5fa4-ad61-1c6e00b8a2b4",
    "slug": "sentarse_y_pararse_con_silla",
    "name": "Sentarse y pararse con silla",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Core",
      "Piernas"
    ],
    "equipment": "Silla",
    "instructions": "Buscá control antes que intensidad.",
    "movement_pattern": "Rehabilitación inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Control básico para zona media, cadera, rodilla y tobillo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentarse y pararse silla",
      "Sentarse y pararse"
    ],
    "variations": [
      "Puente lumbar corto",
      "Respiración 90/90",
      "McGill curl-up",
      "Side plank corta terapéutica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "93cb1b0e-bda4-5065-8594-7d65f1b02204",
    "slug": "step_bajo_controlado",
    "name": "Step bajo controlado",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Core",
      "Piernas"
    ],
    "equipment": "Step",
    "instructions": "Buscá control antes que intensidad.",
    "movement_pattern": "Rehabilitación inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Control básico para zona media, cadera, rodilla y tobillo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Step bajo controlado"
    ],
    "variations": [
      "Puente lumbar corto",
      "Respiración 90/90",
      "McGill curl-up",
      "Side plank corta terapéutica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "562f056f-753a-52a2-8a4e-7418b0e633bf",
    "slug": "movilidad_de_tobillo_terapeutica",
    "name": "Movilidad de tobillo terapéutica",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Core",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá control antes que intensidad.",
    "movement_pattern": "Rehabilitación inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Control básico para zona media, cadera, rodilla y tobillo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de tobillo terapéutica"
    ],
    "variations": [
      "Puente lumbar corto",
      "Respiración 90/90",
      "McGill curl-up",
      "Side plank corta terapéutica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "fde24b2f-eb0b-587a-81f7-dfde31bc196f",
    "slug": "glute_bridge_terapeutico",
    "name": "Glute bridge terapéutico",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Core",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá control antes que intensidad.",
    "movement_pattern": "Rehabilitación inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Control básico para zona media, cadera, rodilla y tobillo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Glute bridge terapéutico"
    ],
    "variations": [
      "Puente lumbar corto",
      "Respiración 90/90",
      "McGill curl-up",
      "Side plank corta terapéutica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "72cb41c8-7a88-5512-a8c3-ba28b37d2a80",
    "slug": "clam_con_banda_suave",
    "name": "Clam con banda suave",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Core",
      "Piernas"
    ],
    "equipment": "Banda",
    "instructions": "Buscá control antes que intensidad.",
    "movement_pattern": "Rehabilitación inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Control básico para zona media, cadera, rodilla y tobillo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Clam banda suave",
      "Clam"
    ],
    "variations": [
      "Puente lumbar corto",
      "Respiración 90/90",
      "McGill curl-up",
      "Side plank corta terapéutica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "b0d3c032-1121-5520-bff6-bbb1a6e2afdb",
    "slug": "abduccion_lateral_acostado",
    "name": "Abducción lateral acostado",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Core",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá control antes que intensidad.",
    "movement_pattern": "Rehabilitación inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Control básico para zona media, cadera, rodilla y tobillo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Abducción lateral acostado"
    ],
    "variations": [
      "Puente lumbar corto",
      "Respiración 90/90",
      "McGill curl-up",
      "Side plank corta terapéutica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "ff5b49f5-e7ba-51d6-8d31-b6670e5059d7",
    "slug": "peso_muerto_bisagra_con_palo",
    "name": "Peso muerto bisagra con palo",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Core",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá control antes que intensidad.",
    "movement_pattern": "Rehabilitación inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Control básico para zona media, cadera, rodilla y tobillo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Peso muerto bisagra palo",
      "Peso muerto bisagra"
    ],
    "variations": [
      "Puente lumbar corto",
      "Respiración 90/90",
      "McGill curl-up",
      "Side plank corta terapéutica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "e46eceea-d9ff-5006-aaa2-ac30fff28796",
    "slug": "wall_sit_terapeutica",
    "name": "Wall sit terapéutica",
    "muscle_group": "Rehab",
    "muscles_secondary": [
      "Core",
      "Piernas"
    ],
    "equipment": "Peso corporal",
    "instructions": "Buscá control antes que intensidad.",
    "movement_pattern": "Rehabilitación inferior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Control básico para zona media, cadera, rodilla y tobillo.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Wall sit terapéutica"
    ],
    "variations": [
      "Puente lumbar corto",
      "Respiración 90/90",
      "McGill curl-up",
      "Side plank corta terapéutica"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "0aff16cb-e0fc-578c-beb2-f51fe47b4da5",
    "slug": "sentadilla_prenatal_con_apoyo",
    "name": "Sentadilla prenatal con apoyo",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Peso corporal",
    "instructions": "Ajustá rango, respiración y esfuerzo según el momento.",
    "movement_pattern": "Prenatal y postparto",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Ejercicios adaptados para embarazo y recuperación postparto.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentadilla prenatal apoyo",
      "Sentadilla prenatal"
    ],
    "variations": [
      "Remo prenatal con banda",
      "Press de pecho prenatal con mancuernas",
      "Peso muerto prenatal con kettlebell",
      "Bird dog prenatal"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "60467c8f-ff58-502e-b2e7-f7a0fef2fb08",
    "slug": "remo_prenatal_con_banda",
    "name": "Remo prenatal con banda",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Banda",
    "instructions": "Ajustá rango, respiración y esfuerzo según el momento.",
    "movement_pattern": "Prenatal y postparto",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Ejercicios adaptados para embarazo y recuperación postparto.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo prenatal banda",
      "Remo prenatal"
    ],
    "variations": [
      "Sentadilla prenatal con apoyo",
      "Press de pecho prenatal con mancuernas",
      "Peso muerto prenatal con kettlebell",
      "Bird dog prenatal"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "c30cf0a4-5328-57b6-a16d-1692cc67359e",
    "slug": "press_de_pecho_prenatal_con_mancuernas",
    "name": "Press de pecho prenatal con mancuernas",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Mancuernas",
    "instructions": "Ajustá rango, respiración y esfuerzo según el momento.",
    "movement_pattern": "Prenatal y postparto",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Ejercicios adaptados para embarazo y recuperación postparto.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press de pecho prenatal mancuernas",
      "Press de pecho prenatal"
    ],
    "variations": [
      "Sentadilla prenatal con apoyo",
      "Remo prenatal con banda",
      "Peso muerto prenatal con kettlebell",
      "Bird dog prenatal"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "644dbf06-293e-5363-8152-67b7e69460ce",
    "slug": "peso_muerto_prenatal_con_kettlebell",
    "name": "Peso muerto prenatal con kettlebell",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Kettlebell",
    "instructions": "Ajustá rango, respiración y esfuerzo según el momento.",
    "movement_pattern": "Prenatal y postparto",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Ejercicios adaptados para embarazo y recuperación postparto.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Peso muerto prenatal kettlebell",
      "Peso muerto prenatal"
    ],
    "variations": [
      "Sentadilla prenatal con apoyo",
      "Remo prenatal con banda",
      "Press de pecho prenatal con mancuernas",
      "Bird dog prenatal"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "507433df-821d-59d8-aca3-4219a07c6014",
    "slug": "bird_dog_prenatal",
    "name": "Bird dog prenatal",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Peso corporal",
    "instructions": "Ajustá rango, respiración y esfuerzo según el momento.",
    "movement_pattern": "Prenatal y postparto",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Ejercicios adaptados para embarazo y recuperación postparto.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Bird dog prenatal"
    ],
    "variations": [
      "Sentadilla prenatal con apoyo",
      "Remo prenatal con banda",
      "Press de pecho prenatal con mancuernas",
      "Peso muerto prenatal con kettlebell"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "4a880e08-259f-57ab-9758-95c3f62d4f79",
    "slug": "respiracion_diafragmatica_prenatal",
    "name": "Respiración diafragmática prenatal",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Peso corporal",
    "instructions": "Ajustá rango, respiración y esfuerzo según el momento.",
    "movement_pattern": "Prenatal y postparto",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Ejercicios adaptados para embarazo y recuperación postparto.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Respiración diafragmática prenatal"
    ],
    "variations": [
      "Sentadilla prenatal con apoyo",
      "Remo prenatal con banda",
      "Press de pecho prenatal con mancuernas",
      "Peso muerto prenatal con kettlebell"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "616c6d23-c6be-594a-a604-161fca9eca34",
    "slug": "movilidad_de_cadera_prenatal",
    "name": "Movilidad de cadera prenatal",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Peso corporal",
    "instructions": "Ajustá rango, respiración y esfuerzo según el momento.",
    "movement_pattern": "Prenatal y postparto",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Ejercicios adaptados para embarazo y recuperación postparto.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de cadera prenatal"
    ],
    "variations": [
      "Sentadilla prenatal con apoyo",
      "Remo prenatal con banda",
      "Press de pecho prenatal con mancuernas",
      "Peso muerto prenatal con kettlebell"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "7c820d8b-fe5c-525b-88d0-83a4e2ed0c74",
    "slug": "caminata_prenatal_suave",
    "name": "Caminata prenatal suave",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Peso corporal",
    "instructions": "Ajustá rango, respiración y esfuerzo según el momento.",
    "movement_pattern": "Prenatal y postparto",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Ejercicios adaptados para embarazo y recuperación postparto.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Caminata prenatal suave"
    ],
    "variations": [
      "Sentadilla prenatal con apoyo",
      "Remo prenatal con banda",
      "Press de pecho prenatal con mancuernas",
      "Peso muerto prenatal con kettlebell"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "69452e88-b0d0-51bd-8892-ff73427cc39a",
    "slug": "apertura_toracica_prenatal",
    "name": "Apertura torácica prenatal",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Peso corporal",
    "instructions": "Ajustá rango, respiración y esfuerzo según el momento.",
    "movement_pattern": "Prenatal y postparto",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Ejercicios adaptados para embarazo y recuperación postparto.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Apertura torácica prenatal"
    ],
    "variations": [
      "Sentadilla prenatal con apoyo",
      "Remo prenatal con banda",
      "Press de pecho prenatal con mancuernas",
      "Peso muerto prenatal con kettlebell"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "4cbb7247-746e-5083-9fb5-595a1ce8daa6",
    "slug": "plancha_inclinada_prenatal",
    "name": "Plancha inclinada prenatal",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Peso corporal",
    "instructions": "Ajustá rango, respiración y esfuerzo según el momento.",
    "movement_pattern": "Prenatal y postparto",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Ejercicios adaptados para embarazo y recuperación postparto.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Plancha inclinada prenatal"
    ],
    "variations": [
      "Sentadilla prenatal con apoyo",
      "Remo prenatal con banda",
      "Press de pecho prenatal con mancuernas",
      "Peso muerto prenatal con kettlebell"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "74373b8f-091e-583f-af7b-8292995ac39f",
    "slug": "puente_postparto_basico",
    "name": "Puente postparto básico",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Peso corporal",
    "instructions": "Ajustá rango, respiración y esfuerzo según el momento.",
    "movement_pattern": "Prenatal y postparto",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Ejercicios adaptados para embarazo y recuperación postparto.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Puente postparto básico"
    ],
    "variations": [
      "Sentadilla prenatal con apoyo",
      "Remo prenatal con banda",
      "Press de pecho prenatal con mancuernas",
      "Peso muerto prenatal con kettlebell"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "93a10d94-64fb-5736-8fac-4294c8b09a36",
    "slug": "respiracion_360_postparto",
    "name": "Respiración 360 postparto",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Peso corporal",
    "instructions": "Ajustá rango, respiración y esfuerzo según el momento.",
    "movement_pattern": "Prenatal y postparto",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Ejercicios adaptados para embarazo y recuperación postparto.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Respiración 360 postparto"
    ],
    "variations": [
      "Sentadilla prenatal con apoyo",
      "Remo prenatal con banda",
      "Press de pecho prenatal con mancuernas",
      "Peso muerto prenatal con kettlebell"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "69c445ae-ede8-582a-8f6a-c8ebb9454d05",
    "slug": "dead_bug_postparto_basico",
    "name": "Dead bug postparto básico",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Peso corporal",
    "instructions": "Ajustá rango, respiración y esfuerzo según el momento.",
    "movement_pattern": "Prenatal y postparto",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Ejercicios adaptados para embarazo y recuperación postparto.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Dead bug postparto básico"
    ],
    "variations": [
      "Sentadilla prenatal con apoyo",
      "Remo prenatal con banda",
      "Press de pecho prenatal con mancuernas",
      "Peso muerto prenatal con kettlebell"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "a4cada0a-04c3-54e8-aef8-b80f8902062c",
    "slug": "clam_postparto",
    "name": "Clam postparto",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Peso corporal",
    "instructions": "Ajustá rango, respiración y esfuerzo según el momento.",
    "movement_pattern": "Prenatal y postparto",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Ejercicios adaptados para embarazo y recuperación postparto.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Clam postparto"
    ],
    "variations": [
      "Sentadilla prenatal con apoyo",
      "Remo prenatal con banda",
      "Press de pecho prenatal con mancuernas",
      "Peso muerto prenatal con kettlebell"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "8a1fd96e-35b7-53a5-b3cb-29f3248cd29e",
    "slug": "marcha_supina_postparto",
    "name": "Marcha supina postparto",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Peso corporal",
    "instructions": "Ajustá rango, respiración y esfuerzo según el momento.",
    "movement_pattern": "Prenatal y postparto",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Ejercicios adaptados para embarazo y recuperación postparto.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Marcha supina postparto"
    ],
    "variations": [
      "Sentadilla prenatal con apoyo",
      "Remo prenatal con banda",
      "Press de pecho prenatal con mancuernas",
      "Peso muerto prenatal con kettlebell"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "cfea255c-e117-5589-997e-c7491e08469e",
    "slug": "sentarse_y_pararse_postparto",
    "name": "Sentarse y pararse postparto",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Peso corporal",
    "instructions": "Ajustá rango, respiración y esfuerzo según el momento.",
    "movement_pattern": "Prenatal y postparto",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Ejercicios adaptados para embarazo y recuperación postparto.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentarse y pararse postparto"
    ],
    "variations": [
      "Sentadilla prenatal con apoyo",
      "Remo prenatal con banda",
      "Press de pecho prenatal con mancuernas",
      "Peso muerto prenatal con kettlebell"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "399bac25-bc07-5f6f-926d-99d2a3264e44",
    "slug": "caminata_postparto_suave",
    "name": "Caminata postparto suave",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Peso corporal",
    "instructions": "Ajustá rango, respiración y esfuerzo según el momento.",
    "movement_pattern": "Prenatal y postparto",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Ejercicios adaptados para embarazo y recuperación postparto.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Caminata postparto suave"
    ],
    "variations": [
      "Sentadilla prenatal con apoyo",
      "Remo prenatal con banda",
      "Press de pecho prenatal con mancuernas",
      "Peso muerto prenatal con kettlebell"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "36b0cd17-1bc2-5405-aacb-a99b1d482a91",
    "slug": "movilidad_toracica_postparto",
    "name": "Movilidad torácica postparto",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Core",
      "Movilidad"
    ],
    "equipment": "Peso corporal",
    "instructions": "Ajustá rango, respiración y esfuerzo según el momento.",
    "movement_pattern": "Prenatal y postparto",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "mobility",
    "description": "Ejercicios adaptados para embarazo y recuperación postparto.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad torácica postparto"
    ],
    "variations": [
      "Sentadilla prenatal con apoyo",
      "Remo prenatal con banda",
      "Press de pecho prenatal con mancuernas",
      "Peso muerto prenatal con kettlebell"
    ],
    "contraindications": [
      "Dolor agudo sin evaluación previa",
      "Mareo o pérdida de estabilidad"
    ]
  },
  {
    "id": "63caf4ae-6940-553b-ada1-fb03974b6e66",
    "slug": "marcha_en_sitio_senior",
    "name": "Marcha en sitio senior",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Equilibrio",
      "Movilidad"
    ],
    "equipment": "Silla",
    "instructions": "Movete con confianza y usando apoyos cuando hagan falta.",
    "movement_pattern": "Funcional senior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Trabajo funcional para fuerza básica, equilibrio y autonomía.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Marcha en sitio senior"
    ],
    "variations": [
      "Step touch senior",
      "Sentarse y pararse senior",
      "Remo con banda senior",
      "Press de pecho con banda senior"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "7d73fca6-1855-5fca-a94d-b78531fa9dc2",
    "slug": "step_touch_senior",
    "name": "Step touch senior",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Equilibrio",
      "Movilidad"
    ],
    "equipment": "Step",
    "instructions": "Movete con confianza y usando apoyos cuando hagan falta.",
    "movement_pattern": "Funcional senior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Trabajo funcional para fuerza básica, equilibrio y autonomía.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Step touch senior"
    ],
    "variations": [
      "Marcha en sitio senior",
      "Sentarse y pararse senior",
      "Remo con banda senior",
      "Press de pecho con banda senior"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "f52bc0fe-c948-52a5-b92b-82cf476e4360",
    "slug": "sentarse_y_pararse_senior",
    "name": "Sentarse y pararse senior",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Equilibrio",
      "Movilidad"
    ],
    "equipment": "Silla",
    "instructions": "Movete con confianza y usando apoyos cuando hagan falta.",
    "movement_pattern": "Funcional senior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Trabajo funcional para fuerza básica, equilibrio y autonomía.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sentarse y pararse senior"
    ],
    "variations": [
      "Marcha en sitio senior",
      "Step touch senior",
      "Remo con banda senior",
      "Press de pecho con banda senior"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "444fbf9c-8046-5909-8a7e-5c7cfb6031fc",
    "slug": "remo_con_banda_senior",
    "name": "Remo con banda senior",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Equilibrio",
      "Movilidad"
    ],
    "equipment": "Banda",
    "instructions": "Movete con confianza y usando apoyos cuando hagan falta.",
    "movement_pattern": "Funcional senior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Trabajo funcional para fuerza básica, equilibrio y autonomía.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Remo banda senior",
      "Remo"
    ],
    "variations": [
      "Marcha en sitio senior",
      "Step touch senior",
      "Sentarse y pararse senior",
      "Press de pecho con banda senior"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "fd30b42a-c96c-5ee0-8a62-c21c65877873",
    "slug": "press_de_pecho_con_banda_senior",
    "name": "Press de pecho con banda senior",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Equilibrio",
      "Movilidad"
    ],
    "equipment": "Banda",
    "instructions": "Movete con confianza y usando apoyos cuando hagan falta.",
    "movement_pattern": "Funcional senior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Trabajo funcional para fuerza básica, equilibrio y autonomía.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Press de pecho banda senior",
      "Press de pecho"
    ],
    "variations": [
      "Marcha en sitio senior",
      "Step touch senior",
      "Sentarse y pararse senior",
      "Remo con banda senior"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "6e48c168-d678-57a7-b43a-5ee6ea5db3a8",
    "slug": "elevacion_lateral_senior",
    "name": "Elevación lateral senior",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Equilibrio",
      "Movilidad"
    ],
    "equipment": "Silla",
    "instructions": "Movete con confianza y usando apoyos cuando hagan falta.",
    "movement_pattern": "Funcional senior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Trabajo funcional para fuerza básica, equilibrio y autonomía.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elevación lateral senior"
    ],
    "variations": [
      "Marcha en sitio senior",
      "Step touch senior",
      "Sentarse y pararse senior",
      "Remo con banda senior"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "4cb403c4-017f-569c-b3ce-44399cf1a636",
    "slug": "curl_de_biceps_senior",
    "name": "Curl de bíceps senior",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Equilibrio",
      "Movilidad"
    ],
    "equipment": "Silla",
    "instructions": "Movete con confianza y usando apoyos cuando hagan falta.",
    "movement_pattern": "Funcional senior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Trabajo funcional para fuerza básica, equilibrio y autonomía.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Curl de bíceps senior"
    ],
    "variations": [
      "Marcha en sitio senior",
      "Step touch senior",
      "Sentarse y pararse senior",
      "Remo con banda senior"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "a2dec265-b426-57b7-9c7d-84974a800227",
    "slug": "extension_de_triceps_senior",
    "name": "Extensión de tríceps senior",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Equilibrio",
      "Movilidad"
    ],
    "equipment": "Silla",
    "instructions": "Movete con confianza y usando apoyos cuando hagan falta.",
    "movement_pattern": "Funcional senior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Trabajo funcional para fuerza básica, equilibrio y autonomía.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Extensión de tríceps senior"
    ],
    "variations": [
      "Marcha en sitio senior",
      "Step touch senior",
      "Sentarse y pararse senior",
      "Remo con banda senior"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "c1e48f4d-6dcd-544d-baab-93631c52016b",
    "slug": "equilibrio_unipodal_asistido",
    "name": "Equilibrio unipodal asistido",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Equilibrio",
      "Movilidad"
    ],
    "equipment": "Silla",
    "instructions": "Movete con confianza y usando apoyos cuando hagan falta.",
    "movement_pattern": "Funcional senior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Trabajo funcional para fuerza básica, equilibrio y autonomía.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Equilibrio unipodal asistido"
    ],
    "variations": [
      "Marcha en sitio senior",
      "Step touch senior",
      "Sentarse y pararse senior",
      "Remo con banda senior"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "1faae922-7062-5978-8752-6a664b1d626a",
    "slug": "caminata_lateral_senior",
    "name": "Caminata lateral senior",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Equilibrio",
      "Movilidad"
    ],
    "equipment": "Silla",
    "instructions": "Movete con confianza y usando apoyos cuando hagan falta.",
    "movement_pattern": "Funcional senior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Trabajo funcional para fuerza básica, equilibrio y autonomía.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Caminata lateral senior"
    ],
    "variations": [
      "Marcha en sitio senior",
      "Step touch senior",
      "Sentarse y pararse senior",
      "Remo con banda senior"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "bb3384cf-fe27-5daf-9b36-6343ae13ad44",
    "slug": "levantarse_de_silla_con_pausa",
    "name": "Levantarse de silla con pausa",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Equilibrio",
      "Movilidad"
    ],
    "equipment": "Silla",
    "instructions": "Movete con confianza y usando apoyos cuando hagan falta.",
    "movement_pattern": "Funcional senior",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Trabajo funcional para fuerza básica, equilibrio y autonomía.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Levantarse de silla pausa",
      "Levantarse de silla"
    ],
    "variations": [
      "Marcha en sitio senior",
      "Step touch senior",
      "Sentarse y pararse senior",
      "Remo con banda senior"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "e5f98391-2dfe-50a9-b5c0-73f25782b9ed",
    "slug": "puente_de_gluteo_senior",
    "name": "Puente de glúteo senior",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Equilibrio",
      "Movilidad"
    ],
    "equipment": "Silla",
    "instructions": "Movete con confianza y usando apoyos cuando hagan falta.",
    "movement_pattern": "Funcional senior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Trabajo funcional para fuerza básica, equilibrio y autonomía.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Puente de glúteo senior"
    ],
    "variations": [
      "Marcha en sitio senior",
      "Step touch senior",
      "Sentarse y pararse senior",
      "Remo con banda senior"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "b229f5fe-1d3c-557f-b9af-cd46ca048c7d",
    "slug": "elevacion_de_talones_senior",
    "name": "Elevación de talones senior",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Equilibrio",
      "Movilidad"
    ],
    "equipment": "Silla",
    "instructions": "Movete con confianza y usando apoyos cuando hagan falta.",
    "movement_pattern": "Funcional senior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Trabajo funcional para fuerza básica, equilibrio y autonomía.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Elevación de talones senior"
    ],
    "variations": [
      "Marcha en sitio senior",
      "Step touch senior",
      "Sentarse y pararse senior",
      "Remo con banda senior"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "c8d834fe-2221-5f97-bdb0-c7800551ae5a",
    "slug": "movilidad_de_hombro_senior",
    "name": "Movilidad de hombro senior",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Equilibrio",
      "Movilidad"
    ],
    "equipment": "Silla",
    "instructions": "Movete con confianza y usando apoyos cuando hagan falta.",
    "movement_pattern": "Funcional senior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Trabajo funcional para fuerza básica, equilibrio y autonomía.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Movilidad de hombro senior"
    ],
    "variations": [
      "Marcha en sitio senior",
      "Step touch senior",
      "Sentarse y pararse senior",
      "Remo con banda senior"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "e112a029-a607-59f1-8ada-616b5a1de1fa",
    "slug": "respiracion_movilidad_senior",
    "name": "Respiración movilidad senior",
    "muscle_group": "Especial",
    "muscles_secondary": [
      "Equilibrio",
      "Movilidad"
    ],
    "equipment": "Silla",
    "instructions": "Movete con confianza y usando apoyos cuando hagan falta.",
    "movement_pattern": "Funcional senior",
    "difficulty_level": "Inicial",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "bodyweight",
    "description": "Trabajo funcional para fuerza básica, equilibrio y autonomía.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Respiración movilidad senior"
    ],
    "variations": [
      "Marcha en sitio senior",
      "Step touch senior",
      "Sentarse y pararse senior",
      "Remo con banda senior"
    ],
    "contraindications": [
      "Dolor agudo no evaluado"
    ]
  },
  {
    "id": "5e8a29de-53b4-5dc7-8a4b-416eef0739a3",
    "slug": "cambio_de_direccion_45_grados",
    "name": "Cambio de dirección 45 grados",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Cambio de dirección 45 grados"
    ],
    "variations": [
      "Cambio de dirección 90 grados",
      "Shuttle run corto",
      "Shuttle run largo",
      "Escalera lateral"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "526eb44d-e2b5-5ac8-af8a-6a82c494b812",
    "slug": "cambio_de_direccion_90_grados",
    "name": "Cambio de dirección 90 grados",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Cambio de dirección 90 grados"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Shuttle run corto",
      "Shuttle run largo",
      "Escalera lateral"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "097c6676-5067-51e2-97cc-9175c88aa827",
    "slug": "shuttle_run_corto",
    "name": "Shuttle run corto",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Shuttle run corto"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Cambio de dirección 90 grados",
      "Shuttle run largo",
      "Escalera lateral"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "8081c7ab-c9dd-5bea-823f-0bd07b7a6e5e",
    "slug": "shuttle_run_largo",
    "name": "Shuttle run largo",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Shuttle run largo"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Cambio de dirección 90 grados",
      "Shuttle run corto",
      "Escalera lateral"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "08e71e18-1e1e-535a-a70d-eb6640f9fa2d",
    "slug": "escalera_lateral",
    "name": "Escalera lateral",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Escalera lateral"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Cambio de dirección 90 grados",
      "Shuttle run corto",
      "Shuttle run largo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "58c96c48-dd5d-5d81-a553-e6086bb27da0",
    "slug": "escalera_in_out",
    "name": "Escalera in-out",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Escalera in-out"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Cambio de dirección 90 grados",
      "Shuttle run corto",
      "Shuttle run largo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "e2f8e614-1501-5814-8a9e-17a7ae13f55d",
    "slug": "escalera_carioca",
    "name": "Escalera carioca",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Escalera carioca"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Cambio de dirección 90 grados",
      "Shuttle run corto",
      "Shuttle run largo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "8545c898-ca47-58a7-9220-f678a634f563",
    "slug": "skipping_lateral",
    "name": "Skipping lateral",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Skipping lateral"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Cambio de dirección 90 grados",
      "Shuttle run corto",
      "Shuttle run largo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "05ab14d2-4b6f-585f-8010-196e5a6cfae8",
    "slug": "defensa_deslizante",
    "name": "Defensa deslizante",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Defensa deslizante"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Cambio de dirección 90 grados",
      "Shuttle run corto",
      "Shuttle run largo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "6c62643f-26ec-5f7b-afa5-27679ed63fa4",
    "slug": "carrera_con_frenada",
    "name": "Carrera con frenada",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Carrera frenada",
      "Carrera"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Cambio de dirección 90 grados",
      "Shuttle run corto",
      "Shuttle run largo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "83bc8471-733d-55f8-8668-e7389ef6ece8",
    "slug": "aceleracion_reactiva",
    "name": "Aceleración reactiva",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Aceleración reactiva"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Cambio de dirección 90 grados",
      "Shuttle run corto",
      "Shuttle run largo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "44196784-bca4-5e08-916d-f79e1a0e01e2",
    "slug": "salto_y_frenada",
    "name": "Salto y frenada",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Salto y frenada"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Cambio de dirección 90 grados",
      "Shuttle run corto",
      "Shuttle run largo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "bb7994b5-46e2-5012-aa92-3f875b85971d",
    "slug": "lanzamiento_rotacional_de_balon_medicinal",
    "name": "Lanzamiento rotacional de balón medicinal",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Balón medicinal",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Lanzamiento rotacional de balón medicinal"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Cambio de dirección 90 grados",
      "Shuttle run corto",
      "Shuttle run largo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "2cb40c71-138f-529a-a377-6b47842ceaf5",
    "slug": "lanzamiento_lateral_de_balon_medicinal",
    "name": "Lanzamiento lateral de balón medicinal",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Balón medicinal",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Lanzamiento lateral de balón medicinal"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Cambio de dirección 90 grados",
      "Shuttle run corto",
      "Shuttle run largo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "9c631c35-7596-5604-9c05-bdc411b3ebfb",
    "slug": "sprint_con_trineo_liviano",
    "name": "Sprint con trineo liviano",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Trineo",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Sprint trineo liviano",
      "Sprint"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Cambio de dirección 90 grados",
      "Shuttle run corto",
      "Shuttle run largo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "88f9badd-e7a7-5ba0-ae08-5c1dc9561791",
    "slug": "empuje_atletico_de_trineo",
    "name": "Empuje atlético de trineo",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Trineo",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Empuje atlético de trineo"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Cambio de dirección 90 grados",
      "Shuttle run corto",
      "Shuttle run largo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "f0ec9cfa-8a40-5c0e-b666-1126936d86f2",
    "slug": "bound_de_patinador",
    "name": "Bound de patinador",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Bound de patinador"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Cambio de dirección 90 grados",
      "Shuttle run corto",
      "Shuttle run largo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "7ebab28e-75bc-5325-8720-9d8279a54296",
    "slug": "carioca_tecnico",
    "name": "Carioca técnico",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Carioca técnico"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Cambio de dirección 90 grados",
      "Shuttle run corto",
      "Shuttle run largo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "54005dd8-8521-5ffd-892f-7d44ca9acb33",
    "slug": "drill_de_conos_5_10_5",
    "name": "Drill de conos 5-10-5",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Drill de conos 5-10-5"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Cambio de dirección 90 grados",
      "Shuttle run corto",
      "Shuttle run largo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  },
  {
    "id": "38e7fc4e-3100-5686-bb0d-3d8a1b801e9d",
    "slug": "drill_de_conos_en_t",
    "name": "Drill de conos en T",
    "muscle_group": "Atlético",
    "muscles_secondary": [
      "Piernas",
      "Core"
    ],
    "equipment": "Peso corporal",
    "instructions": "Priorizá calidad de pies y control del frenado.",
    "movement_pattern": "Agilidad",
    "difficulty_level": "Intermedio",
    "cues": [
      "Respirá estable",
      "Rango limpio",
      "Controlá la vuelta"
    ],
    "mistakes": [
      "Apurarse",
      "Perder técnica",
      "Usar más carga de la que podés controlar"
    ],
    "is_global": true,
    "type": "conditioning",
    "description": "Trabajo atlético para agilidad y cambios de dirección.",
    "gif_url": null,
    "video_url": null,
    "aliases": [
      "Drill de conos en T"
    ],
    "variations": [
      "Cambio de dirección 45 grados",
      "Cambio de dirección 90 grados",
      "Shuttle run corto",
      "Shuttle run largo"
    ],
    "contraindications": [
      "Mareo o dolor en el pecho",
      "Fatiga extrema no recuperada"
    ]
  }
];

export const GENERATED_WORKOUT_ROUTINES: Routine[] = [
  {
    "id": "c52ec8e6-0f0a-5baf-ad2d-705955237582",
    "name": "Base total A",
    "description": "Full body simple para volver a entrenar con básicos estables y poco ruido.",
    "split_tag": "Full body",
    "goal_tag": "Fuerza base",
    "estimated_duration_min": 55,
    "schedule_day": "Lunes",
    "is_primary": true,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "6fab3ac3-aa88-5970-921e-651b2ffa095a",
        "exercise_name": "Sentadilla con barra",
        "sets_target": 4,
        "reps_target": 6,
        "weight_suggestion_kg": 60,
        "order": 0,
        "rest_seconds": 90,
        "rpe_target": 7
      },
      {
        "exercise_id": "4dbd0202-6649-54a3-95ca-d437d3b3c56a",
        "exercise_name": "Press de banca con barra",
        "sets_target": 4,
        "reps_target": 6,
        "weight_suggestion_kg": 45,
        "order": 1,
        "rest_seconds": 90,
        "rpe_target": 7
      },
      {
        "exercise_id": "45f587b5-9858-5513-b305-277e072b99d8",
        "exercise_name": "Remo con barra",
        "sets_target": 3,
        "reps_target": 8,
        "weight_suggestion_kg": 42.5,
        "order": 2,
        "rest_seconds": 90,
        "rpe_target": 7
      },
      {
        "exercise_id": "abee45f4-b1ce-5220-bbd7-21211759d1f5",
        "exercise_name": "Plancha frontal",
        "sets_target": 3,
        "reps_target": 45,
        "weight_suggestion_kg": 0,
        "order": 3,
        "rest_seconds": 60,
        "group_label": "Core"
      }
    ],
    "slug": "foundation_full_body_a"
  },
  {
    "id": "021b2736-17de-59ee-a557-c3527ca322c6",
    "name": "Base total B",
    "description": "Segunda sesión base con bisagra, empuje vertical y tracción controlada.",
    "split_tag": "Full body",
    "goal_tag": "Fuerza base",
    "estimated_duration_min": 54,
    "schedule_day": "Miércoles",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "c0af26a4-16cc-5bb3-b42f-e3c91e8324f6",
        "exercise_name": "Peso muerto con barra",
        "sets_target": 4,
        "reps_target": 5,
        "weight_suggestion_kg": 80,
        "order": 0,
        "rest_seconds": 150,
        "rpe_target": 7
      },
      {
        "exercise_id": "2a3336e2-6165-5a88-90b9-6c1737220f9a",
        "exercise_name": "Press militar con barra",
        "sets_target": 4,
        "reps_target": 6,
        "weight_suggestion_kg": 30,
        "order": 1,
        "rest_seconds": 90,
        "rpe_target": 7
      },
      {
        "exercise_id": "dd99446f-63f1-54bb-aab6-15b443490678",
        "exercise_name": "Jalón al pecho pronado",
        "sets_target": 3,
        "reps_target": 10,
        "weight_suggestion_kg": 40,
        "order": 2,
        "rest_seconds": 90
      },
      {
        "exercise_id": "1bb29304-beb8-5403-a18f-0e1727c87c49",
        "exercise_name": "Dead bug estándar",
        "sets_target": 3,
        "reps_target": 10,
        "weight_suggestion_kg": 0,
        "order": 3,
        "rest_seconds": 60,
        "group_label": "Core"
      }
    ],
    "slug": "foundation_full_body_b"
  },
  {
    "id": "289aff2b-c8e0-5415-8ea7-34afbc672722",
    "name": "Base total C",
    "description": "Bloque de cierre semanal con piernas unilaterales y torso más estable.",
    "split_tag": "Full body",
    "goal_tag": "Fuerza base",
    "estimated_duration_min": 52,
    "schedule_day": "Viernes",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "bece1220-5689-5f42-b8b9-429e2b7b6135",
        "exercise_name": "Sentadilla goblet",
        "sets_target": 4,
        "reps_target": 10,
        "weight_suggestion_kg": 24,
        "order": 0,
        "rest_seconds": 90
      },
      {
        "exercise_id": "41f00082-74b2-5b36-9533-db311c9bbf7a",
        "exercise_name": "Press inclinado con mancuernas",
        "sets_target": 4,
        "reps_target": 10,
        "weight_suggestion_kg": 18,
        "order": 1,
        "rest_seconds": 90
      },
      {
        "exercise_id": "9d3d4920-e2df-57bf-aba0-fa1f69c6e1c7",
        "exercise_name": "Remo sentado en polea baja",
        "sets_target": 3,
        "reps_target": 12,
        "weight_suggestion_kg": 40,
        "order": 2,
        "rest_seconds": 90
      },
      {
        "exercise_id": "fb65685e-941e-5522-be70-1df01aa19a82",
        "exercise_name": "Pallof press en polea",
        "sets_target": 3,
        "reps_target": 12,
        "weight_suggestion_kg": 12,
        "order": 3,
        "rest_seconds": 60,
        "group_label": "Core"
      }
    ],
    "slug": "foundation_full_body_c"
  },
  {
    "id": "afb64124-f493-5f84-a1b0-da78661a351b",
    "name": "Upper fuerza A",
    "description": "Torso fuerte con énfasis en empujes y tirones pesados.",
    "split_tag": "Upper",
    "goal_tag": "Fuerza",
    "estimated_duration_min": 60,
    "schedule_day": "Lunes",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "4dbd0202-6649-54a3-95ca-d437d3b3c56a",
        "exercise_name": "Press de banca con barra",
        "sets_target": 5,
        "reps_target": 5,
        "weight_suggestion_kg": 50,
        "order": 0,
        "rest_seconds": 150
      },
      {
        "exercise_id": "a184a9bd-812c-5559-9dcf-8fdcd8b8ec13",
        "exercise_name": "Dominada pronada",
        "sets_target": 4,
        "reps_target": 6,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 120
      },
      {
        "exercise_id": "2a3336e2-6165-5a88-90b9-6c1737220f9a",
        "exercise_name": "Press militar con barra",
        "sets_target": 4,
        "reps_target": 6,
        "weight_suggestion_kg": 32.5,
        "order": 2,
        "rest_seconds": 90
      },
      {
        "exercise_id": "d5707805-831a-5197-b7a3-03f1e37a3f72",
        "exercise_name": "Face pull en polea alta",
        "sets_target": 3,
        "reps_target": 15,
        "weight_suggestion_kg": 20,
        "order": 3,
        "rest_seconds": 60
      },
      {
        "exercise_id": "02505bff-0bbd-5e9d-9de8-951a8d5d9d93",
        "exercise_name": "Curl de bíceps con barra EZ",
        "sets_target": 3,
        "reps_target": 10,
        "weight_suggestion_kg": 20,
        "order": 4,
        "rest_seconds": 60
      },
      {
        "exercise_id": "5c619fef-8c4e-500d-88e0-0a9f37373b5d",
        "exercise_name": "Pushdown de tríceps con cuerda",
        "sets_target": 3,
        "reps_target": 12,
        "weight_suggestion_kg": 20,
        "order": 5,
        "rest_seconds": 60
      }
    ],
    "slug": "upper_strength_a"
  },
  {
    "id": "d1964882-dfb0-5ae0-a251-1412568798e6",
    "name": "Lower fuerza A",
    "description": "Bloque inferior con sentadilla, bisagra y trabajo complementario útil.",
    "split_tag": "Lower",
    "goal_tag": "Fuerza",
    "estimated_duration_min": 62,
    "schedule_day": "Martes",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "6fab3ac3-aa88-5970-921e-651b2ffa095a",
        "exercise_name": "Sentadilla con barra",
        "sets_target": 5,
        "reps_target": 5,
        "weight_suggestion_kg": 70,
        "order": 0,
        "rest_seconds": 150
      },
      {
        "exercise_id": "42a8879c-d1d2-55de-a64d-c4045e5a019a",
        "exercise_name": "Peso muerto rumano con barra",
        "sets_target": 4,
        "reps_target": 8,
        "weight_suggestion_kg": 65,
        "order": 1,
        "rest_seconds": 120
      },
      {
        "exercise_id": "6a3e8203-1555-5135-8da1-52fac61fcaa1",
        "exercise_name": "Prensa de piernas alta",
        "sets_target": 3,
        "reps_target": 10,
        "weight_suggestion_kg": 120,
        "order": 2,
        "rest_seconds": 90
      },
      {
        "exercise_id": "73f43eb4-6078-502b-89bc-b8ff01f95bdf",
        "exercise_name": "Curl femoral sentado en máquina",
        "sets_target": 3,
        "reps_target": 12,
        "weight_suggestion_kg": 35,
        "order": 3,
        "rest_seconds": 90
      },
      {
        "exercise_id": "80c7b6d3-4fa5-5bf4-89a5-c7430c567825",
        "exercise_name": "Elevación de pantorrillas de pie",
        "sets_target": 4,
        "reps_target": 12,
        "weight_suggestion_kg": 30,
        "order": 4,
        "rest_seconds": 45
      }
    ],
    "slug": "lower_strength_a"
  },
  {
    "id": "c60a2b23-0e1b-58c9-8264-bac4ba1974d9",
    "name": "Push hipertrofia",
    "description": "Empuje alto en volumen para pecho, hombro y tríceps.",
    "split_tag": "Push",
    "goal_tag": "Hipertrofia",
    "estimated_duration_min": 58,
    "schedule_day": "Lunes",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "41f00082-74b2-5b36-9533-db311c9bbf7a",
        "exercise_name": "Press inclinado con mancuernas",
        "sets_target": 4,
        "reps_target": 10,
        "weight_suggestion_kg": 20,
        "order": 0,
        "rest_seconds": 90
      },
      {
        "exercise_id": "28cd0339-3576-52a5-9527-6be594f30897",
        "exercise_name": "Press convergente en máquina",
        "sets_target": 4,
        "reps_target": 10,
        "weight_suggestion_kg": 45,
        "order": 1,
        "rest_seconds": 90
      },
      {
        "exercise_id": "6ff81c25-b7d6-5a67-b046-7791d0da9dfa",
        "exercise_name": "Elevación lateral con mancuernas",
        "sets_target": 4,
        "reps_target": 15,
        "weight_suggestion_kg": 8,
        "order": 2,
        "rest_seconds": 60
      },
      {
        "exercise_id": "41254be1-dfb4-5120-b912-df492f88a551",
        "exercise_name": "Pec deck tradicional",
        "sets_target": 3,
        "reps_target": 15,
        "weight_suggestion_kg": 30,
        "order": 3,
        "rest_seconds": 60
      },
      {
        "exercise_id": "5c619fef-8c4e-500d-88e0-0a9f37373b5d",
        "exercise_name": "Pushdown de tríceps con cuerda",
        "sets_target": 3,
        "reps_target": 12,
        "weight_suggestion_kg": 22,
        "order": 4,
        "rest_seconds": 60
      }
    ],
    "slug": "push_hypertrophy"
  },
  {
    "id": "f14039a5-16e6-50ae-ac04-8f6b3d3197fc",
    "name": "Pull hipertrofia",
    "description": "Tirón de alto volumen para dorsales, espalda media y brazo.",
    "split_tag": "Pull",
    "goal_tag": "Hipertrofia",
    "estimated_duration_min": 57,
    "schedule_day": "Miércoles",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "dd99446f-63f1-54bb-aab6-15b443490678",
        "exercise_name": "Jalón al pecho pronado",
        "sets_target": 4,
        "reps_target": 10,
        "weight_suggestion_kg": 45,
        "order": 0,
        "rest_seconds": 90
      },
      {
        "exercise_id": "fd232e4e-4567-5312-88cd-3ab861be7ddd",
        "exercise_name": "Remo con pecho apoyado con mancuernas",
        "sets_target": 4,
        "reps_target": 12,
        "weight_suggestion_kg": 18,
        "order": 1,
        "rest_seconds": 90
      },
      {
        "exercise_id": "d5707805-831a-5197-b7a3-03f1e37a3f72",
        "exercise_name": "Face pull en polea alta",
        "sets_target": 3,
        "reps_target": 15,
        "weight_suggestion_kg": 18,
        "order": 2,
        "rest_seconds": 60
      },
      {
        "exercise_id": "0608232a-44e3-5323-b5ae-346c3e8b1c51",
        "exercise_name": "Curl inclinado con mancuernas",
        "sets_target": 3,
        "reps_target": 12,
        "weight_suggestion_kg": 12,
        "order": 3,
        "rest_seconds": 60
      },
      {
        "exercise_id": "8366e338-7c8c-5f90-98b2-217b8dd480b9",
        "exercise_name": "Curl martillo con mancuernas",
        "sets_target": 3,
        "reps_target": 12,
        "weight_suggestion_kg": 14,
        "order": 4,
        "rest_seconds": 60
      }
    ],
    "slug": "pull_hypertrophy"
  },
  {
    "id": "cded08c8-a78b-58e4-ba86-a31ccb1bc110",
    "name": "Legs hipertrofia",
    "description": "Pierna con volumen útil y foco en cuádriceps y glúteos.",
    "split_tag": "Legs",
    "goal_tag": "Hipertrofia",
    "estimated_duration_min": 60,
    "schedule_day": "Viernes",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "d5cf68f3-db40-5373-8ed0-bb288de3b716",
        "exercise_name": "Hack squat en máquina",
        "sets_target": 4,
        "reps_target": 10,
        "weight_suggestion_kg": 70,
        "order": 0,
        "rest_seconds": 90
      },
      {
        "exercise_id": "a51a6b47-0ac1-5589-b8a8-9be6be227fea",
        "exercise_name": "Split squat búlgaro con mancuernas",
        "sets_target": 3,
        "reps_target": 10,
        "weight_suggestion_kg": 16,
        "order": 1,
        "rest_seconds": 90
      },
      {
        "exercise_id": "ffac29f2-7f28-52b2-88a4-351ad764f3b9",
        "exercise_name": "Hip thrust con barra",
        "sets_target": 4,
        "reps_target": 10,
        "weight_suggestion_kg": 80,
        "order": 2,
        "rest_seconds": 90
      },
      {
        "exercise_id": "8be296ff-77d0-54a2-b1f4-5139293fbbe1",
        "exercise_name": "Extensión de cuádriceps en máquina",
        "sets_target": 3,
        "reps_target": 15,
        "weight_suggestion_kg": 28,
        "order": 3,
        "rest_seconds": 60
      },
      {
        "exercise_id": "03438cf6-6d9c-5b10-b70d-fdc751305ce4",
        "exercise_name": "Abducción de cadera en máquina",
        "sets_target": 3,
        "reps_target": 18,
        "weight_suggestion_kg": 25,
        "order": 4,
        "rest_seconds": 45
      }
    ],
    "slug": "legs_hypertrophy"
  },
  {
    "id": "7953f9a2-22f2-540e-85ad-8051c03212f6",
    "name": "Glúteos foco",
    "description": "Sesión centrada en glúteos para sumar trabajo local sin perder estabilidad.",
    "split_tag": "Glúteos",
    "goal_tag": "Hipertrofia",
    "estimated_duration_min": 50,
    "schedule_day": "Jueves",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "ffac29f2-7f28-52b2-88a4-351ad764f3b9",
        "exercise_name": "Hip thrust con barra",
        "sets_target": 4,
        "reps_target": 8,
        "weight_suggestion_kg": 90,
        "order": 0,
        "rest_seconds": 90
      },
      {
        "exercise_id": "8caf2ae0-942b-5f8f-98c1-59b02644dbe3",
        "exercise_name": "Patada de glúteo en polea",
        "sets_target": 3,
        "reps_target": 15,
        "weight_suggestion_kg": 10,
        "order": 1,
        "rest_seconds": 60
      },
      {
        "exercise_id": "51a14dec-aab3-5900-9185-8cc05d50027f",
        "exercise_name": "Monster walk con banda",
        "sets_target": 3,
        "reps_target": 20,
        "weight_suggestion_kg": 0,
        "order": 2,
        "rest_seconds": 45
      },
      {
        "exercise_id": "03438cf6-6d9c-5b10-b70d-fdc751305ce4",
        "exercise_name": "Abducción de cadera en máquina",
        "sets_target": 3,
        "reps_target": 18,
        "weight_suggestion_kg": 28,
        "order": 3,
        "rest_seconds": 45
      },
      {
        "exercise_id": "14ff07f1-9620-5491-b3ed-45013f9fcffc",
        "exercise_name": "Puente de glúteo unilateral",
        "sets_target": 3,
        "reps_target": 12,
        "weight_suggestion_kg": 0,
        "order": 4,
        "rest_seconds": 45
      }
    ],
    "slug": "glutes_focus"
  },
  {
    "id": "76cda985-52ee-563a-8faa-60489726eef2",
    "name": "Casa sin equipo",
    "description": "Entreno simple para no cortar continuidad cuando estás con poco tiempo o sin gimnasio.",
    "split_tag": "Casa",
    "goal_tag": "Continuidad",
    "estimated_duration_min": 32,
    "schedule_day": "Flexible",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "5f29ad14-4d14-54e4-b2c4-edd8a973fcb7",
        "exercise_name": "Flexión estándar",
        "sets_target": 4,
        "reps_target": 12,
        "weight_suggestion_kg": 0,
        "order": 0,
        "rest_seconds": 60
      },
      {
        "exercise_id": "b4bdbc02-cee8-5fa4-ad61-1c6e00b8a2b4",
        "exercise_name": "Sentarse y pararse con silla",
        "sets_target": 4,
        "reps_target": 12,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 60
      },
      {
        "exercise_id": "abee45f4-b1ce-5220-bbd7-21211759d1f5",
        "exercise_name": "Plancha frontal",
        "sets_target": 3,
        "reps_target": 40,
        "weight_suggestion_kg": 0,
        "order": 2,
        "rest_seconds": 45
      },
      {
        "exercise_id": "82048bfc-f192-5913-8e9c-48b5b2f20418",
        "exercise_name": "Mountain climber controlado",
        "sets_target": 3,
        "reps_target": 20,
        "weight_suggestion_kg": 0,
        "order": 3,
        "rest_seconds": 45
      }
    ],
    "slug": "home_bodyweight"
  },
  {
    "id": "0ae60398-45d1-57da-9ea7-cb712ac3456a",
    "name": "Express cardio + core",
    "description": "Bloque corto para mover pulsaciones y salir mejor de lo que entraste.",
    "split_tag": "Express",
    "goal_tag": "Cardio",
    "estimated_duration_min": 26,
    "schedule_day": "Sábado",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "fc7344cd-fd87-5857-9150-22cd8b293347",
        "exercise_name": "Assault bike 20/40",
        "sets_target": 6,
        "reps_target": 1,
        "weight_suggestion_kg": 0,
        "order": 0,
        "rest_seconds": 40,
        "notes": "20 segundos fuerte / 40 suave"
      },
      {
        "exercise_id": "1b29c7ad-8679-5f3d-9a46-56244c9d8f7a",
        "exercise_name": "Plancha lateral",
        "sets_target": 3,
        "reps_target": 30,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 45
      },
      {
        "exercise_id": "1bb29304-beb8-5403-a18f-0e1727c87c49",
        "exercise_name": "Dead bug estándar",
        "sets_target": 3,
        "reps_target": 10,
        "weight_suggestion_kg": 0,
        "order": 2,
        "rest_seconds": 45
      }
    ],
    "slug": "express_cardio_core"
  },
  {
    "id": "d5a705d8-9353-5151-9978-87af4b1d108b",
    "name": "Reset de movilidad",
    "description": "Sesión suave para recuperar rango y bajar rigidez general.",
    "split_tag": "Movilidad",
    "goal_tag": "Recuperación",
    "estimated_duration_min": 28,
    "schedule_day": "Domingo",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "5e771bdd-65dc-5d8f-abef-84fd9f62ee1b",
        "exercise_name": "Movilidad de cadera en colchoneta",
        "sets_target": 2,
        "reps_target": 8,
        "weight_suggestion_kg": 0,
        "order": 0,
        "rest_seconds": 30
      },
      {
        "exercise_id": "920914b7-8ea5-5cc7-899b-d3ee60ea0f83",
        "exercise_name": "Rotación torácica en colchoneta",
        "sets_target": 2,
        "reps_target": 8,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 30
      },
      {
        "exercise_id": "0ad76599-29a6-5a83-a9af-11b989e0f86f",
        "exercise_name": "Tobillo rodilla a pared controlado",
        "sets_target": 2,
        "reps_target": 8,
        "weight_suggestion_kg": 0,
        "order": 2,
        "rest_seconds": 30
      },
      {
        "exercise_id": "9a4d78ac-5ee2-56a4-8b8d-6458ffe46b41",
        "exercise_name": "Extensión torácica en foam roller",
        "sets_target": 2,
        "reps_target": 8,
        "weight_suggestion_kg": 0,
        "order": 3,
        "rest_seconds": 30
      }
    ],
    "slug": "mobility_reset"
  },
  {
    "id": "05b7fb32-9f32-5d01-8702-baa7866e1e22",
    "name": "Yoga restaurativo",
    "description": "Respiración, movilidad y un cierre de día bien simple.",
    "split_tag": "Yoga",
    "goal_tag": "Recuperación",
    "estimated_duration_min": 30,
    "schedule_day": "Domingo",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "a67717b8-3653-5720-b8d9-ab2843a7103e",
        "exercise_name": "Postura del niño",
        "sets_target": 1,
        "reps_target": 60,
        "weight_suggestion_kg": 0,
        "order": 0,
        "rest_seconds": 20
      },
      {
        "exercise_id": "f161c038-4968-5650-a6ee-6e7ebdcafd4b",
        "exercise_name": "Perro boca abajo",
        "sets_target": 1,
        "reps_target": 45,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 20
      },
      {
        "exercise_id": "df55b072-d262-57c9-a5f2-4f86b6c072b4",
        "exercise_name": "Paloma reclinada",
        "sets_target": 1,
        "reps_target": 45,
        "weight_suggestion_kg": 0,
        "order": 2,
        "rest_seconds": 20
      },
      {
        "exercise_id": "1ed0dd6a-1ce9-525d-bfff-0c8b326ba95d",
        "exercise_name": "Torsión supina",
        "sets_target": 1,
        "reps_target": 45,
        "weight_suggestion_kg": 0,
        "order": 3,
        "rest_seconds": 20
      },
      {
        "exercise_id": "22811ea7-6aea-5ac0-a61b-82c5b172718a",
        "exercise_name": "Postura del cadáver",
        "sets_target": 1,
        "reps_target": 90,
        "weight_suggestion_kg": 0,
        "order": 4,
        "rest_seconds": 20
      }
    ],
    "slug": "yoga_restore"
  },
  {
    "id": "37299fa7-3b1d-5e43-8c2a-631ead7fd059",
    "name": "Pilates centro",
    "description": "Bloque de control y respiración para fortalecer el centro sin impacto.",
    "split_tag": "Pilates",
    "goal_tag": "Core",
    "estimated_duration_min": 25,
    "schedule_day": "Flexible",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "9ff71e8d-e428-5d2b-af6c-ab940eb09aae",
        "exercise_name": "The hundred",
        "sets_target": 1,
        "reps_target": 100,
        "weight_suggestion_kg": 0,
        "order": 0,
        "rest_seconds": 20
      },
      {
        "exercise_id": "d1934f66-8392-51e8-9f22-017160f5e9cf",
        "exercise_name": "Single leg stretch",
        "sets_target": 3,
        "reps_target": 12,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 30
      },
      {
        "exercise_id": "673192e4-c3ae-55e5-8629-5eedb4facebf",
        "exercise_name": "Shoulder bridge",
        "sets_target": 3,
        "reps_target": 10,
        "weight_suggestion_kg": 0,
        "order": 2,
        "rest_seconds": 30
      },
      {
        "exercise_id": "3b696f5c-3a9b-5ebe-849b-50276123e6ad",
        "exercise_name": "Mermaid stretch",
        "sets_target": 2,
        "reps_target": 8,
        "weight_suggestion_kg": 0,
        "order": 3,
        "rest_seconds": 20
      }
    ],
    "slug": "pilates_core"
  },
  {
    "id": "f7a93b5c-f94e-5fe4-b59b-908766a46d3b",
    "name": "Senior movimiento",
    "description": "Fuerza básica, equilibrio y movilidad para sentirse firme en el día a día.",
    "split_tag": "Senior",
    "goal_tag": "Funcional",
    "estimated_duration_min": 30,
    "schedule_day": "Martes",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "f52bc0fe-c948-52a5-b92b-82cf476e4360",
        "exercise_name": "Sentarse y pararse senior",
        "sets_target": 3,
        "reps_target": 10,
        "weight_suggestion_kg": 0,
        "order": 0,
        "rest_seconds": 45
      },
      {
        "exercise_id": "444fbf9c-8046-5909-8a7e-5c7cfb6031fc",
        "exercise_name": "Remo con banda senior",
        "sets_target": 3,
        "reps_target": 12,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 45
      },
      {
        "exercise_id": "c1e48f4d-6dcd-544d-baab-93631c52016b",
        "exercise_name": "Equilibrio unipodal asistido",
        "sets_target": 3,
        "reps_target": 20,
        "weight_suggestion_kg": 0,
        "order": 2,
        "rest_seconds": 30
      },
      {
        "exercise_id": "63caf4ae-6940-553b-ada1-fb03974b6e66",
        "exercise_name": "Marcha en sitio senior",
        "sets_target": 3,
        "reps_target": 30,
        "weight_suggestion_kg": 0,
        "order": 3,
        "rest_seconds": 30
      }
    ],
    "slug": "senior_move"
  },
  {
    "id": "721f46d0-b09b-57bb-a493-8ddc964127fb",
    "name": "Prenatal equilibrio",
    "description": "Sesión adaptada para embarazo con foco en respiración, fuerza suave y movilidad.",
    "split_tag": "Prenatal",
    "goal_tag": "Bienestar",
    "estimated_duration_min": 28,
    "schedule_day": "Flexible",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "4a880e08-259f-57ab-9758-95c3f62d4f79",
        "exercise_name": "Respiración diafragmática prenatal",
        "sets_target": 2,
        "reps_target": 6,
        "weight_suggestion_kg": 0,
        "order": 0,
        "rest_seconds": 20
      },
      {
        "exercise_id": "0aff16cb-e0fc-578c-beb2-f51fe47b4da5",
        "exercise_name": "Sentadilla prenatal con apoyo",
        "sets_target": 3,
        "reps_target": 10,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 45
      },
      {
        "exercise_id": "60467c8f-ff58-502e-b2e7-f7a0fef2fb08",
        "exercise_name": "Remo prenatal con banda",
        "sets_target": 3,
        "reps_target": 12,
        "weight_suggestion_kg": 0,
        "order": 2,
        "rest_seconds": 45
      },
      {
        "exercise_id": "616c6d23-c6be-594a-a604-161fca9eca34",
        "exercise_name": "Movilidad de cadera prenatal",
        "sets_target": 2,
        "reps_target": 8,
        "weight_suggestion_kg": 0,
        "order": 3,
        "rest_seconds": 30
      }
    ],
    "slug": "prenatal_balance"
  },
  {
    "id": "85bb8df8-85af-5473-9fba-4358bc5e80db",
    "name": "Postparto rebuild",
    "description": "Base de vuelta suave con respiración, core y movimientos muy estables.",
    "split_tag": "Postparto",
    "goal_tag": "Recuperación",
    "estimated_duration_min": 24,
    "schedule_day": "Flexible",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "93a10d94-64fb-5736-8fac-4294c8b09a36",
        "exercise_name": "Respiración 360 postparto",
        "sets_target": 2,
        "reps_target": 6,
        "weight_suggestion_kg": 0,
        "order": 0,
        "rest_seconds": 20
      },
      {
        "exercise_id": "74373b8f-091e-583f-af7b-8292995ac39f",
        "exercise_name": "Puente postparto básico",
        "sets_target": 3,
        "reps_target": 10,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 30
      },
      {
        "exercise_id": "69c445ae-ede8-582a-8f6a-c8ebb9454d05",
        "exercise_name": "Dead bug postparto básico",
        "sets_target": 3,
        "reps_target": 8,
        "weight_suggestion_kg": 0,
        "order": 2,
        "rest_seconds": 30
      },
      {
        "exercise_id": "399bac25-bc07-5f6f-926d-99d2a3264e44",
        "exercise_name": "Caminata postparto suave",
        "sets_target": 3,
        "reps_target": 5,
        "weight_suggestion_kg": 0,
        "order": 3,
        "rest_seconds": 30,
        "notes": "5 minutos por bloque"
      }
    ],
    "slug": "postpartum_rebuild"
  },
  {
    "id": "ce7f91fd-e520-5a80-86d7-0fe9930bd1d0",
    "name": "Hombro rehab",
    "description": "Rehabilitación de hombro y escápula con trabajo muy controlado.",
    "split_tag": "Rehab",
    "goal_tag": "Salud articular",
    "estimated_duration_min": 22,
    "schedule_day": "Flexible",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "fa41074f-6419-56d2-b496-adb220746aa8",
        "exercise_name": "Rotación externa de hombro con banda",
        "sets_target": 3,
        "reps_target": 12,
        "weight_suggestion_kg": 0,
        "order": 0,
        "rest_seconds": 30
      },
      {
        "exercise_id": "c5bcc4a5-a718-53de-b428-9a7176e4d486",
        "exercise_name": "Serratus wall slide",
        "sets_target": 3,
        "reps_target": 10,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 30
      },
      {
        "exercise_id": "e1c95612-ffab-5333-b8d8-b1942200184e",
        "exercise_name": "Scaption con banda",
        "sets_target": 3,
        "reps_target": 12,
        "weight_suggestion_kg": 0,
        "order": 2,
        "rest_seconds": 30
      },
      {
        "exercise_id": "28bfdfb2-efa8-5eed-a3f3-6d5d8e654f6e",
        "exercise_name": "Retracción cervical en pared",
        "sets_target": 2,
        "reps_target": 10,
        "weight_suggestion_kg": 0,
        "order": 3,
        "rest_seconds": 20
      }
    ],
    "slug": "shoulder_rehab"
  },
  {
    "id": "ac7c840e-0ac8-5d19-8f39-965d5aba8521",
    "name": "Espalda baja control",
    "description": "Bloque simple para recuperar control de columna y pelvis.",
    "split_tag": "Rehab",
    "goal_tag": "Salud articular",
    "estimated_duration_min": 20,
    "schedule_day": "Flexible",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "46fd35fd-f78e-5951-81ef-84d30c270720",
        "exercise_name": "Respiración 90/90",
        "sets_target": 2,
        "reps_target": 6,
        "weight_suggestion_kg": 0,
        "order": 0,
        "rest_seconds": 20
      },
      {
        "exercise_id": "58078c80-ccd4-5870-8b91-104da5ccf169",
        "exercise_name": "McGill curl-up",
        "sets_target": 3,
        "reps_target": 8,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 30
      },
      {
        "exercise_id": "75e35f44-92b3-5a08-8cb8-11776d2ec65c",
        "exercise_name": "Bird dog terapéutico",
        "sets_target": 3,
        "reps_target": 8,
        "weight_suggestion_kg": 0,
        "order": 2,
        "rest_seconds": 30
      },
      {
        "exercise_id": "c81a1b12-3256-574b-b602-53ba6b6f1d71",
        "exercise_name": "Puente lumbar corto",
        "sets_target": 3,
        "reps_target": 10,
        "weight_suggestion_kg": 0,
        "order": 3,
        "rest_seconds": 30
      }
    ],
    "slug": "back_rebuild"
  },
  {
    "id": "92de2602-8ed6-5e6b-b9b4-ec5edcabf68b",
    "name": "Potencia atlética",
    "description": "Sesión corta de potencia y cambios de dirección para deportes de cancha o campo.",
    "split_tag": "Atlético",
    "goal_tag": "Potencia",
    "estimated_duration_min": 40,
    "schedule_day": "Sábado",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "3a044e15-0577-5c55-93ee-0a97d19716ec",
        "exercise_name": "Power clean con barra",
        "sets_target": 5,
        "reps_target": 3,
        "weight_suggestion_kg": 50,
        "order": 0,
        "rest_seconds": 120
      },
      {
        "exercise_id": "fc30e72c-ccbb-537b-a719-ee3df54333ad",
        "exercise_name": "Salto vertical con contramovimiento",
        "sets_target": 4,
        "reps_target": 4,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 60
      },
      {
        "exercise_id": "54005dd8-8521-5ffd-892f-7d44ca9acb33",
        "exercise_name": "Drill de conos 5-10-5",
        "sets_target": 4,
        "reps_target": 1,
        "weight_suggestion_kg": 0,
        "order": 2,
        "rest_seconds": 60
      },
      {
        "exercise_id": "be9a2a8c-b45c-5ffb-b68f-9b6778062cde",
        "exercise_name": "Sprint corto 20 m",
        "sets_target": 6,
        "reps_target": 1,
        "weight_suggestion_kg": 0,
        "order": 3,
        "rest_seconds": 45
      }
    ],
    "slug": "athletic_power"
  },
  {
    "id": "c5db364e-49ca-5fb3-9d12-9064253ce455",
    "name": "Conditioning total",
    "description": "Bloque metabólico para sumar gasto y tolerancia al esfuerzo sin complicarte.",
    "split_tag": "Conditioning",
    "goal_tag": "Resistencia",
    "estimated_duration_min": 34,
    "schedule_day": "Jueves",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "3bdd5288-1925-5f42-8356-f01a1bda2a02",
        "exercise_name": "Battle rope olas alternas",
        "sets_target": 8,
        "reps_target": 1,
        "weight_suggestion_kg": 0,
        "order": 0,
        "rest_seconds": 30,
        "notes": "30 segundos"
      },
      {
        "exercise_id": "7a2c4214-af3f-59e2-b5e0-df8aeb1b33ce",
        "exercise_name": "Empuje de trineo ligero",
        "sets_target": 6,
        "reps_target": 1,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 45,
        "notes": "20 metros"
      },
      {
        "exercise_id": "f774e4ae-4a1e-5d7b-ae32-c49277c49841",
        "exercise_name": "Burpee estándar",
        "sets_target": 4,
        "reps_target": 10,
        "weight_suggestion_kg": 0,
        "order": 2,
        "rest_seconds": 45
      },
      {
        "exercise_id": "a4f79805-a947-5c8d-8248-bfadf1cb239f",
        "exercise_name": "Mountain climber rápido",
        "sets_target": 4,
        "reps_target": 20,
        "weight_suggestion_kg": 0,
        "order": 3,
        "rest_seconds": 30
      }
    ],
    "slug": "conditioning_day"
  },
  {
    "id": "61cea880-8e49-5075-bd26-cb2002a2c99e",
    "name": "Cardio base",
    "description": "Sesión de base aeróbica para recuperar ritmo sin ir al límite.",
    "split_tag": "Cardio",
    "goal_tag": "Resistencia",
    "estimated_duration_min": 36,
    "schedule_day": "Martes",
    "is_primary": false,
    "source": "seed",
    "exercises": [
      {
        "exercise_id": "c46d42cc-0e58-5d6e-bd42-e91c7e52fb64",
        "exercise_name": "Caminata en cinta inclinada",
        "sets_target": 1,
        "reps_target": 25,
        "weight_suggestion_kg": 0,
        "order": 0,
        "rest_seconds": 0,
        "notes": "25 minutos"
      },
      {
        "exercise_id": "1808e976-7c6e-5499-80d6-8181367c900b",
        "exercise_name": "Remo ergómetro continuo",
        "sets_target": 1,
        "reps_target": 10,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 0,
        "notes": "10 minutos"
      }
    ],
    "slug": "cardio_base"
  }
];

export const GENERATED_WORKOUT_TEMPLATE_ROUTINES: Routine[] = [
  {
    "id": "dfdd78e9-ea9e-5bb1-be1a-4909a1f1873b",
    "name": "Plantilla full body 3 días",
    "description": "Base simple para empezar o volver con continuidad.",
    "split_tag": "Full body",
    "goal_tag": "Fuerza base",
    "estimated_duration_min": 55,
    "is_primary": false,
    "is_template": true,
    "source": "template",
    "exercises": [
      {
        "exercise_id": "6fab3ac3-aa88-5970-921e-651b2ffa095a",
        "exercise_name": "Sentadilla con barra",
        "sets_target": 4,
        "reps_target": 6,
        "weight_suggestion_kg": 60,
        "order": 0,
        "rest_seconds": 90,
        "rpe_target": 7
      },
      {
        "exercise_id": "4dbd0202-6649-54a3-95ca-d437d3b3c56a",
        "exercise_name": "Press de banca con barra",
        "sets_target": 4,
        "reps_target": 6,
        "weight_suggestion_kg": 45,
        "order": 1,
        "rest_seconds": 90,
        "rpe_target": 7
      },
      {
        "exercise_id": "45f587b5-9858-5513-b305-277e072b99d8",
        "exercise_name": "Remo con barra",
        "sets_target": 3,
        "reps_target": 8,
        "weight_suggestion_kg": 42.5,
        "order": 2,
        "rest_seconds": 90,
        "rpe_target": 7
      },
      {
        "exercise_id": "abee45f4-b1ce-5220-bbd7-21211759d1f5",
        "exercise_name": "Plancha frontal",
        "sets_target": 3,
        "reps_target": 45,
        "weight_suggestion_kg": 0,
        "order": 3,
        "rest_seconds": 60,
        "group_label": "Core"
      }
    ],
    "slug": "beginner_full_body_3d"
  },
  {
    "id": "e9340491-0284-574a-8aa8-5a4b099e5fa0",
    "name": "Plantilla upper/lower 4 días",
    "description": "Frecuencia pareja para fuerza e hipertrofia sin demasiada complejidad.",
    "split_tag": "Upper/Lower",
    "goal_tag": "Fuerza",
    "estimated_duration_min": 60,
    "is_primary": false,
    "is_template": true,
    "source": "template",
    "exercises": [
      {
        "exercise_id": "4dbd0202-6649-54a3-95ca-d437d3b3c56a",
        "exercise_name": "Press de banca con barra",
        "sets_target": 5,
        "reps_target": 5,
        "weight_suggestion_kg": 50,
        "order": 0,
        "rest_seconds": 150
      },
      {
        "exercise_id": "a184a9bd-812c-5559-9dcf-8fdcd8b8ec13",
        "exercise_name": "Dominada pronada",
        "sets_target": 4,
        "reps_target": 6,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 120
      },
      {
        "exercise_id": "2a3336e2-6165-5a88-90b9-6c1737220f9a",
        "exercise_name": "Press militar con barra",
        "sets_target": 4,
        "reps_target": 6,
        "weight_suggestion_kg": 32.5,
        "order": 2,
        "rest_seconds": 90
      },
      {
        "exercise_id": "d5707805-831a-5197-b7a3-03f1e37a3f72",
        "exercise_name": "Face pull en polea alta",
        "sets_target": 3,
        "reps_target": 15,
        "weight_suggestion_kg": 20,
        "order": 3,
        "rest_seconds": 60
      },
      {
        "exercise_id": "02505bff-0bbd-5e9d-9de8-951a8d5d9d93",
        "exercise_name": "Curl de bíceps con barra EZ",
        "sets_target": 3,
        "reps_target": 10,
        "weight_suggestion_kg": 20,
        "order": 4,
        "rest_seconds": 60
      },
      {
        "exercise_id": "5c619fef-8c4e-500d-88e0-0a9f37373b5d",
        "exercise_name": "Pushdown de tríceps con cuerda",
        "sets_target": 3,
        "reps_target": 12,
        "weight_suggestion_kg": 20,
        "order": 5,
        "rest_seconds": 60
      }
    ],
    "slug": "upper_lower_4d"
  },
  {
    "id": "24f56bba-c015-5bba-9b63-c2fad0b68ce1",
    "name": "Plantilla PPL 6 días",
    "description": "Empuje, tirón y pierna en formato clásico de alto volumen.",
    "split_tag": "PPL",
    "goal_tag": "Hipertrofia",
    "estimated_duration_min": 58,
    "is_primary": false,
    "is_template": true,
    "source": "template",
    "exercises": [
      {
        "exercise_id": "41f00082-74b2-5b36-9533-db311c9bbf7a",
        "exercise_name": "Press inclinado con mancuernas",
        "sets_target": 4,
        "reps_target": 10,
        "weight_suggestion_kg": 20,
        "order": 0,
        "rest_seconds": 90
      },
      {
        "exercise_id": "28cd0339-3576-52a5-9527-6be594f30897",
        "exercise_name": "Press convergente en máquina",
        "sets_target": 4,
        "reps_target": 10,
        "weight_suggestion_kg": 45,
        "order": 1,
        "rest_seconds": 90
      },
      {
        "exercise_id": "6ff81c25-b7d6-5a67-b046-7791d0da9dfa",
        "exercise_name": "Elevación lateral con mancuernas",
        "sets_target": 4,
        "reps_target": 15,
        "weight_suggestion_kg": 8,
        "order": 2,
        "rest_seconds": 60
      },
      {
        "exercise_id": "41254be1-dfb4-5120-b912-df492f88a551",
        "exercise_name": "Pec deck tradicional",
        "sets_target": 3,
        "reps_target": 15,
        "weight_suggestion_kg": 30,
        "order": 3,
        "rest_seconds": 60
      },
      {
        "exercise_id": "5c619fef-8c4e-500d-88e0-0a9f37373b5d",
        "exercise_name": "Pushdown de tríceps con cuerda",
        "sets_target": 3,
        "reps_target": 12,
        "weight_suggestion_kg": 22,
        "order": 4,
        "rest_seconds": 60
      }
    ],
    "slug": "ppl_6d"
  },
  {
    "id": "d73c1f9c-7e88-52e9-b223-805c81c1948b",
    "name": "Plantilla casa 3 días",
    "description": "Versión simple sin gimnasio para no romper el hábito.",
    "split_tag": "Casa",
    "goal_tag": "Continuidad",
    "estimated_duration_min": 32,
    "is_primary": false,
    "is_template": true,
    "source": "template",
    "exercises": [
      {
        "exercise_id": "5f29ad14-4d14-54e4-b2c4-edd8a973fcb7",
        "exercise_name": "Flexión estándar",
        "sets_target": 4,
        "reps_target": 12,
        "weight_suggestion_kg": 0,
        "order": 0,
        "rest_seconds": 60
      },
      {
        "exercise_id": "b4bdbc02-cee8-5fa4-ad61-1c6e00b8a2b4",
        "exercise_name": "Sentarse y pararse con silla",
        "sets_target": 4,
        "reps_target": 12,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 60
      },
      {
        "exercise_id": "abee45f4-b1ce-5220-bbd7-21211759d1f5",
        "exercise_name": "Plancha frontal",
        "sets_target": 3,
        "reps_target": 40,
        "weight_suggestion_kg": 0,
        "order": 2,
        "rest_seconds": 45
      },
      {
        "exercise_id": "82048bfc-f192-5913-8e9c-48b5b2f20418",
        "exercise_name": "Mountain climber controlado",
        "sets_target": 3,
        "reps_target": 20,
        "weight_suggestion_kg": 0,
        "order": 3,
        "rest_seconds": 45
      }
    ],
    "slug": "home_3d"
  },
  {
    "id": "354b5d57-280b-5a11-80b1-0bee1e7568e4",
    "name": "Plantilla glúteos 4 días",
    "description": "Alterna trabajo principal y complementario para glúteos.",
    "split_tag": "Glúteos",
    "goal_tag": "Hipertrofia",
    "estimated_duration_min": 50,
    "is_primary": false,
    "is_template": true,
    "source": "template",
    "exercises": [
      {
        "exercise_id": "ffac29f2-7f28-52b2-88a4-351ad764f3b9",
        "exercise_name": "Hip thrust con barra",
        "sets_target": 4,
        "reps_target": 8,
        "weight_suggestion_kg": 90,
        "order": 0,
        "rest_seconds": 90
      },
      {
        "exercise_id": "8caf2ae0-942b-5f8f-98c1-59b02644dbe3",
        "exercise_name": "Patada de glúteo en polea",
        "sets_target": 3,
        "reps_target": 15,
        "weight_suggestion_kg": 10,
        "order": 1,
        "rest_seconds": 60
      },
      {
        "exercise_id": "51a14dec-aab3-5900-9185-8cc05d50027f",
        "exercise_name": "Monster walk con banda",
        "sets_target": 3,
        "reps_target": 20,
        "weight_suggestion_kg": 0,
        "order": 2,
        "rest_seconds": 45
      },
      {
        "exercise_id": "03438cf6-6d9c-5b10-b70d-fdc751305ce4",
        "exercise_name": "Abducción de cadera en máquina",
        "sets_target": 3,
        "reps_target": 18,
        "weight_suggestion_kg": 28,
        "order": 3,
        "rest_seconds": 45
      },
      {
        "exercise_id": "14ff07f1-9620-5491-b3ed-45013f9fcffc",
        "exercise_name": "Puente de glúteo unilateral",
        "sets_target": 3,
        "reps_target": 12,
        "weight_suggestion_kg": 0,
        "order": 4,
        "rest_seconds": 45
      }
    ],
    "slug": "glutes_4d"
  },
  {
    "id": "5a60924e-7ea8-51b3-a8bf-23698729fb4e",
    "name": "Plantilla movilidad restore",
    "description": "Sesiones cortas para bajar rigidez y recuperar rango útil.",
    "split_tag": "Movilidad",
    "goal_tag": "Recuperación",
    "estimated_duration_min": 28,
    "is_primary": false,
    "is_template": true,
    "source": "template",
    "exercises": [
      {
        "exercise_id": "5e771bdd-65dc-5d8f-abef-84fd9f62ee1b",
        "exercise_name": "Movilidad de cadera en colchoneta",
        "sets_target": 2,
        "reps_target": 8,
        "weight_suggestion_kg": 0,
        "order": 0,
        "rest_seconds": 30
      },
      {
        "exercise_id": "920914b7-8ea5-5cc7-899b-d3ee60ea0f83",
        "exercise_name": "Rotación torácica en colchoneta",
        "sets_target": 2,
        "reps_target": 8,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 30
      },
      {
        "exercise_id": "0ad76599-29a6-5a83-a9af-11b989e0f86f",
        "exercise_name": "Tobillo rodilla a pared controlado",
        "sets_target": 2,
        "reps_target": 8,
        "weight_suggestion_kg": 0,
        "order": 2,
        "rest_seconds": 30
      },
      {
        "exercise_id": "9a4d78ac-5ee2-56a4-8b8d-6458ffe46b41",
        "exercise_name": "Extensión torácica en foam roller",
        "sets_target": 2,
        "reps_target": 8,
        "weight_suggestion_kg": 0,
        "order": 3,
        "rest_seconds": 30
      }
    ],
    "slug": "mobility_restore"
  },
  {
    "id": "58da7f08-ba15-51a7-8faf-3cebc8f0cb05",
    "name": "Plantilla rehab reset",
    "description": "Punto de partida suave para hombro y espalda baja.",
    "split_tag": "Rehab",
    "goal_tag": "Salud articular",
    "estimated_duration_min": 22,
    "is_primary": false,
    "is_template": true,
    "source": "template",
    "exercises": [
      {
        "exercise_id": "93a10d94-64fb-5736-8fac-4294c8b09a36",
        "exercise_name": "Respiración 360 postparto",
        "sets_target": 2,
        "reps_target": 6,
        "weight_suggestion_kg": 0,
        "order": 0,
        "rest_seconds": 20
      },
      {
        "exercise_id": "74373b8f-091e-583f-af7b-8292995ac39f",
        "exercise_name": "Puente postparto básico",
        "sets_target": 3,
        "reps_target": 10,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 30
      },
      {
        "exercise_id": "69c445ae-ede8-582a-8f6a-c8ebb9454d05",
        "exercise_name": "Dead bug postparto básico",
        "sets_target": 3,
        "reps_target": 8,
        "weight_suggestion_kg": 0,
        "order": 2,
        "rest_seconds": 30
      },
      {
        "exercise_id": "399bac25-bc07-5f6f-926d-99d2a3264e44",
        "exercise_name": "Caminata postparto suave",
        "sets_target": 3,
        "reps_target": 5,
        "weight_suggestion_kg": 0,
        "order": 3,
        "rest_seconds": 30,
        "notes": "5 minutos por bloque"
      }
    ],
    "slug": "rehab_reset"
  },
  {
    "id": "91b810b2-8e0c-5b4a-92c8-c556fa24a29f",
    "name": "Plantilla cardio mix",
    "description": "Condición base más un día corto intenso cuando querés variar.",
    "split_tag": "Cardio",
    "goal_tag": "Resistencia",
    "estimated_duration_min": 34,
    "is_primary": false,
    "is_template": true,
    "source": "template",
    "exercises": [
      {
        "exercise_id": "46fd35fd-f78e-5951-81ef-84d30c270720",
        "exercise_name": "Respiración 90/90",
        "sets_target": 2,
        "reps_target": 6,
        "weight_suggestion_kg": 0,
        "order": 0,
        "rest_seconds": 20
      },
      {
        "exercise_id": "58078c80-ccd4-5870-8b91-104da5ccf169",
        "exercise_name": "McGill curl-up",
        "sets_target": 3,
        "reps_target": 8,
        "weight_suggestion_kg": 0,
        "order": 1,
        "rest_seconds": 30
      },
      {
        "exercise_id": "75e35f44-92b3-5a08-8cb8-11776d2ec65c",
        "exercise_name": "Bird dog terapéutico",
        "sets_target": 3,
        "reps_target": 8,
        "weight_suggestion_kg": 0,
        "order": 2,
        "rest_seconds": 30
      },
      {
        "exercise_id": "c81a1b12-3256-574b-b602-53ba6b6f1d71",
        "exercise_name": "Puente lumbar corto",
        "sets_target": 3,
        "reps_target": 10,
        "weight_suggestion_kg": 0,
        "order": 3,
        "rest_seconds": 30
      }
    ],
    "slug": "cardio_mix"
  }
];

export const GENERATED_WORKOUT_PROGRAMS: WorkoutProgram[] = [
  {
    "id": "273cad13-6b5e-57b9-92a0-71eeac540a21",
    "name": "Fundación 3 días",
    "split_tag": "Full body",
    "difficulty_level": "Inicial",
    "days_per_week": 3,
    "estimated_session_min": 55,
    "duration_weeks": 6,
    "routine_ids": [
      "c52ec8e6-0f0a-5baf-ad2d-705955237582",
      "021b2736-17de-59ee-a557-c3527ca322c6",
      "289aff2b-c8e0-5415-8ea7-34afbc672722"
    ],
    "target_muscles": [
      "Piernas",
      "Pecho",
      "Espalda",
      "Core"
    ],
    "is_premium_only": false,
    "objective": "Volver a entrenar con una base clara, sin saturarte y con progresión simple.",
    "structure": "Tres sesiones full body con foco en técnica, continuidad y recuperación.",
    "duration_label": "6 semanas",
    "next_program_name": "Fuerza 4 días",
    "source": "catalog",
    "slug": "foundation_3d",
    "session_count": 3,
    "exercise_count": 12
  },
  {
    "id": "024dc030-16e3-5b7b-b39d-2cd52618c2a4",
    "name": "Fuerza 4 días",
    "split_tag": "Upper/Lower",
    "difficulty_level": "Intermedio",
    "days_per_week": 4,
    "estimated_session_min": 61,
    "duration_weeks": 8,
    "routine_ids": [
      "afb64124-f493-5f84-a1b0-da78661a351b",
      "d1964882-dfb0-5ae0-a251-1412568798e6",
      "021b2736-17de-59ee-a557-c3527ca322c6",
      "289aff2b-c8e0-5415-8ea7-34afbc672722"
    ],
    "target_muscles": [
      "Piernas",
      "Pecho",
      "Espalda",
      "Hombros"
    ],
    "is_premium_only": false,
    "objective": "Subir fuerza en básicos sin perder orden semanal.",
    "structure": "Dos días pesados y dos días de soporte para seguir progresando.",
    "duration_label": "8 semanas",
    "next_program_name": "PPL 6 días",
    "source": "catalog",
    "slug": "strength_4d",
    "session_count": 4,
    "exercise_count": 19
  },
  {
    "id": "82838ee7-bde6-5b86-be04-705e9eae0cbc",
    "name": "PPL 6 días",
    "split_tag": "PPL",
    "difficulty_level": "Avanzado",
    "days_per_week": 6,
    "estimated_session_min": 58,
    "duration_weeks": 8,
    "routine_ids": [
      "c60a2b23-0e1b-58c9-8264-bac4ba1974d9",
      "f14039a5-16e6-50ae-ac04-8f6b3d3197fc",
      "cded08c8-a78b-58e4-ba86-a31ccb1bc110",
      "c60a2b23-0e1b-58c9-8264-bac4ba1974d9",
      "f14039a5-16e6-50ae-ac04-8f6b3d3197fc",
      "cded08c8-a78b-58e4-ba86-a31ccb1bc110"
    ],
    "target_muscles": [
      "Pecho",
      "Espalda",
      "Piernas",
      "Hombros"
    ],
    "is_premium_only": true,
    "objective": "Más volumen, más frecuencia y una estructura clásica para hipertrofia.",
    "structure": "Push, pull y legs repetido dos veces por semana.",
    "duration_label": "8 semanas",
    "next_program_name": "Glúteos 4 días",
    "source": "catalog",
    "slug": "ppl_6d",
    "session_count": 6,
    "exercise_count": 30
  },
  {
    "id": "10bafebb-f65c-5976-91bf-a9e8efb0b9a6",
    "name": "Rebuild express",
    "split_tag": "Express",
    "difficulty_level": "Inicial",
    "days_per_week": 3,
    "estimated_session_min": 29,
    "duration_weeks": 4,
    "routine_ids": [
      "76cda985-52ee-563a-8faa-60489726eef2",
      "0ae60398-45d1-57da-9ea7-cb712ac3456a",
      "d5a705d8-9353-5151-9978-87af4b1d108b"
    ],
    "target_muscles": [
      "Cardio",
      "Core",
      "Movilidad"
    ],
    "is_premium_only": false,
    "objective": "Volver a sumar sesiones aunque tu semana esté cargada.",
    "structure": "Dos días cortos y un reset para sostener el hábito.",
    "duration_label": "4 semanas",
    "next_program_name": "Fundación 3 días",
    "source": "catalog",
    "slug": "rebuild_express",
    "session_count": 3,
    "exercise_count": 11
  },
  {
    "id": "cf87bd59-b9f6-5336-a10d-90bbdeec9ec8",
    "name": "Glúteos 4 días",
    "split_tag": "Glúteos",
    "difficulty_level": "Intermedio",
    "days_per_week": 4,
    "estimated_session_min": 50,
    "duration_weeks": 6,
    "routine_ids": [
      "7953f9a2-22f2-540e-85ad-8051c03212f6",
      "d1964882-dfb0-5ae0-a251-1412568798e6",
      "d5a705d8-9353-5151-9978-87af4b1d108b",
      "7953f9a2-22f2-540e-85ad-8051c03212f6"
    ],
    "target_muscles": [
      "Glúteos",
      "Piernas",
      "Core"
    ],
    "is_premium_only": false,
    "objective": "Dar más volumen útil a glúteos sin romper la semana.",
    "structure": "Dos días principales, un soporte de fuerza y un reset para llegar fresca.",
    "duration_label": "6 semanas",
    "next_program_name": "Fuerza 4 días",
    "source": "catalog",
    "slug": "glutes_4d",
    "session_count": 4,
    "exercise_count": 19
  },
  {
    "id": "0bfb4919-ef3c-5ec9-a6e9-1742de56a830",
    "name": "Casa 3 días",
    "split_tag": "Casa",
    "difficulty_level": "Inicial",
    "days_per_week": 3,
    "estimated_session_min": 30,
    "duration_weeks": 5,
    "routine_ids": [
      "76cda985-52ee-563a-8faa-60489726eef2",
      "0ae60398-45d1-57da-9ea7-cb712ac3456a",
      "d5a705d8-9353-5151-9978-87af4b1d108b"
    ],
    "target_muscles": [
      "Core",
      "Cardio",
      "Pecho",
      "Piernas"
    ],
    "is_premium_only": false,
    "objective": "Entrenar en casa sin perder claridad ni continuidad.",
    "structure": "Un día de fuerza simple, uno de cardio y uno de movilidad.",
    "duration_label": "5 semanas",
    "next_program_name": "Fundación 3 días",
    "source": "catalog",
    "slug": "home_bodyweight_3d",
    "session_count": 3,
    "exercise_count": 11
  },
  {
    "id": "0e298442-d0de-5595-a178-33ce7b46d53d",
    "name": "Definición 4 días",
    "split_tag": "Mixto",
    "difficulty_level": "Intermedio",
    "days_per_week": 4,
    "estimated_session_min": 48,
    "duration_weeks": 6,
    "routine_ids": [
      "c60a2b23-0e1b-58c9-8264-bac4ba1974d9",
      "c5db364e-49ca-5fb3-9d12-9064253ce455",
      "f14039a5-16e6-50ae-ac04-8f6b3d3197fc",
      "61cea880-8e49-5075-bd26-cb2002a2c99e"
    ],
    "target_muscles": [
      "Cardio",
      "Piernas",
      "Pecho",
      "Espalda"
    ],
    "is_premium_only": false,
    "objective": "Combinar gasto, fuerza y continuidad sin volverte loco con la estructura.",
    "structure": "Dos días de torso más dos días de cardio/conditioning.",
    "duration_label": "6 semanas",
    "next_program_name": "Rebuild express",
    "source": "catalog",
    "slug": "weight_loss_4d",
    "session_count": 4,
    "exercise_count": 16
  },
  {
    "id": "0ae27d6e-7100-59ba-a085-ed2d3b6166f0",
    "name": "Cardio base 4 días",
    "split_tag": "Cardio",
    "difficulty_level": "Inicial",
    "days_per_week": 4,
    "estimated_session_min": 34,
    "duration_weeks": 5,
    "routine_ids": [
      "61cea880-8e49-5075-bd26-cb2002a2c99e",
      "0ae60398-45d1-57da-9ea7-cb712ac3456a",
      "61cea880-8e49-5075-bd26-cb2002a2c99e",
      "d5a705d8-9353-5151-9978-87af4b1d108b"
    ],
    "target_muscles": [
      "Cardio",
      "Core",
      "Movilidad"
    ],
    "is_premium_only": false,
    "objective": "Construir base aeróbica sin castigar tu recuperación.",
    "structure": "Dos bases aeróbicas, un express y un reset.",
    "duration_label": "5 semanas",
    "next_program_name": "Conditioning total",
    "source": "catalog",
    "slug": "cardio_base_4d",
    "session_count": 4,
    "exercise_count": 11
  },
  {
    "id": "695974b4-59e5-597c-bb6b-44c4bd711b71",
    "name": "Restore 3 días",
    "split_tag": "Movilidad",
    "difficulty_level": "Inicial",
    "days_per_week": 3,
    "estimated_session_min": 28,
    "duration_weeks": 4,
    "routine_ids": [
      "d5a705d8-9353-5151-9978-87af4b1d108b",
      "05b7fb32-9f32-5d01-8702-baa7866e1e22",
      "37299fa7-3b1d-5e43-8c2a-631ead7fd059"
    ],
    "target_muscles": [
      "Movilidad",
      "Core",
      "Yoga"
    ],
    "is_premium_only": false,
    "objective": "Bajar rigidez, mejorar rango y volver a sentir el cuerpo más liviano.",
    "structure": "Movilidad, yoga y pilates repartidos en una semana suave.",
    "duration_label": "4 semanas",
    "next_program_name": "Fundación 3 días",
    "source": "catalog",
    "slug": "mobility_restore_3d",
    "session_count": 3,
    "exercise_count": 13
  },
  {
    "id": "d29fceba-6d4f-5b66-ab09-e683d3030f41",
    "name": "Senior movimiento",
    "split_tag": "Senior",
    "difficulty_level": "Inicial",
    "days_per_week": 3,
    "estimated_session_min": 30,
    "duration_weeks": 6,
    "routine_ids": [
      "f7a93b5c-f94e-5fe4-b59b-908766a46d3b",
      "d5a705d8-9353-5151-9978-87af4b1d108b",
      "61cea880-8e49-5075-bd26-cb2002a2c99e"
    ],
    "target_muscles": [
      "Funcional",
      "Movilidad",
      "Cardio"
    ],
    "is_premium_only": false,
    "objective": "Ganar confianza, equilibrio y fuerza básica para el día a día.",
    "structure": "Fuerza simple, movilidad y cardio suave.",
    "duration_label": "6 semanas",
    "next_program_name": "Fundación 3 días",
    "source": "catalog",
    "slug": "senior_move_3d",
    "session_count": 3,
    "exercise_count": 10
  },
  {
    "id": "695451bc-c429-599a-8c20-d740c6ace0ce",
    "name": "Prenatal cuidado",
    "split_tag": "Prenatal",
    "difficulty_level": "Inicial",
    "days_per_week": 3,
    "estimated_session_min": 28,
    "duration_weeks": 4,
    "routine_ids": [
      "721f46d0-b09b-57bb-a493-8ddc964127fb",
      "d5a705d8-9353-5151-9978-87af4b1d108b",
      "61cea880-8e49-5075-bd26-cb2002a2c99e"
    ],
    "target_muscles": [
      "Bienestar",
      "Movilidad",
      "Cardio"
    ],
    "is_premium_only": false,
    "objective": "Moverte con seguridad, respiración y energía estable durante el embarazo.",
    "structure": "Un día adaptado, un reset y una caminata/cardio suave.",
    "duration_label": "4 semanas",
    "next_program_name": "Restore 3 días",
    "source": "catalog",
    "slug": "prenatal_3d",
    "session_count": 3,
    "exercise_count": 10
  },
  {
    "id": "515dafdb-2ca3-516b-bd92-7b740919406a",
    "name": "Postparto base",
    "split_tag": "Postparto",
    "difficulty_level": "Inicial",
    "days_per_week": 3,
    "estimated_session_min": 24,
    "duration_weeks": 5,
    "routine_ids": [
      "85bb8df8-85af-5473-9fba-4358bc5e80db",
      "d5a705d8-9353-5151-9978-87af4b1d108b",
      "61cea880-8e49-5075-bd26-cb2002a2c99e"
    ],
    "target_muscles": [
      "Recuperación",
      "Core",
      "Cardio"
    ],
    "is_premium_only": false,
    "objective": "Volver a sentir control y estabilidad antes de subir carga.",
    "structure": "Respiración, centro, caminata y movilidad sin apuro.",
    "duration_label": "5 semanas",
    "next_program_name": "Fundación 3 días",
    "source": "catalog",
    "slug": "postpartum_3d",
    "session_count": 3,
    "exercise_count": 10
  },
  {
    "id": "0dfc658c-ac2a-5847-bf6f-d08ac0d8da1a",
    "name": "Potencia atlética",
    "split_tag": "Atlético",
    "difficulty_level": "Avanzado",
    "days_per_week": 3,
    "estimated_session_min": 42,
    "duration_weeks": 6,
    "routine_ids": [
      "92de2602-8ed6-5e6b-b9b4-ec5edcabf68b",
      "d1964882-dfb0-5ae0-a251-1412568798e6",
      "c5db364e-49ca-5fb3-9d12-9064253ce455"
    ],
    "target_muscles": [
      "Potencia",
      "Piernas",
      "Cardio"
    ],
    "is_premium_only": true,
    "objective": "Mejorar salida, frenada y potencia para deportes de cancha o campo.",
    "structure": "Un día explosivo, uno de fuerza y uno de conditioning.",
    "duration_label": "6 semanas",
    "next_program_name": "Fuerza 4 días",
    "source": "catalog",
    "slug": "athletic_power_3d",
    "session_count": 3,
    "exercise_count": 13
  }
];

export const GENERATED_WORKOUT_FAVORITES: string[] = [
  "6fab3ac3-aa88-5970-921e-651b2ffa095a",
  "4dbd0202-6649-54a3-95ca-d437d3b3c56a",
  "c0af26a4-16cc-5bb3-b42f-e3c91e8324f6",
  "ffac29f2-7f28-52b2-88a4-351ad764f3b9",
  "abee45f4-b1ce-5220-bbd7-21211759d1f5"
];
