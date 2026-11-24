// lessons.js — 25 misji z pulą 135 krótkich, jednozdaniowych ciekawostek
// Każdy element tablicy `texts` używa wyłącznie znaków odblokowanych do danego etapu.

export const MODULES = [
  {
    id: 1,
    title: "Moduł 1: Baza Startowa — Rząd Środkowy",
    keysLabel: "A S D F G H J K L ;",
    missions: [
      {
        id: "1.1",
        title: "1.1 Kotwice F i J",
        targetWpm: 12,
        texts: [
          "fjf jfj ff jj fj jf fff jjj fj jf",
          "jfj fjf jj ff jf fj jjj fff jf fj",
          "ff jj fjf jfj fj jf fff jjj fjf jfj",
          "jf fj fff jjj fjf jfj ff jj jf fj"
        ]
      },
      {
        id: "1.2",
        title: "1.2 Środkowe i serdeczne",
        targetWpm: 14,
        texts: [
          "dkd kdk sls lsl fds jkl dsl kfd",
          "sls lsl dkd kdk jkl fds lsk dkf",
          "fds jkl dkd sls kfd lsk dks ldf",
          "jkl fds lsl dkd fdl skj dkf ljs"
        ]
      },
      {
        id: "1.3",
        title: "1.3 Małe palce A oraz ;",
        targetWpm: 15,
        texts: [
          "las sala klasa skala kasa faks dal",
          "laska sad jad fala salka lada kalka",
          "sala klasa las skala faks kasa dal",
          "lada salka fala laska sad jad klasa"
        ]
      },
      {
        id: "1.4",
        title: "1.4 Zasięg do środka G i H",
        targetWpm: 16,
        texts: [
          "gala hala hak flaga alga gafa halka",
          "flaga hala gala alga hak gada lag",
          "halka gafa flaga hala alga dala las",
          "hala flaga gala hak alga salka lada"
        ]
      },
      {
        id: "1.5",
        title: "1.5 Boss Modułu 1",
        boss: true,
        targetWpm: 18,
        texts: [
          "flaga dala hasa klasa skala laska faks",
          "gala hala alga salka lada kalka gafa",
          "klasa skala las sala dal hak flaga",
          "laska faks gala hala alga dala hasa"
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Moduł 2: Górna Orbita — Rząd Górny",
    keysLabel: "Q W E R T Y U I O P",
    missions: [
      {
        id: "2.1",
        title: "2.1 Palce środkowe E i I",
        targetWpm: 16,
        texts: [
          "kij klej liska jajka sklej lek deska",
          "igla lejek kleik ksiega dalej siedliska",
          "leki igielka jajek klej liska deska",
          "sklej lek deska igla lejek klej liska"
        ]
      },
      {
        id: "2.2",
        title: "2.2 Wskazujące w górę R i U",
        targetWpm: 17,
        texts: [
          "drukarka drukuje figura iskra fura",
          "kura raki druk kruk ruda ul rura kurs",
          "iglu kaskader kurier gra seria gier",
          "radar kieruje fura iskra drukarka"
        ]
      },
      {
        id: "2.3",
        title: "2.3 Daleki zasięg T i Y",
        targetWpm: 18,
        texts: [
          "rakieta startuje i trafia dalej",
          "satelita rysuje kratery i tarasy",
          "tygrys jest rudy i syty",
          "latarka daje lekki filtr",
          "galaktyka kryje rakiety i satelity"
        ]
      },
      {
        id: "2.4",
        title: "2.4 Krawędzie W, O, Q, P",
        targetWpm: 19,
        texts: [
          "pilot kieruje statek prosto w daleki swiat",
          "teleskop odkrywa dalekie galaktyki i asteroidy",
          "sowa to lekki i rudy ptak",
          "gepard to rekordowy i rudy kot",
          "serwer wysyla prosty kod gry",
          "rakieta startuje i trafia daleko"
        ]
      },
      {
        id: "2.5",
        title: "2.5 Boss Modułu 2",
        boss: true,
        targetWpm: 20,
        texts: [
          "lekki wiatr kieruje statki daleko od portu",
          "rakieta startuje prosto w daleki swiat",
          "teleskop odkrywa kratery i asteroidy",
          "gepard to rekordowy i rudy kot",
          "serwer wysyla prosty kod gry",
          "satelita wysyla raport prosto do radaru"
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Moduł 3: Dolny Pokład — Rząd Dolny",
    keysLabel: "Z X C V B N M , .",
    missions: [
      {
        id: "3.1",
        title: "3.1 Środkowe w dół C i M",
        targetWpm: 18,
        texts: [
          "kamera filmuje kosmos i komety",
          "kompas kieruje marsa i merkurego",
          "mikroskop odkrywa male komorki",
          "komputer ma super procesor",
          "kometa leci w daleki kosmos",
          "smok kryje perly w starej fortecy"
        ]
      },
      {
        id: "3.2",
        title: "3.2 Wskazujące w dół V, B, N",
        targetWpm: 19,
        texts: [
          "kosmonauta bada niebieski neptun i saturn",
          "wielki wulkan na marsie to olympus mons",
          "delfin i rekin plywaja w oceanie",
          "internet spina komputery na calym swiecie",
          "robot bada kratery na marsie",
          "bateria daje energie do latarki i kompasu"
        ]
      },
      {
        id: "3.3",
        title: "3.3 Krawędzie X, Z oraz , .",
        targetWpm: 20,
        texts: [
          "kosmonauta bada nieznane planety oraz odlegle galaktyki.",
          "szybki gepard biegnie po sawannie z wielka predkoscia.",
          "zamek na wysokiej skale ma grube mury, bramy oraz wieze.",
          "na nocnym niebie pojawia sie jasna kometa.",
          "wulkan wyrzuca goraca lawe oraz gesty popiol.",
          "kameleon potrafi szybko zmieniac kolor swojej skory."
        ]
      },
      {
        id: "3.4",
        title: "3.4 Boss Modułu 3",
        boss: true,
        targetWpm: 22,
        texts: [
          "ziemia potrzebuje trzysta szescdziesiat piec dni na obieg wokol slonca.",
          "na dnie oceanu zyja meduzy, rekiny oraz wielkie wieloryby.",
          "nowoczesny procesor wykonuje miliardy obliczen w jedna sekunde.",
          "saturn posiada piekne pierscienie zbudowane z lodu oraz skal.",
          "pingwiny potrafia swietnie plywac w lodowatej wodzie.",
          "wielka rafa koralowa jest widoczna nawet z kosmosu."
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Moduł 4: Polskie Znaki — Prawy Alt",
    keysLabel: "Ą Ć Ę Ł Ń Ó Ś Ź Ż",
    missions: [
      {
        id: "4.1",
        title: "4.1 Samogłoski Ą, Ę, Ó",
        targetWpm: 18,
        texts: [
          "pająk tka mocną pajęczynę na owady.",
          "węgiel powstaje pod ziemią przez miliony lat.",
          "królik oraz wiewiórka zbierają zapasy na mróz.",
          "pociąg jedzie szybko przez wysoką górę i ciemny bór.",
          "stary dąb ma bardzo twarde drewno oraz mocne korzenie.",
          "bóbr buduje mocną tamę na górskim potoku."
        ]
      },
      {
        id: "4.2",
        title: "4.2 Spółgłoski miękkie Ć, Ń, Ś",
        targetWpm: 19,
        texts: [
          "kometa pędzi przez ciemny kosmos, a jej cień pada na ziemię.",
          "koń ma świetną pamięć i rozpoznaje swoich opiekunów.",
          "jesienią dębowy liść zmienia barwę i cicho opada na ziemię.",
          "promień z naszej gwiazdy dociera na ziemię w osiem minut.",
          "gość z kosmosu zostawia na niebie jasny ślad.",
          "świat kosmosu kryje tysiące nieodkrytych planet."
        ]
      },
      {
        id: "4.3",
        title: "4.3 Znaki specjalne Ł, Ź, Ż",
        targetWpm: 20,
        texts: [
          "żółw morski potrafi przepłynąć tysiące kilometrów na swoją plażę.",
          "księżyc nie świeci własnym światłem, lecz odbija promienie słoneczne.",
          "strażak używa nowoczesnego sprzętu podczas trudnych akcji.",
          "źródło górskiego potoku ma krystalicznie czystą i zimną wodę.",
          "łyżka ze stali nierdzewnej nie rdzewieje w wodzie.",
          "żaba potrafi skoczyć na odległość dwudziestu długości swojego ciała."
        ]
      },
      {
        id: "4.4",
        title: "4.4 Boss Modułu 4",
        boss: true,
        targetWpm: 22,
        texts: [
          "płetwal błękitny to największe zwierzę żyjące obecnie na ziemi.",
          "serce płetwala błękitnego waży tyle co mały samochód osobowy.",
          "ślimak potrafi spać bez przerwy nawet przez trzy lata.",
          "żyrafa ma tak długi język, że potrafi nim wyczyścić własne uszy.",
          "astronauci na orbicie widzą wschód słońca co dziewięćdziesiąt minut.",
          "błyskawica jest pięć razy gorętsza niż powierzchnia słońca."
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Moduł 5: Wielkie Litery i Interpunkcja",
    keysLabel: "Lewy Shift • Prawy Shift • ? ! : -",
    missions: [
      {
        id: "5.1",
        title: "5.1 Lewy Shift (prawa ręka)",
        targetWpm: 20,
        texts: [
          "Polska leży nad morzem, a Kraków oraz Łódź to znane miasta.",
          "Jowisz to największa planeta w naszym układzie.",
          "Neptun oraz Uran to lodowe olbrzymy na krańcu układu.",
          "Merkury krąży najbliżej naszej gwiazdy.",
          "Mars nazywany jest czerwoną planetą.",
          "Łódź oraz Lublin leżą w środkowej oraz wschodniej części kraju."
        ]
      },
      {
        id: "5.2",
        title: "5.2 Prawy Shift (lewa ręka)",
        targetWpm: 20,
        texts: [
          "Saturn posiada setki pięknych pierścieni z lodu i pyłu.",
          "Ziemia to jedyna znana planeta, na której istnieje życie.",
          "Wisła płynie przez Warszawę prosto do Bałtyku.",
          "Wrocław i Gdańsk zachwycają ciekawą architekturą.",
          "Wenus jest najgorętszą planetą w całym układzie.",
          "Tatry to najwyższe pasmo górskie w Polsce."
        ]
      },
      {
        id: "5.3",
        title: "5.3 Znaki ? ! : oraz -",
        targetWpm: 21,
        texts: [
          "Uwaga! Start rakiety nastąpi za trzy sekundy.",
          "Czy wiesz, dlaczego niebo jest błękitne? To efekt rozpraszania światła!",
          "Komputer zgłasza status: wszystkie systemy sprawne!",
          "Czy na Księżycu wieje wiatr? Nie - brakuje tam atmosfery!",
          "Cel misji jest prosty: bezbłędne pisanie bez patrzenia na klawisze!",
          "Sprawdź poziom energii: gotowy do skoku w nadprzestrzeń?"
        ]
      },
      {
        id: "5.4",
        title: "5.4 Boss Modułu 5",
        boss: true,
        targetWpm: 24,
        texts: [
          "Na Marsie znajduje się Olympus Mons - najwyższy wulkan w Układzie Słonecznym!",
          "Jeden dzień na Wenus trwa dłużej niż cały wenusjański rok.",
          "Ośmiornica posiada aż trzy serca oraz niebieską krew!",
          "Światło ze Słońca pokonuje drogę na Ziemię w około osiem minut.",
          "Czy wiesz, że w kosmosie panuje całkowita cisza? Dźwięk potrzebuje powietrza!",
          "Piorun uderza w Ziemię około stu razy w każdej sekundzie!"
        ]
      }
    ]
  },
  {
    id: 6,
    title: "Moduł 6: Cyfry i Kody Techniczne",
    keysLabel: "1 2 3 4 5 6 7 8 9 0 @ # $ % & * ( )",
    missions: [
      {
        id: "6.1",
        title: "6.1 Rząd cyfr 1–0",
        targetWpm: 20,
        texts: [
          "W 1969 roku misja Apollo 11 wylądowała na Księżycu.",
          "Światło pokonuje około 300 000 kilometrów w 1 sekundę.",
          "Zwykły rok ma 365 dni, a rok przestępny trwa 366 dni.",
          "Temperatura na powierzchni Słońca wynosi około 5500 stopni.",
          "Człowiek ma 206 kości w całym dorosłym szkielecie.",
          "Doba na Jowiszu trwa zaledwie 10 godzin!"
        ]
      },
      {
        id: "6.2",
        title: "6.2 Symbole programisty",
        targetWpm: 18,
        texts: [
          "Logowanie pilota: kuba@baza #misja2026 (status: 100% gotowości).",
          "Słynny wzór fizyczny Einsteina zapisujemy jako: E = m * c2.",
          "Proste równanie matematyczne: (25 + 75) * 2 = 200.",
          "Nagroda za ukończenie zadania wynosi 500$ oraz bonus & odznaka!",
          "Wysłano pakiet danych #104 na adres serwer@orbita (100% sukcesu).",
          "Hasło dostępu do śluzy: kod#99 + klucz@42 = otwarte!"
        ]
      },
      {
        id: "6.3",
        title: "6.3 Wielki Finał Kampanii",
        boss: true,
        targetWpm: 25,
        texts: [
          "Gratulacje! Kończysz szkolenie w Akademii Klawiatury z wynikiem 100%!",
          "Od 1969 roku, gdy Apollo 11 dotarł na Księżyc, nauka zmieniła świat.",
          "Dziś pilot @kadet pisze bezwzrokowo z pełną precyzją oraz szybkością!",
          "Twoja ranga to Mistrz Klawiatury: wszystkie 25 misji zaliczone na 100%!",
          "Każdy błąd to tylko wskazówka - teraz piszesz jak prawdziwy programista!",
          "Misja #2026 zakończona sukcesem: pełna kontrola nad klawiaturą!"
        ]
      }
    ]
  }
];
