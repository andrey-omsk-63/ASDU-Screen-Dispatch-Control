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

export const INCOM = "Вх."; // название входяшего напраления

export const OUTGO = "Исх."; // название исходяшего напраления

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

export const CLINCH: Array<number> = [ // список аварийных кодов
  3, // Перекресток работает в Ручном режиме
  8, // Ручное управление ЖМ
  13, // Светофор отключен в ручном режиме
  16, // Авария 220В
  17, // Выключен УСДК
  18, // Нет связи с УСДК
  19, // Нет связи с ПСПД
  20, // Обрыв линии связи
  22, // Базовая привязка
  24, // Коррекция привязки
  28, // Обрыв линии связи
  29, // Негоден по паритету
  30, // ОС конфликт
  32, // ЖМ по перегоранию
  35, // Не подчинение командам
  38, // Нет информации
];
