const readPageTranslations = {
  read_page_title: {
    en: 'Read Tarot Cards',
    pl: 'Czytaj Karty Tarota',
  },
  read_page_description: {
    en: 'Explore the mystical world of Tarot cards and discover their meanings.',
    pl: 'Odkryj mistyczny świat kart Tarota i poznaj ich znaczenie.',
  },
  read_page_instructions: {
    en: 'Select a card to reveal its meaning and interpretation.',
    pl: 'Wybierz kartę, aby odkryć jej znaczenie i interpretację.',
  },
  card_position_1: {
    pl: 'pierwsza',
    en: 'first',
  },
  card_position_2: {
    pl: 'druga',
    en: 'second',
  },
  card_position_3: {
    pl: 'trzecia',
    en: 'third',
  },
  read_page_waiting_for_reading: {
    en: 'Your future is in the cards...',
    pl: 'Twoja przyszłość zwarta jest w kartach Tarota...',
  },
  read_page_start_reading: {
    en: 'Start My Tarot Reading',
    pl: 'Rozpocznij Moje Czytanie Tarota',
  },
  read_page_input_placeholder: {
    en: 'What specific question or intention do you have for this reading?',
    pl: 'Jakie konkretne pytanie lub intencję masz na myśli podczas tego czytania?',
  },
  question_input_title: {
    en: 'Post Your Question',
    pl: 'Zadaj Swoje Pytanie',
  },
  question_input_error_empty: {
    en: 'Please enter a question before submitting.',
    pl: 'Proszę wpisać pytanie przed wysłaniem.',
  },
  question_input_error_unexpected: {
    en: 'An unexpected error occurred during submission.',
    pl: 'Wystąpił nieoczekiwany błąd podczas wysyłania.',
  },
  question_input_label: {
    en: 'Your Question',
    pl: 'Twoje Pytanie',
  },
  question_input_submit_button: {
    en: 'Submit Question',
    pl: 'Wyślij Pytanie',
  },
  question_input_submitting_button: {
    en: 'Submitting...',
    pl: 'Wysyłanie...',
  },
  question_input_default_placeholder: {
    en: 'Type your question here...',
    pl: 'Wpisz swoje pytanie tutaj...',
  },
  validateTarotQuestion_context: {
    en: `You are an expert in Tarot card readings. Your task is to validate if the user's question is suitable for a Tarot card reading.
    A suitable question is clear, specific, and related to the user's personal growth or understanding. It should invite deeper self-reflection rather than seeking definitive predictions, simple yes/no answers, or insights into unrelated general topics. Tarot guides the seeker's journey, not external events or others' free will.

    Here are some examples of valid questions:
    - What can I expect in my love life in the coming months?
    - How can I improve my relationship with my family?
    - What are the potential career paths for me?
    - What are the challenges I need to overcome to achieve my goals?

    Here are some examples of invalid questions:
    - Will I win the lottery? (Seeks to predict the future with certainty)
    - Is there a god? (General topic, not related to personal life)
    - Yes or no? (Yes/no question)
    - What is the meaning of life? (Too broad and philosophical)

    Evaluate the following question and respond with valid JSON in the following format. Respond with only the JSON object, no additional text:

    {
    "isValid": true|false,
    }

    User question:`,
    pl: `Jesteś ekspertem w dziedzinie czytania kart Tarota. Twoim zadaniem jest sprawdzenie, czy pytanie użytkownika nadaje się do odczytu kart Tarota.
    Odpowiednie pytanie jest jasne, konkretne i dotyczy osobistego rozwoju lub zrozumienia użytkownika. Powinno zachęcać do głębszej autorefleksji, a nie szukać definitywnych przewidywań, prostych odpowiedzi tak/nie, ani wglądu w niezwiązane tematy ogólne. Tarot prowadzi w podróży poszukiwacza, a nie zewnętrznych wydarzeń czy wolnej woli innych.

    Oto kilka przykładów prawidłowych pytań:

    - Czego mogę spodziewać się w życiu miłosnym w nadchodzących miesiącach?
    - Jak mogę poprawić swoje relacje z rodziną?
    - Jakie są dla mnie potencjalne ścieżki kariery?
    - Jakie wyzwania muszę pokonać, aby osiągnąć swoje cele?

    Oto kilka przykładów nieprawidłowych pytań:
    - Czy wygram na loterii? (Ma na celu przewidzenie przyszłości z całą pewnością)
    - Czy Bóg istnieje? (Temat ogólny, niezwiązany z życiem osobistym)
    - Tak czy nie? (Pytanie tak/nie)
    - Jaki jest sens życia? (Zbyt szerokie i filozoficzne)

    Oceń poniższe pytanie i odpowiedz w następującym formacie JSON. Odpowiedz tylko obiektem JSON, bez dodatkowego tekstu.

    {
    "isValid": true|false,
    }

    Pytanie użytkownika:`,
  },
} as const;

export default readPageTranslations;
