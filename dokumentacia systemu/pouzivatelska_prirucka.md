# Používateľská príručka pre Systém Integrácie Hlasových Asistentov

## Obsah
1. [Úvod](#úvod)
2. [Prehľad systému](#prehľad-systému)
3. [Inštalácia a nastavenie](#inštalácia-a-nastavenie)
4. [Používanie systému](#používanie-systému)
   - [Spustenie serverov](#spustenie-serverov)
   - [Interakcia s hlasovým asistentom ALICE](#interakcia-s-hlasovým-asistentom-alice)
   - [Vytvorenie vlastného hlasového agenta](#vytvorenie-vlastného-hlasového-agenta)
   - [Použitie RAG systému pre vedomostné databázy](#použitie-rag-systému-pre-vedomostné-databázy)
5. [Komponenty systému](#komponenty-systému)
6. [Riešenie problémov](#riešenie-problémov)
7. [Technická špecifikácia](#technická-špecifikácia)

## Úvod

Tento dokument slúži ako používateľská príručka pre systém integrácie hlasových asistentov vyvinutý ako súčasť bakalárskej práce. Systém pozostáva z backend časti založenej na Pythone, ktorá spracováva hlasových asistentov, a frontend časti založenej na Next.js, ktorá poskytuje používateľské rozhranie.

Systém umožňuje používateľom komunikovať s hlasovým asistentom ALICE, ktorý ich sprevádza procesom vytvorenia vlastného hlasového agenta. Systém taktiež podporuje integráciu s vlastnými vedomostnými databázami pomocou Retrieval Augmented Generation (RAG) systému.

## Prehľad systému

Systém integrácie hlasových asistentov pozostáva z nasledujúcich hlavných komponentov:

1. **Backend služba (Python)**: Spracováva hlasové vstupy, komunikáciu s LiveKit a OpenAI, a implementáciu hlasových asistentov.
2. **Frontend aplikácia (Next.js)**: Poskytuje používateľské rozhranie pre interakciu s hlasovými asistentmi.
3. **RAG systém**: Umožňuje integráciu vlastných vedomostí pre hlasových asistentov.
4. **Systém transkripcie**: Zaznamenáva a spracováva konverzácie s hlasovými asistentmi.

Systém podporuje rôzne typy hlasových asistentov:
- **ALICE Landing Page Assistant**: Uvítací asistent na landing page
- **ALICE Onboarding Assistant**: Asistent pre definovanie požiadaviek na nového hlasového agenta
- **Vygenerovaný asistent**: Vlastný hlasový agent vytvorený používateľom
- **Improvement Assistant**: Asistent pre zlepšovanie existujúcich agentov

## Inštalácia a nastavenie

### Požiadavky na systém
- Python 3.8 alebo novší
- Node.js 16 alebo novší
- Účet LiveKit s API kľúčom a tajomstvom
- OpenAI API kľúč

### Nastavenie backend časti

1. Prejdite do adresára backend:
   ```
   cd Backend
   ```

2. Nainštalujte potrebné Python balíky:
   ```
   pip install -r requirements.txt
   ```

3. Vytvorte súbor `.env` s potrebnými premennými prostredia:
   ```
   LIVEKIT_URL=<váš LiveKit URL>
   LIVEKIT_API_KEY=<váš LiveKit API kľúč>
   LIVEKIT_API_SECRET=<vaše LiveKit API tajomstvo>
   OPENAI_API_KEY=<váš OpenAI API kľúč>
   PORT=5000
   ```

### Nastavenie frontend časti

1. Prejdite do adresára frontend:
   ```
   cd Frontend/AI-voice-agent-platform-frontend
   ```

2. Nainštalujte potrebné npm balíky:
   ```
   npm install
   ```

3. Vytvorte súbor `.env.local` s potrebnými premennými prostredia:
   ```
   NEXT_PUBLIC_LIVEKIT_URL=<váš LiveKit URL>
   LIVEKIT_API_KEY=<váš LiveKit API kľúč>
   LIVEKIT_API_SECRET=<vaše LiveKit API tajomstvo>
   BACKEND_API_URL=http://localhost:5000
   ```

## Používanie systému

### Spustenie serverov

Najjednoduchší spôsob spustenia celého systému je použitie pripravených skriptov:

1. Spustite backend a frontend servery pomocou batch skriptu:
   ```
   start_servers.bat
   ```

Alternatívne môžete spustiť servery individuálne:

#### Backend server:
```
cd Backend
python main.py
```

#### Frontend server:
```
cd Frontend/AI-voice-agent-platform-frontend
npm run dev
```

### Interakcia s hlasovým asistentom ALICE

1. Otvorte webový prehliadač a prejdite na `http://localhost:3000`
2. Na hlavnej stránke nájdete rozhranie pre interakciu s hlasovým asistentom ALICE
3. Kliknite na tlačidlo mikrofónu pre začatie konverzácie
4. Hovorte s ALICE, ktorá vás sprevádza procesom vytvorenia vlastného hlasového agenta
5. Postupujte podľa pokynov na obrazovke

Existujú rôzne verzie ALICE dostupné v systéme:
- ALICE Landing: Odpovedá na otázky o platforme a jej funkcionalitách
- ALICE Onboarding: Pomáha definovať požiadavky pre nového hlasového agenta
- ALICE Improvement: Pomáha zlepšovať existujúceho hlasového agenta

### Vytvorenie vlastného hlasového agenta

Proces vytvorenia vlastného hlasového agenta:

1. Interagujte s ALICE Onboarding asistentom
2. Odpovedajte na otázky o vašom požadovanom agentovi:
   - Meno agenta
   - Primárny účel/cieľ agenta
   - Cieľová skupina používateľov
   - Požadovaná osobnosť/prístup agenta
   - Charakteristiky hlasu
   - Jazyk komunikácie
   - Štýl odpovedí
   - Znalostné požiadavky
   - Kľúčové konverzačné elementy

3. Po dokončení procesu sa vytvorí konfigurácia pre vášho agenta
4. Môžete nahrať dokumenty pre vedomostnú databázu agenta
5. Otestujte interakciu s vašim novým agentom
6. V prípade potreby využite ALICE Improvement asistenta pre úpravy a vylepšenia

### Použitie RAG systému pre vedomostné databázy

Systém podporuje Retrieval Augmented Generation (RAG) pre integráciu vlastných vedomostí do hlasových asistentov:

1. Pripravte textové súbory (.txt, .pdf) s informáciami, ktoré má váš asistent poznať
2. Vložte tieto súbory do adresára `Backend/knowledgebase`
3. Systém automaticky indexuje tieto súbory pri spustení
4. Pri použití asistentov s podporou RAG (označené ako "rag" alebo "context" v názve miestnosti), asistenti budú schopní čerpať z týchto vedomostí

## Komponenty systému

### Backend komponenty

- **main.py**: Hlavný súbor pre spustenie backend servera a inicializáciu asistentov
- **api.py**: Flask API implementácia pre komunikáciu s frontend časťou
- **rag_manager.py**: Správa RAG systému pre vedomostné databázy
- **knowledge_indexer.py**: Indexovanie vedomostných súborov pre RAG
- **transcript_processor.py**: Spracovanie a ukladanie transkripcií z konverzácií
- **custom_rag.py**: Prispôsobené RAG implementácie

#### Adresárová štruktúra backend časti:

- **transcripts/**: Uložené transkripcie konverzácií
  - **landing/**: Transkripcie z landing page asistenta
  - **onboarding/**: Transkripcie z onboarding asistenta
  - **generated_agent/**: Transkripcie z vygenerovaných agentov
  - **alice_improvement/**: Transkripcie z improvement asistenta
  - **other/**: Iné transkripcie
- **generated_prompts/**: Vygenerované prompty pre asistentov
- **knowledgebase/**: Vedomostné súbory pre RAG systém
- **rag_index/**: Indexované vedomostné databázy
- **assistant_setup/**: Konfiguračné súbory pre asistentov

### Frontend komponenty

- **app/page.tsx**: Hlavná stránka aplikácie
- **components/UnifiedVoiceAgent.tsx**: Komponent pre hlasového agenta
- **components/ui/**: UI komponenty pre rozhranie

## Riešenie problémov

### Problémy s pripojením k hlasovému asistentovi

1. Skontrolujte, či sú backend aj frontend servery spustené
2. Overte správnosť LiveKit a OpenAI API kľúčov v konfiguračných súboroch
3. Skontrolujte povolenia mikrofónu vo webovom prehliadači
4. Skontrolujte konzolu prehliadača pre chybové hlášky

### Problémy s RAG systémom

1. Overte, že vedomostné súbory sú v správnom formáte a adresári
2. Reštartujte backend server pre preindexovanie vedomostných súborov
3. Skontrolujte logy servera pre chybové hlášky týkajúce sa indexovania

### Problémy s generovaním hlasových agentov

1. Overte, že transkripcie z onboarding procesu boli správne uložené
2. Skontrolujte prístupové práva k adresárom s vygenerovanými konfiguráciami
3. Reštartujte backend server pre opätovné načítanie konfigurácií

## Technická špecifikácia

### Použité technológie

- **Backend**: Python, Flask, LiveKit, OpenAI API
- **Frontend**: Next.js, TypeScript, TailwindCSS, LiveKit Web SDK
- **Databázy**: Súborový systém pre ukladanie transkripcií a konfigurácií
- **RAG**: FAISS vektorová databáza pre indexovanie vedomostí

### API Endpointy

#### Backend API

- `GET /api/assistant/voices` - Získanie dostupných hlasov pre asistenta
- `POST /api/assistant/create` - Vytvorenie nového asistenta so špecifikovanými parametrami
- `GET /health` - Endpoint pre kontrolu zdravia služby

#### Frontend API

- `GET /api/connection-details` - Generovanie detailov pripojenia do LiveKit miestnosti

### Premenné prostredia

#### Backend

- `LIVEKIT_URL` - LiveKit server URL
- `LIVEKIT_API_KEY` - LiveKit API kľúč
- `LIVEKIT_API_SECRET` - LiveKit API tajomstvo
- `OPENAI_API_KEY` - OpenAI API kľúč
- `PORT` - Port servera (predvolene: 5000)

#### Frontend

- `NEXT_PUBLIC_LIVEKIT_URL` - LiveKit server URL
- `LIVEKIT_API_KEY` - LiveKit API kľúč
- `LIVEKIT_API_SECRET` - LiveKit API tajomstvo
- `BACKEND_API_URL` - Backend API URL (predvolene: http://localhost:5000)