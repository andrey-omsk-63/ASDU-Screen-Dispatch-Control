export const YMapsModul = [
  "multiRouter.MultiRoute",
  "Polyline",
  "templateLayoutFactory",
];

export const MyYandexKey = "65162f5f-2d15-41d1-a881-6c1acf34cfa1"; // ключ

export const ZONE = 1; // район для работы (0 - все районы)

export const SUMPK = 121; // количество планов координации

export const MaxFaz = 8; // максимальное количество фаз

export const KolFrom = 4; // количество исходящих направлений

export const KolIn = 5; // количество входящих направлений

export const INCOM = 'Вх.'; // название входяшего напраления

export const OUTGO = 'Исх.'; // название исходяшего напраления


export const FromCross: any = {
  pointAaRegin: "",
  pointAaArea: "",
  pointAaID: 0,
  pointAcod: "",
};

export const ToCross: any = {
  pointBbRegin: "",
  pointBbArea: "",
  pointBbID: 0,
  pointBcod: "",
};

export const optionsMiniGraf: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        font: {
          weight: "bold",
          size: 7,
        },
        boxWidth: 10,
      },
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      ticks: {
        font: {
          size: 8,
        },
      },
    },
    y: {
      ticks: {
        font: {
          size: 8,
        },
      },
    },
  },
};
