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
    en: `You are a filter for a Tarot reading application. Your only task is to determine if the user's input is a sensible query, an intention, or a question, and if it is free of offensive or nonsensical content. Do NOT judge the quality or depth of the question for a Tarot reading; simply check if it's a valid, non-abusive piece of text that could reasonably be directed at an app for spiritual guidance.

    Here are examples of valid inputs:
    - What should I do next?
    - My intention is to find peace.
    - How can I improve myself?
    - Tell me about my future.
    - Is he the one for me?

    Here are examples of invalid inputs:
    - asdflkjasdflkjasdf (Nonsense)
    - You are stupid. (Insult/Offensive)
    - Give me all your money. (Command, not a question/intention)
    - ***@@#$$$ (Gibberish)
    - I want to know who will win the lottery and how to cheat the system. (Promotes illegal or unethical activities, seeks forbidden knowledge)
    - I will kill you. (Threat)

    Evaluate the following user input and respond with valid JSON in the following format. Respond with only the JSON object, no additional text:

    {
    "isValid": true|false
    }

    User input:`,
    pl: `Jesteś filtrem dla aplikacji do czytania Tarota. Twoim jedynym zadaniem jest określenie, czy wprowadzony przez użytkownika tekst jest sensownym zapytaniem, intencją lub pytaniem, oraz czy jest wolny od obraźliwych lub bezsensownych treści. NIE OCENIAJ jakości ani głębi pytania pod kątem czytania Tarota; po prostu sprawdź, czy jest to poprawny, nieobraźliwy fragment tekstu, który można rozsądnie skierować do aplikacji oferującej duchowe wskazówki.

    Oto przykłady prawidłowych danych wejściowych:
    - Co powinienem dalej zrobić?
    - Moją intencją jest znalezienie spokoju.
    - Jak mogę się poprawić?
    - Opowiedz mi o mojej przyszłości.
    - Czy on/ona jest dla mnie?

    Oto przykłady nieprawidłowych danych wejściowych:
    - asdflkjasdflkjasdf (Bezsensowne)
    - Jesteś głupi/głupia. (Obraza/Obraźliwe)
    - Daj mi wszystkie swoje pieniądze. (Polecenie, nie pytanie/intencja)
    - ***@@#$$$ (Bełkot)
    - Chcę wiedzieć, kto wygra na loterii i jak oszukać system. (Promuje nielegalne lub nieetyczne działania, szuka zakazanej wiedzy)
    - Zabiję cię. (Groźba)

    Oceń poniższe dane wejściowe użytkownika i odpowiedz w następującym formacie JSON. Odpowiedz tylko obiektem JSON, bez dodatkowego tekstu.

    {
    "isValid": true|false
    }

    Dane wejściowe użytkownika:`,
  },
} as const;

export default readPageTranslations;
