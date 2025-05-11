# API a Integrácia Systému

## Prehľad

Tento dokument popisuje API rozhranie a integračné mechanizmy voice assistant platformy. Systém využíva Flask backend pre API endpointy a LiveKit pre real-time komunikáciu (audio/voice). API umožňuje komunikáciu medzi frontend časťou aplikácie a backend službami, ktoré zahŕňajú spracovanie znalostnej bázy, RAG (Retrieval Augmented Generation) funkcionalitu a manažment hlasových asistentov.

## API Endpointy

### 1. Spracovanie znalostnej bázy
- **Endpoint:** `/api/process-knowledgebase`
- **Metóda:** POST
- **Popis:** Spúšťa indexáciu znalostnej bázy a aktualizuje RAG (Retrieval Augmented Generation) systém s novými údajmi
- **Odpoveď:**
  - Úspech (nové súbory): `{"success": true, "message": "Knowledge base updated successfully!"}` (HTTP 200)
  - Úspech (žiadne nové súbory): `{"success": true, "message": "No new knowledge files found to process."}` (HTTP 200)
  - Chyba: `{"success": false, "message": "Error processing knowledge base: [chybová správa]"}` (HTTP 500)
- **Použitie:** Aktualizácia znalostnej bázy po pridaní nových dokumentov

### 2. LiveKit Integrácia
Systém sa integruje s LiveKitom pre poskytovanie real-time hlasových služieb. Táto integrácia nie je priamo vystavená cez REST API, ale je spravovaná prostredníctvom hlavnej aplikácie (`main.py`), ktorá poskytuje nasledujúce druhy asistentov:

- **Landing Page Assistant**: Vitá používateľov a poskytuje informácie o platforme
- **Onboarding Assistant**: Sprevádza používateľov procesom definovania požiadaviek na nový AI hlasový agent
- **Generated Assistant**: Použitie dynamicky vygenerovaného promtu z transkriptov
- **Improvement Assistant**: Pomáha získavať spätnú väzbu o existujúcom hlasovom agentovi a implementovať zmeny

## Architektúra API

Backend API je postavené na Flask frameworku s nasledujúcimi kľúčovými komponentmi:

1. **Flask Application Server**:
   - Inicializovaný v `api.py` a štartovaný v paralelnom vlákne v `main.py`
   - Používa CORS (Cross-Origin Resource Sharing) pre umožnenie cross-domain requestov

2. **RAG (Retrieval Augmented Generation) System**:
   - `knowledge_indexer.py`: Zodpovedný za indexáciu znalostných dokumentov
   - `rag_manager.py`: Spravuje vektorovú databázu a obohacuje konverzačný kontext

3. **Transcript Processor**:
   - Beží ako background service pre spracovanie a uchovanie transkriptov konverzácií
   - Automaticky ukladá transkripcie rozhovorov do adresárovej štruktúry podľa typu konverzácie

## Zabezpečenie a Autentifikácia

V aktuálnej implementácii nie sú viditeľné explicitné bezpečnostné mechanizmy alebo autentifikačné metódy pre API endpointy. V produkčnom prostredí by malo byť zvážené:

- Implementácia API kľúčov alebo JWT tokenov
- Rate limiting pre prevenciu DoS útokov
- Šifrovanie citlivých dát

## Integrácia s Frontend

Frontend komunikuje s backend API prostredníctvom:

1. **REST API volania**: Pre HTTP request/response interakcie (napr., aktualizácia znalostnej bázy)

2. **LiveKit WebRTC**: Pre real-time audio komunikáciu s hlasovými asistentmi
   - Umožňuje bidirekcioálnu audio komunikáciu
   - Zabezpečuje prepis reči na text (transcription)
   - Spracováva real-time odpovede asistentov

## Integrácia s Externými Službami

Systém sa integruje s nasledujúcimi externými službami:

1. **OpenAI Services**:
   - Speech-to-Text (STT): Konverzia hlasu používateľa na text
   - Text-to-Speech (TTS): Generovanie prirodzene znejúceho hlasu asistentov
   - LLM (Language Model): Pre generovanie odpovedí asistentov

2. **LiveKit**: Real-time WebRTC komunikačná infraštruktúra
   - Audio streaming
   - Manažment participants (užívateľov v room)
   - Udalostný systém pre monitoring pripojení a aktivít

## Rozšíriteľnosť a Návrhy na Zlepšenie

1. **API Dokumentácia**:
   - Implementácia Swagger/OpenAPI špecifikácie pre automatickú API dokumentáciu
   - Detailnejšie endpointy pre správu asistentov a ich konfigurácií

2. **Bezpečnosť**:
   - Pridanie autentifikačných mechanizmov
   - Implementácia rate-limitingu
   - Monitoring a logovanie API prístupov

3. **Rozšírenie API**:
   - Endpointy pre správu užívateľských účtov
   - Endpointy pre konfiguráciu a customizáciu hlasových agentov
   - História konverzácií a analytika
   - Webhook integrácie pre notifikácie a eventy

4. **Performance Optimalizácie**:
   - Cacheing pre často používané dopyty
   - Asynchrónne spracovanie dlho bežiacich operácií
   - Horizontálne škálovanie pre vyššie zaťaženie

## Záver

Aktuálna implementácia API poskytuje základnú funkcionalitu potrebnú pre integráciu frontend aplikácie s backend službami. Aj keď je systém funkčný, existuje priestor pre rozšírenie API o ďalšie endpointy a vylepšenia v oblastiach bezpečnosti, dokumentácie a škálovateľnosti.