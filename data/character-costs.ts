import type { CharacterCost } from "@/types/costs"

// Custos dos personagens por elemento e constelação
export const CHARACTER_COSTS: CharacterCost[] = [
  // FUSION
  {
    id: "brant",
    name: "Brant",
    element: "Fusão",
    costs: { S0: 15, S1: 25, S2: 40, S3: 55, S4: 70, S5: 80, S6: 90 },
  },
  {
    id: "changli",
    name: "Changli",
    element: "Fusão",
    costs: { S0: 15, S1: 20, S2: 25, S3: 30, S4: 40, S5: 60, S6: 75 },
  },
  {
    id: "encore",
    name: "Encore",
    element: "Fusão",
    costs: { S0: 8, S1: 11, S2: 12, S3: 16, S4: 25, S5: 30, S6: 40 },
  },
  {
    id: "mortefi",
    name: "Mortefi",
    element: "Fusão",
    costs: { S0: 2, S1: 5, S2: 5, S3: 5, S4: 5, S5: 5, S6: 7 },
  },
  {
    id: "chixia",
    name: "Chixia",
    element: "Fusão",
    costs: { S0: 1, S1: 1, S2: 1, S3: 3, S4: 6, S5: 7, S6: 9 },
  },

  // GLACIO
  {
    id: "carlota",
    name: "Carlota",
    element: "Glacio",
    costs: { S0: 30, S1: 33, S2: 41, S3: 55, S4: 63, S5: 66, S6: 101 },
  },
  {
    id: "zhe",
    name: "Zhezhi",
    element: "Glacio",
    costs: { S0: 20, S1: 30, S2: 45, S3: 60, S4: 70, S5: 90, S6: 105 },
  },
  {
    id: "lingyang",
    name: "Lingyang",
    element: "Glacio",
    costs: { S0: 10, S1: 15, S2: 18, S3: 20, S4: 22, S5: 24, S6: 25 },
  },
  {
    id: "senhua",
    name: "Sanhua",
    element: "Glacio",
    costs: { S0: 3, S1: 3, S2: 3, S3: 5, S4: 8, S5: 10, S6: 17 },
  },
  {
    id: "baizhi",
    name: "Baizhi",
    element: "Glacio",
    costs: { S0: 1, S1: 1, S2: 1, S3: 1, S4: 1, S5: 1, S6: 3 },
  },
  {
    id: "youhu",
    name: "Youhu",
    element: "Glacio",
    costs: { S0: 1, S1: 1, S2: 1, S3: 2, S4: 3, S5: 4, S6: 5 },
  },

  // ELECTRO
  {
    id: "xiangli",
    name: "Xiangli Yao",
    element: "Eletro",
    costs: { S0: 20, S1: 25, S2: 28, S3: 35, S4: 40, S5: 50, S6: 70 },
  },
  {
    id: "yinglin",
    name: "Yinlin",
    element: "Eletro",
    costs: { S0: 20, S1: 25, S2: 30, S3: 40, S4: 50, S5: 66, S6: 85 },
  },
  {
    id: "calcharo",
    name: "Calcharo",
    element: "Eletro",
    costs: { S0: 12, S1: 12, S2: 15, S3: 20, S4: 25, S5: 28, S6: 30 },
  },
  {
    id: "lumi",
    name: "Lumi",
    element: "Eletro",
    costs: { S0: 3, S1: 5, S2: 5, S3: 5, S4: 5, S5: 5, S6: 6 },
  },
  {
    id: "yuanwu",
    name: "Yuanwu",
    element: "Eletro",
    costs: { S0: 1, S1: 1, S2: 1, S3: 3, S4: 5, S5: 5, S6: 6 },
  },

  // AERO
  {
    id: "jiyan",
    name: "Jiyan",
    element: "Aero",
    costs: { S0: 25, S1: 30, S2: 40, S3: 60, S4: 65, S5: 80, S6: 90 },
  },
  {
    id: "jianxin",
    name: "Jianxin",
    element: "Aero",
    costs: { S0: 10, S1: 12, S2: 12, S3: 14, S4: 15, S5: 15, S6: 20 },
  },
  {
    id: "yangyang",
    name: "Yangyang",
    element: "Aero",
    costs: { S0: 1, S1: 1, S2: 1, S3: 3, S4: 5, S5: 5, S6: 7 },
  },
  {
    id: "aalto",
    name: "Aalto",
    element: "Aero",
    costs: { S0: 2, S1: 2, S2: 3, S3: 3, S4: 3, S5: 5, S6: 7 },
  },
  {
    id: "aero-rover",
    name: "Aero Rover",
    element: "Aero",
    costs: { S0: 3, S1: 4, S2: 4, S3: 5, S4: 5, S5: 6, S6: 7 },
  },

  // SPECTRO
  {
    id: "febe",
    name: "Phoebe",
    element: "Espectro",
    costs: { S0: 55, S1: 75, S2: 90, S3: 105, S4: 135, S5: 140, S6: 165 },
  },
  {
    id: "keeper",
    name: "Shorekeeper",
    element: "Espectro",
    costs: { S0: 40, S1: 60, S2: 80, S3: 85, S4: 85, S5: 85, S6: 150 },
  },
  {
    id: "jinhsi",
    name: "Jinhsi",
    element: "Espectro",
    costs: { S0: 40, S1: 50, S2: 60, S3: 75, S4: 95, S5: 110, S6: 130 },
  },
  {
    id: "verina",
    name: "Verina",
    element: "Espectro",
    costs: { S0: 15, S1: 15, S2: 30, S3: 30, S4: 50, S5: 50, S6: 60 },
  },
  {
    id: "zani",
    name: "Zani",
    element: "Espectro",
    costs: { S0: 50, S1: 65, S2: 85, S3: 95, S4: 105, S5: 120, S6: 145 },
  },
  {
    id: "spectro-rover",
    name: "Spectro Rover",
    element: "Espectro",
    costs: { S0: 3, S1: 5, S2: 6, S3: 6, S4: 6, S5: 7, S6: 10 },
  },

  // HAVOC
  {
    id: "cantarela",
    name: "Cantarella",
    element: "Devastação",
    costs: { S0: 20, S1: 30, S2: 45, S3: 75, S4: 75, S5: 85, S6: 120 },
  },
  {
    id: "roccia",
    name: "Roccia",
    element: "Devastação",
    costs: { S0: 20, S1: 25, S2: 40, S3: 50, S4: 60, S5: 65, S6: 90 },
  },
  {
    id: "camelia",
    name: "Camélia",
    element: "Devastação",
    costs: { S0: 30, S1: 50, S2: 65, S3: 80, S4: 90, S5: 105, S6: 140 },
  },
  {
    id: "danjin",
    name: "Danjin",
    element: "Devastação",
    costs: { S0: 7, S1: 9, S2: 10, S3: 11, S4: 12, S5: 13, S6: 15 },
  },
  {
    id: "taoqi",
    name: "Taoqi",
    element: "Devastação",
    costs: { S0: 1, S1: 3, S2: 3, S3: 4, S4: 4, S5: 4, S6: 4 },
  },
  {
    id: "havoc-rover",
    name: "Havoc Rover",
    element: "Devastação",
    costs: { S0: 10, S1: 11, S2: 12, S3: 12, S4: 14, S5: 15, S6: 15 },
  },
]
